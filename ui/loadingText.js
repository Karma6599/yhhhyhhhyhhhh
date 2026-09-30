// ==========================================================================
// src/gui/LoadingText.js  —  loading text
// 'Prism Client' loading screen branding
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// --------------------------------------------------------------------------
// module body (src/gui/LoadingText.js)
// --------------------------------------------------------------------------
// ---- line 2433 ----
function anon2433() {
    getStrPtr3 = FUNC_getStrPtr3;
    init_node_globals();
    base17 = Module.findBaseAddress("libg.so");
    connectionCredit = "Prism Client";
    StringTable_getString = new NativeFunction(base17.add(10308092), "pointer", ["pointer"]);
    {}.onEnter = FUNC_<null-atom>;
    {}.onLeave = FUNC_<null-atom>;
    return;
}
// ---- line 2438 ----
function getStrPtr3(str) {
    return Memory.allocUtf8String(str);
}
// ---- line 2443 ----
function anon2443(args) {
    this = this;
    str = Memory.readUtf8String(args[0]);
    this.str = str;
    return;
}
// ---- line 2447 ----
function anon2447(retval) {
    this = this;
    if ((this.str == "TID_CONNECTING_TO_SERVER")) {
        retval.replace(StringTable_getString(getStrPtr3(connectionCredit)));
    }
    return;
}
