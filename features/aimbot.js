import "frida-builtins:/node-globals.js";
import "../config.js";

function clamp(v, lo, hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

function hypot(x, y) {
  return Math.sqrt(x * x + y * y);
}

function regress(pts) {
  let n = pts.length;
  if (n < 2) return null;
  let t0 = pts[0].t;
  let sT = 0, sT2 = 0, sX = 0, sY = 0, sTX = 0, sTY = 0;
  for (let i = 0; i < n; i++) {
    let tt = (pts[i].t - t0) / 1000;
    sT += tt;
    sT2 += tt * tt;
    sX += pts[i].x;
    sY += pts[i].y;
    sTX += tt * pts[i].x;
    sTY += tt * pts[i].y;
  }
  let denom = n * sT2 - sT * sT;
  if (Math.abs(denom) < 1e-09) return null;
  return {
    vx: (n * sTX - sT * sX) / denom,
    vy: (n * sTY - sT * sY) / denom
  };
}

function estimateAccel(pts) {
  let n = pts.length;
  let mid = Math.floor(n / 2);
  let early = regress(pts.slice(0, mid + 1));
  let late = regress(pts.slice(mid));
  if (!early || !late) return { ax: 0, ay: 0 };
  let tEarly = (pts[0].t + pts[mid].t) / 2;
  let tLate = (pts[mid].t + pts[n - 1].t) / 2;
  let dt = (tLate - tEarly) / 1000;
  if (dt <= 1e-06) return { ax: 0, ay: 0 };
  return {
    ax: (late.vx - early.vx) / dt,
    ay: (late.vy - early.vy) / dt
  };
}

function updateTracking(x, y, id) {
  let a = config.aimbot;
  let now = Date.now();
  if (id !== currentTargetID) {
    samples.length = 0;
    currentTargetID = id;
    haveEma = false;
    prevVx = 0;
    prevVy = 0;
    trackedVx = 0;
    trackedVy = 0;
    trackedAx = 0;
    trackedAy = 0;
  }
  samples.push({ x, y, t: now });
  let maxLen = a.lastpositionsLen | 0;
  if (maxLen < 2) maxLen = 2;
  while (samples.length > maxLen) samples.shift();
  if (samples.length < 2) {
    trackedVx = 0;
    trackedVy = 0;
    trackedAx = 0;
    trackedAy = 0;
    return;
  }
  let vfit = regress(samples) || { vx: 0, vy: 0 };
  let vx = vfit.vx;
  let vy = vfit.vy;
  let snapped = false;
  let jp = a.jukePredict;
  if (jp && jp.enabled && jp.reactive) {
    let vnew = regress(samples.slice(-3));
    if (vnew) {
      let dot = vnew.vx * prevVx + vnew.vy * prevVy;
      if (dot < 0 && hypot(vnew.vx, vnew.vy) > a.deadzoneSpeed) {
        vx = vnew.vx;
        vy = vnew.vy;
        snapped = true;
      }
    }
  }
  if (snapped) {
    emaVx = vx;
    emaVy = vy;
    haveEma = true;
  } else {
    let k = clamp(a.velocitySmoothing || 0, 0, 0.5);
    if (!haveEma) {
      emaVx = vx;
      emaVy = vy;
      haveEma = true;
    } else {
      emaVx = k * emaVx + (1 - k) * vx;
      emaVy = k * emaVy + (1 - k) * vy;
    }
  }
  trackedVx = emaVx;
  trackedVy = emaVy;
  prevVx = trackedVx;
  prevVy = trackedVy;
  trackedAx = 0;
  trackedAy = 0;
  if (a.curvePredict && a.curvePredict.enabled && samples.length >= 4) {
    let acc, ax, ay, spd, amax, amag, s;
    acc = estimateAccel(samples);
    ax = acc.ax;
    ay = acc.ay;
    spd = hypot(trackedVx, trackedVy);
    amax = spd * 8;
    amag = hypot(ax, ay);
    if (amag > amax && amag > 1) {
      s = amax / amag;
      ax *= s;
      ay *= s;
    }
    trackedAx = ax;
    trackedAy = ay;
  }
}

function solveIntercept(sx, sy, tx, ty, vx, vy, ax, ay, P, maxT) {
  let t = hypot(tx - sx, ty - sy) / P;
  for (let i = 0; i < 6; i++) {
    let px, py, nt;
    px = tx + vx * t + 0.5 * ax * t * t;
    py = ty + vy * t + 0.5 * ay * t * t;
    nt = hypot(px - sx, py - sy) / P;
    if (nt > maxT) nt = maxT;
    if (Math.abs(nt - t) < 0.0005) {
      t = nt;
      break;
    }
    t = nt;
  }
  if (t > maxT) t = maxT;
  return {
    x: tx + vx * t + 0.5 * ax * t * t,
    y: ty + vy * t + 0.5 * ay * t * t
  };
}

function computeAimPoint(sx, sy, P) {
  let a = config.aimbot;
  if (samples.length < 1) return null;
  let cur = samples[samples.length - 1];
  let speed = hypot(trackedVx, trackedVy);
  if (speed < a.deadzoneSpeed) return { x: cur.x, y: cur.y };
  let str = typeof a.predictionStrength === "number" ? a.predictionStrength : 1;
  let maxT = typeof a.maxLeadTime === "number" && a.maxLeadTime > 0 ? a.maxLeadTime : 0.9;
  let vx = trackedVx * str;
  let vy = trackedVy * str;
  let ax = trackedAx * str;
  let ay = trackedAy * str;
  let fwd = solveIntercept(sx, sy, cur.x, cur.y, vx, vy, ax, ay, P, maxT);
  let jp = a.jukePredict;
  if (jp && jp.enabled && jp.bias > 0) {
    let bias, rev;
    bias = clamp(jp.bias, 0, 1);
    rev = solveIntercept(sx, sy, cur.x, cur.y, -vx, -vy, 0, 0, P, maxT);
    return {
      x: fwd.x * (1 - bias) + rev.x * bias,
      y: fwd.y * (1 - bias) + rev.y * bias
    };
  }
  return fwd;
}

function applyAimbotConfig(skillClient) {
  if (!battleMode) return null;
  if (!config.aimbot.enabled) return null;
  let SkillData = natives.LogicSkillClient_getData(skillClient);
  if (SkillData.isNull()) return null;
  let ProjectileData = natives.LogicSkillClient_getProjectile(SkillData, 0);
  if (ProjectileData.isNull()) return null;
  let skillName = "";
  try {
    skillName = NativeString.toJSString(natives.LogicData_getName(SkillData));
  } catch (e) {
  }
  if (blacklistedSkills.includes(skillName)) return null;
  let speedNative = natives.LogicProjectileData_getSpeed(ProjectileData);
  let P = speedNative > 0 ? speedNative : config.aimbot.projectileSpeed;
  if (!P || P <= 0) return null;
  let ownLogicCharacter = natives.LogicBattleModeClient_getOwnCharacter(battleMode);
  if (ownLogicCharacter.isNull()) return null;
  let ownX = natives.LogicGameObjectClient_getX(ownLogicCharacter);
  let ownY = natives.LogicGameObjectClient_getY(ownLogicCharacter);
  let aim = computeAimPoint(ownX, ownY, P);
  if (!aim) return null;
  return { x: Math.round(aim.x), y: Math.round(aim.y) };
}

function triggerShot(BattleScreen, x, y, ownChar, nextSkillClient, isAimed) {
  let newX = x;
  let newY = y;
  if (config.aimbot.enabled && !isAimed) {
    let aimTarget = applyAimbotConfig(nextSkillClient);
    if (aimTarget) {
      newX = aimTarget.x;
      newY = aimTarget.y;
    }
  }
  natives.BattleScreen_activateSkill_orig(BattleScreen, newX, newY, ownChar, nextSkillClient, ptr(0), isAimed ? 0 : ID);
}

var base = Module.getBaseAddress("libg.so");
var offset = {

  LogicBattleModeClient_update: 12714096,

  LogicGameObjectClient_getX: 11913624,

  LogicGameObjectClient_getY: 11913632,

  LogicBattleModeClient_getOwnCharacter: 12722116,

  BattleScreen_getClosestTargetForAutoshoot: 8868908,

  BattleScreen_activateSkill: 8764700,

  LogicSkillClient_getData: 12030616,

  LogicSkillData_getProjectile: 11586408,

  LogicProjectileData_getSpeed: 11507308,

  LogicProjectileData_getRadius: 11507436,

  LogicGameObjectClient_getGlobalID: 11913540,

  LogicData_getName: 11283052,

  LogicCharacterClient_getLinkedCarryable: 11731640,

  BattleMode_getInstance: 10197860,

  LogicCharacterClient_hasAmmo: 11733412,

  LogicCharacterClient_canCastSkill: 11734712,

  LogicPlayer_hasUlti: 12851068,

  LogicCharacterClientOwn_getUltiSkillClient: 11743036,

  LogicCharacterClientOwn_getNextSkillClient: 11742880,

  LogicCharacterClient_getOwnPlayerIndex: 12721172,

  getManualCoords: 8763216

};

var natives = {
  LogicBattleModeClient_getOwnCharacter: new NativeFunction(base.add(offset.LogicBattleModeClient_getOwnCharacter), "pointer", ["pointer"]),
  LogicGameObjectClient_getX: new NativeFunction(base.add(offset.LogicGameObjectClient_getX), "uint32", ["pointer"]),
  LogicGameObjectClient_getY: new NativeFunction(base.add(offset.LogicGameObjectClient_getY), "uint32", ["pointer"]),
  LogicSkillClient_getData: new NativeFunction(base.add(offset.LogicSkillClient_getData), "pointer", ["pointer"]),

  LogicSkillClient_getProjectile: new NativeFunction(base.add(offset.LogicSkillData_getProjectile), "pointer", ["pointer", "uint32"]),

  LogicProjectileData_getSpeed: new NativeFunction(base.add(offset.LogicProjectileData_getSpeed), "uint32", ["pointer"]),
  LogicProjectileData_getRadius: new NativeFunction(base.add(offset.LogicProjectileData_getRadius), "uint32", ["pointer"]),
  LogicGameObjectClient_getGlobalID: new NativeFunction(base.add(offset.LogicGameObjectClient_getGlobalID), "uint32", ["pointer"]),
  LogicData_getName: new NativeFunction(base.add(offset.LogicData_getName), "pointer", ["pointer"]),
  LogicCharacterClient_getLinkedCarryable: new NativeFunction(base.add(offset.LogicCharacterClient_getLinkedCarryable), "pointer", ["pointer", "pointer"]),

  BattleMode_getInstance: new NativeFunction(base.add(offset.BattleMode_getInstance), "pointer", ["pointer"]),
  LogicCharacterClient_hasAmmo: new NativeFunction(base.add(offset.LogicCharacterClient_hasAmmo), "bool", ["pointer"]),
  LogicCharacterClient_canCastSkill: new NativeFunction(base.add(offset.LogicCharacterClient_canCastSkill), "bool", ["pointer", "pointer", "pointer"]),

  LogicPlayer_hasUlti: new NativeFunction(base.add(offset.LogicPlayer_hasUlti), "bool", ["pointer"]),
  LogicCharacterClientOwn_getUltiSkillClient: new NativeFunction(base.add(offset.LogicCharacterClientOwn_getUltiSkillClient), "pointer", ["pointer"]),
  BattleScreen_activateSkill_orig: new NativeFunction(base.add(offset.BattleScreen_activateSkill), "void", ["pointer", "int", "int", "pointer", "pointer", "pointer", "int"]),

  LogicCharacterClientOwn_getNextSkillClient: new NativeFunction(base.add(offset.LogicCharacterClientOwn_getNextSkillClient), "pointer", ["pointer", "pointer"]),
  LogicCharacterClient_getOwnPlayerIndex: new NativeFunction(base.add(offset.LogicCharacterClient_getOwnPlayerIndex), "int", ["pointer"]),
  getManualCoords: new NativeFunction(base.add(offset.getManualCoords), "uint64", ["pointer", "pointer", "pointer"])
};

class NativeString {
  static toJSString(stringPtr) {
    if (!stringPtr || stringPtr.isNull()) return "";
    try {
      let len = stringPtr.add(4).readInt();
      if (len === 0) return "";
      if (len > 7) return stringPtr.add(8).readPointer().readUtf8String(len);
      return stringPtr.add(8).readUtf8String(len);
    } catch (e) {
      return "";
    }
  }
}

var battleMode = null;

Interceptor.attach(base.add(offset.LogicBattleModeClient_update), {
  onEnter: function (args) {
    battleMode = args[0];
  }
});
var ID = 1000000;
var samples = [];
var currentTargetID = -1;
var emaVx = 0;
var emaVy = 0;
var haveEma = false;
var prevVx = 0;
var prevVy = 0;
var trackedVx = 0;
var trackedVy = 0;
var trackedAx = 0;
var trackedAy = 0;

Interceptor.attach(base.add(offset.BattleScreen_getClosestTargetForAutoshoot), {
  onLeave: function (retval) {
    if (retval == 0) return;
    let x = natives.LogicGameObjectClient_getX(retval);
    let y = natives.LogicGameObjectClient_getY(retval);
    let gid = natives.LogicGameObjectClient_getGlobalID(retval);
    ID = gid;
    updateTracking(x, y, gid);
  }
});
var SHOOT_STICK_ACTIVE_OFFSET = 3913;
var ULTI_STICK_ACTIVE_OFFSET = 3914;
var SHOOT_STICK_AIMING_OFFSET = 3821;
var blacklistedSkills = ["ShamanUlti", "MechanicUlti", "ClusterBombDudeUlti", "ArcadeUlti", "ArtilleryDudeUlti", "SoulCollectorUlti", "MinigunDudeUlti", "KnightUlti", "DuplicatorUlti", "TwinsUlti", "SpawnerDudeUlti", "ConductorUlti", "MeepleUlti", "FleaUlti", "ReviverUlti", "VoodooUlti", "ShadowdemonUlti", "RollerUlti", "SniperUlti", "EnragerUlti", "PowerLevelerUlti", "DoorManUlti", "ConductorUltiSpawn"];

Interceptor.replace(base.add(offset.BattleScreen_activateSkill), new NativeCallback(function (battleScreen, x, y, character, skillClient, target, targetID) {
  let newX = x;
  let newY = y;
  let newTarget = target;
  let isAutoshot = targetID !== 0;
  if (isAutoshot && battleMode && config.aimbot.enabled) {
    let aimTarget = applyAimbotConfig(skillClient);
    if (aimTarget) {
      newX = aimTarget.x;
      newY = aimTarget.y;
      newTarget = ptr(0);
    }
  }
  natives.BattleScreen_activateSkill_orig(battleScreen, newX, newY, character, skillClient, newTarget, targetID);
}, "void", ["pointer", "int", "int", "pointer", "pointer", "pointer", "int"]));
var lastUltiAimTime = 0;

Interceptor.attach(base.add(8799892), {
  onEnter(args) {
    let BattleScreen = args[0];
    let shootStickActive = BattleScreen.add(SHOOT_STICK_ACTIVE_OFFSET).readU8();
    let ultiStickActive = BattleScreen.add(ULTI_STICK_ACTIVE_OFFSET).readU8();
    let shootStickAiming = BattleScreen.add(SHOOT_STICK_AIMING_OFFSET).readU8();
    if (ultiStickActive) {
      lastUltiAimTime = Date.now();
      return;
    }
    if (Date.now() - lastUltiAimTime < 150) return;
    let battleInstance = natives.BattleMode_getInstance(ptr(0));
    if (battleInstance == ptr(0) || battleInstance == 16) return;
    let logicBattleModeClient = battleInstance.add(40).readPointer();
    if (logicBattleModeClient.isNull()) return;
    let ownChar = natives.LogicBattleModeClient_getOwnCharacter(logicBattleModeClient);
    if (ownChar.isNull()) return;
    let nextSkillClient = ptr(0);
    let nextSkillData = ptr(0);
    let ownPlayer = ptr(0);
    try {
      let playerIndex = natives.LogicCharacterClient_getOwnPlayerIndex(logicBattleModeClient);
      let playerArray = logicBattleModeClient.readPointer();
      if (playerArray.isNull() || playerArray.toUInt32() < 4096) return;
      ownPlayer = playerArray.add(playerIndex * 8).readPointer();
      if (ownPlayer.isNull() || ownPlayer.toUInt32() < 4096) return;
      nextSkillClient = natives.LogicCharacterClientOwn_getNextSkillClient(ownChar, ownPlayer);
      if (nextSkillClient.isNull()) return;
      nextSkillData = natives.LogicSkillClient_getData(nextSkillClient);
      if (nextSkillData.isNull()) return;
    } catch (e) {
      return;
    }
    let canCastNormal = natives.LogicCharacterClient_canCastSkill(ownChar, nextSkillData, ownPlayer);
    let ultiSkillClient = natives.LogicCharacterClientOwn_getUltiSkillClient(ownChar);
    let canCastUlti = false;
    if (!ultiSkillClient.isNull() && natives.LogicPlayer_hasUlti(ownPlayer)) {
      let ultiSkillData = natives.LogicSkillClient_getData(ultiSkillClient);
      canCastUlti = natives.LogicCharacterClient_canCastSkill(ownChar, ultiSkillData, ownPlayer);
    }
    let linkedCarryable = natives.LogicCharacterClient_getLinkedCarryable(ownChar, logicBattleModeClient);
    let hasCarryable = !linkedCarryable.isNull();
    let targetX = BattleScreen.add(3964).readU32();
    let targetY = BattleScreen.add(3968).readU32();
    let packedCoords = natives.getManualCoords(BattleScreen, ownChar, nextSkillData);
    let packedBig = BigInt(packedCoords);
    let targetXAimed = Number(packedBig & 0xFFFFFFFFn);
    let targetYAimed = Number(packedBig >> 32n);
    let willShoot = false;
    let finalX = 0;
    let finalY = 0;
    let isAimed = false;
    let skillToTrigger = nextSkillClient;
    if (!hasCarryable && config.autoUlti && config.autoUlti.enabled && canCastUlti && ID !== 1000000) {
      willShoot = true;
      finalX = targetX;
      finalY = targetY;
      isAimed = false;
      skillToTrigger = ultiSkillClient;
    } else if (!hasCarryable && canCastNormal) {
      if (config.holdToShoot.enabled && shootStickActive) {
        willShoot = true;
        if (!shootStickAiming) {
          finalX = targetX;
          finalY = targetY;
          isAimed = false;
        } else {
          finalX = targetXAimed;
          finalY = targetYAimed;
          isAimed = true;
        }
      } else if (config.autoShoot.enabled) {
        if (!shootStickAiming) {
          willShoot = true;
          finalX = targetX;
          finalY = targetY;
          isAimed = false;
        } else if (shootStickActive && shootStickAiming) {
          willShoot = true;
          finalX = targetXAimed;
          finalY = targetYAimed;
          isAimed = true;
        }
      }
    }
    if (willShoot) {
      triggerShot(BattleScreen, finalX, finalY, ownChar, skillToTrigger, isAimed);
    }
  }
});
