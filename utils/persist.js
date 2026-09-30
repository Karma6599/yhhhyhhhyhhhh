// ==========================================================================
// src/utils/persist.js  —  config persistence
// loads/saves .prism-config.json atomically
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 377 ----
function anon377() {
    return loadConfig;
}

// ---- line 378 ----
function anon378() {
    return scheduleSave;
}

// ---- line 380 ----
function _i2(n) {
    if ((typeof (n) === "number")) {
        return n;
    }
    return n.toInt32();
}

// ---- line 383 ----
function _replacer(k, v) {
    if ((v === Infinity)) {
        return "__Inf__";
    }
    if ((v === -(Infinity))) {
        return "__-Inf__";
    }
    return v;
}

// ---- line 386 ----
function _reviver(k, v) {
    if ((v === "__Inf__")) {
        return Infinity;
    }
    if ((v === "__-Inf__")) {
        return -(Infinity);
    }
    return v;
}

// ---- line 389 ----
function _pkgName2() {
    try {
        let r;
        let buf;
        let fd;
        fd = _open2(Memory.allocUtf8String("/proc/self/cmdline"), 0, 0);
        if ((fd < 0)) {
            return null;
        }
        buf = Memory.alloc(256);
        r = _i2(_read2(fd, buf, 256));
        _close2(fd);
        if ((r <= 0)) {
            return null;
        }
        return Memory.readUtf8String(buf);
    } catch (e) {
        return null;
    }
}

// ---- line 402 ----
function _utf8Len(s) {
    let n;
    n = 0;
    let i;
    i = 0;
    while ((i < s.length)) {
        let c;
        c = s.charCodeAt(i);
        if ((c < 128)) {
            n = (n + 1);
        } else {
            if ((c < 2048)) {
                n = (n + 2);
            } else {
                if ((c >= 55296)) {
                    if ((c <= 56319)) {
                        n = (n + 4);
                        i++;
                    } else {
                        n = (n + 3);
                    }
                }
                n = (n + 3);
            }
        }
        i++;
    }
    return n;
}

// ---- line 415 ----
function _readText(path) {
    try {
        let total;
        let buf;
        let CAP;
        let fd;
        fd = _open2(Memory.allocUtf8String(path), 0, 0);
        if ((fd < 0)) {
            return null;
        }
        CAP = 65536;
        buf = Memory.alloc(CAP);
        total = 0;
        while ((total < CAP)) {
            let r;
            r = _i2(_read2(fd, buf.add(total), (CAP - total)));
            if (((r <= 0))) break;
            total = (total + r);
        }
        _close2(fd);
        if ((total <= 0)) {
            return null;
        }
        return Memory.readUtf8String(buf, total);
    } catch (e) {
        return null;
    }
}

// ---- line 434 ----
function _writeTextAtomic(path, text) {
    try {
        let off;
        let len;
        let bytes;
        let fd;
        let tmp;
        tmp = (path + ".tmp");
        fd = _open2(Memory.allocUtf8String(tmp), O_WRONLY_CREAT_TRUNC, MODE_06002);
        if ((fd < 0)) {
            return false;
        }
        bytes = Memory.allocUtf8String(text);
        len = _utf8Len(text);
        off = 0;
        while ((off < len)) {
            let w;
            w = _i2(_write2(fd, bytes.add(off), (len - off)));
            if ((w <= 0)) {
                _close2(fd);
                return <under>;
            }
            off = (off + w);
        }
        _close2(fd);
        return (_i2(_rename2(Memory.allocUtf8String(tmp), Memory.allocUtf8String(path))) === 0);
    } catch (e) {
        return false;
    }
}

// ---- line 456 ----
function _mergeInto(dst, src) {
    if ((!(src) || (typeof (src) !== "object"))) {
        return;
    }
    let k;
    for (const k in dst) {
        let sv;
        let dv;
        if (!(Object.prototype.hasOwnProperty.call(dst, k))) continue;
        if (!(Object.prototype.hasOwnProperty.call(src, k))) continue;
        dv = dst[k];
        sv = src[k];
        if (Array.isArray(dv)) {
            if (!(Array.isArray(sv))) continue;
            dst[k] = sv.slice();
            continue;
        }
        if (dv) {
            if ((typeof (dv) === "object")) {
                if (!(sv)) continue;
                if (!((typeof (sv) === "object"))) continue;
                _mergeInto(dv, sv);
                continue;
            }
        }
        if (!((typeof (sv) === typeof (dv)))) continue;
        dst[k] = sv;
    }
    return;
}

// ---- line 471 ----
function loadConfig() {
    let raw;
    if (!(CFG_PATH)) {
        try {
            console.log("[persist] no package path \u2014 persistence disabled");
            return;
        } catch (e) {
            return;
        }
    }
    raw = _readText(CFG_PATH);
    if ((raw == null)) {
        _writeTextAtomic(CFG_PATH, JSON.stringify(config, _replacer));
        try {
            console.log(("[persist] no saved config \u2014 wrote defaults to " + CFG_PATH));
            return;
        } catch (e) {
            return;
        }
    }
    try {
        _mergeInto(config, JSON.parse(raw, _reviver));
        try {
            console.log(("[persist] restored saved config from " + CFG_PATH));
        } catch (e) {
        }
        return;
    } catch (e) {
        console.log((("[persist] saved config unreadable (" + e) + ") \u2014 keeping defaults"));
    }
}

// ---- line 501 ----
function _saveNow() {
    _timer = null;
    if (!(CFG_PATH)) {
        return;
    }
    try {
        _writeTextAtomic(CFG_PATH, JSON.stringify(config, _replacer));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 509 ----
function scheduleSave() {
    if (!(+(_timer))) {
        clearTimeout(_timer);
    }
    _timer = setTimeout(_saveNow, 1200);
    return;
}

// --------------------------------------------------------------------------
// module body (src/utils/persist.js)
// --------------------------------------------------------------------------
// ---- line 515 ----
function anon515() {
    init_node_globals();
    init_config();
    _open2 = new NativeFunction(Module.getExportByName(null, "open"), "int", ["pointer", "int", "int"]);
    _read2 = new NativeFunction(Module.getExportByName(null, "read"), "int", ["int", "pointer", "int"]);
    _write2 = new NativeFunction(Module.getExportByName(null, "write"), "int", ["int", "pointer", "int"]);
    _close2 = new NativeFunction(Module.getExportByName(null, "close"), "int", ["int"]);
    _rename2 = new NativeFunction(Module.getExportByName(null, "rename"), "int", ["pointer", "pointer"]);
    O_WRONLY_CREAT_TRUNC = 577;
    MODE_06002 = 384;
    CFG_PATH = FUNC_<null-atom>();
    _timer = null;
    return;
}
// ---- line 525 ----
function anon525() {
    let pkg;
    pkg = _pkgName2();
    if (pkg) {
        return (("/data/data/" + pkg) + "/.prism-config.json");
    }
    return null;
}
