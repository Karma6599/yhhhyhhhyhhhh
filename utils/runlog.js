// ==========================================================================
// src/utils/runlog.js  —  run logger
// captures runs to .prism-run.log + uploads to prismclient.xyz/api/devlog
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 43 ----
function anon43() {
    return RUNLOG_ENABLED;
}

// ---- line 44 ----
function anon44() {
    return initRunLog;
}

// ---- line 45 ----
function anon45() {
    return prevRunSize;
}

// ---- line 46 ----
function anon46() {
    return uploadPrevRun;
}

// ---- line 48 ----
function _i(n) {
    if ((typeof (n) === "number")) {
        return n;
    }
    return n.toInt32();
}

// ---- line 51 ----
function _u8len(s) {
    let n;
    n = 0;
    let i;
    i = 0;
    while ((i < s.length)) {
        let c;
        c = s.charCodeAt(i);
        n = (n + ((c < 128) ? 1 : ((c < 2048) ? 2 : 3)));
        i++;
    }
    return n;
}

// ---- line 59 ----
function _readFileText(path, cap) {
    try {
        let total;
        let buf;
        let fd;
        fd = _i(_open(Memory.allocUtf8String(path), 0, 0));
        if ((fd < 0)) {
            return null;
        }
        buf = Memory.alloc(cap);
        total = 0;
        while ((total < cap)) {
            let r;
            r = _i(_read(fd, buf.add(total), (cap - total)));
            if (((r <= 0))) break;
            total = (total + r);
        }
        _close(fd);
        return ((total > 0) ? Memory.readUtf8String(buf, total) : null);
    } catch (e) {
        return null;
    }
}

// ---- line 76 ----
function _pkgName() {
    try {
        let r;
        let buf;
        let fd;
        fd = _i(_open(Memory.allocUtf8String("/proc/self/cmdline"), 0, 0));
        if ((fd < 0)) {
            return null;
        }
        buf = Memory.alloc(256);
        r = _i(_read(fd, buf, 256));
        _close(fd);
        return ((r > 0) ? Memory.readUtf8String(buf) : null);
    } catch (e) {
        return null;
    }
}

// ---- line 88 ----
function _rawWrite(text) {
    if ((_fd < 0)) {
        return;
    }
    try {
        let off;
        let len;
        let bytes;
        bytes = Memory.allocUtf8String(text);
        len = _u8len(text);
        off = 0;
        while ((off < len)) {
            let w;
            w = _i(_write(_fd, bytes.add(off), (len - off)));
            if (((w <= 0))) break;
            off = (off + w);
        }
        _bytes = (_bytes + len);
        return;
    } catch (e) {
        return;
    }
}

// ---- line 103 ----
function _line(text) {
    if ((!(CUR_PATH) || (_fd < 0))) {
        return;
    }
    try {
        if ((_bytes >= CAP_BYTES)) {
            try {
                _close(_fd);
            } catch (e) {
            }
            _fd = _i(_open(Memory.allocUtf8String(CUR_PATH), O_TRUNC_CREAT, MODE_0600));
            _bytes = 0;
            _rawWrite((("+0|[wrap] exceeded " + CAP_BYTES) + "B, earlier output dropped\n"));
        }
        _rawWrite((((("+" + (Date.now() - _t0)) + "|") + text) + "\n"));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 119 ----
function initRunLog(version) {
    if (!(!(RUNLOG_ENABLED))) {
    }
    if (!(RUNLOG_ENABLED)) {
        return;
    }
    _inited = true;
    _version = (version || "?");
    try {
        let orig;
        let t;
        try {
            _rename(Memory.allocUtf8String(CUR_PATH), Memory.allocUtf8String(PREV_PATH));
        } catch (e) {
        }
        t = _i(_open(Memory.allocUtf8String(CUR_PATH), O_TRUNC_CREAT, MODE_0600));
        if ((t >= 0)) {
            _close(t);
        }
        _fd = _i(_open(Memory.allocUtf8String(CUR_PATH), O_APPEND_CREAT, MODE_0600));
        _bytes = 0;
        _rawWrite((((((("===== prism run v" + _version) + " id=") + _deviceId) + " pkg=") + _pkg) + " =====\n"));
        orig = console.log;
        console.log = FUNC_<null-atom>;
        console.log((((("[runlog] capturing to " + CUR_PATH) + " (prev run kept at ") + PREV_PATH) + ")"));
        return;
    } catch (e) {
        _fd = -1;
        return;
    }
}
// ---- line 134 ----
function anon134() {
    /* @0 ?? ('unknown', 'special_object', 0) */
    arguments = <under>;
    try {
        if (!(_inWrite)) {
            let s;
            _inWrite = true;
            s = "";
            let i;
            i = 0;
            while ((i < arguments.length)) {
                s = (s + ((i ? " " : "") + String(arguments[i])));
                i++;
            }
            _line(s);
            _inWrite = false;
        }
    } catch (e) {
        _inWrite = false;
    }
    try {
        return orig.apply(console, arguments);
    } catch (e) {
        return;
    }
}

// ---- line 156 ----
function prevRunSize() {
    let t;
    t = (PREV_PATH ? _readFileText(PREV_PATH, (CAP_BYTES + 8192)) : null);
    if (t) {
        return _u8len(t);
    }
    return 0;
}

// ---- line 160 ----
function _jsonStr(s) {
    return JSON.stringify(String(s));
}

// ---- line 163 ----
function _strBytes(s) {
    let out;
    out = [];
    let i;
    i = 0;
    while ((i < s.length)) {
        let c;
        c = s.charCodeAt(i);
        if ((c < 128)) {
            out.push(c);
        } else {
            if ((c < 2048)) {
                out.push((192 | (c >> 6)), (128 | (c & 63)));
            } else {
                out.push((224 | (c >> 12)), (128 | ((c >> 6) & 63)), (128 | (c & 63)));
            }
        }
        i++;
    }
    return out;
}

// ---- line 173 ----
function uploadPrevRun(cb) {
    let body;
    let prev;
    let say;
    say = FUNC_<null-atom>;
    if (!(RUNLOG_ENABLED)) {
        return;
    }
    if (!(PREV_PATH)) {
        return;
    }
    prev = _readFileText(PREV_PATH, (CAP_BYTES + 8192));
    if ((!(prev) || !(prev.length))) {
        return;
    }
    body = ((((_jsonStr + _pkg((_pkg || "?"))) + ",\"log\":") + _jsonStr(prev)) + "}");
    try {
        {}.family = "ipv4";
        {}.host = LOG_HOST;
        {}.port = LOG_PORT;
        Socket.connect({}).then(FUNC_<null-atom>).catch(FUNC_<null-atom>);
        return;
    } catch (e) {
        say(false, ("upload error: " + e));
        return;
    }
}
// ---- line 174 ----
function anon174(ok, msg) {
    try {
        if (cb) {
            cb(ok, msg);
        }
        return;
    } catch (e) {
        return;
    }
}
// ---- line 195 ----
function anon195(conn) {
    let ab;
    let rb;
    let req;
    req = ((((((("POST " + LOG_PATH) + " HTTP/1.1\r\nHost: ") + LOG_HOST) + "\r\nContent-Type: application/json; charset=utf-8\r\nUser-Agent: prism-runlog/1\r\nConnection: close\r\nContent-Length: ") + _u8len(body)) + "\r\n\r\n") + body);
    rb = _strBytes(req);
    ab = new ArrayBuffer(rb.length);
    new Uint8Array(ab).set(rb);
    return;
}
// ---- line 200 ----
function anon200() {
    return;
}
// ---- line 201 ----
function anon201(buf) {
    let head;
    head = "";
    try {
        head = .apply.null(Uint8Array, new Uint8Array(buf)).split("\r\n")[0];
    } catch (e) {
    }
    try {
        conn.close();
    } catch (e) {
    }
    if (/\u0000\u0001\u0000'\u0000\u0000\u0000\b\u0006\u0000\u0000\u0000\u0004\u0007\ufffd\ufffd\ufffd\ufffd\u000b\u0000\u0001 \u0000\u00012\u0000\u0015\u0001\u00000\u00009\u0000\u0015\u0001\u00000\u00009\u0000\u0001 \u0000\f\u0000\n/.test(head)) {
        say(true, (("log uploaded (" + Math.round((prev.length / 1024))) + " KB)"));
        return;
    }
    false("server said: ", (head + (head || "no response")));
    return;
}
// ---- line 213 ----
function anon213() {
    try {
        conn.close();
    } catch (e) {
    }
    return;
}
// ---- line 220 ----
function anon220(e) {
    try {
        conn.close();
    } catch (_e) {
    }
    return;
}
// ---- line 227 ----
function anon227(e) {
    return;
}

// --------------------------------------------------------------------------
// module body (src/utils/runlog.js)
// --------------------------------------------------------------------------
// ---- line 236 ----
function anon236() {
    init_node_globals();
    RUNLOG_ENABLED = true;
    LOG_HOST = "prismclient.xyz";
    LOG_PORT = 80;
    LOG_PATH = "/api/devlog";
    CAP_BYTES = (256 * 1024);
    _open = new NativeFunction(Module.getExportByName(null, "open"), "int", ["pointer", "int", "int"]);
    _read = new NativeFunction(Module.getExportByName(null, "read"), "int", ["int", "pointer", "int"]);
    _write = new NativeFunction(Module.getExportByName(null, "write"), "int", ["int", "pointer", "int"]);
    _close = new NativeFunction(Module.getExportByName(null, "close"), "int", ["int"]);
    _rename = new NativeFunction(Module.getExportByName(null, "rename"), "int", ["pointer", "pointer"]);
    O_APPEND_CREAT = 1089;
    O_TRUNC_CREAT = 577;
    MODE_0600 = 384;
    _pkg = _pkgName();
    CUR_PATH = (_pkg ? (("/data/data/" + _pkg) + "/.prism-run.log") : null);
    PREV_PATH = (_pkg ? (("/data/data/" + _pkg) + "/.prism-run-prev.log") : null);
    _deviceId = FUNC_<null-atom>();
    _t0 = Date.now();
    _fd = -1;
    _bytes = 0;
    _inWrite = false;
    _version = "?";
    _inited = false;
    return;
}
// ---- line 254 ----
function anon254() {
    let v;
    if (!(_pkg)) {
        return "nopkg";
    }
    v = _readFileText((("/data/data/" + _pkg) + "/.prism-id"), 4096);
    if (v) {
    } else {
    }
    return (<under> || "unknown");
}
