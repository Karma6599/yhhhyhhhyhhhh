import "frida-builtins:/node-globals.js";
import "../config.js";
import "./projectiledetection.js";
import "./mapDetection.js";
import "./movement.js";
import "./dodgeProfiles.js";

function tileStops(tile, mode) {
  if (mode === RAY_MOVE) return tile.blocksMovement;
  if (!tile.blocksProjectiles) return false;
  if (tile.isDestructibleWithPiercing) return false;
  if (tile.isDestructible) return mode !== RAY_LOS_BUTTER;
  return true;
}

function gridRaycast(x, y, dirX, dirY, maxDist, mode) {
  let tc = tileCache;
  if (!tc) return maxDist;
  if (mode === RAY_MOVE) {
    let m = config.dodge.borderMargin || 0;
    if (m > 0) {
      let W = tc.width * TILE;
      let H = tc.height * TILE;
      let cap = maxDist;
      if (dirX > 1e-12) {
        cap = Math.min(cap, (W - m - x) / dirX);
      } else if (dirX < -1e-12) {
        cap = Math.min(cap, m - x / dirX);
      }
      if (dirY > 1e-12) {
        cap = Math.min(cap, (H - m - y) / dirY);
      } else if (dirY < -1e-12) {
        cap = Math.min(cap, m - y / dirY);
      }
      if (cap < maxDist) maxDist = cap > 0 ? cap : 0;
    }
  }
  let tx = Math.floor(x / TILE);
  let ty = Math.floor(y / TILE);
  let stepX = dirX > 0 ? 1 : -1;
  let stepY = dirY > 0 ? 1 : -1;
  let adx = Math.abs(dirX);
  let ady = Math.abs(dirY);
  let tDeltaX = adx > 1e-12 ? TILE / adx : Infinity;
  let tDeltaY = ady > 1e-12 ? TILE / ady : Infinity;
  let tMaxX = adx > 1e-12 ? (dirX > 0 ? (tx + 1) * TILE - x : x - tx * TILE) / adx : Infinity;
  let tMaxY = ady > 1e-12 ? (dirY > 0 ? (ty + 1) * TILE - y : y - ty * TILE) / ady : Infinity;
  for (let i = 0; i < 512; i++) {
    let dist;
    if (tMaxX < tMaxY) {
      dist = tMaxX;
      tMaxX += tDeltaX;
      tx += stepX;
    } else {
      dist = tMaxY;
      tMaxY += tDeltaY;
      ty += stepY;
    }
    if (dist >= maxDist) return maxDist;
    if (tx < 0 || ty < 0 || tx >= tc.width || ty >= tc.height) return dist;
    if (tileStops(tc.tiles[tx * tc.height + ty], mode)) return dist;
  }
  return maxDist;
}

function losTruncate(x, y, dirX, dirY, range, piercesButter) {
  if (config.dodge.wallMode !== "full") return range;
  return gridRaycast(x, y, dirX, dirY, range, piercesButter ? RAY_LOS_BUTTER : RAY_LOS_NORMAL);
}

function mapSpanUnits() {
  if (tileCache) return Math.hypot(tileCache.width, tileCache.height) * TILE;
  return Infinity;
}

function compileProjectile(proj) {
  let hazards = null;
  let dynamic = false;
  let profile = getProfile(proj.name);
  if (profile) {
    dynamic = !!profile.dynamic;
    try {
      hazards = profile.compile(proj, api);
    } catch (e) {
      hazards = null;
    }
  }
  if (!Array.isArray(hazards)) {
    hazards = compileGeneric(proj, api);
  }
  return { hazards, tileV: tileCache ? tileCache.version : 0, dynamic };
}

function gatherHazards(now) {
  hCount = 0;
  tEvalMax = 0;
  maxClose = mySpeed;
  let tv = tileCache ? tileCache.version : 0;
  let pad = config.dodge.radiusPadding || 0;
  let COORD_MAX = tileCache ? Math.max(tileCache.width, tileCache.height) * TILE + TILE : 1000000;
  let MAX_HORIZON = 20;
  for (let [gid, proj] of liveProjectiles) {
    try {
      let entry = bundleCache.get(gid);
      if (!entry) {
        entry = compileProjectile(proj);
        bundleCache.set(gid, entry);
        if (config.dodge.debug) {
          console.log("[dodge] first sight: ".concat(proj.name, " +", now - proj.timestamp, "ms after spawn, dist ", Math.round(Math.hypot(proj.x - meX, proj.y - meY))));
        }
      } else if (entry.dynamic || entry.tileV !== tv) {
        entry = compileProjectile(proj);
        bundleCache.set(gid, entry);
      }
      let freshX = NaN;
      let freshY = NaN;
      for (let h of entry.hazards) {
        if (hCount >= MAXH) return;
        let tb = (h.t1 - now) / 1000;
        if (tb <= 0 && !h.flight) continue;
        let ta = (h.t0 - now) / 1000;
        if (ta < 0) ta = 0;
        if (h.kind === 1) {
          if (!Number.isFinite(ta) || !Number.isFinite(tb) || tb > MAX_HORIZON) continue;
          if (!Number.isFinite(h.ax) || !Number.isFinite(h.ay) || !Number.isFinite(h.bx) || !Number.isFinite(h.by) || Math.abs(h.ax) > COORD_MAX || Math.abs(h.bx) > COORD_MAX || Math.abs(h.ay) > COORD_MAX || Math.abs(h.by) > COORD_MAX) continue;
          let mx = (h.ax + h.bx) / 2;
          let my = (h.ay + h.by) / 2;
          let half = Math.hypot(h.bx - h.ax, h.by - h.ay) / 2;
          let reach = h.r + myRadius + pad + half + mySpeed * (tb + LOGIC_TICK) + lastMargin;
          if (Math.hypot(mx - meX, my - meY) > reach) continue;
          let i2 = hCount++;
          hKind[i2] = 1;
          hAx[i2] = h.ax;
          hAy[i2] = h.ay;
          hBx[i2] = h.bx;
          hBy[i2] = h.by;
          hR[i2] = h.r + myRadius + pad;
          hTa[i2] = ta;
          hTb[i2] = tb;
          hName[i2] = proj.name;
          if (tb > tEvalMax) tEvalMax = tb;
        } else {
          let dtAnchor = (now - h.anchorT) / 1000;
          let px = h.px + h.vx * dtAnchor;
          let py = h.py + h.vy * dtAnchor;
          let hv = Math.hypot(h.vx, h.vy);
          let R = h.r + myRadius + pad;
          if (!h.flight) {
            let reach = R + (hv + mySpeed) * (tb + LOGIC_TICK) + lastMargin;
            if (Math.hypot(px - meX, py - meY) > reach) continue;
          } else {
            let flown, rem, reach;
            if (tb > LOGIC_TICK + dtFrame) {
              let reach2 = R + (hv + mySpeed) * (tb + LOGIC_TICK) + lastMargin;
              if (Math.hypot(px - meX, py - meY) > reach2) continue;
            }
            if (isNaN(freshX)) {
              freshX = getObjX(proj.ptr);
              freshY = getObjY(proj.ptr);
            }
            px = freshX;
            py = freshY;
            flown = Math.hypot(px - h.sx, py - h.sy);
            if (flown * h.angleErr > 2) {
              let k = h.speed / flown;
              h.vx = (px - h.sx) * k;
              h.vy = (py - h.sy) * k;
              h.angleErr = 2 / flown;
            }
            if (flown + h.speed * LOGIC_TICK >= h.effRange) {
              h.effRange = flown + h.speed * LOGIC_TICK;
              h.t1 = now + LOGIC_TICK_MS;
            }
            rem = (h.effRange - flown) / h.speed;
            tb = tb > 0 ? Math.min(tb, rem) : rem;
            ta = 0;
            reach = R + (hv + mySpeed) * (tb + LOGIC_TICK) + lastMargin;
            if (Math.hypot(px - meX, py - meY) > reach) continue;
          }
          if (!Number.isFinite(px) || !Number.isFinite(py) || Math.abs(px) > COORD_MAX || Math.abs(py) > COORD_MAX) continue;
          if (!Number.isFinite(ta) || !Number.isFinite(tb) || tb > MAX_HORIZON) continue;
          let i = hCount++;
          hKind[i] = 0;
          hPx[i] = px;
          hPy[i] = py;
          hVx[i] = h.vx;
          hVy[i] = h.vy;
          hR[i] = R;
          hTa[i] = ta;
          hTb[i] = tb;
          hName[i] = proj.name;
          if (tb > tEvalMax) tEvalMax = tb;
          let close = hv + mySpeed;
          if (close > maxClose) maxClose = close;
        }
      }
    } catch (e) {
    }
  }
}

function discTest(dx, dy, wx, wy, R, ta, tb) {
  g_hit = Infinity;
  g_leave = -Infinity;
  if (tb <= ta) {
    g_clear = Infinity;
    return;
  }
  let a = wx * wx + wy * wy;
  if (a < 1e-12) {
    g_clear = Math.sqrt(dx * dx + dy * dy) - R;
    if (g_clear <= 0) {
      g_hit = ta;
      g_leave = tb;
    }
    return;
  }
  R += Math.sqrt(a) * tickSlackS;
  let b = dx * wx + dy * wy;
  let c = dx * dx + dy * dy - R * R;
  let tc = -b / a;
  if (tc < ta) tc = ta;
  else if (tc > tb) tc = tb;
  let cx = dx + wx * tc;
  let cy = dy + wy * tc;
  g_clear = Math.sqrt(cx * cx + cy * cy) - R;
  let disc = b * b - a * c;
  if (disc <= 0) return;
  let sq = Math.sqrt(disc);
  let tEnter = (-b - sq) / a;
  let tExit = (-b + sq) / a;
  if (tExit < ta || tEnter > tb) return;
  g_hit = tEnter > ta ? tEnter : ta;
  g_leave = tExit < tb ? tExit : tb;
}

function mergeG() {
  if (g_hit < m_hit) m_hit = g_hit;
  if (g_leave > m_leave) m_leave = g_leave;
  if (g_clear < m_clear) m_clear = g_clear;
}

function capsuleTest(px, py, ux, uy, ax, ay, bx, by, R, ta, tb) {
  m_hit = Infinity;
  m_leave = -Infinity;
  m_clear = Infinity;
  if (tb <= ta) {
    m_clear = Infinity;
    return;
  }
  discTest(ax - px, ay - py, -ux, -uy, R, ta, tb);
  mergeG();
  discTest(bx - px, by - py, -ux, -uy, R, ta, tb);
  mergeG();
  let ex = bx - ax;
  let ey = by - ay;
  let len2 = ex * ex + ey * ey;
  if (len2 < 1e-09) return;
  R += Math.sqrt(ux * ux + uy * uy) * tickSlackS;
  let len = Math.sqrt(len2);
  let nx = -ey / len;
  let ny = ex / len;
  let f0 = (px - ax) * nx + (py - ay) * ny;
  let fv = ux * nx + uy * ny;
  let s0 = ((px - ax) * ex + (py - ay) * ey) / len2;
  let sv = (ux * ex + uy * ey) / len2;
  let sLo = ta;
  let sHi = tb;
  if (Math.abs(sv) < 1e-12) {
    if (s0 < 0 || s0 > 1) return;
  } else {
    let i0 = (0 - s0) / sv;
    let i1 = (1 - s0) / sv;
    if (i0 > i1) {
      let t = i0;
      i0 = i1;
      i1 = t;
    }
    if (i0 > sLo) sLo = i0;
    if (i1 < sHi) sHi = i1;
    if (sHi <= sLo) return;
  }
  let fA = f0 + fv * sLo;
  let fB = f0 + fv * sHi;
  let fMin = Math.min(Math.abs(fA), Math.abs(fB));
  if (fA < 0 !== fB < 0) fMin = 0;
  if (fMin - R < m_clear) m_clear = fMin - R;
  let hLo = sLo;
  let hHi = sHi;
  if (Math.abs(fv) < 1e-12) {
    if (Math.abs(f0) > R) return;
  } else {
    let j0 = (-R - f0) / fv;
    let j1 = (R - f0) / fv;
    if (j0 > j1) {
      let t = j0;
      j0 = j1;
      j1 = t;
    }
    if (j0 > hLo) hLo = j0;
    if (j1 < hHi) hHi = j1;
    if (hHi <= hLo) return;
  }
  if (hLo < m_hit) m_hit = hLo;
  if (hHi > m_leave) m_leave = hHi;
}

function evalMotion(ux, uy, track) {
  e_hit = Infinity;
  e_clear = Infinity;
  e_leave = 0;
  if (track) imCount = 0;
  let trackMax = track ? Math.min(16, config.dodge.tangentEscapeThreats | 0) : 0;
  let sp = Math.sqrt(ux * ux + uy * uy);
  let tw = Infinity;
  let stopX = 0;
  let stopY = 0;
  if (sp > 1e-09) {
    let maxD = sp * tEvalMax + myRadius;
    let raw = gridRaycast(meX, meY, ux / sp, uy / sp, maxD, RAY_MOVE);
    if (raw < maxD) {
      let dWall = raw - myRadius;
      tw = dWall > 0 ? dWall / sp : 0;
      stopX = meX + ux * tw;
      stopY = meY + uy * tw;
    }
  }
  for (let i = 0; i < hCount; i++) {
    let ta = hTa[i];
    let tb = hTb[i];
    let R = hR[i];
    let hit = Infinity;
    let leave = -Infinity;
    let clear = Infinity;
    if (hKind[i] === 0) {
      let dx = hPx[i] - meX;
      let dy = hPy[i] - meY;
      if (tw > 0) {
        discTest(dx, dy, hVx[i] - ux, hVy[i] - uy, R, ta, tb < tw ? tb : tw);
        hit = g_hit;
        leave = g_leave;
        clear = g_clear;
      }
      if (tw < tb) {
        let d2x = hPx[i] + hVx[i] * tw - stopX;
        let d2y = hPy[i] + hVy[i] * tw - stopY;
        discTest(d2x, d2y, hVx[i], hVy[i], R, ta > tw ? ta - tw : 0, tb - tw);
        if (g_hit + tw < hit) hit = g_hit + tw;
        if (g_leave + tw > leave) leave = g_leave + tw;
        if (g_clear < clear) clear = g_clear;
      }
    } else {
      if (tw > 0) {
        capsuleTest(meX, meY, ux, uy, hAx[i], hAy[i], hBx[i], hBy[i], R, ta, tb < tw ? tb : tw);
        hit = m_hit;
        leave = m_leave;
        clear = m_clear;
      }
      if (tw < tb) {
        capsuleTest(stopX, stopY, 0, 0, hAx[i], hAy[i], hBx[i], hBy[i], R, ta > tw ? ta - tw : 0, tb - tw);
        if (m_hit + tw < hit) hit = m_hit + tw;
        if (m_leave + tw > leave) leave = m_leave + tw;
        if (m_clear < clear) clear = m_clear;
      }
    }
    if (hit < e_hit) e_hit = hit;
    if (clear < e_clear) e_clear = clear;
    if (hit <= dtFrame && leave > e_leave) e_leave = leave;
    if (track && hit !== Infinity && trackMax > 0) {
      let j = imCount < trackMax ? imCount : trackMax - 1;
      if (imCount < trackMax) {
        imCount++;
      } else if (hit >= imHit[j]) continue;
      while (j > 0 && imHit[j - 1] > hit) {
        imHit[j] = imHit[j - 1];
        imIdx[j] = imIdx[j - 1];
        j--;
      }
      imHit[j] = hit;
      imIdx[j] = i;
    }
  }
}

function collectTangents() {
  tangentCount = 0;
  for (let k = 0; k < imCount; k++) {
    let i = imIdx[k];
    if (hKind[i] !== 0) continue;
    let dx = hPx[i] - meX;
    let dy = hPy[i] - meY;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let Rm = hR[i] + margin;
    if (dist <= Rm) continue;
    let alpha = Math.asin(Rm / dist);
    let theta = Math.atan2(dy, dx);
    for (let s = -1; s <= 1; s += 2) {
      let bAng, bx, by, hb, disc, lambda;
      bAng = theta + s * alpha;
      bx = Math.cos(bAng);
      by = Math.sin(bAng);
      hb = hVx[i] * bx + hVy[i] * by;
      disc = hb * hb - (hVx[i] * hVx[i] + hVy[i] * hVy[i]) + mySpeed * mySpeed;
      if (disc < 0) continue;
      lambda = -hb + Math.sqrt(disc);
      if (lambda <= 0) continue;
      if (tangentCount < 32) {
        tangentAngles[tangentCount++] = Math.atan2(hVy[i] + lambda * by, hVx[i] + lambda * bx);
      }
    }
  }
}

function release() {
  if (overriding) {
    moveEnable();
    moveRelease();
    overriding = false;
  }
}

function clearCommitment() {
  committedAngle = null;
  committedStop = false;
}

function applyChoice(angle, isStop) {
  overriding = true;
  committedAngle = isStop ? null : angle;
  committedStop = isStop;
  if (isStop) {
    moveRelease();
    moveDisable();
    return;
  }
  let deg = angle * 180 / Math.PI + 90;
  moveEnable();
  if (state.revertMovement) deg += 180;
  move(deg);
}

function update() {
  if (!config.dodge.enabled) {
    release();
    clearCommitment();
    return;
  }
  let now = Date.now();
  if (lastNow > 0) {
    let dt = (now - lastNow) / 1000;
    if (dt > 1 / 240 && dt < 0.1) dtFrame = dt;
  }
  lastNow = now;
  meX = state.ownX;
  meY = state.ownY;
  myRadius = state.ownRadius;
  mySpeed = state.ownSpeed;
  if (!mySpeed || mySpeed <= 0 || liveProjectiles.size === 0) {
    for (let gid of bundleCache.keys()) {
      if (!liveProjectiles.has(gid)) bundleCache.delete(gid);
    }
    release();
    clearCommitment();
    return;
  }
  gatherHazards(now);
  if (bundleCache.size > liveProjectiles.size) {
    for (let gid of bundleCache.keys()) {
      if (!liveProjectiles.has(gid)) bundleCache.delete(gid);
    }
  }
  if (hCount === 0) {
    release();
    clearCommitment();
    return;
  }
  let slack = Math.max(dtFrame, (config.dodge.reactionSlackFrames || 1) * LOGIC_TICK);
  margin = mySpeed * slack;
  lastMargin = margin;
  tickSlackS = LOGIC_TICK * 0.5 * (config.dodge.tickHitSlack || 0);
  let mirrored = !!state.revertMovement;
  let intentAngle = null;
  let iux = 0;
  let iuy = 0;
  if (userMoveAngle !== false && userMoveAngle !== null) {
    intentAngle = (parseFloat(userMoveAngle) - 90) * Math.PI / 180;
    if (mirrored) intentAngle += Math.PI;
    iux = Math.cos(intentAngle) * mySpeed;
    iuy = Math.sin(intentAngle) * mySpeed;
  }
  evalMotion(0, 0, true);
  let stopHit = e_hit;
  let stopClear = e_clear;
  evalMotion(iux, iuy, false);
  let intentHit = e_hit;
  let intentClear = e_clear;
  let relMargin = margin + mySpeed * dtFrame;
  let stopSafe = stopHit === Infinity && stopClear >= relMargin;
  let intentSafe = intentHit === Infinity && intentClear >= relMargin;
  if (stopSafe && intentSafe) {
    if (overriding && config.dodge.debug) console.log("[dodge] release");
    release();
    return;
  }
  let urgency = config.dodge.interventionUrgency;
  if (urgency !== Infinity && !overriding && intentSafe && stopHit !== Infinity && imCount > 0) {
    let i = imIdx[0];
    let tNeed = dtFrame;
    if (hKind[i] === 0) {
      let dx = meX - hPx[i];
      let dy = meY - hPy[i];
      let hv = Math.hypot(hVx[i], hVy[i]);
      let lateral;
      if (hv > 1e-09) {
        lateral = Math.abs(dx * (hVy[i] / hv) - dy * (hVx[i] / hv));
      } else {
        lateral = Math.sqrt(dx * dx + dy * dy);
      }
      let need = hR[i] + margin - lateral;
      if (need / mySpeed > tNeed) tNeed = need / mySpeed;
    }
    if (stopHit > urgency * tNeed) {
      release();
      return;
    }
  }
  collectTangents();
  let n = 0;
  let committedIdx = -1;
  let intentIdx = -1;
  let stopIdx;
  if (committedAngle !== null) {
    committedIdx = n;
    cAngle[n] = committedAngle;
    cStop[n++] = 0;
  }
  stopIdx = n;
  cAngle[n] = 0;
  cStop[n++] = 1;
  if (committedStop) committedIdx = stopIdx;
  if (intentAngle !== null) {
    intentIdx = n;
    cAngle[n] = intentAngle;
    cStop[n++] = 0;
  }
  let K = Math.max(8, config.dodge.escapeDirections | 0);
  for (let k = 0; k < K && n < 120; k++) {
    cAngle[n] = 2 * Math.PI * k / K;
    cStop[n++] = 0;
  }
  for (let k = 0; k < tangentCount && n < 128; k++) {
    cAngle[n] = tangentAngles[k];
    cStop[n++] = 0;
  }
  let steering = intentAngle !== null;
  let t = Math.min(3, Math.max(0, config.dodge.intentInfluence || 0));
  let bestClass = -1;
  let maxClearInBest = -Infinity;
  for (let k = 0; k < n; k++) {
    let ux = 0;
    let uy = 0;
    if (!cStop[k]) {
      ux = Math.cos(cAngle[k]) * mySpeed;
      uy = Math.sin(cAngle[k]) * mySpeed;
    }
    evalMotion(ux, uy, false);
    cCls[k] = e_hit !== Infinity ? 0 : e_clear >= margin ? 2 : 1;
    cClear[k] = e_clear;
    cHit[k] = e_hit;
    if (cCls[k] > bestClass) {
      bestClass = cCls[k];
      maxClearInBest = e_clear;
    } else if (cCls[k] === bestClass && e_clear > maxClearInBest) {
      maxClearInBest = e_clear;
    }
  }
  let blend = bestClass === 2 && steering;
  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestHit = -Infinity;
  let comScore = -Infinity;
  let comInBest = false;
  for (let k = 0; k < n; k++) {
    let score;
    if (cCls[k] !== bestClass) continue;
    score = undefined;
    if (blend) {
      let align = cStop[k] ? -1 : Math.cos(cAngle[k] - intentAngle);
      score = (1 - t) * cClear[k] + t * align * maxClearInBest;
    } else {
      score = cClear[k];
    }
    if (score > bestScore || score === bestScore && cHit[k] > bestHit) {
      bestScore = score;
      bestHit = cHit[k];
      bestIdx = k;
    }
    if (k === committedIdx) {
      comScore = score;
      comInBest = true;
    }
  }
  if (bestIdx < 0) {
    release();
    return;
  }
  let pick = bestIdx;
  if (comInBest) {
    let reversal = committedAngle !== null && !cStop[bestIdx] && Math.cos(cAngle[bestIdx] - committedAngle) < 0;
    if (reversal || bestScore - comScore <= mySpeed * dtFrame) {
      pick = committedIdx;
    }
  }
  if (config.dodge.debug && !overriding) {
    let threat = imCount > 0 ? hName[imIdx[0]] : "?";
    let tDist = imCount > 0 ? Math.round(Math.hypot(hPx[imIdx[0]] - meX, hPy[imIdx[0]] - meY)) : -1;
    console.log("[dodge] takeover vs ".concat(threat, " (dist ", tDist, "): intent tHit=", intentHit === Infinity ? "never" : Math.round(intentHit * 1000) + "ms", " clear=", Math.round(intentClear), " me=(", meX, ",", meY, ") spd=", Math.round(mySpeed), " reserve=", Math.round(relMargin), " fps=", Math.round(1 / dtFrame), " mirror=", state.revertMovement, " -> ", cStop[pick] ? "STOP" : "dir " + Math.round(cAngle[pick] * 180 / Math.PI + 180) + "deg", " (class ", bestClass, ")"));
  }
  applyChoice(cAngle[pick], cStop[pick] === 1);
}

var base = Process.getModuleByName("libg.so").base;
var offsets = {
  LogicBattleModeClient_update: 12714096,

  BattleMode_enter: 10204192
};
var TILE = 300;
var LOGIC_TICK = 0.05;
var LOGIC_TICK_MS = 50;
var KNOWN_RANGES = {
  RocketGirlProjectile: 2700
};
var RAY_MOVE = 0;
var RAY_LOS_NORMAL = 1;
var RAY_LOS_BUTTER = 2;
var api = {
  TILE,
  LOGIC_TICK_MS,
  movingDisc(o) {
    let cos = Math.cos(o.angle);
    let sin = Math.sin(o.angle);
    let speed = Math.max(1, o.speed + (o.noSpeedPad ? 0 : config.dodge.speedPadding || 0));
    let paddedRange = o.expiryTrusted === false ? mapSpanUnits() : o.range + (o.noPad ? 0 : config.dodge.rangePadding || 0);
    let effRange = o.ignoreWalls ? paddedRange : losTruncate(o.x, o.y, cos, sin, paddedRange, !!o.piercesEnvironmentLikeButter);
    return {
      kind: 0,
      flight: false,
      px: o.x,
      py: o.y,
      anchorT: o.t0,
      vx: cos * speed,
      vy: sin * speed,
      r: o.radius,
      t0: o.t0,
      t1: o.t0 + effRange / speed * 1000,
      sx: o.x,
      sy: o.y,
      speed,
      effRange,
      angleErr: o.angleErr === undefined ? Math.PI / 360 : o.angleErr
    };
  },
  staticDisc(o) {
    return {
      kind: 0,
      flight: false,
      px: o.x,
      py: o.y,
      anchorT: o.t0,
      vx: 0,
      vy: 0,
      r: o.radius,
      t0: o.t0,
      t1: o.t1,
      sx: o.x,
      sy: o.y,
      speed: 0,
      effRange: 0
    };
  },
  capsule(o) {
    return {
      kind: 1,
      flight: false,
      ax: o.ax,
      ay: o.ay,
      bx: o.bx,
      by: o.by,
      r: o.radius,
      t0: o.t0,
      t1: o.t1
    };
  },
  predictDeath(proj) {
    if (proj.isThrower === 1 && proj.targetX !== 0 && proj.targetY !== 0) {
      let dx = proj.targetX - proj.x;
      let dy = proj.targetY - proj.y;
      let total = Math.sqrt(dx * dx + dy * dy);
      let dirAngle = Math.atan2(dy, dx);
      let t = undefined;
      let now = Date.now();
      let elapsed = now - proj.timestamp;
      let cur = api.livePos(proj);
      if (cur && elapsed > 0 && total > 1) {
        let remaining = Math.hypot(proj.targetX - cur.x, proj.targetY - cur.y);
        let traveled = total - remaining;
        if (traveled > total * 0.05) {
          t = now + remaining * (elapsed / traveled);
        }
      }
      if (t === undefined) {
        t = proj.timestamp + total / Math.max(1, proj.speed) * 1000;
      }
      return { x: proj.targetX, y: proj.targetY, t, dirAngle };
    }
    let rad = proj.angle * Math.PI / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    let deathDist = KNOWN_RANGES[proj.name];
    if (!deathDist) {
      let obs = api.observedRange(proj.name);
      deathDist = obs > 0 ? Math.min(obs, proj.range) : proj.range;
    }
    let eff = losTruncate(proj.x, proj.y, cos, sin, deathDist, !!proj.piercesEnvironmentLikeButter);
    return {
      x: proj.x + cos * eff,
      y: proj.y + sin * eff,
      t: proj.timestamp + eff / Math.max(1, proj.speed) * 1000,
      dirAngle: rad
    };
  },
  compileGeneric(proj) {
    return compileGeneric(proj, api);
  },
  observedRange(name) {
    let r = observedProjectileRange.get(name);
    if (r === undefined) return 0;
    return r;
  },
  rangeExpiryObserved(name) {
    return rangeExpiryNames.has(name);
  },
  livePos(proj) {
    try {
      return { x: getObjX(proj.ptr), y: getObjY(proj.ptr) };
    } catch (e) {
      return { x: proj.x, y: proj.y };
    }
  },
  losEndpoint(x, y, angleRad, maxDist, piercesButter) {
    let c = Math.cos(angleRad);
    let s = Math.sin(angleRad);
    let d = losTruncate(x, y, c, s, maxDist, !!piercesButter);
    return { x: x + c * d, y: y + s * d, dist: d };
  }
};
var bundleCache = new Map();
var MAXH = 2048;
var hKind = new Int8Array(MAXH);
var hPx = new Float64Array(MAXH);
var hPy = new Float64Array(MAXH);
var hVx = new Float64Array(MAXH);
var hVy = new Float64Array(MAXH);
var hAx = new Float64Array(MAXH);
var hAy = new Float64Array(MAXH);
var hBx = new Float64Array(MAXH);
var hBy = new Float64Array(MAXH);
var hR = new Float64Array(MAXH);
var hTa = new Float64Array(MAXH);
var hTb = new Float64Array(MAXH);
var hName = new Array(MAXH);
var hCount = 0;
var meX = 0;
var meY = 0;
var mySpeed = 1;
var myRadius = 0;
var tEvalMax = 0;
var maxClose = 0;
var margin = 0;
var lastMargin = 0;
var dtFrame = 1 / 60;
var g_hit = Infinity;
var g_leave = -Infinity;
var g_clear = Infinity;
var tickSlackS = 0;
var m_hit = Infinity;
var m_leave = -Infinity;
var m_clear = Infinity;
var e_hit = Infinity;
var e_clear = Infinity;
var e_leave = 0;
var imIdx = new Int32Array(16);
var imHit = new Float64Array(16);
var imCount = 0;
var tangentAngles = new Float64Array(32);
var tangentCount = 0;
var overriding = false;
var committedAngle = null;
var committedStop = false;
var lastNow = 0;
var cAngle = new Float64Array(128);
var cStop = new Uint8Array(128);
var cCls = new Int8Array(128);
var cClear = new Float64Array(128);
var cHit = new Float64Array(128);

Interceptor.attach(base.add(offsets.BattleMode_enter), {
  onEnter() {
    bundleCache.clear();
    overriding = false;
    committedAngle = null;
    committedStop = false;
    lastNow = 0;
    try {
      moveEnable();
      moveRelease();
    } catch (e) {
    }
  }
});

Interceptor.attach(base.add(offsets.LogicBattleModeClient_update), {
  onEnter() {
    try {
      update();
    } catch (e) {
      try {
        release();
      } catch (e2) {
      }
      if (config.dodge.debug) console.log("[dodge] error: " + e);
    }
  }
});

console.log("[dodge] loaded");
