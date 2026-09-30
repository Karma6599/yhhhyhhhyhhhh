import "frida-builtins:/node-globals.js";
import "../config.js";

export function getObjX(ptr) {
  return natives.getX(ptr);
}

export function getObjY(ptr) {
  return natives.getY(ptr);
}

function recordObservedRange(proj, x, y) {
  let flown = Math.hypot(x - proj.x, y - proj.y);
  let prev = observedProjectileRange.get(proj.name);
  if (prev === undefined || flown > prev) {
    observedProjectileRange.set(proj.name, flown);
  }
  if (flown >= proj.range - 80) {
    rangeExpiryNames.add(proj.name);
  }
}

function detectSpikeVariant(proj, deathX, deathY) {
  if (spikeVariant !== null && proj.name !== "CactusSpike") return;
  let dx = deathX - proj.x;
  let dy = deathY - proj.y;
  if (dx * dx + dy * dy < 1000 * 1000) return;
  let chordAng = Math.atan2(dy, dx) * 180 / Math.PI;
  let dev = Math.abs(((chordAng - proj.angle) % 360 + 540) % 360 - 180);
  spikeVariant = dev > 22 ? "curve" : "straight";
  console.log("[dodge] Spike detected: ".concat(spikeVariant, " (chord ", dev.toFixed(0), "° off spawn angle at ", Math.round(Math.sqrt(dx * dx + dy * dy)), "u)"));
}

function normalizeAngle(angle) {
  return (angle + 90) % 360;
}

function calculateAngle(ptr) {
  return new Promise((resolve) => {
    let startX = natives.getX(ptr);
    let startY = natives.getY(ptr);
    let poll = setInterval(() => {
      try {
        let dx = natives.getX(ptr) - startX;
        let dy = natives.getY(ptr) - startY;
        if (Math.sqrt(dx * dx + dy * dy) >= 30) {
          clearInterval(poll);
          resolve((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360);
        }
      } catch (e) {
        clearInterval(poll);
        resolve(0);
      }
    }, 5);
  });
}

function fitParabolaFindZero(points, z0) {
  let s4 = 0, s3 = 0, s2 = 0, s2y = 0, s1y = 0;
  for (let { d, z } of points) {
    let y = z - z0;
    let d2 = d * d;
    s4 += d2 * d2;
    s3 += d2 * d;
    s2 += d2;
    s2y += d2 * y;
    s1y += d * y;
  }
  let det = s4 * s2 - s3 * s3;
  if (Math.abs(det) < 1e-09) return null;
  let a = (s2y * s2 - s1y * s3) / det;
  let b = (s4 * s1y - s3 * s2y) / det;
  let disc = b * b - 4 * a * z0;
  if (disc < 0 || Math.abs(a) < 1e-12) return null;
  let sq = Math.sqrt(disc);
  let r1 = (-b + sq) / (2 * a);
  let r2 = (-b - sq) / (2 * a);
  let candidates = [r1, r2].filter((r) => r > 0);
  if (!candidates.length) return null;
  return Math.max(0, ...candidates);
}

async function calculateTarget(ptr, spawnTime) {
  return new Promise((resolve) => {
    let globalID = natives.getGlobalID(ptr);
    let startX = natives.getX(ptr);
    let startY = natives.getY(ptr);
    let z0 = natives.getZ(ptr);
    pendingTargetCalcs.set(globalID, {
      ptr,
      startX,
      startY,
      z0,
      spawnTime,
      points: [{ d: 0, z: z0 }],
      lastZ: z0,
      resolve
    });
  });
}

var base = Process.getModuleByName("libg.so").base;
var offsets = {

  logicGameObjectClient_getX: 11913624,

  logicGameObjectClient_getY: 11913632,

  logicGameObjectClient_getZ: 11913640,

  logicProjectileData_getSpeed: 11507308,

  logicProjectileData_getRadius: 11507436,

  logicProjectileClient_ctor: 11982568,

  logicGameObject_getGlobalID: 11913540,

  LogicBattleModeClient_update: 12714096,

  LogicBattleModeClient_getOwnPlayerTeam: 12721180,

  LogicBattleModeClient_getOwnCharacter: 12722116,

  LogicCharacterData_getSpeed: 11215292,

  LogicGameObjectClient_getData: 11912824,

  LogicCharacterData_getRadius: 11215880,

  LogicProjectileData_piercesEnvironment: 11507792,

  LogicProjectileData_piercesEnvironmentLikeButter: 11507800,

  LogicSkillData_getProjectileData: 11586408,

  LogicSkillData_getCastingRangeTiles: 11585792,

  LogicData_getName: 11283052,

  projectile_angle: 468,

  projectile_team: 64,

  mirrored_playfield: 19843992,

  projectile_isInderect: 184,

  LogicProjectileClient_getTargetX: 11984020,

  LogicProjectileClient_getTargetY: 11984028,

  LogicProjectileClient_getData: 11983544,

  LogicProjectileData_getRendering: 11507776,

  LogicProjectileClient_decode: 11982788,

  LogicCharacterClient_getSpeed: 11764544,

  LogicProjectileData_getSpawnAreaEffect: 11507664,

  LogicSpawnAreaData_getRadius: 11103144,

  LogicAreaEffectData_getActiveTime: 11103112,

  LogicAreaEffectData_getTimeMS: 11103136,

  LogicProjectileData_getPreExplosionTimeMS: 11508468,

  BattleMode_enter: 10204192,

  LogicProjectileClient_destruct: 11982680,

  projectile_deathFlag: 424,

  Projectile_update: 5479144

};

var natives = {
  getX: new NativeFunction(base.add(offsets.logicGameObjectClient_getX), "int", ["pointer"]),
  getY: new NativeFunction(base.add(offsets.logicGameObjectClient_getY), "int", ["pointer"]),
  getZ: new NativeFunction(base.add(offsets.logicGameObjectClient_getZ), "int", ["pointer"]),
  getSpeed: new NativeFunction(base.add(offsets.logicProjectileData_getSpeed), "int", ["pointer"]),
  getRadius: new NativeFunction(base.add(offsets.logicProjectileData_getRadius), "int", ["pointer"]),
  getGlobalID: new NativeFunction(base.add(offsets.logicGameObject_getGlobalID), "int", ["pointer"]),
  getData: new NativeFunction(base.add(offsets.LogicGameObjectClient_getData), "pointer", ["pointer"]),
  LogicBattleModeClient_getOwnCharacter: new NativeFunction(base.add(offsets.LogicBattleModeClient_getOwnCharacter), "pointer", ["pointer"]),
  LogicData_getName: new NativeFunction(base.add(offsets.LogicData_getName), "pointer", ["pointer"]),
  LogicBattleModeClient_getOwnPlayerTeam: new NativeFunction(base.add(offsets.LogicBattleModeClient_getOwnPlayerTeam), "int", ["pointer"]),
  LogicCharacterData_getSpeed: new NativeFunction(base.add(offsets.LogicCharacterData_getSpeed), "int", ["pointer"]),
  LogicCharacterData_getRadius: new NativeFunction(base.add(offsets.LogicCharacterData_getRadius), "int", ["pointer"]),
  LogicProjectileData_piercesEnvironment: new NativeFunction(base.add(offsets.LogicProjectileData_piercesEnvironment), "uint32", ["pointer"]),
  LogicProjectileData_piercesEnvironmentLikeButter: new NativeFunction(base.add(offsets.LogicProjectileData_piercesEnvironmentLikeButter), "uint32", ["pointer"]),
  LogicSkillData_getCastingRangeTiles: new NativeFunction(base.add(offsets.LogicSkillData_getCastingRangeTiles), "int64", ["pointer"]),
  LogicProjectileClient_getTargetX: new NativeFunction(base.add(offsets.LogicProjectileClient_getTargetX), "int", ["pointer"]),
  LogicProjectileClient_getTargetY: new NativeFunction(base.add(offsets.LogicProjectileClient_getTargetY), "int", ["pointer"]),
  LogicSkillData_getProjectileData: new NativeFunction(base.add(offsets.LogicSkillData_getProjectileData), "pointer", ["pointer"]),
  LogicProjectileClient_getData: new NativeFunction(base.add(offsets.LogicProjectileClient_getData), "pointer", ["pointer"]),
  LogicProjectileData_getRendering: new NativeFunction(base.add(offsets.LogicProjectileData_getRendering), "int", ["pointer"]),
  LogicCharacterClient_getSpeed: new NativeFunction(base.add(offsets.LogicCharacterClient_getSpeed), "int", ["pointer"]),
  LogicProjectileData_getSpawnAreaEffect: new NativeFunction(base.add(offsets.LogicProjectileData_getSpawnAreaEffect), "pointer", ["pointer"]),
  LogicAreaEffectData_getRadius: new NativeFunction(base.add(offsets.LogicSpawnAreaData_getRadius), "int", ["pointer"]),
  LogicAreaEffectData_getActiveTime: new NativeFunction(base.add(offsets.LogicAreaEffectData_getActiveTime), "int", ["pointer"]),
  LogicAreaEffectData_getTimeMS: new NativeFunction(base.add(offsets.LogicAreaEffectData_getTimeMS), "int", ["pointer"]),
  LogicProjectileData_getPreExplosionTimeMS: new NativeFunction(base.add(offsets.LogicProjectileData_getPreExplosionTimeMS), "int", ["pointer"])
};

class NativeString {
  static toJSString(stringPtr) {
    let len = stringPtr.add(4).readInt();
    if (len > 7) return stringPtr.add(8).readPointer().readUtf8String(len);
    return stringPtr.add(8).readUtf8String(len);
  }
}

export var state = { ownTeam: 0, ownX: 0, ownY: 0, ownRadius: 0, ownSpeed: 0, revertMovement: 0 };
export var observedProjectileRange = new Map();
export var rangeExpiryNames = new Set();
export var spikeVariant = null;
export var liveProjectiles = new Map();
var pendingProjectiles = new Set();
var pendingTargetCalcs = new Map();
var projectileNameToRange = new Map();

Interceptor.attach(base.add(offsets.LogicSkillData_getProjectileData), {
  onEnter: function (args) {
    if (args[0].isNull()) return;
    try {
      let projectileData = natives.LogicSkillData_getProjectileData(args[0]);
      let projectileName = NativeString.toJSString(natives.LogicData_getName(projectileData));
      if (!projectileNameToRange.has(projectileName)) {
        let range = natives.LogicSkillData_getCastingRangeTiles(args[0]) * 100;
        projectileNameToRange.set(projectileName, { range });
      }
    } catch (error) {
    }
  }
});

Interceptor.attach(base.add(offsets.BattleMode_enter), {
  onEnter: function (args) {
    liveProjectiles.clear();
    pendingProjectiles.clear();
    pendingTargetCalcs.clear();
    spikeVariant = null;
  }
});

Interceptor.attach(base.add(offsets.LogicBattleModeClient_update), {
  onEnter: function (args) {
    try {
      state.ownTeam = natives.LogicBattleModeClient_getOwnPlayerTeam(args[0]);
      let LogicCharacterClientOwn = natives.LogicBattleModeClient_getOwnCharacter(args[0]);
      state.ownX = natives.getX(LogicCharacterClientOwn);
      state.ownY = natives.getY(LogicCharacterClientOwn);
      state.ownRadius = natives.LogicCharacterData_getRadius(natives.getData(LogicCharacterClientOwn));
      state.ownSpeed = natives.LogicCharacterData_getSpeed(natives.getData(LogicCharacterClientOwn));
      state.ownSpeedBuff = LogicCharacterClientOwn.add(508).readInt();
      state.ownSpeed += state.ownSpeedBuff;
      state.revertMovement = base.add(offsets.mirrored_playfield).readU32();
      let trajNames = config.dodge && config.dodge.logTrajectories;
      let trajOn = trajNames && trajNames.length > 0;
      for (let [globalID, proj] of liveProjectiles) {
        try {
          if (proj.ptr.add(offsets.projectile_deathFlag).readInt() !== 0) {
            let dx = natives.getX(proj.ptr);
            let dy = natives.getY(proj.ptr);
            recordObservedRange(proj, dx, dy);
            detectSpikeVariant(proj, dx, dy);
            liveProjectiles.delete(globalID);
            console.log("Projectile with globalID ".concat(globalID, " removed, x: ", dx, ", y: ", dy, ", targetX: ", proj.targetX, ", targetY: ", proj.targetY, ", time alive: ", Date.now() - proj.timestamp, "ms"));
          } else if (trajOn && trajNames.includes(proj.name)) {
            console.log("[traj] ".concat(proj.name, " gid=", globalID, " t=", Date.now() - proj.timestamp, " x=", natives.getX(proj.ptr), " y=", natives.getY(proj.ptr), " z=", natives.getZ(proj.ptr)));
          }
        } catch (e) {
          liveProjectiles.delete(globalID);
        }
      }
      for (let [gid, calc] of pendingTargetCalcs) {
        try {
          let nz = natives.getZ(calc.ptr);
          if (nz === calc.lastZ) continue;
          calc.lastZ = nz;
          let nx = natives.getX(calc.ptr);
          let ny = natives.getY(calc.ptr);
          let dx = nx - calc.startX;
          let dy = ny - calc.startY;
          let d = Math.sqrt(dx * dx + dy * dy);
          calc.points.push({ d, z: nz });
          if (calc.points.length < 4) continue;
          let range = fitParabolaFindZero(calc.points, calc.z0);
          if (range === null) continue;
          let ux = d > 0 ? dx / d : 0;
          let uy = d > 0 ? dy / d : 0;
          let targetX = Math.round(calc.startX + ux * range);
          let targetY = Math.round(calc.startY + uy * range);
          let msAfterSpawn = Date.now() - calc.spawnTime;
          console.log("[calculateTarget] globalID ".concat(gid, " predicted after ", msAfterSpawn, "ms (", calc.points.length, " Z-ticks): targetX=", targetX, " targetY=", targetY, " range=", Math.round(range)));
          calc.resolve({ targetX, targetY });
          pendingTargetCalcs.delete(gid);
        } catch (e) {
          calc.resolve({ targetX: 0, targetY: 0 });
          pendingTargetCalcs.delete(gid);
        }
      }
    } catch (error) {
    }
  }
});

Interceptor.attach(base.add(offsets.logicProjectileClient_ctor), {
  onEnter(args) {
    this.self = args[0];
    this.data = args[1];
  },
  onLeave() {
    let spawnTime = Date.now();
    setTimeout(async () => {
      try {
        let self = this.self;
        let data = this.data;
        let globalID = natives.getGlobalID(self);
        let team = self.add(offsets.projectile_team).readU32();
        if (team === state.ownTeam) return;
        if (liveProjectiles.has(globalID) || pendingProjectiles.has(globalID)) return;
        pendingProjectiles.add(globalID);
        let name = NativeString.toJSString(natives.LogicData_getName(Memory.readPointer(data.add(88))));
        let x = natives.getX(self);
        let y = natives.getY(self);
        let z = natives.getZ(self);
        let speed = natives.getSpeed(data);
        let radius = natives.getRadius(data);
        let piercesEnvironment = natives.LogicProjectileData_piercesEnvironment(data);
        let piercesEnvironmentLikeButter = natives.LogicProjectileData_piercesEnvironmentLikeButter(data);
        let rendering = natives.LogicProjectileData_getRendering(data);
        let isThrower = data.add(offsets.projectile_isInderect).readInt();
        let angle = rendering === 3 ? await calculateAngle(self) : self.add(offsets.projectile_angle).readU32();
        let normalizedAngle = normalizeAngle(angle);
        let spawnAreaEffect = natives.LogicProjectileData_getSpawnAreaEffect(data);
        let spawnAreaRadius = 0;
        let spawnAreaActiveTime = 0;
        if (!spawnAreaEffect.isNull()) {
          spawnAreaRadius = spawnAreaEffect.add(296).readInt();
          spawnAreaActiveTime = natives.LogicAreaEffectData_getActiveTime(spawnAreaEffect);
        }
        let targetX = natives.LogicProjectileClient_getTargetX(self);
        let targetY = natives.LogicProjectileClient_getTargetY(self);
        if (isThrower === 1 && targetX === 0 && targetY === 0) {
          ({ targetX, targetY } = await calculateTarget(self, spawnTime));
        }
        let range = 4000;
        let parentName = NativeString.toJSString(natives.LogicData_getName(Memory.readPointer(data.add(88))));
        try {
          if (parentName === "BeamerProjectile") {
            range = 3600 + 80;
          } else {
            range = projectileNameToRange.get(parentName).range + 80;
          }
        } catch (error) {
        }
        liveProjectiles.set(globalID, {
          ptr: self,
          name,
          x,
          y,
          z,
          angle,
          normalizedAngle,
          team,
          speed,
          radius,
          piercesEnvironment,
          piercesEnvironmentLikeButter,
          globalID,
          range,
          targetX,
          targetY,
          rendering,
          spawnAreaEffect,
          spawnAreaRadius,
          spawnAreaActiveTime,
          isThrower,
          timestamp: spawnTime
        });
        console.log(JSON.stringify({
          name,
          x,
          y,
          z,
          angle,
          normalizedAngle,
          team,
          speed,
          radius,
          piercesEnvironment,
          piercesEnvironmentLikeButter,
          globalID,
          range,
          targetX,
          targetY,
          rendering,
          spawnAreaEffect,
          spawnAreaRadius,
          spawnAreaActiveTime,
          isThrower,
          timestamp: spawnTime
        }));
        pendingProjectiles.delete(globalID);
      } catch (e) {
        console.log("Error:", e);
      }
    }, 1);
  }
});

Interceptor.attach(base.add(offsets.LogicProjectileClient_destruct), {
  onEnter: function (args) {
    let self = args[0];
    let globalID = natives.getGlobalID(self);
    if (liveProjectiles.has(globalID)) {
      let proj = liveProjectiles.get(globalID);
      let dx = natives.getX(self);
      let dy = natives.getY(self);
      recordObservedRange(proj, dx, dy);
      detectSpikeVariant(proj, dx, dy);
      liveProjectiles.delete(globalID);
      console.log("Projectile with globalID ".concat(globalID, " removed on destruct, x: ", dx, ", y: ", dy, ", time alive: ", Date.now() - proj.timestamp, "ms"));
    }
  }
});
