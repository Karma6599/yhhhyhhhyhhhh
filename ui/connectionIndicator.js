// ==========================================================================
// src/gui/connectionindicator.js  —  connection indicator
// live connection status HUD
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 750 ----
function anon750() {
    return setConnectionIndicatorLive;
}

// ---- line 752 ----
function setConnectionIndicatorLive(enabled) {
    if (!(combatHUDInstance)) {
        return;
    }
    try {
        combatHUDInstance.add(1056).readPointer().add(8).writeU8((enabled ? 1 : 0));
        return;
    } catch (e) {
        return;
    }
}

// --------------------------------------------------------------------------
// module body (src/gui/connectionindicator.js)
// --------------------------------------------------------------------------
// ---- line 761 ----
function anon761() {
    init_node_globals();
    init_config();
    base4 = Module.findBaseAddress("libg.so");
    combatHUDInstance = null;
    {}.onEnter = FUNC_<null-atom>;
    {}.onLeave = FUNC_<null-atom>;
    return;
}
// ---- line 768 ----
function anon768(args) {
    this = this;
    this.a1 = args[0];
    return;
}
// ---- line 771 ----
function anon771(retval) {
    this = this;
    let ptr2;
    combatHUDInstance = this.a1;
    ptr2 = this.a1.add(1056).readPointer();
    if (config.connectionIndicator.enabled) {
        ptr2.add(8).writeU8(1);
        return;
    }
    ptr2.add(8).writeU8(0);
    return;
}
