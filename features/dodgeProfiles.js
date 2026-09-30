import "frida-builtins:/node-globals.js";
import "../config.js";
import { spikeVariant } from "./projectiledetection.js";

function spikeModel() {
  let f = config.dodge.spikeCurveball;
  if (f === true) return "curve";
  if (f === false) return "straight";
  return spikeVariant;
}

function registerProfile(name, profile) {
  profiles.set(name, profile);
}

function getProfile(name) {
  return profiles.get(name);
}

function compileGeneric(proj, api) {
  let hazards = [];
  let death = api.predictDeath(proj);
  if (proj.isThrower === 1 && proj.targetX !== 0 && proj.targetY !== 0) {
    hazards.push(api.staticDisc({
      x: proj.targetX,
      y: proj.targetY,
      t0: death.t,
      t1: death.t + api.LOGIC_TICK_MS,
      radius: proj.radius
    }));
  } else {
    let flight = api.movingDisc({
      x: proj.x,
      y: proj.y,
      t0: proj.timestamp,
      angle: death.dirAngle,
      speed: proj.speed,
      radius: proj.radius,
      range: Math.max(proj.range, api.observedRange(proj.name)),
      expiryTrusted: api.rangeExpiryObserved(proj.name),
      angleErr: proj.rendering === 3 ? 2 / 30 : undefined,
      piercesEnvironment: proj.piercesEnvironment,
      piercesEnvironmentLikeButter: proj.piercesEnvironmentLikeButter
    });
    flight.flight = true;
    hazards.push(flight);
  }
  if (proj.spawnAreaRadius > 0 && proj.isThrower !== 1 && proj.targetX !== 0 && proj.targetY !== 0) {
    hazards.push(api.staticDisc({
      x: death.x,
      y: death.y,
      t0: death.t,
      t1: death.t + proj.spawnAreaActiveTime,
      radius: proj.spawnAreaRadius
    }));
  }
  return hazards;
}

function finite(v) {
  return Number.isFinite(v);
}

function makeCrossProfile(P) {
  return {
    dynamic: false,

    compile(proj, api) {
      let cx = proj.targetX;
      let cy = proj.targetY;
      if (!finite(cx) || !finite(cy) || cx === 0 && cy === 0 || Math.abs(cx) > 1000000 || Math.abs(cy) > 1000000) {
        return [];
      }
      let landAt = proj.timestamp + P.flightTimeMs;
      let t0 = landAt - api.LOGIC_TICK_MS;
      let t1 = landAt + P.burstLifeMs + api.LOGIC_TICK_MS;
      let arm = P.armLength;

      return [
        api.capsule({ ax: cx - arm, ay: cy, bx: cx + arm, by: cy, t0, t1, radius: P.childRadius }),

        api.capsule({ ax: cx, ay: cy - arm, bx: cx, by: cy + arm, t0, t1, radius: P.childRadius })
      ];
    }
  };
}

var profiles = new Map();
var CROSSBOMB = {
  childRadius: 125,

  childSpeed: 3000,

  spawnOffset: 200,

  childTravel: 800,

  flightTimeMs: 1015
};
var CROSSBOMB_ULTI = {
  childRadius: 375,

  childSpeed: 3000,

  spawnOffset: 100,

  childTravel: 1600,

  flightTimeMs: 1115
};
for (let P of [CROSSBOMB, CROSSBOMB_ULTI]) {
  P.armLength = P.spawnOffset + P.childTravel;
  P.burstLifeMs = P.childTravel / P.childSpeed * 1000;
}
registerProfile("CrossBomberProjectile", makeCrossProfile(CROSSBOMB));
registerProfile("CrossBomberUltiProjectile", makeCrossProfile(CROSSBOMB_ULTI));
var SPIKE = {
  spokes: 6,

  childRadius: 50,

  spawnOffset: 200,

  childTravel: 1100,

  flightDist: 2035,

  flightTimeMs: 963,

  burstLifeMs: 360,

  blastMs: 700
};
SPIKE.armLength = SPIKE.spawnOffset + SPIKE.childTravel;
SPIKE.curveArc = [
  [0, 200, 0],
  [110, 515, 32],
  [207, 797, 216],
  [312, 999, 519],
  [411, 1066, 930],
  [513, 995, 1377],
  [557, 883, 1611]
];
registerProfile("CactusProjectile", {
  dynamic: false,
  compile(proj, api) {
    let rad = proj.angle * Math.PI / 180;
    let end = api.losEndpoint(proj.x, proj.y, rad, SPIKE.flightDist, proj.piercesEnvironmentLikeButter);
    let burstAt = proj.timestamp + SPIKE.flightTimeMs * (end.dist / SPIKE.flightDist);
    let hazards = [];
    let flight = api.movingDisc({
      x: proj.x,
      y: proj.y,
      t0: proj.timestamp,
      angle: rad,
      speed: proj.speed,
      radius: proj.radius,
      range: SPIKE.flightDist
    });
    flight.flight = true;
    hazards.push(flight);
    if (proj.spawnAreaRadius > 0) {
      hazards.push(api.staticDisc({
        x: end.x,
        y: end.y,
        t0: burstAt,
        t1: burstAt + (proj.spawnAreaActiveTime || SPIKE.blastMs),
        radius: proj.spawnAreaRadius
      }));
    }
    let model = spikeModel();
    if (model === "straight") {
      let t0 = burstAt - api.LOGIC_TICK_MS;
      let t1 = burstAt + SPIKE.burstLifeMs + api.LOGIC_TICK_MS;
      let arm = SPIKE.armLength;
      for (let i = 0; i < 3; i++) {
        let a = i * Math.PI / 3;
        let dx = Math.cos(a) * arm;
        let dy = Math.sin(a) * arm;
        hazards.push(api.capsule({
          ax: end.x - dx,
          ay: end.y - dy,
          bx: end.x + dx,
          by: end.y + dy,
          t0: t0,
          t1: t1,
          radius: SPIKE.childRadius
        }));
      }
    }
    if (model === "curve") {
      let A = SPIKE.curveArc;
      for (let s = 0; s < SPIKE.spokes; s++) {
        let rot = s * (2 * Math.PI / SPIKE.spokes);
        let cr = Math.cos(rot);
        let sr = Math.sin(rot);
        for (let k = 0; k + 1 < A.length; k++) {
          let ta = A[k][0];
          let ax = A[k][1];
          let ay = A[k][2];
          let tb = A[k + 1][0];
          let bx = A[k + 1][1];
          let by = A[k + 1][2];
          let sx = end.x + ax * cr - ay * sr;
          let sy = end.y + ax * sr + ay * cr;
          let ex = end.x + bx * cr - by * sr;
          let ey = end.y + bx * sr + by * cr;
          let segLen = Math.hypot(ex - sx, ey - sy);
          let segDur = (tb - ta) / 1000;
          hazards.push(api.movingDisc({
            x: sx,
            y: sy,
            t0: burstAt + ta,
            angle: Math.atan2(ey - sy, ex - sx),
            speed: segLen / segDur,
            radius: SPIKE.childRadius,
            range: segLen,
            noPad: true,
            noSpeedPad: true
          }));
        }
      }
    }
    return hazards;
  }
});
registerProfile("CactusSpike", {
  dynamic: false,
  compile(proj, api) {
    if (spikeModel() === null) return api.compileGeneric(proj); return [];
  }
});
