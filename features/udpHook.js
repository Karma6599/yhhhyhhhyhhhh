// ==========================================================================
// src/mech/udpHook.js  —  UDP hook
// reads live server IP/port from the game's socket
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 722 ----
function anon722() {
    return IP;
}

// ---- line 724 ----
function readScString(strObj) {
    let len;
    len = strObj.add(4).readInt();
    if ((len > 7)) {
        return strObj.add(8).readPointer().readUtf8String(len);
    }
    return strObj.add(8).readUtf8String(len);
}

// --------------------------------------------------------------------------
// module body (src/mech/udpHook.js)
// --------------------------------------------------------------------------
// ---- line 730 ----
function anon730() {
    init_node_globals();
    init_Debug_Toggles();
    base3 = Module.findBaseAddress("libg.so");
    getPort = new NativeFunction(base3.add(12709600), "int", ["pointer"]);
    IP = "penis:1337";
    // module entry: onEnter
    return;
}
// ---- line 738 ----
function anon738(args) {
    let a1;
    a1 = args[0];
    IP = ((readScString(a1.add(152).readPointer()) + ":") + getPort(a1));
    return;
}
