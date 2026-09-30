// ==========================================================================
// src/gui/floatertext.js  —  floating text overlay
// in-game text via the game's own floater ctor
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 534 ----
function getStrPtr(str) {
    return Memory.allocUtf8String(str);
}

// ---- line 537 ----
function getScPtr(str) {
    pointer = malloc(40);
    stringctor(pointer, getStrPtr(str));
    return pointer;
}

// ---- line 542 ----
function showFloater(text) {
    /* @20 ?? ('unknown', 'call', 20) */
    return;
}

// --------------------------------------------------------------------------
// module body (src/gui/floatertext.js)
// --------------------------------------------------------------------------
// ---- line 547 ----
function anon547() {
    init_node_globals();
    base = Module.getBaseAddress("libg.so");
    getinstance = new NativeFunction(base.add(6042912), "pointer", []);
    floater = new NativeFunction(base.add(8884440), "void", ["pointer", "pointer", "int", "int"]);
    malloc = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
    stringctor = new NativeFunction(base.add(15293804), "pointer", ["pointer", "pointer"]);
    return;
}
