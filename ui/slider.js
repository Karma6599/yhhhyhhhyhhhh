// ==========================================================================
// src/gui/slider.js  —  GUI sliders
// GameSliderComponent hijack for config sliders
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 785 ----
function u(s) {
    return Memory.allocUtf8String(s);
}

// ---- line 788 ----
function _slStage(n) {
    return (SLIDER_STAGE >= n);
}

// ---- line 791 ----
function _notify(self) {
    let i;
    i = 0;
    while ((i < _sliders.length)) {
        let s;
        s = _sliders[i];
        if (!((!(s.comp) || !(s.comp.equals(self))))) {
            try {
                let v;
                v = self.add(232).readS32();
                if (!((v !== s.last))) continue;
                s.last = v;
                if (!(s.onChange)) continue;
                try {
                    s.onChange(v);
                    continue;
                } catch (e) {
                }
                return;
            } catch (e) {
                return;
            }
        }
        i++;
    }
    return;
}

// ---- line 811 ----
function _installVtableDriver(comp) {
    let cbReleased;
    let cbMoved;
    let origReleased;
    let origMoved;
    let copy;
    let orig;
    if (_vtCopy) {
        return;
    }
    orig = comp.readPointer();
    copy = Memory.alloc(VT_SIZE);
    Memory.copy(copy, orig, VT_SIZE);
    origMoved = new NativeFunction(orig.add(VT_TOUCH_MOVED).readPointer(), "int", ["pointer", "pointer"]);
    origReleased = new NativeFunction(orig.add(VT_TOUCH_RELEASED).readPointer(), "int", ["pointer", "pointer"]);
    cbMoved = new NativeCallback(FUNC_<null-atom>, "int", ["pointer", "pointer"]);
    cbReleased = new NativeCallback(FUNC_<null-atom>, "int", ["pointer", "pointer"]);
    copy.add(VT_TOUCH_MOVED).writePointer(cbMoved);
    copy.add(VT_TOUCH_RELEASED).writePointer(cbReleased);
    _vtKeepAlive.push(cbMoved, cbReleased, origMoved, origReleased);
    _vtCopy = copy;
    comp.writePointer(copy);
    return;
}
// ---- line 821 ----
function anon821(self, touch) {
    let r;
    r = 0;
    try {
        r = origMoved(self, touch);
    } catch (e) {
    }
    try {
        GameSlider_update(self);
        _notify(self);
    } catch (e) {
    }
    return r;
}
// ---- line 834 ----
function anon834(self, touch) {
    let r;
    r = 0;
    try {
        r = origReleased(self, touch);
    } catch (e) {
    }
    try {
        GameSlider_update(self);
        _notify(self);
    } catch (e) {
    }
    return r;
}

// ---- line 854 ----
function _armGlobalPump() {
    if (_updateHooked) {
        return;
    }
    _updateHooked = true;
    // module entry: onEnter
    return;
}
// ---- line 858 ----
function anon858() {
    if ((PUMP_MODE < 1)) {
        return;
    }
    let i;
    i = 0;
    while ((i < _sliders.length)) {
        let s;
        s = _sliders[i];
        if (!(!(s.shown))) {
            try {
                let v;
                if ((PUMP_MODE >= 2)) {
                    GameSlider_update(s.comp);
                }
                v = s.comp.add(232).readS32();
                if (!((v !== s.last))) continue;
                s.last = v;
                if (!(s.onChange)) continue;
                try {
                    s.onChange(v);
                    continue;
                } catch (e) {
                }
            } catch (e) {
            }
        }
        i++;
    }
    return;
}

// ---- line 881 ----
function _ensureUpdateHook(comp) {
    if ((DRIVE_MODE === "vtable")) {
        try {
            _installVtableDriver(comp);
            return;
        } catch (e) {
            _log(("vtable driver failed: " + e));
            return;
        }
    }
    if ((DRIVE_MODE === "hook")) {
        _armGlobalPump();
    }
    return;
}

// ---- line 892 ----
function _hide(node) {
    if (node) {
        if (!(node.isNull())) {
            DisplayObject_setXY(node, 9999, 9999);
        }
    }
    return;
}

// ---- line 895 ----
function _log(s) {
    try {
        console.log(("[prism-slider] " + s));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 901 ----
function _sp(p2) {
    try {
        return ((p2 == null) ? "nil" : (p2.isNull() ? "0x0\ufffdNULL" : p2.toString()));
    } catch (e) {
        return "?err";
    }
}

// ---- line 908 ----
function strace(ev) {
    try {
        _slSeq = _slSeq;
        console.log(((((("[gui-sl] " + ("" + _slSeq).padStart(3, "0")) + " +") + (Date.now() - _slT0)) + "ms | ") + ev));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 914 ----
function createSlider(stageInstance2, x, y, min, max, value, scale, onChange) {
    let onChange;
    let scale;
    let value;
    let max;
    let min;
    let y;
    let x;
    let stageInstance2;
    stageInstance2 = stageInstance2;
    x = x;
    y = y;
    /* @32 ?? ('unknown', 'UN_0xf5', 32) */
    if (min) {
        min = 0;
    }
    min = min;
    /* @43 ?? ('unknown', 'UN_0xf5', 43) */
    if (max) {
        max = 100;
    }
    max = max;
    /* @58 ?? ('unknown', 'UN_0xf5', 58) */
    if (value) {
        value = 0;
    }
    value = value;
    /* @72 ?? ('unknown', 'UN_0xf5', 72) */
    if (scale) {
        scale = 1;
    }
    scale = scale;
    /* @86 ?? ('unknown', 'UN_0xf5', 86) */
    if (onChange) {
        onChange = null;
    }
    onChange = onChange;
    let entry;
    let comp;
    let knob;
    let container;
    let sliders;
    let root;
    if ((!(stageInstance2) || stageInstance2.isNull())) {
        throw new Error("slider: stage not ready");
    }
    root = StringTable_getMovieClip(u("sc/ui.sc"), u("edit_controls_ui_screen_center"));
    strace(((((("createSlider @ (" + x.toFixed(0)) + ",") + y.toFixed(0)) + ") getMC(edit_controls)=") + _sp(root)));
    if ((!(root) || root.isNull())) {
        throw new Error("slider: edit_controls_ui_screen_center not loaded (sc/ui.sc)");
    }
    gotoAndStop(root, 1);
    sliders = MovieClip_getChildByName(root, u("sliders"));
    if ((!(sliders) || sliders.isNull())) {
        throw new Error("slider: \"sliders\" node missing");
    }
    container = MovieClip_getChildByName(sliders, u("slider_scale"));
    if ((!(container) || container.isNull())) {
        throw new Error("slider: \"slider_scale\" node missing");
    }
    knob = MovieClip_getChildByName(container, u("slider_button"));
    if ((!(knob) || knob.isNull())) {
        throw new Error("slider: \"slider_button\" knob missing");
    }
    strace(((((("  children: sliders=" + _sp(sliders)) + " container=") + _sp(container)) + " knob=") + _sp(knob)));
    comp = null;
    if (_slStage(2)) {
        comp = malloc3(SLIDER_COMP_SIZE);
        .writeByteArray.Uint8Array(new Uint8Array(SLIDER_COMP_SIZE));
        Sprite_ctor(comp, 1);
        /* @594 ?? ('unknown', 'call', 594) */
        strace((("  comp=" + _sp(comp)) + " ctor ok"));
    } else {
        strace("  SLIDER_STAGE 1 \u2014 no component built (clip only)");
    }
    if (_slStage(3)) {
        if (comp) {
            GameSliderComponent_setBounds(comp, (min | 0), (max | 0));
            comp.add(232).writeS32((value | 0));
            comp.add(224).writePointer(ptr(0));
            GameSlider_refreshLogic(comp);
            GameSlider_update(comp);
        }
    }
    _hide(MovieClip_getChildByName(sliders, u("slider_opacity")));
    _hide(MovieClip_getChildByName(sliders, u("TID_EDIT_CONTROLS_OPACITY_INFO")));
    _hide(MovieClip_getChildByName(sliders, u("hint_props_txt")));
    _hide(MovieClip_getChildByName(sliders, u("hint_drag_txt")));
    DisplayObject_removeFromParent(sliders);
    DisplayObject_setXY(sliders, x, y);
    sliders.add(16).writeFloat(scale);
    sliders.add(28).writeFloat(scale);
    setInteractiveRecursive(sliders, 1);
    setInteractiveRecursive(container, 1);
    setInteractiveRecursive(knob, 1);
    Stage_addChild(stageInstance2, sliders);
    {}.comp = comp;
    {}.last = (value | 0);
    {}.onChange = onChange;
    {}.shown = true;
    entry = {};
    if (_slStage(4)) {
        if (comp) {
            _sliders.push(entry);
            _ensureUpdateHook(comp);
        } else {
            strace("  SLIDER_STAGE <4 \u2014 per-frame pump NOT armed");
        }
    }
    strace("  SLIDER_STAGE <4 \u2014 per-frame pump NOT armed");
    if (_slStage(5)) {
        if (comp) {
            try {
                let sane;
                let TOL;
                let b2;
                let b0;
                let bp;
                bp = comp.add(312).readPointer();
                b0 = bp.readFloat();
                b2 = bp.add(8).readFloat();
                TOL = 40;
                sane = ((Math.abs((b0 - _goodBounds[0])) < TOL) && (Math.abs((b2 - _goodBounds[1])) < TOL));
                if (sane) {
                    _goodBounds = [b0, b2];
                } else {
                    bp.writeFloat(_goodBounds[0]);
                    bp.add(8).writeFloat(_goodBounds[1]);
                    GameSlider_update(comp);
                    _log((((((((("HEALED bad bounds [" + b0.toFixed(1)) + ",") + b2.toFixed(1)) + "] -> [") + _goodBounds[0].toFixed(1)) + ",") + _goodBounds[1].toFixed(1)) + "]"));
                    b0 = _goodBounds[0];
                    b2 = _goodBounds[1];
                }
                _log((((((((((((("built @ (" + x.toFixed(0)) + ",") + y.toFixed(0)) + ") val=") + (value | 0)) + " knobLX=") + knob.add(32).readFloat().toFixed(1)) + " bounds=[") + b0.toFixed(1)) + ",") + b2.toFixed(1)) + "]"));
            } catch (e) {
                _log((((((((("built @ (" + x.toFixed(0)) + ",") + y.toFixed(0)) + ") val=") + (value | 0)) + " (geom err: ") + e) + ")"));
            }
        }
    }
    {}.comp = comp;
    {}.node = sliders;
    {}.container = container;
    {}.knob = knob;
    // module entry: getValue
    // module entry: show
    // module entry: hide
    return !(sliders);
}
// ---- line 988 ----
function anon988() {
    try {
        if (comp) {
        } else {
        }
        return <under>;
    } catch (e) {
        return 0;
    }
}
// ---- line 1002 ----
function anon1002(nx, ny) {
    entry.shown = true;
    try {
        if (!(comp)) {
            throw 0;
        }
        comp.add(320).writeU8(0);
        GameSlider_update(comp);
        _log(((((((("show knobLX=" + knob.add(32).readFloat().toFixed(1)) + " bounds=[") + comp.add(312).readPointer().readFloat().toFixed(1)) + ",") + comp.add(312).readPointer().add(8).readFloat().toFixed(1)) + "] val=") + comp.add(232).readS32()));
    } catch (e) {
    }
    return;
}
// ---- line 1013 ----
function anon1013() {
    entry.shown = false;
    try {
        if (comp) {
            comp.add(320).writeU8(0);
        }
    } catch (e) {
    }
    return;
}

// --------------------------------------------------------------------------
// module body (src/gui/slider.js)
// --------------------------------------------------------------------------
// ---- line 1025 ----
function anon1025() {
    init_node_globals();
    base5 = Process.getModuleByName("libg.so").base;
    malloc3 = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
    Stage_addChild = new NativeFunction(base5.add(13414284), "pointer", ["pointer", "pointer"]);
    DisplayObject_removeFromParent = new NativeFunction(base5.add(13294556), "void", ["pointer"]);
    DisplayObject_setXY = new NativeFunction(base5.add(13293704), "void", ["pointer", "float", "float"]);
    setInteractiveRecursive = new NativeFunction(base5.add(13319444), "void", ["pointer", "int"]);
    StringTable_getMovieClip = new NativeFunction(base5.add(13125444), "pointer", ["pointer", "pointer"]);
    MovieClip_getChildByName = new NativeFunction(base5.add(13320836), "pointer", ["pointer", "pointer"]);
    gotoAndStop = new NativeFunction(base5.add(13317696), "void", ["pointer", "int"]);
    Sprite_ctor = new NativeFunction(base5.add(13389364), "pointer", ["pointer", "uint16"]);
    GameSliderComponent_ctor = new NativeFunction(base5.add(6086716), "void", ["pointer", "pointer", "pointer", "pointer", "int"]);
    GameSliderComponent_setBounds = new NativeFunction(base5.add(6088768), "void", ["pointer", "int", "int"]);
    GameSlider_refreshLogic = new NativeFunction(base5.add(6087776), "void", ["pointer"]);
    GameSlider_update = new NativeFunction(base5.add(6088436), "void", ["pointer"]);
    GameMain_update_a = base5.add(5047780);
    SLIDER_COMP_SIZE = 4096;
    SLIDER_STAGE = 5;
    PUMP_MODE = 2;
    _sliders = [];
    _updateHooked = false;
    _goodBounds = [-(108.2), 107];
    DRIVE_MODE = "vtable";
    VT_TOUCH_MOVED = 280;
    VT_TOUCH_RELEASED = 288;
    VT_SIZE = 512;
    _vtCopy = null;
    _vtKeepAlive = [];
    if ((DRIVE_MODE === "early")) {
        try {
            _armGlobalPump();
        } catch (e) {
        }
    }
    _slSeq = 0;
    _slT0 = Date.now();
    return;
}
