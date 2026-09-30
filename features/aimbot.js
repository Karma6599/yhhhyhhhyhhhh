// ==========================================================================
// src/mech/shooting.js  —  AIMBOT
// intercept solver + tracking + trigger shot
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 4131 ----
function clamp(v, lo, hi) {
    if ((v < lo)) {
        return lo;
    }
    if ((v > hi)) {
        return hi;
    }
    return v;
}

// ---- line 4134 ----
function hypot(x, y) {
    return Math.sqrt(((x * x) + (y * y)));
}

// ---- line 4137 ----
function regress(pts) {
    let denom;
    let sTY;
    let sTX;
    let sY;
    let sX;
    let sT2;
    let sT;
    let t0;
    let n;
    n = pts.length;
    if ((n < 2)) {
        return null;
    }
    t0 = pts[0].t;
    sT = 0;
    sT2 = 0;
    sX = 0;
    sY = 0;
    sTX = 0;
    sTY = 0;
    let i;
    i = 0;
    while ((i < n)) {
        let tt;
        tt = ((pts[i].t - t0) / 1000);
        sT = (sT + tt);
        sT2 = (sT2 + (tt * tt));
        sX = (sX + pts[i].x);
        sY = (sY + pts[i].y);
        sTX = (sTX + (tt * pts[i].x));
        sTY = (sTY + (tt * pts[i].y));
        i++;
    }
    denom = ((n * sT2) - (sT * sT));
    if ((Math.abs(denom) < 1e-09)) {
        return null;
    }
    {}.vx = (((n * sTX) - (sT * sX)) / denom);
    {}.vy = (((n * sTY) - (sT * sY)) / denom);
    return {};
}

// ---- line 4158 ----
function estimateAccel(pts) {
    let dt;
    let tLate;
    let tEarly;
    let late;
    let early;
    let mid;
    let n;
    n = pts.length;
    mid = Math.floor((n / 2));
    early = regress(pts.slice(0, (mid + 1)));
    late = regress(pts.slice(mid));
    if ((!(early) || !(late))) {
        {}.ax = 0;
        {}.ay = 0;
        return {};
    }
    tEarly = ((pts[0].t + pts[mid].t) / 2);
    tLate = ((pts[mid].t + pts[(n - 1)].t) / 2);
    dt = ((tLate - tEarly) / 1000);
    if ((dt <= 1e-06)) {
        {}.ax = 0;
        {}.ay = 0;
        return {};
    }
    {}.ax = ((late.vx - early.vx) / dt);
    {}.ay = ((late.vy - early.vy) / dt);
    return {};
}

// ---- line 4170 ----
function updateTracking(x, y, id) {
    let jp;
    let snapped;
    let vy;
    let vx;
    let vfit;
    let maxLen;
    let now;
    let a;
    a = config.aimbot;
    now = Date.now();
    if ((id !== currentTargetID)) {
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
    {}.x = x;
    {}.y = y;
    {}.t = now;
    samples.push({});
    maxLen = (a.lastpositionsLen | 0);
    if ((maxLen < 2)) {
        maxLen = 2;
    }
    while ((samples.length > maxLen)) {
        samples.shift();
    }
    if ((samples.length < 2)) {
        trackedVx = 0;
        trackedVy = 0;
        trackedAx = 0;
        trackedAy = 0;
        return;
    }
    if (!(regress(samples))) {
        {}.vx = 0;
        {}.vy = 0;
    }
    vfit = regress(samples);
    vx = vfit.vx;
    vy = vfit.vy;
    snapped = false;
    jp = a.jukePredict;
    if (jp) {
        if (jp.enabled) {
            if (jp.reactive) {
                let vnew;
                vnew = regress(samples.slice(-3));
                if (vnew) {
                    let dot;
                    dot = ((vnew.vx * prevVx) + (vnew.vy * prevVy));
                    if ((dot < 0)) {
                        if ((hypot(vnew.vx, vnew.vy) > a.deadzoneSpeed)) {
                            vx = vnew.vx;
                            vy = vnew.vy;
                            snapped = true;
                        }
                    }
                }
            }
        }
    }
    if (snapped) {
        emaVx = vx;
        emaVy = vy;
        haveEma = true;
    } else {
        let k;
        k = a.velocitySmoothing((a.velocitySmoothing || 0), 0, 0.95);
        if (!(haveEma)) {
            emaVx = vx;
            emaVy = vy;
            haveEma = true;
        } else {
            emaVx = ((k * emaVx) + ((1 - k) * vx));
            emaVy = ((k * emaVy) + ((1 - k) * vy));
        }
    }
    trackedVx = emaVx;
    trackedVy = emaVy;
    prevVx = trackedVx;
    prevVy = trackedVy;
    trackedAx = 0;
    trackedAy = 0;
    if (a.curvePredict) {
        if (a.curvePredict.enabled) {
            if ((samples.length >= 4)) {
                let amag;
                let amax;
                let spd;
                let ay;
                let ax;
                let acc;
                acc = estimateAccel(samples);
                ax = acc.ax;
                ay = acc.ay;
                spd = hypot(trackedVx, trackedVy);
                amax = (spd * 8);
                amag = hypot(ax, ay);
                if ((amag > amax)) {
                    if ((amag > 1e-06)) {
                        let s;
                        s = (amax / amag);
                        ax = (ax * s);
                        ay = (ay * s);
                    }
                }
                trackedAx = ax;
                trackedAy = ay;
            }
        }
    }
    return;
}

// ---- line 4246 ----
function solveIntercept(sx, sy, tx, ty, vx, vy, ax, ay, P, maxT) {
    let t;
    t = (hypot((tx - sx), (ty - sy)) / P);
    let i;
    i = 0;
    while ((i < 6)) {
        let nt;
        let py;
        let px;
        px = ((tx + (vx * t)) + (((0.5 * ax) * t) * t));
        py = ((ty + (vy * t)) + (((0.5 * ay) * t) * t));
        nt = (hypot((px - sx), (py - sy)) / P);
        if ((nt > maxT)) {
            nt = maxT;
        }
        if ((Math.abs((nt - t)) < 0.0005)) {
            t = nt;
            break;
        }
        t = nt;
        i++;
    }
    if ((t > maxT)) {
        t = maxT;
    }
    {}.x = ((tx + (vx * t)) + (((0.5 * ax) * t) * t));
    {}.y = ((ty + (vy * t)) + (((0.5 * ay) * t) * t));
    return {};
}

// ---- line 4262 ----
function computeAimPoint(sx, sy, P) {
    let jp;
    let fwd;
    let ay;
    let ax;
    let vy;
    let vx;
    let maxT;
    let str;
    let speed;
    let cur;
    let a;
    a = config.aimbot;
    if ((samples.length < 1)) {
        return null;
    }
    cur = samples[(samples.length - 1)];
    speed = hypot(trackedVx, trackedVy);
    if ((speed < a.deadzoneSpeed)) {
        {}.x = cur.x;
        {}.y = cur.y;
        return {};
    }
    str = ((typeof (a.predictionStrength) === "number") ? a.predictionStrength : 1);
    if ((typeof (a.maxLeadTime) === "number")) {
    }
    maxT = 0.9;
    vx = (trackedVx * str);
    vy = (trackedVy * str);
    ax = (trackedAx * str);
    ay = (trackedAy * str);
    /* @285 ?? ('unknown', 'call', 285) */
    fwd = maxT;
    jp = a.jukePredict;
    if (jp) {
        if (jp.enabled) {
            if ((jp.bias > 0)) {
                let rev;
                let bias;
                bias = clamp(jp.bias, 0, 1);
                /* @397 ?? ('unknown', 'call', 397) */
                rev = maxT;
                {}.x = ((fwd.x * (1 - bias)) + (rev.x * bias));
                {}.y = ((fwd.y * (1 - bias)) + (rev.y * bias));
                return {};
            }
        }
    }
    return fwd;
}

// ---- line 4284 ----
function applyAimbotConfig(skillClient) {
    let aim;
    let ownY;
    let ownX;
    let ownLogicCharacter;
    let P;
    let speedNative;
    let skillName;
    let ProjectileData;
    let SkillData;
    if (!(battleMode)) {
        return null;
    }
    if (!(config.aimbot.enabled)) {
        return null;
    }
    SkillData = natives3.LogicSkillClient_getData(skillClient);
    if (SkillData.isNull()) {
        return null;
    }
    ProjectileData = natives3.LogicSkillClient_getProjectile(SkillData, 0);
    if (ProjectileData.isNull()) {
        return null;
    }
    skillName = "";
    try {
        skillName = NativeString3.toJSString(natives3.LogicData_getName(SkillData));
    } catch (e) {
    }
    if (blacklistedSkills.includes(skillName)) {
        return null;
    }
    speedNative = natives3.LogicProjectileData_getSpeed(ProjectileData);
    P = ((speedNative > 0) ? speedNative : config.aimbot.projectileSpeed);
    if ((!(P) || (P <= 0))) {
        return null;
    }
    ownLogicCharacter = natives3.LogicBattleModeClient_getOwnCharacter(battleMode);
    if (ownLogicCharacter.isNull()) {
        return null;
    }
    ownX = natives3.LogicGameObjectClient_getX(ownLogicCharacter);
    ownY = natives3.LogicGameObjectClient_getY(ownLogicCharacter);
    aim = computeAimPoint(ownX, ownY, P);
    if (!(aim)) {
        return null;
    }
    {}.x = Math.round(aim.x);
    {}.y = Math.round(aim.y);
    return {};
}

// ---- line 4313 ----
function triggerShot(BattleScreen, x, y, ownChar, nextSkillClient, isAimed) {
    let newY;
    let newX;
    newX = x;
    newY = y;
    if (config.aimbot.enabled) {
        if (!(isAimed)) {
            let aimTarget;
            aimTarget = applyAimbotConfig(nextSkillClient);
            if (aimTarget) {
                newX = aimTarget.x;
                newY = aimTarget.y;
            }
        }
    }
    return;
}

// --------------------------------------------------------------------------
// module body (src/mech/shooting.js)
// --------------------------------------------------------------------------
// ---- line 4327 ----
function anon4327() {
    init_node_globals();
    init_config();
    base11 = Module.getBaseAddress("libg.so");
    {}.LogicBattleModeClient_update = 12714096;
    {}.LogicGameObjectClient_getX = 11913624;
    {}.LogicGameObjectClient_getY = 11913632;
    {}.LogicBattleModeClient_getOwnCharacter = 12722116;
    {}.BattleScreen_getClosestTargetForAutoshoot = 8868908;
    {}.BattleScreen_activateSkill = 8764700;
    {}.LogicSkillClient_getData = 12030616;
    {}.LogicSkillData_getProjectile = 11586408;
    {}.LogicProjectileData_getSpeed = 11507308;
    {}.LogicProjectileData_getRadius = 11507436;
    {}.LogicGameObjectClient_getGlobalID = 11913540;
    {}.LogicData_getName = 11283052;
    {}.LogicCharacterClient_getLinkedCarryable = 11731640;
    {}.BattleMode_getInstance = 10197860;
    {}.LogicCharacterClient_hasAmmo = 11733412;
    {}.LogicCharacterClient_canCastSkill = 11734712;
    {}.LogicPlayer_hasUlti = 12851068;
    {}.LogicCharacterClientOwn_getUltiSkillClient = 11743036;
    {}.LogicCharacterClientOwn_getNextSkillClient = 11742880;
    {}.LogicCharacterClient_getOwnPlayerIndex = 12721172;
    {}.getManualCoords = 8763216;
    offset = {};
    NativeFunction.LogicBattleModeClient_getOwnCharacter = new NativeFunction(base11.add(offset.LogicBattleModeClient_getOwnCharacter), "pointer", ["pointer"]);
    NativeFunction.LogicGameObjectClient_getX = new NativeFunction(base11.add(offset.LogicGameObjectClient_getX), "uint32", ["pointer"]);
    NativeFunction.LogicGameObjectClient_getY = new NativeFunction(base11.add(offset.LogicGameObjectClient_getY), "uint32", ["pointer"]);
    NativeFunction.LogicSkillClient_getData = new NativeFunction(base11.add(offset.LogicSkillClient_getData), "pointer", ["pointer"]);
    NativeFunction.LogicSkillClient_getProjectile = new NativeFunction(base11.add(offset.LogicSkillData_getProjectile), "pointer", ["pointer", "uint32"]);
    NativeFunction.LogicProjectileData_getSpeed = new NativeFunction(base11.add(offset.LogicProjectileData_getSpeed), "uint32", ["pointer"]);
    NativeFunction.LogicProjectileData_getRadius = new NativeFunction(base11.add(offset.LogicProjectileData_getRadius), "uint32", ["pointer"]);
    NativeFunction.LogicGameObjectClient_getGlobalID = new NativeFunction(base11.add(offset.LogicGameObjectClient_getGlobalID), "uint32", ["pointer"]);
    NativeFunction.LogicData_getName = new NativeFunction(base11.add(offset.LogicData_getName), "pointer", ["pointer"]);
    NativeFunction.LogicCharacterClient_getLinkedCarryable = new NativeFunction(base11.add(offset.LogicCharacterClient_getLinkedCarryable), "pointer", ["pointer", "pointer"]);
    NativeFunction.BattleMode_getInstance = new NativeFunction(base11.add(offset.BattleMode_getInstance), "pointer", ["pointer"]);
    NativeFunction.LogicCharacterClient_hasAmmo = new NativeFunction(base11.add(offset.LogicCharacterClient_hasAmmo), "bool", ["pointer"]);
    NativeFunction.LogicCharacterClient_canCastSkill = new NativeFunction(base11.add(offset.LogicCharacterClient_canCastSkill), "bool", ["pointer", "pointer", "pointer"]);
    NativeFunction.LogicPlayer_hasUlti = new NativeFunction(base11.add(offset.LogicPlayer_hasUlti), "bool", ["pointer"]);
    NativeFunction.LogicCharacterClientOwn_getUltiSkillClient = new NativeFunction(base11.add(offset.LogicCharacterClientOwn_getUltiSkillClient), "pointer", ["pointer"]);
    NativeFunction.BattleScreen_activateSkill_orig = new NativeFunction(base11.add(offset.BattleScreen_activateSkill), "void", ["pointer", "int", "int", "pointer", "pointer", "pointer", "int"]);
    NativeFunction.LogicCharacterClientOwn_getNextSkillClient = new NativeFunction(base11.add(offset.LogicCharacterClientOwn_getNextSkillClient), "pointer", ["pointer", "pointer"]);
    NativeFunction.LogicCharacterClient_getOwnPlayerIndex = new NativeFunction(base11.add(offset.LogicCharacterClient_getOwnPlayerIndex), "int", ["pointer"]);
    NativeFunction.getManualCoords = new NativeFunction(base11.add(offset.getManualCoords), "uint64", ["pointer", "pointer", "pointer"]);
    natives3 = NativeFunction;
    let <class_fields_init>;
    /* @1286 ?? ('unknown', 'define_class', 1286) */
    // module entry: toJSString
    <class_fields_init> = undefined;
    NativeString3 = {'__type__': 'function', 'has_prototype': 0, 'has_simple_parameter_list': 1, 'is;
    battleMode = null;
    {}.onEnter = FUNC_<null-atom>;
    Interceptor.attach(base11.add(offset.LogicBattleModeClient_update), {});
    ID = 1000000;
    samples = [];
    currentTargetID = -1;
    emaVx = 0;
    emaVy = 0;
    haveEma = false;
    prevVx = 0;
    prevVy = 0;
    trackedVx = 0;
    trackedVy = 0;
    trackedAx = 0;
    trackedAy = 0;
    {}.onLeave = FUNC_<null-atom>;
    Interceptor.attach(base11.add(offset.BattleScreen_getClosestTargetForAutoshoot), {});
    SHOOT_STICK_ACTIVE_OFFSET = 3913;
    ULTI_STICK_ACTIVE_OFFSET = 3914;
    SHOOT_STICK_AIMING_OFFSET = 3821;
    blacklistedSkills = ["ShamanUlti", "MechanicUlti", "ClusterBombDudeUlti", "ArcadeUlti", "ArtilleryDudeUlti", "SoulCollectorUlti", "MinigunDudeUlti", "KnightUlti", "DuplicatorUlti", "TwinsUlti", "SpawnerDudeUlti", "ConductorUlti", "MeepleUlti", "FleaUlti", "ReviverUlti", "VoodooUlti", "ShadowdemonUlti", "RollerUlti", "SniperUlti", "EnragerUlti", "PowerLevelerUlti", "DoorManUlti", "ConductorUltiSpawn"];
    .replace.base11.add(offset.BattleScreen_activateSkill)(NativeCallback, new NativeCallback(FUNC_<null-atom>, "void", ["pointer", "int", "int", "pointer", "pointer", "pointer", "int"]));
    lastUltiAimTime = 0;
    // module entry: onEnter
    return;
}
// ---- line 4390 ----
function anon4390(stringPtr) {
    if ((!(stringPtr) || stringPtr.isNull())) {
        return "";
    }
    try {
        let len;
        len = stringPtr.add(4).readInt();
        if ((len === 0)) {
            return "";
        }
        if ((len > 7)) {
            return stringPtr.add(8).readPointer().readUtf8String(len);
        }
        return stringPtr.add(8).readUtf8String(len);
    } catch (e) {
        return "";
    }
}
// ---- line 4401 ----
function anon4401() {
    this = this;
    if (<class_fields_init>) {
    }
    return;
}
// ---- line 4404 ----
function anon4404(args) {
    battleMode = args[0];
    return;
}
// ---- line 4421 ----
function anon4421(retval) {
    let gid;
    let y;
    let x;
    if ((retval == 0)) {
        return;
    }
    x = natives3.LogicGameObjectClient_getX(retval);
    y = natives3.LogicGameObjectClient_getY(retval);
    gid = natives3.LogicGameObjectClient_getGlobalID(retval);
    ID = gid;
    return;
}
// ---- line 4458 ----
function anon4458(battleScreen, x, y, character, skillClient, target, targetID) {
    let isAutoshot;
    let newTarget;
    let newY;
    let newX;
    newX = x;
    newY = y;
    newTarget = target;
    isAutoshot = (targetID !== 0);
    if (isAutoshot) {
        if (battleMode) {
            if (config.aimbot.enabled) {
                let aimTarget;
                aimTarget = applyAimbotConfig(skillClient);
                if (aimTarget) {
                    newX = aimTarget.x;
                    newY = aimTarget.y;
                    newTarget = ptr(0);
                }
            }
        }
    }
    return;
}
// ---- line 4476 ----
function anon4476(args) {
    let skillToTrigger;
    let isAimed;
    let finalY;
    let finalX;
    let willShoot;
    let targetYAimed;
    let targetXAimed;
    let packedBig;
    let packedCoords;
    let targetY;
    let targetX;
    let hasCarryable;
    let linkedCarryable;
    let canCastUlti;
    let ultiSkillClient;
    let canCastNormal;
    let ownPlayer;
    let nextSkillData;
    let nextSkillClient;
    let ownChar;
    let logicBattleModeClient;
    let battleInstance;
    let shootStickAiming;
    let ultiStickActive;
    let shootStickActive;
    let BattleScreen;
    BattleScreen = args[0];
    shootStickActive = BattleScreen.add(SHOOT_STICK_ACTIVE_OFFSET).readU8();
    ultiStickActive = BattleScreen.add(ULTI_STICK_ACTIVE_OFFSET).readU8();
    shootStickAiming = BattleScreen.add(SHOOT_STICK_AIMING_OFFSET).readU8();
    if (ultiStickActive) {
        lastUltiAimTime = Date.now();
        return;
    }
    if (((Date.now() - lastUltiAimTime) < 150)) {
        return;
    }
    battleInstance = natives3.BattleMode_getInstance(ptr(0));
    if (((battleInstance == ptr(0)) || (battleInstance == 16))) {
        return;
    }
    logicBattleModeClient = battleInstance.add(40).readPointer();
    if (logicBattleModeClient.isNull()) {
        return;
    }
    ownChar = natives3.LogicBattleModeClient_getOwnCharacter(logicBattleModeClient);
    if (ownChar.isNull()) {
        return;
    }
    nextSkillClient = ptr(0);
    nextSkillData = ptr(0);
    ownPlayer = ptr(0);
    try {
        let playerArray;
        let playerIndex;
        playerIndex = natives3.LogicCharacterClient_getOwnPlayerIndex(logicBattleModeClient);
        playerArray = logicBattleModeClient.readPointer();
        if ((playerArray.isNull() || (playerArray.toUInt32() < 4096))) {
            return undefined;
        }
        ownPlayer = playerArray.add((playerIndex * 8)).readPointer();
        if ((ownPlayer.isNull() || (ownPlayer.toUInt32() < 4096))) {
            return undefined;
        }
        nextSkillClient = natives3.LogicCharacterClientOwn_getNextSkillClient(ownChar, ownPlayer);
        if (nextSkillClient.isNull()) {
            return undefined;
        }
        nextSkillData = natives3.LogicSkillClient_getData(nextSkillClient);
        if (nextSkillData.isNull()) {
            return undefined;
        }
    } catch (e) {
        return undefined;
    }
    canCastNormal = natives3.LogicCharacterClient_canCastSkill(ownChar, nextSkillData, ownPlayer);
    ultiSkillClient = natives3.LogicCharacterClientOwn_getUltiSkillClient(ownChar);
    canCastUlti = false;
    if (!(ultiSkillClient.isNull())) {
        if (natives3.LogicPlayer_hasUlti(ownPlayer)) {
            let ultiSkillData;
            ultiSkillData = natives3.LogicSkillClient_getData(ultiSkillClient);
            canCastUlti = natives3.LogicCharacterClient_canCastSkill(ownChar, ultiSkillData, ownPlayer);
        }
    }
    linkedCarryable = natives3.LogicCharacterClient_getLinkedCarryable(ownChar, logicBattleModeClient);
    hasCarryable = !(linkedCarryable.isNull());
    targetX = BattleScreen.add(3964).readU32();
    targetY = BattleScreen.add(3968).readU32();
    packedCoords = natives3.getManualCoords(BattleScreen, ownChar, nextSkillData);
    packedBig = BigInt(packedCoords);
    targetXAimed = Number((packedBig & "18446744069414584320e67n"));
    targetYAimed = Number((packedBig >> "9223372036854775808e15n"));
    willShoot = false;
    finalX = 0;
    finalY = 0;
    isAimed = false;
    skillToTrigger = nextSkillClient;
    if (!(hasCarryable)) {
        if (config.autoUlti) {
            if (config.autoUlti.enabled) {
                if (canCastUlti) {
                    if ((ID !== 1000000)) {
                        willShoot = true;
                        finalX = targetX;
                        finalY = targetY;
                        isAimed = false;
                        skillToTrigger = ultiSkillClient;
                    } else {
                        if (!(hasCarryable)) {
                            if (canCastNormal) {
                                if (config.holdToShoot.enabled) {
                                    if (shootStickActive) {
                                        willShoot = true;
                                        if (!(shootStickAiming)) {
                                            finalX = targetX;
                                            finalY = targetY;
                                            isAimed = false;
                                        } else {
                                            finalX = targetXAimed;
                                            finalY = targetYAimed;
                                            isAimed = true;
                                        }
                                    }
                                }
                                if (config.autoShoot.enabled) {
                                    if (!(shootStickAiming)) {
                                        willShoot = true;
                                        finalX = targetX;
                                        finalY = targetY;
                                        isAimed = false;
                                    } else {
                                        if (shootStickActive) {
                                            if (shootStickAiming) {
                                                willShoot = true;
                                                finalX = targetXAimed;
                                                finalY = targetYAimed;
                                                isAimed = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (!(hasCarryable)) {
        if (canCastNormal) {
            if (config.holdToShoot.enabled) {
                if (shootStickActive) {
                    willShoot = true;
                    if (!(shootStickAiming)) {
                        finalX = targetX;
                        finalY = targetY;
                        isAimed = false;
                    } else {
                        finalX = targetXAimed;
                        finalY = targetYAimed;
                        isAimed = true;
                    }
                }
            }
            if (config.autoShoot.enabled) {
                if (!(shootStickAiming)) {
                    willShoot = true;
                    finalX = targetX;
                    finalY = targetY;
                    isAimed = false;
                } else {
                    if (shootStickActive) {
                        if (shootStickAiming) {
                            willShoot = true;
                            finalX = targetXAimed;
                            finalY = targetYAimed;
                            isAimed = true;
                        }
                    }
                }
            }
        }
    }
    if (willShoot) {
        /* @1181 ?? ('unknown', 'call', 1181) */
    }
    return;
}
