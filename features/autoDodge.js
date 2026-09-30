// ==========================================================================
// src/mech/dodge.js  —  AUTO-DODGE
// raycast + capsule escape engine
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 3363 ----
function tileStops(tile, mode) {
    if ((mode === RAY_MOVE)) {
        return tile.blocksMovement;
    }
    if (!(tile.blocksProjectiles)) {
        return false;
    }
    if (tile.isDestructibleWithPiercing) {
        return false;
    }
    if (tile.isDestructible) {
        return (mode !== RAY_LOS_BUTTER);
    }
    return true;
}

// ---- line 3370 ----
function gridRaycast(x, y, dirX, dirY, maxDist, mode) {
    let tMaxY;
    let tMaxX;
    let tDeltaY;
    let tDeltaX;
    let ady;
    let adx;
    let stepY;
    let stepX;
    let ty;
    let tx;
    let tc;
    tc = tileCache;
    if (!(tc)) {
        return maxDist;
    }
    if ((mode === RAY_MOVE)) {
        let m;
        m = (config.dodge.borderMargin || 0);
        if ((m > 0)) {
            let cap;
            let H;
            let W;
            W = (tc.width * TILE);
            H = (tc.height * TILE);
            cap = maxDist;
            if ((dirX > 1e-12)) {
                cap = Math.min(cap, (((W - m) - x) / dirX));
            } else {
                if ((dirX < -(1e-12))) {
                    cap = Math.min(cap, ((m - x) / dirX));
                }
            }
            if ((dirY > 1e-12)) {
                cap = Math.min(cap, (((H - m) - y) / dirY));
            } else {
                if ((dirY < -(1e-12))) {
                    cap = Math.min(cap, ((m - y) / dirY));
                }
            }
            if ((cap < maxDist)) {
                maxDist = ((cap > 0) ? cap : 0);
            }
        }
    }
    tx = Math.floor((x / TILE));
    ty = Math.floor((y / TILE));
    stepX = ((dirX > 0) ? 1 : -1);
    stepY = ((dirY > 0) ? 1 : -1);
    adx = Math.abs(dirX);
    ady = Math.abs(dirY);
    tDeltaX = ((adx > 1e-12) ? (TILE / adx) : Infinity);
    tDeltaY = ((ady > 1e-12) ? (TILE / ady) : Infinity);
    if ((adx > 1e-12)) {
    }
    tMaxX = Infinity;
    if ((ady > 1e-12)) {
    }
    tMaxY = Infinity;
    let i;
    i = 0;
    while ((i < 512)) {
        let dist;
        dist = undefined;
        if ((tMaxX < tMaxY)) {
            dist = tMaxX;
            tMaxX = (tMaxX + tDeltaX);
            tx = (tx + stepX);
        } else {
            dist = tMaxY;
            tMaxY = (tMaxY + tDeltaY);
            ty = (ty + stepY);
        }
        if ((dist >= maxDist)) {
            return maxDist;
        }
        if (!((tx < 0))) {
            if (!((ty < 0))) {
            }
        }
        if ((tx < 0)) {
            return dist;
        }
        if (tileStops(tc.tiles[((tx * tc.height) + ty)], mode)) {
            return dist;
        }
        i++;
    }
    return maxDist;
}

// ---- line 3409 ----
function losTruncate(x, y, dirX, dirY, range, piercesButter) {
    if ((config.dodge.wallMode !== "full")) {
        return range;
    }
    return gridRaycast(x, y, dirX, dirY, range, (piercesButter ? RAY_LOS_BUTTER : RAY_LOS_NORMAL));
}

// ---- line 3413 ----
function mapSpanUnits() {
    if (tileCache) {
        return (Math.hypot(tileCache.width, tileCache.height) * TILE);
    }
    return Infinity;
}

// ---- line 3416 ----
function compileProjectile(proj) {
    let profile;
    let dynamic;
    let hazards;
    hazards = null;
    dynamic = false;
    profile = getProfile(proj.name);
    if (profile) {
        dynamic = !(!(profile.dynamic));
        try {
            hazards = profile.compile(proj, api);
        } catch (e) {
            hazards = null;
        }
    }
    if (!(Array.isArray(hazards))) {
        hazards = compileGeneric(proj, api);
    }
    {}.hazards = hazards;
    {}.tileV = (tileCache ? tileCache.version : 0);
    {}.dynamic = dynamic;
    return {};
}

// ---- line 3430 ----
function gatherHazards(now) {
    let MAX_HORIZON;
    let COORD_MAX;
    let pad;
    let tv;
    hCount = 0;
    tEvalMax = 0;
    maxClose = mySpeed;
    tv = (tileCache ? tileCache.version : 0);
    pad = (config.dodge.radiusPadding || 0);
    COORD_MAX = (tileCache ? ((Math.max(tileCache.width, tileCache.height) * TILE) + TILE) : 1000000);
    MAX_HORIZON = 20;
    let proj;
    let gid;
    for (const it of liveProjectiles) {
        /* @160 for_X_start unmatched */
        /* @160 for_X_start unmatched */
        /* @160 ?? ('unknown', 'for_of_start', 160) */
        gid = <under>;
        proj = <under>;
        try {
            let freshY;
            let freshX;
            let entry;
            entry = bundleCache.get(gid);
            if (!(entry)) {
                entry = compileProjectile(proj);
                bundleCache.set(gid, entry);
                if (config.dodge.debug) {
                    console.log("[dodge] first sight: ".concat(proj.name, " +", (now - proj.timestamp), "ms after spawn, dist ", Math.round(Math.hypot((proj.x - meX), (proj.y - meY)))));
                } else {
                    if ((entry.dynamic || (entry.tileV !== tv))) {
                        entry = compileProjectile(proj);
                        bundleCache.set(gid, entry);
                    }
                }
            }
            if ((entry.dynamic || (entry.tileV !== tv))) {
                entry = compileProjectile(proj);
                bundleCache.set(gid, entry);
            }
            freshX = NaN;
            freshY = NaN;
            let h;
            for (const h of entry.hazards) {
                let close;
                let i;
                let R;
                let hv;
                let py;
                let px;
                let dtAnchor;
                let ta;
                let tb;
                if ((hCount >= MAXH)) {
                    /* @511 ?? ('unknown', 'op9f', 511) */
                    /* @516 ?? ('unknown', 'op9f', 516) */
                    return <under>;
                }
                tb = ((h.t1 - now) / 1000);
                if ((tb <= 0)) {
                    if (!(h.flight)) continue;
                }
                ta = ((h.t0 - now) / 1000);
                if ((ta < 0)) {
                    ta = 0;
                }
                if ((h.kind === 1)) {
                    let i2;
                    let reach;
                    let half;
                    let my;
                    let mx;
                    if (!(!(Number.isFinite(ta)))) {
                    }
                    if (!(Number.isFinite(ta))) continue;
                    if (!(!(Number.isFinite(h.ax)))) {
                        if (!(!(Number.isFinite(h.ay)))) {
                            if (!(!(Number.isFinite(h.bx)))) {
                                if (!(!(Number.isFinite(h.by)))) {
                                    if (!((Math.abs(h.ax) > COORD_MAX))) {
                                        if (!((Math.abs(h.bx) > COORD_MAX))) {
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!(Number.isFinite(h.ax))) continue;
                    mx = ((h.ax + h.bx) / 2);
                    my = ((h.ay + h.by) / 2);
                    half = (Math.hypot((h.bx - h.ax), (h.by - h.ay)) / 2);
                    reach = (((((h.r + myRadius) + pad) + half) + (mySpeed * (tb + LOGIC_TICK))) + lastMargin);
                    if ((Math.hypot((mx - meX), (my - meY)) > reach)) continue;
                    hCount = hCount;
                    i2 = <under>;
                    hKind[i2] = 1;
                    hAx[i2] = h.ax;
                    hAy[i2] = h.ay;
                    hBx[i2] = h.bx;
                    hBy[i2] = h.by;
                    hR[i2] = ((h.r + myRadius) + pad);
                    hTa[i2] = ta;
                    hTb[i2] = tb;
                    hName[i2] = proj.name;
                    if (!((tb > tEvalMax))) continue;
                    tEvalMax = tb;
                    continue;
                }
                dtAnchor = ((now - h.anchorT) / 1000);
                px = (h.px + (h.vx * dtAnchor));
                py = (h.py + (h.vy * dtAnchor));
                hv = Math.hypot(h.vx, h.vy);
                R = ((h.r + myRadius) + pad);
                if (!(h.flight)) {
                    let reach;
                    reach = ((R + ((hv + mySpeed) * (tb + LOGIC_TICK))) + lastMargin);
                    if ((Math.hypot((px - meX), (py - meY)) > reach)) continue;
                }
                let reach;
                let rem;
                let flown;
                if ((tb > (LOGIC_TICK + dtFrame))) {
                    let reach2;
                    reach2 = ((R + ((hv + mySpeed) * (tb + LOGIC_TICK))) + lastMargin);
                    if ((Math.hypot((px - meX), (py - meY)) > reach2)) continue;
                }
                if (isNaN(freshX)) {
                    freshX = getObjX(proj.ptr);
                    freshY = getObjY(proj.ptr);
                }
                px = freshX;
                py = freshY;
                flown = Math.hypot((px - h.sx), (py - h.sy));
                if (((flown * h.angleErr) > 2)) {
                    let k;
                    k = (h.speed / flown);
                    h.vx = ((px - h.sx) * k);
                    h.vy = ((py - h.sy) * k);
                    h.angleErr = (2 / flown);
                }
                if (((flown + (h.speed * LOGIC_TICK)) >= h.effRange)) {
                    h.effRange = (flown + (h.speed * LOGIC_TICK));
                    h.t1 = (now + LOGIC_TICK_MS);
                }
                rem = ((h.effRange - flown) / h.speed);
                tb = ((tb > 0) ? Math.min(tb, rem) : rem);
                ta = 0;
                reach = ((R + ((hv + mySpeed) * (tb + LOGIC_TICK))) + lastMargin);
                if ((Math.hypot((px - meX), (py - meY)) > reach)) continue;
                if (!(!(Number.isFinite(px)))) {
                    if (!(!(Number.isFinite(py)))) {
                    }
                }
                if (!(Number.isFinite(px))) continue;
                if (!(!(Number.isFinite(ta)))) {
                }
                if (!(Number.isFinite(ta))) continue;
                hCount = hCount;
                i = <under>;
                hKind[i] = 0;
                hPx[i] = px;
                hPy[i] = py;
                hVx[i] = h.vx;
                hVy[i] = h.vy;
                hR[i] = R;
                hTa[i] = ta;
                hTb[i] = tb;
                hName[i] = proj.name;
                if ((tb > tEvalMax)) {
                    tEvalMax = tb;
                }
                close = (hv + mySpeed);
                if (!((close > maxClose))) continue;
                maxClose = close;
            }
            continue;
        } catch (e) {
        }
    }
    return;
}

// ---- line 3534 ----
function discTest(dx, dy, wx, wy, R, ta, tb) {
    let tExit;
    let tEnter;
    let sq;
    let disc;
    let cy;
    let cx;
    let tc;
    let c;
    let b;
    let a;
    g_hit = Infinity;
    g_leave = -(Infinity);
    if ((tb <= ta)) {
        g_clear = Infinity;
        return;
    }
    a = ((wx * wx) + (wy * wy));
    if ((a < 1e-12)) {
        g_clear = (Math.sqrt(((dx * dx) + (dy * dy))) - R);
        if ((g_clear <= 0)) {
            g_hit = ta;
            g_leave = tb;
        }
        return;
    }
    R = (R + (Math.sqrt(a) * tickSlackS));
    b = ((dx * wx) + (dy * wy));
    c = (((dx * dx) + (dy * dy)) - (R * R));
    tc = (-(b) / a);
    if ((tc < ta)) {
        tc = ta;
    } else {
        if ((tc > tb)) {
            tc = tb;
        }
    }
    cx = (dx + (wx * tc));
    cy = (dy + (wy * tc));
    g_clear = (Math.sqrt(((cx * cx) + (cy * cy))) - R);
    disc = ((b * b) - (a * c));
    if ((disc <= 0)) {
        return;
    }
    sq = Math.sqrt(disc);
    tEnter = ((-(b) - sq) / a);
    tExit = ((-(b) + sq) / a);
    if (((tExit < ta) || (tEnter > tb))) {
        return;
    }
    g_hit = ((tEnter > ta) ? tEnter : ta);
    g_leave = ((tExit < tb) ? tExit : tb);
    return;
}

// ---- line 3566 ----
function mergeG() {
    if ((g_hit < m_hit)) {
        m_hit = g_hit;
    }
    if ((g_leave > m_leave)) {
        m_leave = g_leave;
    }
    if ((g_clear < m_clear)) {
        m_clear = g_clear;
    }
    return;
}

// ---- line 3571 ----
function capsuleTest(px, py, ux, uy, ax, ay, bx, by, R, ta, tb) {
    let hHi;
    let hLo;
    let fMin;
    let fB;
    let fA;
    let sHi;
    let sLo;
    let sv;
    let s0;
    let fv;
    let f0;
    let ny;
    let nx;
    let len;
    let len2;
    let ey;
    let ex;
    m_hit = Infinity;
    m_leave = -(Infinity);
    m_clear = Infinity;
    if ((tb <= ta)) {
        m_clear = Infinity;
        return;
    }
    /* @137 ?? ('unknown', 'call', 137) */
    mergeG();
    /* @176 ?? ('unknown', 'call', 176) */
    mergeG();
    ex = (bx - ax);
    ey = (by - ay);
    len2 = ((ex * ex) + (ey * ey));
    if ((len2 < 1e-09)) {
        return;
    }
    R = (R + (Math.sqrt(((ux * ux) + (uy * uy))) * tickSlackS));
    len = Math.sqrt(len2);
    nx = (-(ey) / len);
    ny = (ex / len);
    f0 = (((px - ax) * nx) + ((py - ay) * ny));
    fv = ((ux * nx) + (uy * ny));
    s0 = ((((px - ax) * ex) + ((py - ay) * ey)) / len2);
    sv = (((ux * ex) + (uy * ey)) / len2);
    sLo = ta;
    sHi = tb;
    if ((Math.abs(sv) < 1e-12)) {
        if (((s0 < 0) || (s0 > 1))) {
            return;
            let i1;
            let i0;
            i0 = ((0 - s0) / sv);
            i1 = ((1 - s0) / sv);
            if ((i0 > i1)) {
                let t;
                t = i0;
                i0 = i1;
                i1 = t;
            }
            if ((i0 > sLo)) {
                sLo = i0;
            }
            if ((i1 < sHi)) {
                sHi = i1;
            }
            if ((sHi <= sLo)) {
                return;
            }
        }
    }
    let i1;
    let i0;
    i0 = ((0 - s0) / sv);
    i1 = ((1 - s0) / sv);
    if ((i0 > i1)) {
        let t;
        t = i0;
        i0 = i1;
        i1 = t;
    }
    if ((i0 > sLo)) {
        sLo = i0;
    }
    if ((i1 < sHi)) {
        sHi = i1;
    }
    if ((sHi <= sLo)) {
        return;
    }
    fA = (f0 + (fv * sLo));
    fB = (f0 + (fv * sHi));
    fMin = Math.min(Math.abs(fA), Math.abs(fB));
    if (((fA < 0) !== (fB < 0))) {
        fMin = 0;
    }
    if (((fMin - R) < m_clear)) {
        m_clear = (fMin - R);
    }
    hLo = sLo;
    hHi = sHi;
    if ((Math.abs(fv) < 1e-12)) {
        if ((Math.abs(f0) > R)) {
            return;
            let j1;
            let j0;
            j0 = ((-(R) - f0) / fv);
            j1 = ((R - f0) / fv);
            if ((j0 > j1)) {
                let t;
                t = j0;
                j0 = j1;
                j1 = t;
            }
            if ((j0 > hLo)) {
                hLo = j0;
            }
            if ((j1 < hHi)) {
                hHi = j1;
            }
            if ((hHi <= hLo)) {
                return;
            }
        }
    }
    let j1;
    let j0;
    j0 = ((-(R) - f0) / fv);
    j1 = ((R - f0) / fv);
    if ((j0 > j1)) {
        let t;
        t = j0;
        j0 = j1;
        j1 = t;
    }
    if ((j0 > hLo)) {
        hLo = j0;
    }
    if ((j1 < hHi)) {
        hHi = j1;
    }
    if ((hHi <= hLo)) {
        return;
    }
    if ((hLo < m_hit)) {
        m_hit = hLo;
    }
    if ((hHi > m_leave)) {
        m_leave = hHi;
    }
    return;
}

// ---- line 3626 ----
function evalMotion(ux, uy, track) {
    let stopY;
    let stopX;
    let tw;
    let sp;
    let trackMax;
    e_hit = Infinity;
    e_clear = Infinity;
    e_leave = 0;
    if (track) {
        imCount = 0;
    }
    trackMax = (track ? Math.min(16, (config.dodge.tangentEscapeThreats | 0)) : 0);
    sp = Math.sqrt(((ux * ux) + (uy * uy)));
    tw = Infinity;
    stopX = 0;
    stopY = 0;
    if ((sp > 1e-09)) {
        let raw;
        let maxD;
        maxD = ((sp * tEvalMax) + myRadius);
        /* @196 ?? ('unknown', 'call', 196) */
        raw = RAY_MOVE;
        if ((raw < maxD)) {
            let dWall;
            dWall = (raw - myRadius);
            tw = ((dWall > 0) ? (dWall / sp) : 0);
            stopX = (meX + (ux * tw));
            stopY = (meY + (uy * tw));
        }
    }
    let i;
    i = 0;
    while ((i < hCount)) {
        let clear;
        let leave;
        let hit;
        let R;
        let tb;
        let ta;
        ta = hTa[i];
        tb = hTb[i];
        R = hR[i];
        hit = Infinity;
        leave = -(Infinity);
        clear = Infinity;
        if ((hKind[i] === 0)) {
            let dy;
            let dx;
            dx = (hPx[i] - meX);
            dy = (hPy[i] - meY);
            if ((tw > 0)) {
                /* @490 ?? ('unknown', 'call', 490) */
                hit = g_hit;
                leave = g_leave;
                clear = g_clear;
            }
            if ((tw < tb)) {
                let d2y;
                let d2x;
                d2x = ((hPx[i] + (hVx[i] * tw)) - stopX);
                d2y = ((hPy[i] + (hVy[i] * tw)) - stopY);
                /* @658 ?? ('unknown', 'call', 658) */
                if (((g_hit + tw) < hit)) {
                    hit = (g_hit + tw);
                }
                if (((g_leave + tw) > leave)) {
                    leave = (g_leave + tw);
                }
                if ((g_clear < clear)) {
                    clear = g_clear;
                } else {
                    if ((tw > 0)) {
                        /* @830 ?? ('unknown', 'call', 830) */
                        hit = m_hit;
                        leave = m_leave;
                        clear = m_clear;
                    }
                    if ((tw < tb)) {
                        /* @954 ?? ('unknown', 'call', 954) */
                        if (((m_hit + tw) < hit)) {
                            hit = (m_hit + tw);
                        }
                        if (((m_leave + tw) > leave)) {
                            leave = (m_leave + tw);
                        }
                        if ((m_clear < clear)) {
                            clear = m_clear;
                        }
                    }
                }
            }
        }
        if ((tw > 0)) {
            /* @830 ?? ('unknown', 'call', 830) */
            hit = m_hit;
            leave = m_leave;
            clear = m_clear;
        }
        if ((tw < tb)) {
            /* @954 ?? ('unknown', 'call', 954) */
            if (((m_hit + tw) < hit)) {
                hit = (m_hit + tw);
            }
            if (((m_leave + tw) > leave)) {
                leave = (m_leave + tw);
            }
            if ((m_clear < clear)) {
                clear = m_clear;
            }
        }
        if ((hit < e_hit)) {
            e_hit = hit;
        }
        if ((clear < e_clear)) {
            e_clear = clear;
        }
        if ((hit <= dtFrame)) {
            if ((leave > e_leave)) {
                e_leave = leave;
            }
        }
        if (track) {
            if ((hit !== Infinity)) {
                if ((trackMax > 0)) {
                    let j;
                    j = ((imCount < trackMax) ? imCount : (trackMax - 1));
                    if ((imCount < trackMax)) {
                        imCount = imCount;
                    } else {
                        if (!((hit >= imHit[j]))) {
                            while ((j > 0)) {
                                if ((imHit[(j - 1)] > hit)) break;
                                imHit[j] = imHit[(j - 1)];
                                imIdx[j] = imIdx[(j - 1)];
                                j--;
                            }
                            imHit[j] = hit;
                            imIdx[j] = i;
                        }
                    }
                    if ((j > 0)) {
                        if ((imHit[(j - 1)] > hit)) {
                            imHit[j] = imHit[(j - 1)];
                            imIdx[j] = imIdx[(j - 1)];
                            j--;
                            continue;
                        }
                    }
                    imHit[j] = hit;
                    imIdx[j] = i;
                }
            }
        }
        i++;
    }
    return;
}

// ---- line 3694 ----
function collectTangents() {
    tangentCount = 0;
    let k;
    k = 0;
    while ((k < imCount)) {
        let theta;
        let alpha;
        let Rm;
        let dist;
        let dy;
        let dx;
        let i;
        i = imIdx[k];
        if (!((hKind[i] !== 0))) {
            dx = (hPx[i] - meX);
            dy = (hPy[i] - meY);
            dist = Math.sqrt(((dx * dx) + (dy * dy)));
            Rm = (hR[i] + margin);
            if (!((dist <= Rm))) {
                alpha = Math.asin((Rm / dist));
                theta = Math.atan2(dy, dx);
                let s;
                s = -1;
                while ((s <= 1)) {
                    let lambda;
                    let disc;
                    let hb;
                    let by;
                    let bx;
                    let bAng;
                    bAng = (theta + (s * alpha));
                    bx = Math.cos(bAng);
                    by = Math.sin(bAng);
                    hb = ((hVx[i] * bx) + (hVy[i] * by));
                    disc = (((hb * hb) - ((hVx[i] * hVx[i]) + (hVy[i] * hVy[i]))) + (mySpeed * mySpeed));
                    if (!((disc < 0))) {
                        lambda = (-(hb) + Math.sqrt(disc));
                        if (!((lambda <= 0))) {
                            if ((tangentCount < 32)) {
                                tangentCount = tangentCount;
                                tangentAngles[Math.atan2((hVy[i] + (lambda * by)), (hVx[i] + (lambda * bx)))] = <under>;
                            }
                        }
                    }
                    s = (s + 2);
                }
            }
        }
        k++;
    }
    return;
}

// ---- line 3719 ----
function release() {
    if (overriding) {
        moveEnable();
        moveRelease();
        overriding = false;
    }
    return;
}

// ---- line 3726 ----
function clearCommitment() {
    committedAngle = null;
    committedStop = false;
    return;
}

// ---- line 3730 ----
function applyChoice(angle, isStop) {
    overriding = true;
    committedAngle = (isStop ? null : angle);
    committedStop = isStop;
    if (isStop) {
        moveRelease();
        moveDisable();
        return;
    }
    let deg;
    moveEnable();
    deg = (((angle * 180) / Math.PI) + 90);
    if (state.revertMovement) {
        deg = (deg + 180);
    }
    move(deg);
    return;
}

// ---- line 3744 ----
function update() {
    let pick;
    let comInBest;
    let comScore;
    let bestHit;
    let bestScore;
    let bestIdx;
    let blend;
    let maxClearInBest;
    let bestClass;
    let t;
    let steering;
    let K;
    let stopIdx;
    let intentIdx;
    let committedIdx;
    let n;
    let urgency;
    let intentSafe;
    let stopSafe;
    let relMargin;
    let intentClear;
    let intentHit;
    let stopClear;
    let stopHit;
    let iuy;
    let iux;
    let intentAngle;
    let mirrored;
    let slack;
    let now;
    if (!(config.dodge.enabled)) {
        release();
        return;
    }
    now = Date.now();
    if ((lastNow > 0)) {
        let dt;
        dt = ((now - lastNow) / 1000);
        if ((dt > (1 / 240))) {
            if ((dt < 0.1)) {
                dtFrame = dt;
            }
        }
    }
    lastNow = now;
    meX = state.ownX;
    meY = state.ownY;
    myRadius = state.ownRadius;
    mySpeed = state.ownSpeed;
    if (!(!(mySpeed))) {
    }
    if (!(mySpeed)) {
        let gid;
        for (const gid of bundleCache.keys()) {
            if (!(!(liveProjectiles.has(gid)))) continue;
            bundleCache.delete(gid);
        }
        release();
        return;
    }
    gatherHazards(now);
    if ((bundleCache.size > liveProjectiles.size)) {
        let gid;
        for (const gid of bundleCache.keys()) {
            if (!(!(liveProjectiles.has(gid)))) continue;
            bundleCache.delete(gid);
        }
    }
    if ((hCount === 0)) {
        release();
        return;
    }
    slack = .max.dtFrame((config.dodge.reactionSlackFrames * (config.dodge.reactionSlackFrames || 1)), LOGIC_TICK);
    margin = (mySpeed * slack);
    lastMargin = margin;
    tickSlackS = (config.dodge.tickHitSlack * (config.dodge.tickHitSlack || 0));
    mirrored = !(!(state.revertMovement));
    intentAngle = null;
    iux = 0;
    iuy = 0;
    if ((userMoveAngle !== false)) {
        if ((userMoveAngle !== null)) {
            intentAngle = (((parseFloat(userMoveAngle) - 90) * Math.PI) / 180);
            if (mirrored) {
                intentAngle = (intentAngle + Math.PI);
            }
            iux = (Math.cos(intentAngle) * mySpeed);
            iuy = (Math.sin(intentAngle) * mySpeed);
        }
    }
    evalMotion(0, 0, true);
    stopHit = e_hit;
    stopClear = e_clear;
    evalMotion(iux, iuy, false);
    intentHit = e_hit;
    intentClear = e_clear;
    relMargin = (margin + (mySpeed * dtFrame));
    stopSafe = ((stopHit === Infinity) && (stopClear >= relMargin));
    intentSafe = ((intentHit === Infinity) && (intentClear >= relMargin));
    if (stopSafe) {
        if (intentSafe) {
            if (overriding) {
                if (config.dodge.debug) {
                    console.log("[dodge] release");
                }
            }
            return;
        }
    }
    urgency = config.dodge.interventionUrgency;
    if ((urgency !== Infinity)) {
        if (!(overriding)) {
            if (intentSafe) {
                if ((stopHit !== Infinity)) {
                    if ((imCount > 0)) {
                        let tNeed;
                        let i;
                        i = imIdx[0];
                        tNeed = dtFrame;
                        if ((hKind[i] === 0)) {
                            let need;
                            let lateral;
                            let hv;
                            let dy;
                            let dx;
                            dx = (meX - hPx[i]);
                            dy = (meY - hPy[i]);
                            hv = Math.hypot(hVx[i], hVy[i]);
                            lateral = undefined;
                            if ((hv > 1e-09)) {
                                lateral = Math.abs(((dx * (hVy[i] / hv)) - (dy * (hVx[i] / hv))));
                            } else {
                                lateral = Math.sqrt(((dx * dx) + (dy * dy)));
                            }
                            need = ((hR[i] + margin) - lateral);
                            if (((need / mySpeed) > tNeed)) {
                                tNeed = (need / mySpeed);
                            }
                        }
                        if ((stopHit > (urgency * tNeed))) {
                            return;
                        }
                    }
                }
            }
        }
    }
    collectTangents();
    n = 0;
    committedIdx = -1;
    intentIdx = -1;
    stopIdx = undefined;
    if (!(+(committedAngle))) {
        committedIdx = n;
        cAngle[n] = committedAngle;
        n++;
        (intentHit === Infinity)[cStop] = 0;
    }
    stopIdx = n;
    cAngle[n] = 0;
    n++;
    (intentHit === Infinity)[cStop] = 1;
    if (committedStop) {
        committedIdx = stopIdx;
    }
    if (!(+(intentAngle))) {
        intentIdx = n;
        cAngle[n] = intentAngle;
        n++;
        (stopHit === Infinity)[cStop] = 0;
    }
    K = Math.max(8, (config.dodge.escapeDirections | 0));
    let k;
    k = 0;
    while ((k < K)) {
        if ((n < 120)) break;
        cAngle[n] = (((2 * Math.PI) * k) / K);
        n++;
        cStop[0] = <under>;
        k++;
    }
    let k;
    k = 0;
    while ((k < tangentCount)) {
        if ((n < 128)) break;
        cAngle[n] = tangentAngles[k];
        n++;
        cStop[0] = <under>;
        k++;
    }
    steering = (intentAngle !== null);
    t = .min.0.5(Math, .max.0(config.dodge.intentInfluence, (config.dodge.intentInfluence || 0)));
    bestClass = -1;
    maxClearInBest = -(Infinity);
    let k;
    k = 0;
    while ((k < n)) {
        let uy;
        let ux;
        ux = 0;
        uy = 0;
        if (!(cStop[k])) {
            ux = (Math.cos(cAngle[k]) * mySpeed);
            uy = (Math.sin(cAngle[k]) * mySpeed);
        }
        evalMotion(ux, uy, false);
        cCls[k] = ((e_hit !== Infinity) ? 0 : ((e_clear >= margin) ? 2 : 1));
        cClear[k] = e_clear;
        cHit[k] = e_hit;
        if ((cCls[k] > bestClass)) {
            bestClass = cCls[k];
            maxClearInBest = e_clear;
        } else {
            if ((cCls[k] === bestClass)) {
                if ((e_clear > maxClearInBest)) {
                    maxClearInBest = e_clear;
                }
            }
        }
        k++;
    }
    blend = ((bestClass === 2) && steering);
    bestIdx = -1;
    bestScore = -(Infinity);
    bestHit = -(Infinity);
    comScore = -(Infinity);
    comInBest = false;
    let k;
    k = 0;
    while ((k < n)) {
        let score;
        if (!((cCls[k] !== bestClass))) {
            score = undefined;
            if (blend) {
                let align;
                align = (cStop[k] ? -1 : Math.cos((cAngle[k] - intentAngle)));
                score = (((1 - t) * cClear[k]) + ((t * align) * maxClearInBest));
            }
            score = cClear[k];
            if (!((score > bestScore))) {
                if ((score === bestScore)) {
                    if ((cHit[k] > bestHit)) {
                        bestScore = score;
                        bestHit = cHit[k];
                        bestIdx = k;
                    }
                }
            }
            if ((score > bestScore)) {
                bestScore = score;
                bestHit = cHit[k];
                bestIdx = k;
            }
            if ((k === committedIdx)) {
                comScore = score;
                comInBest = true;
            }
        }
        k++;
    }
    if ((bestIdx < 0)) {
        return;
    }
    pick = bestIdx;
    if (comInBest) {
        let reversal;
        if ((committedAngle !== null)) {
        }
        reversal = (committedAngle !== null);
        if ((reversal || ((bestScore - comScore) <= (mySpeed * dtFrame)))) {
            pick = committedIdx;
        }
    }
    if (config.dodge.debug) {
        if (!(overriding)) {
            let tDist;
            let threat;
            threat = ((imCount > 0) ? hName[imIdx[0]] : "?");
            tDist = ((imCount > 0) ? Math.round(Math.hypot((hPx[imIdx[0]] - meX), (hPy[imIdx[0]] - meY))) : -1);
            console.log("[dodge] takeover vs ".concat(threat, " (dist ", tDist, "): intent tHit=", ((intentHit === Infinity) ? "never" : (Math.round((intentHit * 1000)) + "ms")), " clear=", Math.round(intentClear), " me=(", meX, ",", meY, ") spd=", Math.round(mySpeed), " reserve=", Math.round(relMargin), " fps=", Math.round((1 / dtFrame)), " mirror=", state.revertMovement, " -> ", (cStop[pick] ? "STOP" : (("dir " + Math.round(((cAngle[pick] * 180) / Math.PI))) + "deg")), " (class ", bestClass, ")"));
        }
    }
    return;
}

// --------------------------------------------------------------------------
// module body (src/mech/dodge.js)
// --------------------------------------------------------------------------
// ---- line 3902 ----
function anon3902() {
    init_node_globals();
    init_config();
    init_projectiledetection();
    init_mapDetection();
    init_movement();
    init_dodgeProfiles();
    base10 = Process.getModuleByName("libg.so").base;
    {}.LogicBattleModeClient_update = 12714096;
    {}.BattleMode_enter = 10204192;
    offsets4 = {};
    TILE = 300;
    LOGIC_TICK = 0.05;
    LOGIC_TICK_MS = 50;
    {}.RocketGirlProjectile = 2700;
    KNOWN_RANGES = {};
    RAY_MOVE = 0;
    RAY_LOS_NORMAL = 1;
    RAY_LOS_BUTTER = 2;
    {}.TILE = TILE;
    {}.LOGIC_TICK_MS = LOGIC_TICK_MS;
    // module entry: movingDisc
    // module entry: staticDisc
    // module entry: capsule
    // module entry: predictDeath
    // module entry: compileGeneric
    // module entry: observedRange
    // module entry: rangeExpiryObserved
    // module entry: livePos
    // module entry: losEndpoint
    api = <under>;
    bundleCache = new Map();
    MAXH = 2048;
    hKind = new Int8Array(MAXH);
    hPx = new Float64Array(MAXH);
    hPy = new Float64Array(MAXH);
    hVx = new Float64Array(MAXH);
    hVy = new Float64Array(MAXH);
    hAx = new Float64Array(MAXH);
    hAy = new Float64Array(MAXH);
    hBx = new Float64Array(MAXH);
    hBy = new Float64Array(MAXH);
    hR = new Float64Array(MAXH);
    hTa = new Float64Array(MAXH);
    hTb = new Float64Array(MAXH);
    hName = new Array(MAXH);
    hCount = 0;
    meX = 0;
    meY = 0;
    mySpeed = 1;
    myRadius = 0;
    tEvalMax = 0;
    maxClose = 0;
    margin = 0;
    lastMargin = 0;
    dtFrame = (1 / 60);
    g_hit = Infinity;
    g_leave = -(Infinity);
    g_clear = Infinity;
    tickSlackS = 0;
    m_hit = Infinity;
    m_leave = -(Infinity);
    m_clear = Infinity;
    e_hit = Infinity;
    e_clear = Infinity;
    e_leave = 0;
    imIdx = new Int32Array(16);
    imHit = new Float64Array(16);
    imCount = 0;
    tangentAngles = new Float64Array(32);
    tangentCount = 0;
    overriding = false;
    committedAngle = null;
    committedStop = false;
    lastNow = 0;
    cAngle = new Float64Array(128);
    cStop = new Uint8Array(128);
    cCls = new Int8Array(128);
    cClear = new Float64Array(128);
    cHit = new Float64Array(128);
    // module entry: onEnter
    Float64Array.Interceptor(.attach, base10.add(offsets4.BattleMode_enter));
    // module entry: onEnter
    Float64Array.Interceptor(.attach, base10.add(offsets4.LogicBattleModeClient_update));
    return;
}
// ---- line 3930 ----
function anon3930(o) {
    let effRange;
    let paddedRange;
    let speed;
    let sin;
    let cos;
    cos = Math.cos(o.angle);
    sin = Math.sin(o.angle);
    if (o.noSpeedPad) {
    } else {
    }
    speed = <under>.Math(.max, (1 + o.speed));
    if ((o.expiryTrusted === false)) {
    } else {
        if (o.noPad) {
        } else {
        }
    }
    paddedRange = <under>;
    if (o.ignoreWalls) {
    } else {
        /* @212 ?? ('unknown', 'call', 212) */
    }
    effRange = <under>;
    {}.kind = 0;
    {}.flight = false;
    {}.px = o.x;
    {}.py = o.y;
    {}.anchorT = o.t0;
    {}.vx = (cos * speed);
    {}.vy = (sin * speed);
    {}.r = o.radius;
    {}.t0 = o.t0;
    {}.t1 = (o.t0 + ((effRange / speed) * 1000));
    {}.sx = o.x;
    {}.sy = o.y;
    {}.speed = speed;
    {}.effRange = effRange;
    /* @376 ?? ('unknown', 'UN_0xf5', 376) */
    {}.angleErr = (o.angleErr ? (Math.PI / 360) : o.angleErr);
    return {};
}
// ---- line 3955 ----
function anon3955(o) {
    {}.kind = 0;
    {}.flight = false;
    {}.px = o.x;
    {}.py = o.y;
    {}.anchorT = o.t0;
    {}.vx = 0;
    {}.vy = 0;
    {}.r = o.radius;
    {}.t0 = o.t0;
    {}.t1 = o.t1;
    {}.sx = o.x;
    {}.sy = o.y;
    {}.speed = 0;
    {}.effRange = 0;
    return {};
}
// ---- line 3973 ----
function anon3973(o) {
    {}.kind = 1;
    {}.flight = false;
    {}.ax = o.ax;
    {}.ay = o.ay;
    {}.bx = o.bx;
    {}.by = o.by;
    {}.r = o.radius;
    {}.t0 = o.t0;
    {}.t1 = o.t1;
    return {};
}
// ---- line 3986 ----
function anon3986(proj) {
    let eff;
    let deathDist;
    let sin;
    let cos;
    let rad;
    if ((proj.isThrower === 1)) {
        if (((proj.targetX !== 0) || (proj.targetY !== 0))) {
            let cur;
            let elapsed;
            let now;
            let t;
            let dirAngle;
            let total;
            let dy;
            let dx;
            dx = (proj.targetX - proj.x);
            dy = (proj.targetY - proj.y);
            total = Math.sqrt(((dx * dx) + (dy * dy)));
            dirAngle = Math.atan2(dy, dx);
            t = undefined;
            now = Date.now();
            elapsed = (now - proj.timestamp);
            cur = api.livePos(proj);
            if (cur) {
                if ((elapsed > 0)) {
                    if ((total > 1)) {
                        let traveled;
                        let remaining;
                        remaining = Math.hypot((proj.targetX - cur.x), (proj.targetY - cur.y));
                        traveled = (total - remaining);
                        if ((traveled > (total * 0.05))) {
                            t = (now + (remaining * (elapsed / traveled)));
                        }
                    }
                }
            }
            /* @314 ?? ('unknown', 'UN_0xf5', 314) */
            if (t) {
                t = (proj.timestamp + ((total / Math.max(1, proj.speed)) * 1000));
            }
            {}.x = proj.targetX;
            {}.y = proj.targetY;
            {}.t = t;
            {}.dirAngle = dirAngle;
            return {};
        }
    }
    rad = ((proj.angle * Math.PI) / 180);
    cos = Math.cos(rad);
    sin = Math.sin(rad);
    deathDist = KNOWN_RANGES[proj.name];
    if (!(deathDist)) {
        let obs;
        obs = api.observedRange(proj.name);
        deathDist = ((obs > 0) ? Math.min(obs, proj.range) : proj.range);
    }
    /* @576 ?? ('unknown', 'call', 576) */
    eff = !(!(proj.piercesEnvironmentLikeButter));
    {}.x = (proj.x + (cos * eff));
    {}.y = (proj.y + (sin * eff));
    {}.t = (proj.timestamp + ((eff / Math.max(1, proj.speed)) * 1000));
    {}.dirAngle = rad;
    return {};
}
// ---- line 4020 ----
function anon4020(proj) {
    return compileGeneric(proj, api);
}
// ---- line 4024 ----
function anon4024(name) {
    let r;
    r = observedProjectileRange.get(name);
    /* @21 ?? ('unknown', 'UN_0xf5', 21) */
    if (r) {
        return 0;
    }
    return r;
}
// ---- line 4030 ----
function anon4030(name) {
    return rangeExpiryNames.has(name);
}
// ---- line 4034 ----
function anon4034(proj) {
    try {
        {}.x = getObjX(proj.ptr);
        {}.y = getObjY(proj.ptr);
        return {};
    } catch (e) {
        {}.x = proj.x;
        {}.y = proj.y;
        return {};
    }
}
// ---- line 4043 ----
function anon4043(x, y, angleRad, maxDist, piercesButter) {
    let d;
    let s;
    let c;
    c = Math.cos(angleRad);
    s = Math.sin(angleRad);
    /* @58 ?? ('unknown', 'call', 58) */
    d = !(!(piercesButter));
    {}.x = (x + (c * d));
    {}.y = (y + (s * d));
    {}.dist = d;
    return {};
}
// ---- line 4099 ----
function anon4099() {
    bundleCache.clear();
    overriding = false;
    committedAngle = null;
    committedStop = false;
    lastNow = 0;
    try {
        moveEnable();
        moveRelease();
        return;
    } catch (e) {
        return;
    }
}
// ---- line 4113 ----
function anon4113() {
    try {
        update();
        return;
    } catch (e) {
        release();
    }
}
