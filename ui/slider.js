import "frida-builtins:/node-globals.js";

function u(s) {
  return Memory.allocUtf8String(s);
}

function _slStage(n) {
  return SLIDER_STAGE >= n;
}

function _notify(self) {
  for (let i = 0; i < _sliders.length; i++) {
    let s = _sliders[i];
    if (!s.comp || !s.comp.equals(self)) continue;
    try {
      let v = self.add(232).readS32();
      if (v !== s.last) {
        s.last = v;
        if (s.onChange) {
          try {
            s.onChange(v);
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
    return;
  }
}

function _installVtableDriver(comp) {
  if (_vtCopy) {
    comp.writePointer(_vtCopy);
    return;
  }
  let orig = comp.readPointer();
  let copy = Memory.alloc(VT_SIZE);
  Memory.copy(copy, orig, VT_SIZE);
  let origMoved = new NativeFunction(orig.add(VT_TOUCH_MOVED).readPointer(), "int", ["pointer", "pointer"]);
  let origReleased = new NativeFunction(orig.add(VT_TOUCH_RELEASED).readPointer(), "int", ["pointer", "pointer"]);
  let cbMoved = new NativeCallback((self, touch) => {
    let r = 0;
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
  }, "int", ["pointer", "pointer"]);
  let cbReleased = new NativeCallback((self, touch) => {
    let r = 0;
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
  }, "int", ["pointer", "pointer"]);
  copy.add(VT_TOUCH_MOVED).writePointer(cbMoved);
  copy.add(VT_TOUCH_RELEASED).writePointer(cbReleased);
  _vtKeepAlive.push(cbMoved, cbReleased, origMoved, origReleased);
  _vtCopy = copy;
  comp.writePointer(copy);
  strace("  vtable driver installed (copy=" + _sp(copy) + " orig=" + _sp(orig) + ") — no game code patched");
}

function _armGlobalPump() {
  if (_updateHooked) return;
  _updateHooked = true;
  Interceptor.attach(GameMain_update_a, {
    onEnter() {
      if (PUMP_MODE < 1) return;
      for (let i = 0; i < _sliders.length; i++) {
        let s = _sliders[i];
        if (!s.shown) continue;
        try {
          if (PUMP_MODE >= 2) {
            GameSlider_update(s.comp);
          }
          let v = s.comp.add(232).readS32();
          if (v !== s.last) {
            s.last = v;
            if (s.onChange) {
              try {
                s.onChange(v);
              } catch (e) {
              }
            }
          }
        } catch (e) {
        }
      }
    }
  });
}

function _ensureUpdateHook(comp) {
  if (DRIVE_MODE === "vtable") {
    try {
      _installVtableDriver(comp);
    } catch (e) {
      _log("vtable driver failed: " + e);
    }
    return;
  }
  if (DRIVE_MODE === "hook") {
    _armGlobalPump();
  }
}

function _hide(node) {
  if (node && !node.isNull()) {
    DisplayObject_setXY(node, 9999, 9999);
  }
}

function _log(s) {
  try {
    console.log("[prism-slider] " + s);
  } catch (e) {
  }
}

function _sp(p2) {
  try {
    if (p2 == null) {
      return "nil";
    }
    if (p2.isNull()) {
      return "0x0·NULL";
    }
    return p2.toString();
  } catch (e) {
    return "?err";
  }
}

function strace(ev) {
  try {
    console.log("[gui-sl] " + ("" + ++_slSeq).padStart(3, "0") + " +" + (Date.now() - _slT0) + "ms | " + ev);
  } catch (e) {
  }
}

function createSlider(stageInstance, x, y, min = 0, max = 100, value = 0, scale = 1, onChange = null) {
  if (!stageInstance || stageInstance.isNull()) {
    throw new Error("slider: stage not ready");
  }
  let root = StringTable_getMovieClip(u("sc/ui.sc"), u("edit_controls_ui_screen_center"));
  strace("createSlider @ (" + x.toFixed(0) + "," + y.toFixed(0) + ") getMC(edit_controls)=" + _sp(root));
  if (!root || root.isNull()) {
    throw new Error("slider: edit_controls_ui_screen_center not loaded (sc/ui.sc)");
  }
  gotoAndStop(root, 1);
  let sliders = MovieClip_getChildByName(root, u("sliders"));
  if (!sliders || sliders.isNull()) {
    throw new Error('slider: "sliders" node missing');
  }
  let container = MovieClip_getChildByName(sliders, u("slider_scale"));
  if (!container || container.isNull()) {
    throw new Error('slider: "slider_scale" node missing');
  }
  let knob = MovieClip_getChildByName(container, u("slider_button"));
  if (!knob || knob.isNull()) {
    throw new Error('slider: "slider_button" knob missing');
  }
  strace("  children: sliders=" + _sp(sliders) + " container=" + _sp(container) + " knob=" + _sp(knob));
  let comp = null;
  if (_slStage(2)) {
    comp = malloc(SLIDER_COMP_SIZE);
    comp.writeByteArray(new Uint8Array(SLIDER_COMP_SIZE));
    Sprite_ctor(comp, 1);
    GameSliderComponent_ctor(comp, container, knob, ptr(0), 0);
    strace("  comp=" + _sp(comp) + " ctor ok");
  } else {
    strace("  SLIDER_STAGE 1 — no component built (clip only)");
  }
  if (_slStage(3) && comp) {
    GameSliderComponent_setBounds(comp, min | 0, max | 0);
    comp.add(232).writeS32(value | 0);
    comp.add(224).writePointer(ptr(0));
    GameSlider_refreshLogic(comp);
    GameSlider_update(comp);
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
  Stage_addChild(stageInstance, sliders);
  let entry = { comp, last: value | 0, onChange, shown: true };
  if (_slStage(4) && comp) {
    _sliders.push(entry);
    _ensureUpdateHook(comp);
  } else {
    strace("  SLIDER_STAGE <4 — per-frame pump NOT armed");
  }
  if (_slStage(5) && comp) {
    try {
      let bp = comp.add(312).readPointer();
      let b0 = bp.readFloat();
      let b2 = bp.add(8).readFloat();
      let TOL = 40;
      let sane = Math.abs(b0 - _goodBounds[0]) < TOL && Math.abs(b2 - _goodBounds[1]) < TOL;
      if (sane) {
        _goodBounds = [b0, b2];
      } else {
        bp.writeFloat(_goodBounds[0]);
        bp.add(8).writeFloat(_goodBounds[1]);
        GameSlider_update(comp);
        _log("HEALED bad bounds [" + b0.toFixed(1) + "," + b2.toFixed(1) + "] -> [" + _goodBounds[0].toFixed(1) + "," + _goodBounds[1].toFixed(1) + "]");
        b0 = _goodBounds[0];
        b2 = _goodBounds[1];
      }
      _log("built @ (" + x.toFixed(0) + "," + y.toFixed(0) + ") val=" + (value | 0) + " knobLX=" + knob.add(32).readFloat().toFixed(1) + " bounds=[" + b0.toFixed(1) + "," + b2.toFixed(1) + "]");
    } catch (e) {
      _log("built @ (" + x.toFixed(0) + "," + y.toFixed(0) + ") val=" + (value | 0) + " (geom err: " + e + ")");
    }
  }
  return {
    comp,
    node: sliders,
    container,
    knob,
    getValue() {
      try {
        return comp ? comp.add(232).readS32() : value | 0;
      } catch (e) {
        return 0;
      }
    },
    show(nx, ny) {
      entry.shown = true;
      try {
        if (!comp) throw 0;
        comp.add(320).writeU8(0);
        GameSlider_update(comp);
        _log("show knobLX=" + knob.add(32).readFloat().toFixed(1) + " bounds=[" + comp.add(312).readPointer().readFloat().toFixed(1) + "," + comp.add(312).readPointer().add(8).readFloat().toFixed(1) + "] val=" + comp.add(232).readS32());
      } catch (e) {
      }
      DisplayObject_setXY(sliders, nx, ny);
    },
    hide() {
      entry.shown = false;
      try {
        if (comp) {
          comp.add(320).writeU8(0);
        }
      } catch (e) {
      }
      DisplayObject_setXY(sliders, 9999, 9999);
    }
  };
}

var base = Process.getModuleByName("libg.so").base;
var malloc = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
var Stage_addChild = new NativeFunction(base.add(13414284), "pointer", ["pointer", "pointer"]);
var DisplayObject_removeFromParent = new NativeFunction(base.add(13294556), "void", ["pointer"]);
var DisplayObject_setXY = new NativeFunction(base.add(13293704), "void", ["pointer", "float", "float"]);
var setInteractiveRecursive = new NativeFunction(base.add(13319444), "void", ["pointer", "int"]);
var StringTable_getMovieClip = new NativeFunction(base.add(13125444), "pointer", ["pointer", "pointer"]);
var MovieClip_getChildByName = new NativeFunction(base.add(13320836), "pointer", ["pointer", "pointer"]);
var gotoAndStop = new NativeFunction(base.add(13317696), "void", ["pointer", "int"]);
var Sprite_ctor = new NativeFunction(base.add(13389364), "pointer", ["pointer", "uint16"]);
var GameSliderComponent_ctor = new NativeFunction(base.add(6086716), "void", ["pointer", "pointer", "pointer", "pointer", "int"]);
var GameSliderComponent_setBounds = new NativeFunction(base.add(6088768), "void", ["pointer", "int", "int"]);
var GameSlider_refreshLogic = new NativeFunction(base.add(6087776), "void", ["pointer"]);
var GameSlider_update = new NativeFunction(base.add(6088436), "void", ["pointer"]);
var GameMain_update_a = base.add(5047780);
var SLIDER_COMP_SIZE = 4096;
var SLIDER_STAGE = 5;
var PUMP_MODE = 2;
var _sliders = [];
var _updateHooked = false;
var _goodBounds = [-108.2, 107];
var DRIVE_MODE = "vtable";
var VT_TOUCH_MOVED = 280;
var VT_TOUCH_RELEASED = 288;
var VT_SIZE = 512;
var _vtCopy = null;
var _vtKeepAlive = [];
if (DRIVE_MODE === "early") {
  try {
    _armGlobalPump();
  } catch (e) {
  }
}
var _slSeq = 0;
var _slT0 = Date.now();
