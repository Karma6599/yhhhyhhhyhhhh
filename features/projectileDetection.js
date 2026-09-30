// ==========================================================================
// src/mech/projectiledetection.js  —  projectile detection
// tracks enemy projectiles, predicts targets
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 2576 ----
function anon2576() {
    return getObjX;
}

// ---- line 2577 ----
function anon2577() {
    return getObjY;
}

// ---- line 2578 ----
function anon2578() {
    return liveProjectiles;
}

// ---- line 2579 ----
function anon2579() {
    return observedProjectileRange;
}

// ---- line 2580 ----
function anon2580() {
    return rangeExpiryNames;
}

// ---- line 2581 ----
function anon2581() {
    return spikeVariant;
}

// ---- line 2582 ----
function anon2582() {
    return state;
}

// ---- line 2584 ----
function getObjX(ptr2) {
    return natives.getX(ptr2);
}

// ---- line 2587 ----
function getObjY(ptr2) {
    return natives.getY(ptr2);
}

// ---- line 2590 ----
function recordObservedRange(proj, x, y) {
    let prev;
    let flown;
    if ((proj.isThrower === 1)) {
        return;
    }
    flown = Math.hypot((x - proj.x), (y - proj.y));
    prev = observedProjectileRange.get(proj.name);
    /* @70 ?? ('unknown', 'UN_0xf5', 70) */
    if ((prev || (flown > prev))) {
        observedProjectileRange.set(proj.name, flown);
    }
    if ((flown >= (proj.range - 80))) {
        rangeExpiryNames.add(proj.name);
    }
    return;
}

// ---- line 2597 ----
function detectSpikeVariant(proj, deathX, deathY) {
    let dev;
    let chordAng;
    let dy;
    let dx;
    if (((spikeVariant !== null) || (proj.name !== "CactusSpike"))) {
        return;
    }
    dx = (deathX - proj.x);
    dy = (deathY - proj.y);
    if ((((dx * dx) + (dy * dy)) < (1000 * 1000))) {
        return;
    }
    chordAng = ((Math.atan2(dy, dx) * 180) / Math.PI);
    dev = Math.abs((((((chordAng - proj.angle) % 360) + 540) % 360) - 180));
    spikeVariant = ((dev > 22) ? "curve" : "straight");
    return;
}

// ---- line 2606 ----
function normalizeAngle(angle) {
    return ((angle + 90) % 360);
}

// ---- line 2609 ----
function calculateAngle(ptr2) {
    return new Promise(FUNC_<null-atom>);
}
// ---- line 2610 ----
function anon2610(resolve) {
    let poll;
    let startY;
    let startX;
    startX = natives.getX(ptr2);
    startY = natives.getY(ptr2);
    poll = setInterval(FUNC_<null-atom>, 5);
    return;
}
// ---- line 2613 ----
function anon2613() {
    try {
        let dy;
        let dx;
        dx = (natives.getX(ptr2) - startX);
        dy = (natives.getY(ptr2) - startY);
        if ((Math.sqrt(((dx * dx) + (dy * dy))) >= 30)) {
            clearInterval(poll);
            resolve(((((Math.atan2(dy, dx) * 180) / Math.PI) + 360) % 360));
        }
        return;
    } catch (e) {
        clearInterval(poll);
        resolve(0);
        return;
    }
}

// ---- line 2628 ----
function fitParabolaFindZero(points, z0) {
    let candidates;
    let r2;
    let r1;
    let sq;
    let disc;
    let b;
    let a;
    let det;
    let s1y;
    let s2y;
    let s2;
    let s3;
    let s4;
    s4 = 0;
    s3 = 0;
    s2 = 0;
    s2y = 0;
    s1y = 0;
    let z;
    let d;
    for (const it of points) {
        while (true) {
            /* @60 ?? ('unknown', 'to_object', 60) */
            d = .d;
            z = .z;
            let d2;
            let y;
            y = (z - z0);
            d2 = (d * d);
            s4 = (s4 + (d2 * d2));
            s3 = (s3 + (d2 * d));
            s2 = (s2 + d2);
            s2y = (s2y + (d2 * y));
            s1y = (s1y + (d * y));
        }
    }
    det = ((s4 * s2) - (s3 * s3));
    if ((Math.abs(det) < 1e-09)) {
        return null;
    }
    a = (((s2y * s2) - (s1y * s3)) / det);
    b = (((s4 * s1y) - (s3 * s2y)) / det);
    disc = ((b * b) - ((4 * a) * z0));
    if (((disc < 0) || (Math.abs(a) < 1e-12))) {
        return null;
    }
    sq = Math.sqrt(disc);
    r1 = ((-(b) + sq) / (2 * a));
    r2 = ((-(b) - sq) / (2 * a));
    candidates = [r1, r2].filter(FUNC_<null-atom>);
    if (!(candidates.length)) {
        return null;
    }
    /* @408 ?? ('unknown', 'op6e', 408) */
    /* @410 ?? ('unknown', 'opab', 410) */
    return .max.apply([], 0);
}
// ---- line 2648 ----
function anon2648(r) {
    return (r > 0);
}

// ---- line 2652 ----
function calculateTarget(ptr2, spawnTime) {
    return;
}
// ---- line 2653 ----
function anon2653(resolve) {
    let z0;
    let startY;
    let startX;
    let globalID;
    globalID = natives.getGlobalID(ptr2);
    startX = natives.getX(ptr2);
    startY = natives.getY(ptr2);
    z0 = natives.getZ(ptr2);
    {}.ptr = ptr2;
    {}.startX = startX;
    {}.startY = startY;
    {}.z0 = z0;
    {}.spawnTime = spawnTime;
    {}.d = 0;
    {}.z = z0;
    {}.points = [{}];
    {}.lastZ = z0;
    {}.resolve = resolve;
    return;
}

// --------------------------------------------------------------------------
// module body (src/mech/projectiledetection.js)
// --------------------------------------------------------------------------
// ---- line 2673 ----
function anon2673() {
    init_node_globals();
    init_config();
    base8 = Process.getModuleByName("libg.so").base;
    {}.logicGameObjectClient_getX = 11913624;
    {}.logicGameObjectClient_getY = 11913632;
    {}.logicGameObjectClient_getZ = 11913640;
    {}.logicProjectileData_getSpeed = 11507308;
    {}.logicProjectileData_getRadius = 11507436;
    {}.logicProjectileClient_ctor = 11982568;
    {}.logicGameObject_getGlobalID = 11913540;
    {}.LogicBattleModeClient_update = 12714096;
    {}.LogicBattleModeClient_getOwnPlayerTeam = 12721180;
    {}.LogicBattleModeClient_getOwnCharacter = 12722116;
    {}.LogicCharacterData_getSpeed = 11215292;
    {}.LogicGameObjectClient_getData = 11912824;
    {}.LogicCharacterData_getRadius = 11215880;
    {}.LogicProjectileData_piercesEnvironment = 11507792;
    {}.LogicProjectileData_piercesEnvironmentLikeButter = 11507800;
    {}.LogicSkillData_getProjectileData = 11586408;
    {}.LogicSkillData_getCastingRangeTiles = 11585792;
    {}.LogicData_getName = 11283052;
    {}.projectile_angle = 468;
    {}.projectile_team = 64;
    {}.mirrored_playfield = 19843992;
    {}.projectile_isInderect = 184;
    {}.LogicProjectileClient_getTargetX = 11984020;
    {}.LogicProjectileClient_getTargetY = 11984028;
    {}.LogicProjectileClient_getData = 11983544;
    {}.LogicProjectileData_getRendering = 11507776;
    {}.LogicProjectileClient_decode = 11982788;
    {}.LogicCharacterClient_getSpeed = 11764544;
    {}.LogicProjectileData_getSpawnAreaEffect = 11507664;
    {}.LogicSpawnAreaData_getRadius = 11103144;
    {}.LogicAreaEffectData_getActiveTime = 11103112;
    {}.LogicAreaEffectData_getTimeMS = 11103136;
    {}.LogicProjectileData_getPreExplosionTimeMS = 11508468;
    {}.BattleMode_enter = 10204192;
    {}.LogicProjectileClient_destruct = 11982680;
    {}.projectile_deathFlag = 424;
    {}.Projectile_update = 5479144;
    offsets2 = {};
    NativeFunction.getX = new NativeFunction(base8.add(offsets2.logicGameObjectClient_getX), "int", ["pointer"]);
    NativeFunction.getY = new NativeFunction(base8.add(offsets2.logicGameObjectClient_getY), "int", ["pointer"]);
    NativeFunction.getZ = new NativeFunction(base8.add(offsets2.logicGameObjectClient_getZ), "int", ["pointer"]);
    NativeFunction.getSpeed = new NativeFunction(base8.add(offsets2.logicProjectileData_getSpeed), "int", ["pointer"]);
    NativeFunction.getRadius = new NativeFunction(base8.add(offsets2.logicProjectileData_getRadius), "int", ["pointer"]);
    NativeFunction.getGlobalID = new NativeFunction(base8.add(offsets2.logicGameObject_getGlobalID), "int", ["pointer"]);
    NativeFunction.getData = new NativeFunction(base8.add(offsets2.LogicGameObjectClient_getData), "pointer", ["pointer"]);
    NativeFunction.LogicBattleModeClient_getOwnCharacter = new NativeFunction(base8.add(offsets2.LogicBattleModeClient_getOwnCharacter), "pointer", ["pointer"]);
    NativeFunction.LogicData_getName = new NativeFunction(base8.add(offsets2.LogicData_getName), "pointer", ["pointer"]);
    NativeFunction.LogicBattleModeClient_getOwnPlayerTeam = new NativeFunction(base8.add(offsets2.LogicBattleModeClient_getOwnPlayerTeam), "int", ["pointer"]);
    NativeFunction.LogicCharacterData_getSpeed = new NativeFunction(base8.add(offsets2.LogicCharacterData_getSpeed), "int", ["pointer"]);
    NativeFunction.LogicCharacterData_getRadius = new NativeFunction(base8.add(offsets2.LogicCharacterData_getRadius), "int", ["pointer"]);
    NativeFunction.LogicProjectileData_piercesEnvironment = new NativeFunction(base8.add(offsets2.LogicProjectileData_piercesEnvironment), "uint32", ["pointer"]);
    NativeFunction.LogicProjectileData_piercesEnvironmentLikeButter = new NativeFunction(base8.add(offsets2.LogicProjectileData_piercesEnvironmentLikeButter), "uint32", ["pointer"]);
    NativeFunction.LogicSkillData_getCastingRangeTiles = new NativeFunction(base8.add(offsets2.LogicSkillData_getCastingRangeTiles), "int64", ["pointer"]);
    NativeFunction.LogicProjectileClient_getTargetX = new NativeFunction(base8.add(offsets2.LogicProjectileClient_getTargetX), "int", ["pointer"]);
    NativeFunction.LogicProjectileClient_getTargetY = new NativeFunction(base8.add(offsets2.LogicProjectileClient_getTargetY), "int", ["pointer"]);
    NativeFunction.LogicSkillData_getProjectileData = new NativeFunction(base8.add(offsets2.LogicSkillData_getProjectileData), "pointer", ["pointer"]);
    NativeFunction.LogicProjectileClient_getData = new NativeFunction(base8.add(offsets2.LogicProjectileClient_getData), "pointer", ["pointer"]);
    NativeFunction.LogicProjectileData_getRendering = new NativeFunction(base8.add(offsets2.LogicProjectileData_getRendering), "int", ["pointer"]);
    NativeFunction.LogicCharacterClient_getSpeed = new NativeFunction(base8.add(offsets2.LogicCharacterClient_getSpeed), "int", ["pointer"]);
    NativeFunction.LogicProjectileData_getSpawnAreaEffect = new NativeFunction(base8.add(offsets2.LogicProjectileData_getSpawnAreaEffect), "pointer", ["pointer"]);
    NativeFunction.LogicAreaEffectData_getRadius = new NativeFunction(base8.add(offsets2.LogicSpawnAreaData_getRadius), "int", ["pointer"]);
    NativeFunction.LogicAreaEffectData_getActiveTime = new NativeFunction(base8.add(offsets2.LogicAreaEffectData_getActiveTime), "int", ["pointer"]);
    NativeFunction.LogicAreaEffectData_getTimeMS = new NativeFunction(base8.add(offsets2.LogicAreaEffectData_getTimeMS), "int", ["pointer"]);
    NativeFunction.LogicProjectileData_getPreExplosionTimeMS = new NativeFunction(base8.add(offsets2.LogicProjectileData_getPreExplosionTimeMS), "int", ["pointer"]);
    natives = NativeFunction;
    let <class_fields_init>;
    /* @1727 ?? ('unknown', 'define_class', 1727) */
    // module entry: toJSString
    <class_fields_init> = undefined;
    NativeString = {'__type__': 'function', 'has_prototype': 0, 'has_simple_parameter_list': 1, 'is;
    {}.ownTeam = 0;
    {}.ownX = 0;
    {}.ownY = 0;
    {}.ownRadius = 0;
    {}.ownSpeed = 0;
    {}.revertMovement = 0;
    state = {};
    observedProjectileRange = new Map();
    rangeExpiryNames = new Set();
    spikeVariant = null;
    liveProjectiles = new Map();
    pendingProjectiles = new Set();
    pendingTargetCalcs = new Map();
    projectileNameToRange = new Map();
    {}.onEnter = FUNC_<null-atom>;
    Interceptor.attach(base8.add(offsets2.LogicSkillData_getProjectileData), {});
    {}.onEnter = FUNC_<null-atom>;
    Interceptor.attach(base8.add(offsets2.BattleMode_enter), {});
    {}.onEnter = FUNC_<null-atom>;
    Interceptor.attach(base8.add(offsets2.LogicBattleModeClient_update), {});
    // module entry: onEnter
    // module entry: onLeave
    Map.Map(Interceptor, .attach);
    {}.onEnter = FUNC_<null-atom>;
    return;
}
// ---- line 2780 ----
function anon2780(stringPtr) {
    let len;
    len = stringPtr.add(4).readInt();
    if ((len > 7)) {
        return stringPtr.add(8).readPointer().readUtf8String(len);
    }
    return stringPtr.add(8).readUtf8String(len);
}
// ---- line 2785 ----
function anon2785() {
    this = this;
    if (<class_fields_init>) {
    }
    return;
}
// ---- line 2796 ----
function anon2796(args) {
    if (args[0].isNull()) {
        return;
    }
    try {
        let projectileName;
        let projectileData;
        projectileData = natives.LogicSkillData_getProjectileData(args[0]);
        projectileName = NativeString.toJSString(natives.LogicData_getName(projectileData));
        if (!(projectileNameToRange.has(projectileName))) {
            let range;
            range = (natives.LogicSkillData_getCastingRangeTiles(args[0]) * 100);
            {}.range = range;
            projectileNameToRange.set(projectileName, {});
        }
        return;
    } catch (error) {
        return;
    }
}
// ---- line 2810 ----
function anon2810(args) {
    liveProjectiles.clear();
    pendingProjectiles.clear();
    pendingTargetCalcs.clear();
    spikeVariant = null;
    return;
}
// ---- line 2818 ----
function anon2818(args) {
    try {
        let trajOn;
        let trajNames;
        let LogicCharacterClientOwn;
        state.ownTeam = natives.LogicBattleModeClient_getOwnPlayerTeam(args[0]);
        LogicCharacterClientOwn = natives.LogicBattleModeClient_getOwnCharacter(args[0]);
        state.ownX = natives.getX(LogicCharacterClientOwn);
        state.ownY = natives.getY(LogicCharacterClientOwn);
        state.ownRadius = natives.LogicCharacterData_getRadius(natives.getData(LogicCharacterClientOwn));
        state.ownSpeed = natives.LogicCharacterData_getSpeed(natives.getData(LogicCharacterClientOwn));
        state.ownSpeedBuff = LogicCharacterClientOwn.add(508).readInt();
        state.ownSpeed = (.ownSpeed + state.ownSpeedBuff);
        state.revertMovement = base8.add(offsets2.mirrored_playfield).readU32();
        trajNames = (config.dodge && config.dodge.logTrajectories);
        trajOn = (trajNames && (trajNames.length > 0));
        let proj;
        let globalID;
        for (const it of liveProjectiles) {
            /* @345 for_X_start unmatched */
            /* @345 for_X_start unmatched */
            /* @345 ?? ('unknown', 'for_of_start', 345) */
            globalID = <under>;
            proj = <under>;
            try {
                if ((proj.ptr.add(offsets2.projectile_deathFlag).readInt() !== 0)) {
                    let dy;
                    let dx;
                    dx = natives.getX(proj.ptr);
                    dy = natives.getY(proj.ptr);
                    recordObservedRange(proj, dx, dy);
                    detectSpikeVariant(proj, dx, dy);
                    liveProjectiles.delete(globalID);
                    console.log("Projectile with globalID ".concat(globalID, " removed, x: ", dx, ", y: ", dy, ", targetX: ", proj.targetX, ", targetY: ", proj.targetY, ", time alive: ", (Date.now() - proj.timestamp), "ms"));
                } else {
                    if (trajOn) {
                        if (trajNames.includes(proj.name)) {
                            console.log("[traj] ".concat(proj.name, " gid=", globalID, " t=", (Date.now() - proj.timestamp), " x=", natives.getX(proj.ptr), " y=", natives.getY(proj.ptr), " z=", natives.getZ(proj.ptr)));
                        }
                    }
                }
                continue;
            } catch (e) {
                liveProjectiles.delete(globalID);
            }
        }
        let calc;
        let gid;
        for (const it of pendingTargetCalcs) {
            /* @845 for_X_start unmatched */
            /* @845 for_X_start unmatched */
            /* @845 ?? ('unknown', 'for_of_start', 845) */
            gid = <under>;
            calc = <under>;
            try {
                let msAfterSpawn;
                let targetY;
                let targetX;
                let uy;
                let ux;
                let range;
                let d;
                let dy;
                let dx;
                let ny;
                let nx;
                let nz;
                nz = natives.getZ(calc.ptr);
                if ((nz === calc.lastZ)) {
                } else {
                    calc.lastZ = nz;
                    nx = natives.getX(calc.ptr);
                    ny = natives.getY(calc.ptr);
                    dx = (nx - calc.startX);
                    dy = (ny - calc.startY);
                    d = Math.sqrt(((dx * dx) + (dy * dy)));
                    {}.d = d;
                    {}.z = nz;
                    calc.points.push({});
                    if ((calc.points.length < 4)) {
                    } else {
                        range = fitParabolaFindZero(calc.points, calc.z0);
                        if (+(range)) {
                        } else {
                            ux = ((d > 0) ? (dx / d) : 0);
                            uy = ((d > 0) ? (dy / d) : 0);
                            targetX = Math.round((calc.startX + (ux * range)));
                            targetY = Math.round((calc.startY + (uy * range)));
                            msAfterSpawn = (Date.now() - calc.spawnTime);
                            console.log("[calculateTarget] globalID ".concat(gid, " predicted after ", msAfterSpawn, "ms (", calc.points.length, " Z-ticks): targetX=", targetX, " targetY=", targetY, " range=", Math.round(range)));
                            {}.targetX = targetX;
                            {}.targetY = targetY;
                            calc.resolve({});
                            pendingTargetCalcs.delete(gid);
                            continue;
                        }
                    }
                }
            } catch (e) {
                {}.targetX = 0;
                {}.targetY = 0;
                calc.resolve({});
                pendingTargetCalcs.delete(gid);
            }
        }
        return;
    } catch (error) {
        return;
    }
}
// ---- line 2878 ----
function anon2878(args) {
    this = this;
    this.self = args[0];
    this.data = args[1];
    return;
}
// ---- line 2882 ----
function anon2882() {
    this = this;
    let spawnTime;
    spawnTime = Date.now();
    return;
}
// ---- line 2884 ----
function anon2884() {
    try {
        let parentName;
        let range;
        let targetY;
        let targetX;
        let spawnAreaActiveTime;
        let spawnAreaRadius;
        let spawnAreaEffect;
        let normalizedAngle;
        let angle;
        let isThrower;
        let rendering;
        let piercesEnvironmentLikeButter;
        let piercesEnvironment;
        let radius;
        let speed;
        let z;
        let y;
        let x;
        let name;
        let team;
        let globalID;
        let data;
        let self;
        self = this.self;
        data = this.data;
        globalID = natives.getGlobalID(self);
        team = self.add(offsets2.projectile_team).readU32();
        if ((team === state.ownTeam)) {
            return;
        }
        if ((liveProjectiles.has(globalID) || pendingProjectiles.has(globalID))) {
            return;
        }
        pendingProjectiles.add(globalID);
        name = NativeString.toJSString(natives.LogicData_getName(Memory.readPointer(data.add(88))));
        x = natives.getX(self);
        y = natives.getY(self);
        z = natives.getZ(self);
        speed = natives.getSpeed(data);
        radius = natives.getRadius(data);
        piercesEnvironment = natives.LogicProjectileData_piercesEnvironment(data);
        piercesEnvironmentLikeButter = natives.LogicProjectileData_piercesEnvironmentLikeButter(data);
        rendering = natives.LogicProjectileData_getRendering(data);
        isThrower = data.add(184).readInt();
        angle = ((rendering === 3) ? (calculateAngle(self) == null) : self.add(offsets2.projectile_angle).readU32());
        normalizedAngle = normalizeAngle(angle);
        spawnAreaEffect = natives.LogicProjectileData_getSpawnAreaEffect(data);
        spawnAreaRadius = 0;
        spawnAreaActiveTime = 0;
        if (!(spawnAreaEffect.isNull())) {
            spawnAreaRadius = spawnAreaEffect.add(296).readInt();
            spawnAreaActiveTime = natives.LogicAreaEffectData_getActiveTime(spawnAreaEffect);
        }
        targetX = natives.LogicProjectileClient_getTargetX(self);
        targetY = natives.LogicProjectileClient_getTargetY(self);
        if ((isThrower === 1)) {
            if ((targetX === 0)) {
                if ((targetY === 0)) {
                }
            }
        }
        range = 4000;
        parentName = NativeString.toJSString(natives.LogicData_getName(Memory.readPointer(data.add(88))));
        try {
            if ((parentName === "BeamerProjectile")) {
                range = (3600 + 80);
            } else {
                range = (projectileNameToRange.get(parentName).range + 80);
            }
        } catch (error) {
        }
        {}.ptr = self;
        {}.name = name;
        {}.x = x;
        {}.y = y;
        {}.z = z;
        {}.angle = angle;
        {}.normalizedAngle = normalizedAngle;
        {}.team = team;
        {}.speed = speed;
        {}.radius = radius;
        {}.piercesEnvironment = piercesEnvironment;
        {}.piercesEnvironmentLikeButter = piercesEnvironmentLikeButter;
        {}.globalID = globalID;
        {}.range = range;
        {}.targetX = targetX;
        {}.targetY = targetY;
        {}.rendering = rendering;
        {}.spawnAreaEffect = spawnAreaEffect;
        {}.spawnAreaRadius = spawnAreaRadius;
        {}.spawnAreaActiveTime = spawnAreaActiveTime;
        {}.isThrower = isThrower;
        {}.timestamp = spawnTime;
        liveProjectiles.set(globalID, {});
        {}.name = name;
        {}.x = x;
        {}.y = y;
        {}.z = z;
        {}.angle = angle;
        {}.normalizedAngle = normalizedAngle;
        {}.team = team;
        {}.speed = speed;
        {}.radius = radius;
        {}.piercesEnvironment = piercesEnvironment;
        {}.piercesEnvironmentLikeButter = piercesEnvironmentLikeButter;
        {}.globalID = globalID;
        {}.range = range;
        {}.targetX = targetX;
        {}.targetY = targetY;
        {}.rendering = rendering;
        {}.spawnAreaEffect = spawnAreaEffect;
        {}.spawnAreaRadius = spawnAreaRadius;
        {}.spawnAreaActiveTime = spawnAreaActiveTime;
        {}.isThrower = isThrower;
        {}.timestamp = spawnTime;
        console.log(JSON.stringify({}));
        pendingProjectiles.delete(globalID);
    } catch (e) {
        console.log("Error:", e);
    }
    return;
}
// ---- line 2983 ----
function anon2983(args) {
    let globalID;
    let self;
    self = args[0];
    globalID = natives.getGlobalID(self);
    if (liveProjectiles.has(globalID)) {
        let dy;
        let dx;
        let proj;
        proj = liveProjectiles.get(globalID);
        dx = natives.getX(self);
        dy = natives.getY(self);
        recordObservedRange(proj, dx, dy);
        detectSpikeVariant(proj, dx, dy);
        liveProjectiles.delete(globalID);
        console.log("Projectile with globalID ".concat(globalID, " removed on destruct, x: ", dx, ", y: ", dy, ", time alive: ", (Date.now() - proj.timestamp), "ms"));
    }
    return;
}
