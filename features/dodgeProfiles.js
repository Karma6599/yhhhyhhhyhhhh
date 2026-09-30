// ==========================================================================
// src/mech/dodgeProfiles.js  —  dodge profiles
// per-brawler hazard models (Spike, Dynamike...)
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 3133 ----
function spikeModel() {
    let f;
    f = config.dodge.spikeCurveball;
    if ((f === true)) {
        return "curve";
    }
    if ((f === false)) {
        return "straight";
    }
    return spikeVariant;
}

// ---- line 3139 ----
function registerProfile(name, profile) {
    return;
}

// ---- line 3142 ----
function getProfile(name) {
    return profiles.get(name);
}

// ---- line 3145 ----
function compileGeneric(proj, api2) {
    let death;
    let hazards;
    hazards = [];
    death = api2.predictDeath(proj);
    if ((proj.isThrower === 1)) {
        if (((proj.targetX !== 0) || (proj.targetY !== 0))) {
            {}.x = proj.targetX;
            {}.y = proj.targetY;
            {}.t0 = death.t;
            {}.t1 = (death.t + api2.LOGIC_TICK_MS);
            {}.radius = proj.radius;
            hazards.push(api2.staticDisc({}));
        } else {
            let flight;
            {}.x = proj.x;
            {}.y = proj.y;
            {}.t0 = proj.timestamp;
            {}.angle = death.dirAngle;
            {}.speed = proj.speed;
            {}.radius = proj.radius;
            {}.range = Math.max(proj.range, api2.observedRange(proj.name));
            {}.expiryTrusted = api2.rangeExpiryObserved(proj.name);
            {}.angleErr = ((proj.rendering === 3) ? (2 / 30) : undefined);
            {}.piercesEnvironment = proj.piercesEnvironment;
            {}.piercesEnvironmentLikeButter = proj.piercesEnvironmentLikeButter;
            flight = api2.movingDisc({});
            flight.flight = true;
            hazards.push(flight);
        }
    }
    let flight;
    {}.x = proj.x;
    {}.y = proj.y;
    {}.t0 = proj.timestamp;
    {}.angle = death.dirAngle;
    {}.speed = proj.speed;
    {}.radius = proj.radius;
    {}.range = Math.max(proj.range, api2.observedRange(proj.name));
    {}.expiryTrusted = api2.rangeExpiryObserved(proj.name);
    {}.angleErr = ((proj.rendering === 3) ? (2 / 30) : undefined);
    {}.piercesEnvironment = proj.piercesEnvironment;
    {}.piercesEnvironmentLikeButter = proj.piercesEnvironmentLikeButter;
    flight = api2.movingDisc({});
    flight.flight = true;
    hazards.push(flight);
    if ((proj.spawnAreaRadius > 0)) {
        if (!((proj.isThrower !== 1))) {
        }
        if ((proj.isThrower !== 1)) {
            {}.x = death.x;
            {}.y = death.y;
            {}.t0 = death.t;
            {}.t1 = (death.t + proj.spawnAreaActiveTime);
            {}.radius = proj.spawnAreaRadius;
            hazards.push(api2.staticDisc({}));
        }
    }
    return hazards;
}

// ---- line 3189 ----
function finite(v) {
    return Number.isFinite(v);
}

// ---- line 3192 ----
function makeCrossProfile(P) {
    {}.dynamic = false;
    // module entry: compile
    return;
}
// ---- line 3198 ----
function anon3198(proj, api2) {
    let arm;
    let t1;
    let t0;
    let landAt;
    let cy;
    let cx;
    cx = proj.targetX;
    cy = proj.targetY;
    if (!(!(finite(cx)))) {
        if (!(!(finite(cy)))) {
            if (!(((cx === 0) && (cy === 0)))) {
            }
        }
    }
    if (!(finite(cx))) {
        return [];
    }
    landAt = (proj.timestamp + P.flightTimeMs);
    t0 = (landAt - api2.LOGIC_TICK_MS);
    t1 = ((landAt + P.burstLifeMs) + api2.LOGIC_TICK_MS);
    arm = P.armLength;
    {}.ax = (cx - arm);
    {}.ay = cy;
    {}.bx = (cx + arm);
    {}.by = cy;
    {}.t0 = t0;
    {}.t1 = t1;
    {}.radius = P.childRadius;
    {}.ax = cx;
    {}.ay = (cy - arm);
    {}.bx = cx;
    {}.by = (cy + arm);
    {}.t0 = t0;
    {}.t1 = t1;
    {}.radius = P.childRadius;
    return [api2.capsule({}), api2.capsule({})];
}

// --------------------------------------------------------------------------
// module body (src/mech/dodgeProfiles.js)
// --------------------------------------------------------------------------
// ---- line 3216 ----
function anon3216() {
    init_node_globals();
    init_config();
    init_projectiledetection();
    profiles = new Map();
    {}.childRadius = 125;
    {}.childSpeed = 3000;
    {}.spawnOffset = 200;
    {}.childTravel = 800;
    {}.flightTimeMs = 1015;
    CROSSBOMB = {};
    {}.childRadius = 375;
    {}.childSpeed = 3000;
    {}.spawnOffset = 100;
    {}.childTravel = 1600;
    {}.flightTimeMs = 1115;
    CROSSBOMB_ULTI = {};
    let P;
    for (const P of [CROSSBOMB, CROSSBOMB_ULTI]) {
        P.armLength = (P.spawnOffset + P.childTravel);
        P.burstLifeMs = ((P.childTravel / P.childSpeed) * 1000);
    }
    registerProfile("CrossBomberProjectile", makeCrossProfile(CROSSBOMB));
    registerProfile("CrossBomberUltiProjectile", makeCrossProfile(CROSSBOMB_ULTI));
    {}.spokes = 6;
    {}.childRadius = 50;
    {}.spawnOffset = 200;
    {}.childTravel = 1100;
    {}.flightDist = 2035;
    {}.flightTimeMs = 963;
    {}.burstLifeMs = 360;
    {}.blastMs = 700;
    SPIKE = {};
    SPIKE.armLength = (SPIKE.spawnOffset + SPIKE.childTravel);
    SPIKE.curveArc = [[0, 200, 0], [110, 515, 32], [207, 797, 216], [312, 999, 519], [411, 1066, 930], [513, 995, 1377], [557, 883, 1611]];
    {}.dynamic = false;
    // module entry: compile
    <under>(registerProfile, "CactusProjectile");
    {}.dynamic = false;
    // module entry: compile
    return;
}
// ---- line 3279 ----
function anon3279(proj, api2) {
    let model;
    let flight;
    let hazards;
    let burstAt;
    let end;
    let rad;
    rad = ((proj.angle * Math.PI) / 180);
    end = api2.losEndpoint(proj.x, proj.y, rad, SPIKE.flightDist, proj.piercesEnvironmentLikeButter);
    burstAt = (proj.timestamp + (SPIKE.flightTimeMs * (end.dist / SPIKE.flightDist)));
    hazards = [];
    {}.x = proj.x;
    {}.y = proj.y;
    {}.t0 = proj.timestamp;
    {}.angle = rad;
    {}.speed = proj.speed;
    {}.radius = proj.radius;
    {}.range = SPIKE.flightDist;
    flight = api2.movingDisc({});
    flight.flight = true;
    hazards.push(flight);
    if ((proj.spawnAreaRadius > 0)) {
        {}.x = end.x;
        {}.y = end.y;
        {}.t0 = burstAt;
        burstAt.t1 = (proj.spawnAreaActiveTime + (proj.spawnAreaActiveTime || SPIKE.blastMs));
        burstAt.radius = proj.spawnAreaRadius;
        .push.api2(.staticDisc.{}(burstAt));
    }
    model = spikeModel();
    if ((model === "straight")) {
        let arm;
        let t1;
        let t0;
        t0 = (burstAt - api2.LOGIC_TICK_MS);
        t1 = ((burstAt + SPIKE.burstLifeMs) + api2.LOGIC_TICK_MS);
        arm = SPIKE.armLength;
        let i;
        i = 0;
        while ((i < 3)) {
            let dy;
            let dx;
            let a;
            a = ((i * Math.PI) / 3);
            dx = (Math.cos(a) * arm);
            dy = (Math.sin(a) * arm);
            {}.ax = (end.x - dx);
            {}.ay = (end.y - dy);
            {}.bx = (end.x + dx);
            {}.by = (end.y + dy);
            {}.t0 = t0;
            {}.t1 = t1;
            {}.radius = SPIKE.childRadius;
            hazards.push(api2.capsule({}));
            i++;
        }
    }
    if ((model === "curve")) {
        let A;
        A = SPIKE.curveArc;
        let s;
        s = 0;
        while ((s < SPIKE.spokes)) {
            let sr;
            let cr;
            let rot;
            rot = (s * ((2 * Math.PI) / SPIKE.spokes));
            cr = Math.cos(rot);
            sr = Math.sin(rot);
            let k;
            k = 0;
            while (((k + 1) < A.length)) {
                let segDur;
                let segLen;
                let ey;
                let ex;
                let sy;
                let sx;
                let by;
                let bx;
                let tb;
                let ay;
                let ax;
                let ta;
                ta = A[k][0];
                ax = A[k][1];
                ay = A[k][2];
                tb = A[(k + 1)][0];
                bx = A[(k + 1)][1];
                by = A[(k + 1)][2];
                sx = ((end.x + (ax * cr)) - (ay * sr));
                sy = ((end.y + (ax * sr)) + (ay * cr));
                ex = ((end.x + (bx * cr)) - (by * sr));
                ey = ((end.y + (bx * sr)) + (by * cr));
                segLen = Math.hypot((ex - sx), (ey - sy));
                segDur = ((tb - ta) / 1000);
                {}.x = sx;
                {}.y = sy;
                {}.t0 = (burstAt + ta);
                {}.angle = Math.atan2((ey - sy), (ex - sx));
                {}.speed = (segLen / segDur);
                {}.radius = SPIKE.childRadius;
                {}.range = segLen;
                {}.noPad = true;
                {}.noSpeedPad = true;
                hazards.push(api2.movingDisc({}));
                k++;
            }
            s++;
        }
    }
    return hazards;
}
// ---- line 3354 ----
function anon3354(proj, api2) {
    if (+(spikeModel())) {
        return api2.compileGeneric(proj);
    }
    return [];
}
