// ==========================================================================
// src/utils/antiAfk.js  —  anti-AFK
// periodic input injection
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// --------------------------------------------------------------------------
// module body (src/utils/antiAfk.js)
// --------------------------------------------------------------------------
// ---- line 4642 ----
function anon4642() {
    init_node_globals();
    init_config();
    base14 = Module.findBaseAddress("libg.so");
    malloc6 = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
    ClientInputManager_addInput2 = new NativeFunction(base14.add(8318548), "void", ["pointer", "pointer"]);
    BattleMode_getInstance2 = new NativeFunction(base14.add(10197860), "pointer", ["pointer"]);
    ClientInput_constructor2 = new NativeFunction(base14.add(12470332), "void", ["pointer", "int"]);
    LogicGameObjectClient_getX = new NativeFunction(base14.add(11913624), "uint32", ["pointer"]);
    LogicGameObjectClient_getY = new NativeFunction(base14.add(11913632), "uint32", ["pointer"]);
    LogicBattleModeClient_getOwnCharacter2 = new NativeFunction(base14.add(12722116), "pointer", ["pointer"]);
    // module entry: onLeave
    return;
}
// ---- line 4655 ----
function anon4655(retval) {
    if ((retval == 1)) {
        if (config.antiAFK.enabled) {
            let ownGameObject;
            let input;
            let logicBattleModeClient;
            let battleInstance;
            battleInstance = BattleMode_getInstance2(ptr(0));
            logicBattleModeClient = battleInstance.add(40).readPointer();
            input = malloc6(64);
            ownGameObject = LogicBattleModeClient_getOwnCharacter2(logicBattleModeClient);
            ClientInput_constructor2(input, 2);
            input.add(12).writeInt(LogicGameObjectClient_getX(ownGameObject));
            input.add(16).writeInt(LogicGameObjectClient_getY(ownGameObject));
            ClientInputManager_addInput2(battleInstance.add(88).readPointer(), input);
            retval.replace(0);
        }
    }
    return;
}
