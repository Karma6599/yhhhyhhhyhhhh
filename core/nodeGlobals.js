// ==========================================================================
// frida-builtins:/node-globals.js  —  node globals shim
// process/Buffer shims for the QuickJS environment
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 7 ----
function anon7(fn, res) {
    return FUNC___init;
}
// ---- line 7 ----
function __init() {
    if (fn) {
        fn = 0;
        res = <under>(fn[__getOwnPropNames(fn)[0]]);
    }
    return res;
}

// ---- line 10 ----
function anon10(cb, mod) {
    return FUNC___require;
}
// ---- line 10 ----
function __require() {
    if (!(mod)) {
        {}.exports = {};
        mod = {};
    }
    return mod.exports;
}

// ---- line 13 ----
function anon13(target, all) {
    for (const name in all) {
        {}.get = all[name];
        {}.enumerable = true;
        __defProp(target, name, {});
    }
    return;
}

// ---- line 17 ----
function anon17(to, from, except, desc) {
    if (!((from && (typeof (from) === "object")))) {
        /* @18 ?? ('unknown', 'UN_0xf4', 18) */
    }
    if ((from && (typeof (from) === "object"))) {
        let key;
        for (const key of __getOwnPropNames(from)) {
            if (!(__hasOwnProp.call(to, key))) {
                if ((key !== except)) {
                    {}.get = FUNC_<null-atom>;
                    desc = __getOwnPropDesc(from, key);
                    !({}).enumerable = (!({}) || desc.enumerable);
                    __defProp(to, key, !({}));
                }
            }
        }
    }
    return to;
}
// ---- line 21 ----
function anon21() {
    return from[key];
}

// ---- line 25 ----
function anon25(mod, isNodeMode, target) {
    target = ((mod != null) ? __create(__getProtoOf(mod)) : {});
    if (!(isNodeMode)) {
    }
    if (isNodeMode) {
        {}.value = mod;
        {}.enumerable = true;
    } else {
    }
    return <under>(__copyProps, mod);
}

// --------------------------------------------------------------------------
// module body (frida-builtins:/node-globals.js)
// --------------------------------------------------------------------------
// ---- line 36 ----
function anon36() {
    return;
}
