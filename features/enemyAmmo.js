// ==========================================================================
// src/mech/enemyAmmo.js  —  enemy ammo bars
// Character_updateHealthBar hook
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// --------------------------------------------------------------------------
// module body (src/mech/enemyAmmo.js)
// --------------------------------------------------------------------------
// ---- line 4676 ----
function anon4676() {
    init_node_globals();
    init_config();
    base15 = Module.getBaseAddress("libg.so");
    Character_updateHealthBar = new NativeFunction(base15.add(5420332), "void", ["pointer", "float"]);
    ammoBarOffset = 2872;
    return;
}
// ---- line 4682 ----
function anon4682(character, time) {
    let ammoBar;
    Character_updateHealthBar(character, time);
    ammoBar = character.add(ammoBarOffset).readPointer();
    if (!(ammoBar.isNull())) {
        ammoBar.add(Process.pointerSize).writeU8((config.showEnemyAmmo.enabled ? 1 : 0));
    }
    return;
}
