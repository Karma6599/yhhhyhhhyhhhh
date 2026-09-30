// ==========================================================================
// src/utils/ping.js  —  ping/IP HUD
// ping display + IP display
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// --------------------------------------------------------------------------
// module body (src/utils/ping.js)
// --------------------------------------------------------------------------
// ---- line 4696 ----
function anon4696() {
    init_node_globals();
    init_Debug_Toggles();
    base16 = Module.findBaseAddress("libg.so");
    BattleMode_getInstance3 = new NativeFunction(base16.add(10197860), "pointer", ["pointer"]);
    // module entry: onEnter
    return;
}
// ---- line 4703 ----
function anon4703() {
    try {
        let ping;
        let battleInstance;
        battleInstance = BattleMode_getInstance3(ptr(0));
        ping = battleInstance.add(88).readPointer().add(48).readInt();
        setPingHUD(ping);
        return;
    } catch (e) {
        return;
    }
}
