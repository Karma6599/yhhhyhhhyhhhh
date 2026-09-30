// ==========================================================================
// src/mech/AutoCharge.js  —  auto charge
// auto attack charge via ClientInputManager
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// --------------------------------------------------------------------------
// module body (src/mech/AutoCharge.js)
// --------------------------------------------------------------------------
// ---- line 4573 ----
function anon4573() {
    init_node_globals();
    init_config();
    base12 = Module.findBaseAddress("libg.so");
    malloc5 = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
    ClientInputManager_addInput = new NativeFunction(base12.add(8318548), "void", ["pointer", "pointer"]);
    BattleMode_getInstance = new NativeFunction(base12.add(10197860), "pointer", ["pointer"]);
    ClientInput_constructor = new NativeFunction(base12.add(12470332), "void", ["pointer", "int"]);
    LogicBattleModeClient_getOwnCharacter = new NativeFunction(base12.add(12722116), "pointer", ["pointer"]);
    LogicGameObjectClient_getData = new NativeFunction(base12.add(11912824), "pointer", ["pointer"]);
    LogicData_getName = new NativeFunction(base12.add(11283052), "pointer", ["pointer"]);
    let <class_fields_init>;
    /* @389 ?? ('unknown', 'define_class', 389) */
    // module entry: toJSString
    <class_fields_init> = undefined;
    NativeString4 = {'__type__': 'function', 'has_prototype': 0, 'has_simple_parameter_list': 1, 'is;
    return;
}
// ---- line 4585 ----
function anon4585(stringPtr) {
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
// ---- line 4596 ----
function anon4596() {
    this = this;
    if (<class_fields_init>) {
    }
    return;
}
// ---- line 4597 ----
function anon4597() {
    try {
        let input;
        let brawlerName;
        let ownCharData;
        let ownChar;
        let logicBattleModeClient;
        let battleInstance;
        if (!(config.autoCharge.enabled)) {
            return undefined;
        }
        battleInstance = BattleMode_getInstance(ptr(0));
        if ((battleInstance.isNull() || (battleInstance == ptr(16)))) {
            return undefined;
        }
        logicBattleModeClient = battleInstance.add(40).readPointer();
        if (logicBattleModeClient.isNull()) {
            return undefined;
        }
        ownChar = LogicBattleModeClient_getOwnCharacter(logicBattleModeClient);
        if (ownChar.isNull()) {
            return undefined;
        }
        ownCharData = LogicGameObjectClient_getData(ownChar);
        if (ownCharData.isNull()) {
            return undefined;
        }
        brawlerName = NativeString4.toJSString(LogicData_getName(ownCharData));
        if (!(config.autoCharge.brawlers.includes(brawlerName))) {
            return undefined;
        }
        input = malloc5(50);
        input.add(44).writeU8(69);
        ClientInput_constructor(input, 13);
        ClientInputManager_addInput(battleInstance.add(88).readPointer(), input);
        return;
    } catch (e) {
        return;
    }
}
