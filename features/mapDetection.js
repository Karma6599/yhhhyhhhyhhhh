// ==========================================================================
// src/mech/mapDetection.js  —  tile map
// tile cache + wall/LOS queries via LogicTileMap
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 3002 ----
function anon3002() {
    return tileCache;
}

// ---- line 3004 ----
function buildTileCache(logicBattle) {
    let tiles;
    let height;
    let width;
    let tileMap;
    tileMap = natives2.LogicBattleModeClient_getTileMap(logicBattle);
    width = tileMap.add(196).readU32();
    height = tileMap.add(200).readU32();
    tiles = new Array((width * height));
    let x;
    x = 0;
    while ((x < width)) {
        let y;
        y = 0;
        while ((y < height)) {
            let tileData;
            tileData = Memory.readPointer(natives2.LogicTileMap_getTile(tileMap, x, y));
            {}.name = NativeString2.toJSString(natives2.LogicData_getName(tileData));
            {}.code = natives2.LogicTileData_getTileCode(tileData);
            {}.blocksMovement = natives2.LogicTileData_blocksMovement(tileData);
            {}.blocksProjectiles = natives2.LogicTileData_blocksProjectiles(tileData);
            {}.isDestructible = natives2.LogicTileData_isDestructibleAny(tileData);
            {}.isDestructibleWithPiercing = natives2.LogicTileData_isDestructibleWithPiercing(tileData);
            tiles[((x * height) + y)] = {};
            y++;
        }
        x++;
    }
    {}.width = width;
    {}.height = height;
    {}.tiles = tiles;
    {}.version = 0;
    tileCache = {};
    return;
}

// ---- line 3025 ----
function findTilePosition(tileMap, targetTile) {
    let height;
    let width;
    width = tileMap.add(196).readU32();
    height = tileMap.add(200).readU32();
    let x;
    x = 0;
    while ((x < width)) {
        let y;
        y = 0;
        while ((y < height)) {
            if (natives2.LogicTileMap_getTile(tileMap, x, y).equals(targetTile)) {
                {}.x = x;
                {}.y = y;
                return {};
            }
            y++;
        }
        x++;
    }
    return null;
}

// --------------------------------------------------------------------------
// module body (src/mech/mapDetection.js)
// --------------------------------------------------------------------------
// ---- line 3039 ----
function anon3039() {
    init_node_globals();
    init_config();
    base9 = Module.findBaseAddress("libg.so");
    {}.LogicBattleModeClient_getTileMap = 12721988;
    {}.LogicBattleModeClient_update = 12714096;
    {}.LogicTileMap_getTile = 10820784;
    {}.LogicTileData_isDestructibleAny = 11664548;
    {}.LogicTileData_isDestructibleWithPiercing = 11664556;
    {}.LogicTileData_blocksProjectiles = 11664540;
    {}.LogicTileData_blocksMovement = 11664532;
    {}.LogicTile_destroyTile = 10816040;
    {}.LogicData_getName = 11283052;
    {}.LogicTileData_getTileCode = 11664480;
    {}.BattleMode_enter = 10204192;
    offsets3 = {};
    NativeFunction.LogicBattleModeClient_getTileMap = new NativeFunction(base9.add(offsets3.LogicBattleModeClient_getTileMap), "pointer", ["pointer"]);
    NativeFunction.LogicTileMap_getTile = new NativeFunction(base9.add(offsets3.LogicTileMap_getTile), "pointer", ["pointer", "uint32", "uint32"]);
    NativeFunction.LogicTileData_getTileCode = new NativeFunction(base9.add(offsets3.LogicTileData_getTileCode), "uint32", ["pointer"]);
    NativeFunction.LogicData_getName = new NativeFunction(base9.add(offsets3.LogicData_getName), "pointer", ["pointer"]);
    NativeFunction.LogicTileData_blocksMovement = new NativeFunction(base9.add(offsets3.LogicTileData_blocksMovement), "bool", ["pointer"]);
    NativeFunction.LogicTileData_blocksProjectiles = new NativeFunction(base9.add(offsets3.LogicTileData_blocksProjectiles), "bool", ["pointer"]);
    NativeFunction.LogicTileData_isDestructibleAny = new NativeFunction(base9.add(offsets3.LogicTileData_isDestructibleAny), "bool", ["pointer"]);
    NativeFunction.LogicTileData_isDestructibleWithPiercing = new NativeFunction(base9.add(offsets3.LogicTileData_isDestructibleWithPiercing), "bool", ["pointer"]);
    natives2 = NativeFunction;
    let <class_fields_init>;
    /* @581 ?? ('unknown', 'define_class', 581) */
    // module entry: toJSString
    <class_fields_init> = undefined;
    NativeString2 = {'__type__': 'function', 'has_prototype': 0, 'has_simple_parameter_list': 1, 'is;
    tileCache = null;
    currentLogicBattle = null;
    newGame = false;
    // module entry: onEnter
    NativeFunction.Interceptor(.attach, base9.add(offsets3.BattleMode_enter));
    // module entry: onEnter
    NativeFunction.Interceptor(.attach, base9.add(offsets3.LogicBattleModeClient_update));
    // module entry: onEnter
    // module entry: onLeave
    return;
}
// ---- line 3079 ----
function anon3079(stringPtr) {
    let len;
    len = stringPtr.add(4).readInt();
    if ((len > 7)) {
        return stringPtr.add(8).readPointer().readUtf8String(len);
    }
    return stringPtr.add(8).readUtf8String(len);
}
// ---- line 3084 ----
function anon3084() {
    this = this;
    if (<class_fields_init>) {
    }
    return;
}
// ---- line 3089 ----
function anon3089(args) {
    newGame = true;
    return;
}
// ---- line 3094 ----
function anon3094(args) {
    currentLogicBattle = args[0];
    if (newGame) {
        buildTileCache(args[0]);
        newGame = false;
    }
    return;
}
// ---- line 3103 ----
function anon3103(args) {
    this = this;
    if ((!(tileCache) || !(currentLogicBattle))) {
        return;
    }
    try {
        let tileMap;
        tileMap = natives2.LogicBattleModeClient_getTileMap(currentLogicBattle);
        this.position = findTilePosition(tileMap, args[0]);
        return;
    } catch (e) {
        return;
    }
}
// ---- line 3111 ----
function anon3111(retval) {
    this = this;
    if (!(!(tileCache))) {
    }
    if (!(tileCache)) {
        return;
    }
    try {
        let tileData;
        let tileMap;
        tileMap = natives2.LogicBattleModeClient_getTileMap(currentLogicBattle);
        tileData = Memory.readPointer(natives2.LogicTileMap_getTile(tileMap, this.position.x, this.position.y));
        {}.name = NativeString2.toJSString(natives2.LogicData_getName(tileData));
        {}.code = natives2.LogicTileData_getTileCode(tileData);
        {}.blocksMovement = natives2.LogicTileData_blocksMovement(tileData);
        {}.blocksProjectiles = natives2.LogicTileData_blocksProjectiles(tileData);
        {}.isDestructible = natives2.LogicTileData_isDestructibleAny(tileData);
        {}.isDestructibleWithPiercing = natives2.LogicTileData_isDestructibleWithPiercing(tileData);
        tileCache.tiles[((this.position.x * tileCache.height) + this.position.y)] = {};
        tileCache.version = .version;
        return;
    } catch (e) {
        return;
    }
}
