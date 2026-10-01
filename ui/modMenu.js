import "frida-builtins:/node-globals.js";
import "../config.js";
import "./floatertext.js";
import "../utils/persist.js";
import "../utils/gradients.js";
import "../mech/udpHook.js";
import "./connectionindicator.js";
import "./slider.js";
import "../utils/runlog.js";

function mcChildren(mc) {
  let out = [];
  try {
    let n = mc.add(MC_CHILD_COUNT).readS16();
    if (n <= 0 || n > 64) {
      return out;
    }
    let objs = mc.add(MC_CHILD_OBJS).readPointer();
    let names = mc.add(MC_CHILD_NAMES).readPointer();
    for (let i = 0; i < n; i++) {
      let o = null;
      let nm = "";
      try {
        if (!objs.isNull()) {
          o = objs.add(i * 8).readPointer();
        }
      } catch (e) {
      }
      try {
        if (!names.isNull()) {
          let np = names.add(i * 8).readPointer();
          if (!np.isNull()) {
            nm = np.readUtf8String() || "";
          }
        }
      } catch (e) {
      }
      out.push({ name: nm, obj: o });
    }
  } catch (e) {
  }
  return out;
}

function hideToggleInnerText(tog) {
  if (!tog || !tog.mc || tog.mc.isNull()) return;
  try {
    let kids = mcChildren(tog.mc);
    let hid = [];
    for (let k of kids) {
      if (!k.obj || k.obj.isNull()) continue;
      if (!TOGGLE_INNER_TEXT_RE.test(k.name)) continue;
      k.obj.add(OFF_VISIBLE).writeU8(0);
      hid.push(k.name);
    }
    if (!_togChildrenLogged[tog.name]) {
      _togChildrenLogged[tog.name] = 1;
      _gdbg("toggle '" + tog.name + "' clip children=[" + kids.map((k) => k.name || "?").join(",") + "] hid=[" + hid.join(",") + "]");
    }
  } catch (e) {
  }
}

function _fieldLine(o) {
  return "w=" + objWidth(o).toFixed(1) + " h=" + objHeight(o).toFixed(1) + " vis=" + o.add(OFF_VISIBLE).readU8() + " x=" + o.add(32).readFloat().toFixed(1) + " y=" + o.add(36).readFloat().toFixed(1) + " sX=" + o.add(16).readFloat().toFixed(2) + " sY=" + o.add(28).readFloat().toFixed(2);
}

function dumpToggleSubtree(tog) {
  if (!tog || !tog.mc || tog.mc.isNull() || _togDumpCount >= 6) return;
  _togDumpCount++;
  _gdbg("toggle '" + tog.name + "' post-press:");
  if (tog.ins && !tog.ins.isNull()) {
    _gdbg("   INS " + _fieldLine(tog.ins) + "  <- the actual touch hitbox");
  }
  _gdbg("   MC  " + _fieldLine(tog.mc));
  (function walk(mc, pad, depth) {
    if (depth < 0) return;
    let kids = mcChildren(mc);
    for (let i = 0; i < kids.length; i++) {
      let o = kids[i].obj;
      if (!o || o.isNull()) continue;
      _gdbg(pad + "[" + i + "] '" + kids[i].name + "' " + _fieldLine(o));
      walk(o, pad + "   ", depth - 1);
    }
  })(tog.mc, "   ", 2);
}

function setToggleVisual(tog, on) {
  try {
    if (tog && tog.mc && !tog.mc.isNull()) {
      MovieClip_gotoAndStop(tog.mc, on ? TOGGLE_FRAME_ON : TOGGLE_FRAME_OFF);
    }
  } catch (e) {
  }
  hideToggleInnerText(tog);
}

function allocGuiObject() {
  let p2 = Memory.alloc(GUI_OBJ_SIZE);
  p2.writeByteArray(new Uint8Array(GUI_OBJ_SIZE));
  return p2;
}

function gtrace(ev) {
  if (!GUI_TRACE) return;
  try {
    console.log("[gui] " + ("" + ++_gtSeq).padStart(3, "0") + " +" + (Date.now() - _gtT0) + "ms " + _gtPhase + " | " + ev);
  } catch (e) {
  }
}

function gphase(p2) {
  _gtPhase = p2;
  gtrace("──────── phase: " + p2 + " ────────");
}

function gptr(p2) {
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

function pmile(msg) {
  try {
    console.log("[prism-ms] +" + (Date.now() - _gtT0) + "ms " + msg);
  } catch (e) {
  }
}

function stageCanvas() {
  var w = 1024;
  var h = 576;
  try {
    var _w = stageInstance.add(STAGE_LOGICAL_W_OFF).readFloat();
    if (_w > 1 && _w < 20000) {
      w = _w;
    }
  } catch (e) {
  }
  try {
    var _h = stageInstance.add(STAGE_LOGICAL_H_OFF).readFloat();
    if (_h > 1 && _h < 20000) {
      h = _h;
    }
  } catch (e) {
  }
  return { w, h };
}

function cfgCatOffset() {
  return CFG_CATEGORY_OFFSET[openedCatName] || {};
}

function getStrPtr2(str) {
  return Memory.allocUtf8String(str);
}

function strPtr(str) {
  return Memory.allocUtf8String(str);
}

function scPtr(str) {
  let pointer = Memory.alloc(32);
  StringCtor(pointer, strPtr(str));
  return pointer;
}

function getScPtr2(str) {
  let pointer = malloc4(40);
  StringCtor(pointer, getStrPtr2(str));
  return pointer;
}

function setXY(ptr1, x, y) {
  ptr1.add(xPtr).writeFloat(x);
  ptr1.add(yPtr).writeFloat(y);
}

function setHeightWidth(ptr1, height, width) {
  ptr1.add(heightPtr).writeFloat(height);
  ptr1.add(widthPtr).writeFloat(width);
}

function setScaleXY(ptr1, sx, sy) {
  ptr1.add(16).writeFloat(sx);
  ptr1.add(28).writeFloat(sy);
}

function _vFloat(obj, slot) {
  try {
    return new NativeFunction(obj.readPointer().add(slot).readPointer(), "float", ["pointer"])(obj);
  } catch (e) {
    return 0;
  }
}

function objWidth(obj) {
  return _vFloat(obj, 88);
}

function objHeight(obj) {
  return _vFloat(obj, 96);
}

function setNodeVisible(ptr1, on, x, y) {
  if (!ptr1) return;
  if (on) {
    if (x != null && y !== undefined) {
      setXY(ptr1, x, y);
    }
    ptr1.add(OFF_VISIBLE).writeU8(1);
  } else {
    ptr1.add(OFF_VISIBLE).writeU8(0);
    setXY(ptr1, HIDE_XY, HIDE_XY);
  }
}

function hideObject(ptr1) {
  setNodeVisible(ptr1, false);
}

function showObject(ptr1, x = 0, y = 0) {
  setNodeVisible(ptr1, true, x, y);
}

function setObjAlpha(ptr1, a) {
  if (!ptr1) return;
  ptr1.add(OFF_ALPHA).writeU8(Math.max(0, Math.min(255, Math.round(a * 255))));
}

function createMenuText(x, y, scaleX = 1, scaleY = 1) {
  let sprite = allocGuiObject();
  Sprite_Sprite(sprite, 1);
  let mc = ResourceManager_getMovieClip(strPtr("sc/debug.sc"), strPtr("debug_menu_text"));
  gtrace("menuText: sprite=" + gptr(sprite) + " getMC(debug_menu_text)=" + gptr(mc));
  new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(sprite, mc);
  sprite.add(32).writeFloat(x);
  sprite.add(36).writeFloat(y);
  sprite.add(16).writeFloat(scaleX);
  sprite.add(28).writeFloat(scaleY);
  Stage_addChild2(stageInstance, sprite);
  let obj = { sprite, movieClip: mc, visible: false, text: "", x, y };
  setNodeVisible(sprite, false);
  return obj;
}

function showGradientMenuText(obj, text) {
  if (!obj) return;
  obj.text = text;
  obj.visible = true;
  setNodeVisible(obj.sprite, true, obj.x, obj.y);
  try {
    let tf = MovieClip_getTextFieldByName(obj.movieClip, strPtr("Text"));
    if (tf && !tf.isNull()) {
      applyGradient(tf, PRISM_GRADIENT, 1, 0.3);
    }
  } catch (e) {
  }
  movieClipsettext(obj.sprite, "Text".ptr(), text.scptr());
}

function hideMenuText(obj) {
  if (!obj || !obj.visible) return;
  obj.visible = false;
  setNodeVisible(obj.sprite, false);
  try {
    movieClipsettext(obj.sprite, "Text".ptr(), "".scptr());
  } catch (e) {
  }
}

export function setPingHUD(ping) {
  if (!pingHUD || !pingHUD.visible || ping <= 0) return;
  let text = "Ping: ".concat(ping, "ms");
  if (pingHUD.text === text) return;
  showGradientMenuText(pingHUD, text);
}

export function setIPHUD(ip) {
  if (!ipHUD || !ipHUD.visible) return;
  showGradientMenuText(ipHUD, ip);
}

function createDebugText(initialText = "Hello World", x = 5, y = 5, scaleX = 1.4, scaleY = 1.4) {
  GameMain_loadAsset("sc/ui.sc".scptr(), 0);
  let sprite = allocGuiObject();
  Sprite_Sprite(sprite, 1);
  let movieClip = ResourceManager_getMovieClip(strPtr("sc/ui.sc"), strPtr("damage_number"));
  new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(sprite, movieClip);
  sprite.add(32).writeFloat(x);
  sprite.add(36).writeFloat(y);
  sprite.add(16).writeFloat(scaleX);
  sprite.add(28).writeFloat(scaleY);
  Stage_addChild2(stageInstance, sprite);
  movieClipsettext(sprite, "txt".ptr(), initialText.scptr());
  let textObj = { sprite, movieClip, visible: true, text: initialText };
  textObjects.push(textObj);
  return textObj;
}

function setPosition(textObj, x, y) {
  if (!textObj) return;
  textObj.sprite.add(32).writeFloat(x);
  textObj.sprite.add(36).writeFloat(y);
}

function hideText(textObj) {
  if (!textObj || !textObj.visible) return;
  movieClipsettext(textObj.sprite, "txt".ptr(), "".scptr());
  textObj.visible = false;
}

function showText(textObj, newText = null) {
  if (!textObj) return;
  let textToShow = newText === null ? textObj.text : newText;
  movieClipsettext(textObj.sprite, "txt".ptr(), textToShow.scptr());
}

function updateFeaturePositions() {
  let currentY = FEATURE_START_Y;
  for (let key of Object.keys(featureStates)) {
    if (!featureStates[key] || !debugTextElements[key]) continue;
    setPosition(debugTextElements[key], featureLabels[key].x, currentY);
    currentY += FEATURE_SPACING;
  }
}

function toggleFeature(featureName, enabled) {
  featureStates[featureName] = enabled;
  switch (featureName) {
    case "autododge":
      config.dodge.enabled = enabled;
      break;
    case "aimbot":
      config.aimbot.enabled = enabled;
      break;
    case "autoshoot":
      config.autoShoot.enabled = enabled;
      break;
    case "autoulti":
      config.autoUlti.enabled = enabled;
      break;
    case "holdtoshoot":
      config.holdToShoot.enabled = enabled;
      break;
    case "autocharge":
      config.autoCharge.enabled = enabled;
      break;
    case "autospin":
      config.autospin.enabled = enabled;
      break;
    case "connectionindicator":
      config.connectionIndicator.enabled = enabled;
      setConnectionIndicatorLive(enabled);
      break;
    case "showammo":
      config.showEnemyAmmo.enabled = enabled;
      break;
    case "antiafk":
      config.antiAFK.enabled = enabled;
      break;
    case "pingdisplay":
      config.pingDisplay.enabled = enabled;
      break;
    case "ipdisplay":
      config.ipDisplay.enabled = enabled;
      break;
  }
  scheduleSave();
  if (featureName === "pingdisplay") {
    if (enabled && inBattle) {
      showGradientMenuText(pingHUD, pingHUD.text || "Ping: --ms");
    } else {
      hideMenuText(pingHUD);
    }
  }
  if (featureName === "ipdisplay") {
    if (enabled && inBattle) {
      showGradientMenuText(ipHUD, IP);
    } else {
      hideMenuText(ipHUD);
    }
  }
  if (featureName === "featuredisplay") {
    if (enabled) {
      showText(debugTextElements.titleText);
      for (let key of Object.keys(featureLabels)) {
        if (!featureStates[key] || !debugTextElements[key]) continue;
        showText(debugTextElements[key]);
      }
      updateFeaturePositions();
    } else {
      hideText(debugTextElements.titleText);
      for (let key of Object.keys(featureLabels)) {
        if (!debugTextElements[key]) continue;
        hideText(debugTextElements[key]);
      }
    }
    showFloater("Feature Display ".concat(enabled ? "ON" : "OFF"));
    return;
  }
  var label = featureLabels[featureName]?.label || featureName;
  if (enabled) {
    if (featureStates.featuredisplay) {
      showText(debugTextElements[featureName]);
    }
    showFloater("".concat(label, " ON"));
  } else {
    hideText(debugTextElements[featureName]);
    showFloater("".concat(label, " OFF"));
  }
  updateFeaturePositions();
}

function applyHudGradient(textObj, speed) {
  try {
    let tf = MovieClip_getTextFieldByName(textObj.movieClip, strPtr("txt"));
    if (tf && !tf.isNull()) {
      applyGradient(tf, PRISM_GRADIENT, 1, speed);
    }
  } catch (e) {
  }
}

function initDebugTextElements() {
  Interceptor.attach(base.add(13107016), {
    onEnter(args) {
      args[4] = ptr(1);
    }
  });
  debugTextElements.titleText = createDebugText("PRISM CLIENT", TITLE_X, TITLE_Y, TITLE_SCALE, TITLE_SCALE);
  applyHudGradient(debugTextElements.titleText, 0.4);
  for (let key of Object.keys(featureStates)) {
    if (!featureLabels[key]) continue;
    let { label, x } = featureLabels[key];
    debugTextElements[key] = createDebugText(label, x, FEATURE_START_Y, FEATURE_SCALE, FEATURE_SCALE);
    applyHudGradient(debugTextElements[key], 1.25);
    if (!featureStates[key]) {
      hideText(debugTextElements[key]);
    }
  }
  updateFeaturePositions();
  pingHUD = createMenuText(PING_X, PING_Y, 0.3, 0.3);
  ipHUD = createMenuText(IP_X, IP_Y, 1.25, 1.25);
  var _featCount = Object.keys(featureLabels).filter((k) => debugTextElements[k]).length;
  pmile("feature column built: title + " + _featCount + "/" + Object.keys(featureLabels).length + " feature texts, pingHUD=" + (pingHUD ? "ok" : "nil") + " ipHUD=" + (ipHUD ? "ok" : "nil"));
}

function runCfgAction(c) {
  if (c.spec.action !== "uploadLog") return;
  setToggleVisual(c.tog, false);
  showFloater("Uploading last run's log…");
  uploadPrevRun((ok, msg) => {
    try {
      showFloater((ok ? "✔ " : "✖ ") + msg);
    } catch (e) {
    }
    try {
      console.log("[runlog] upload " + (ok ? "OK" : "FAILED") + ": " + msg);
    } catch (e) {
    }
  });
}

function cfgGet(p2) {
  return p2.split(".").reduce((o, k) => o == null ? o : o[k], config);
}

function cfgSet(p2, v) {
  let a = p2.split(".");
  let o = config;
  for (let i = 0; i < a.length - 1; i++) {
    o = o[a[i]];
  }
  o[a[a.length - 1]] = v;
  scheduleSave();
}

function fmtNum(v, dec) {
  if (dec > 0) {
    return Number(v).toFixed(dec);
  }
  return String(Math.round(v));
}

function cfgIsOn(c) {
  if (c.spec.action) {
    return false;
  }
  if (c.spec.feature) {
    return !!featureStates[c.spec.feature];
  }
  var cur = cfgGet(c.spec.path);
  return c.onV === cur || c.onV === true && cur === true;
}

function _showText(o, x, y) {
  if (!o || !o.sprite) return;
  try {
    Stage_addChild2(stageInstance, o.sprite);
  } catch (e) {
  }
  o.x = x;
  o.y = y;
  setNodeVisible(o.sprite, true, x, y);
  o.visible = true;
}

function _hideText(o) {
  if (!o || !o.sprite) return;
  setNodeVisible(o.sprite, false);
  o.visible = false;
}

function createGradientLabel(x, y, scale) {
  let sprite = allocGuiObject();
  Sprite_Sprite(sprite, 1);
  let mc = ResourceManager_getMovieClip(strPtr("sc/ui.sc"), strPtr("damage_number"));
  gtrace("gradLabel: sprite=" + gptr(sprite) + " getMC(damage_number)=" + gptr(mc));
  new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(sprite, mc);
  sprite.add(32).writeFloat(x);
  sprite.add(36).writeFloat(y);
  sprite.add(16).writeFloat(scale);
  sprite.add(28).writeFloat(scale);
  Stage_addChild2(stageInstance, sprite);
  let obj = { sprite, movieClip: mc, visible: false, text: "" };
  try {
    movieClipsettext(sprite, "txt".ptr(), getScPtr2(" "));
    obj._grad = createGradient(PRISM_GRADIENT, 1, 0.3);
    if (!obj._grad) {
      gtrace("gradLabel: gradient unavailable → plain text only");
    } else {
      let tf = MovieClip_getTextFieldByName(mc, strPtr("txt"));
      if (tf && !tf.isNull()) {
        obj._df = applyGradientOnly(tf, obj._grad);
      }
      gtrace("gradLabel: GRADIENT ok tf=" + gptr(tf) + " df=" + gptr(obj._df));
    }
  } catch (e) {
    gtrace("gradLabel: DECORATE THREW " + e + " (mc=" + gptr(mc) + ") → plain fallback");
  }
  setNodeVisible(sprite, false);
  obj.visible = false;
  return obj;
}

function paintValueLabel(obj, text) {
  if (!obj || !obj.sprite) return;
  try {
    setNodeVisible(obj.sprite, true, obj.x, obj.y);
    obj.visible = true;
    movieClipsettext(obj.sprite, "txt".ptr(), getScPtr2("<c40e0d0>" + text + "</c>"));
    obj.text = text;
  } catch (e) {
    if (!obj._logged) {
      obj._logged = 1;
      _gdbg("label '" + text + "' ERR: " + e);
    }
  }
}

function prebuildCfgLabels() {
  var jobs = [];
  var names = [];
  for (var cn in CFG) {
    var specs = CFG[cn].sliders || [];
    for (var i = 0; i < specs.length; i++) {
      jobs.push(specs[i]);
      names.push(cn + "/" + specs[i].label);
    }
    var texts = CFG[cn].texts || [];
    for (var j = 0; j < texts.length; j++) {
      jobs.push(texts[j]);
      names.push(cn + "/txt:" + texts[j].text);
    }
  }
  gphase("prebuild-labels (" + jobs.length + " + cat-title)");
  (function next(i2) {
    if (i2 >= jobs.length) {
      gtrace("prebuild: cat-title");
      try {
        if (!catTitleLabel) {
          catTitleLabel = createGradientLabel(0, 0, CFG_CAT_TITLE_SCALE);
        }
      } catch (e) {
        gtrace("prebuild cat-title FAIL: " + e);
      }
      gtrace("prebuild: DONE (" + jobs.length + " labels)");
      return;
    }
    gtrace("prebuild [" + (i2 + 1) + "/" + jobs.length + "] " + names[i2]);
    try {
      if (!jobs[i2]._label) {
        jobs[i2]._label = createGradientLabel(0, 0, jobs[i2].scale || SLIDER_TITLE_SCALE);
      }
    } catch (e) {
      gtrace("prebuild label FAIL: " + e);
    }
    setTimeout(() => next(i2 + 1), 0);
  })(0);
}

function makeCfgSlider(spec) {
  var dec = spec.dec || 0;
  var mult = Math.pow(10, dec);
  var sMin = Math.round(spec.min * mult);
  var sMax = Math.round(spec.max * mult);
  var cur = cfgGet(spec.path);
  var init;
  if (spec.infAtMax && cur === Infinity) {
    init = sMax;
  } else {
    init = Math.round((typeof cur === "number" ? cur : spec.min) * mult);
  }
  if (init < sMin) {
    init = sMin;
  }
  if (init > sMax) {
    init = sMax;
  }
  var title = spec._label || createGradientLabel(0, 0, SLIDER_TITLE_SCALE);
  var _tLast = 0;
  var _tStr = null;
  var _tPend = null;
  function paint(str) {
    _tStr = str;
    _tLast = Date.now();
    paintValueLabel(title, str);
  }
  function apply(sliderInt) {
    var str;
    if (spec.infAtMax && sliderInt >= sMax) {
      cfgSet(spec.path, Infinity);
      str = spec.label + ": Inf";
    } else {
      var real = sliderInt / mult;
      cfgSet(spec.path, real);
      str = spec.label + ": " + fmtNum(real, dec);
    }
    if (str === _tStr) return;
    if (Date.now() - _tLast >= SLIDER_TEXT_MS) {
      if (_tPend) {
        clearTimeout(_tPend);
        _tPend = null;
      }
      paint(str);
      return;
    }
    if (_tPend) {
      clearTimeout(_tPend);
    }
    _tPend = setTimeout(() => {
      _tPend = null;
      paint(spec.label + ": " + (cfgGet(spec.path) === Infinity ? "Inf" : fmtNum(cfgGet(spec.path), dec)));
    }, SLIDER_TEXT_MS);
  }
  apply(init);
  _hideText(title);
  return { kind: "slider", spec, title, slider: null, apply, sMin, sMax, init };
}

function makeCfgToggle(spec) {
  var onV = "on" in spec ? spec.on : true;
  var offV = "off" in spec ? spec.off : false;
  var ctrl = {
    kind: "toggle",
    spec,
    tog: null,
    label: null,
    onV,
    offV
  };
  var on = cfgIsOn(ctrl);
  if (spec.path) {
    cfgSet(spec.path, on ? onV : offV);
  }
  var tog = debugMenuBase.addToggle(spec.label, "__cfg", on);
  Stage_addChild2(stageInstance, tog.ins);
  var label = createMenuText(0, 0, 1, 1);
  showGradientMenuText(label, spec.label);
  _hideText(label);
  ctrl.tog = tog;
  ctrl.label = label;
  gtrace("makeToggle '" + spec.label + "' state=" + on + " labelSprite=" + (label ? gptr(label.sprite) : label));
  return ctrl;
}

function buildCfgCategory(catName) {
  if (cfgBuilt[catName]) {
    return cfgBuilt[catName];
  }
  gphase("build:" + catName);
  var def = CFG[catName];
  var built = { sliders: [], toggles: [], texts: [] };
  if (def) {
    if (_stageAtLeast(5)) {
      (def.sliders || []).slice(0, CFG_SLIDER_LIMIT).forEach((spec) => {
        gtrace("+slider '" + spec.label + "'");
        try {
          built.sliders.push(makeCfgSlider(spec));
        } catch (e) {
          gtrace("SLIDER '" + spec.label + "' FAIL: " + e);
        }
      });
    }
    (def.toggles || []).forEach((spec) => {
      gtrace("+toggle '" + spec.label + "'");
      try {
        var t = makeCfgToggle(spec);
        built.toggles.push(t);
        cfgToggles.push(t);
      } catch (e) {
        gtrace("TOGGLE '" + spec.label + "' FAIL: " + e);
      }
    });
    if (_stageAtLeast(7)) {
      (def.texts || []).forEach((spec) => {
        gtrace("+text '" + spec.text + "'");
        try {
          var obj = spec._label || createGradientLabel(0, 0, spec.scale || SLIDER_TITLE_SCALE);
          paintValueLabel(obj, spec.text);
          _hideText(obj);
          built.texts.push({ spec, label: obj });
        } catch (e) {
          gtrace("TEXT '" + spec.text + "' FAIL: " + e);
        }
      });
    }
  }
  gtrace("built '" + catName + "': sliders " + built.sliders.length + "/" + (def && def.sliders ? def.sliders.length : 0) + ", toggles " + built.toggles.length + "/" + (def && def.toggles ? def.toggles.length : 0) + ", texts " + built.texts.length);
  cfgBuilt[catName] = built;
  return built;
}

function buildAllCfg() {
  for (var cn in CFG) {
    buildCfgCategory(cn);
  }
}

function hideAllCfg() {
  for (var cn in cfgBuilt) {
    cfgBuilt[cn].sliders.forEach((c) => {
      try {
        if (c.slider) {
          c.slider.hide();
        }
      } catch (e) {
      }
      _hideText(c.title);
    });
    cfgBuilt[cn].toggles.forEach((c) => {
      hideObject(c.tog.ins);
      _hideText(c.label);
    });
    (cfgBuilt[cn].texts || []).forEach((t) => {
      _hideText(t.label);
    });
  }
}

function layoutCfgControls() {
  if (!menuBox) return;
  hideAllCfg();
  var built = cfgBuilt[openedCatName];
  if (!built) return;
  gtrace("layout '" + openedCatName + "': show " + built.sliders.length + " sliders, " + built.toggles.length + " toggles, " + built.texts.length + " texts");
  var co = cfgCatOffset();
  built.sliders.forEach((c, i) => {
    var sx = menuBox.left + c.spec.x + CFG_SLIDERS_DX + (co.dx || 0);
    var sy = menuBox.top + c.spec.y + CFG_SLIDERS_DY + (co.dy || 0);
    try {
      if (!c.slider) {
        c.slider = createSlider(stageInstance, sx, sy, c.sMin, c.sMax, c.init, SLIDER_SCALE, c.apply);
      } else {
        c.slider.show(sx, sy);
      }
      if (i === 0) {
        var n = c.slider.node;
        var ct = c.slider.container;
        _gdbg("show '" + c.spec.label + "' NODE vis=" + n.add(OFF_VISIBLE).readU8() + " nkids=" + n.add(OFF_CHILD_COUNT).readU16() + " a=" + n.add(OFF_ALPHA).readU8() + " x=" + n.add(32).readFloat().toFixed(0) + " y=" + n.add(36).readFloat().toFixed(0) + " sX=" + n.add(16).readFloat().toFixed(2) + " | CONTAINER=" + ct + " vis=" + ct.add(OFF_VISIBLE).readU8() + " nkids=" + ct.add(OFF_CHILD_COUNT).readU16() + " a=" + ct.add(OFF_ALPHA).readU8() + " x=" + ct.add(32).readFloat().toFixed(0) + " y=" + ct.add(36).readFloat().toFixed(0) + " sX=" + ct.add(16).readFloat().toFixed(2));
      }
    } catch (e) {
      _gdbg("show '" + c.spec.label + "' FAIL: " + e);
    }
    _showText(c.title, sx + SLIDER_TITLE_DX, sy + SLIDER_TITLE_DY);
  });
  built.toggles.forEach((c) => {
    var tx = menuBox.left + c.spec.x + CFG_TOGGLES_DX + (co.tdx || 0);
    var ty = menuBox.top + c.spec.y + CFG_TOGGLES_DY + (co.tdy || 0);
    showObject(c.tog.ins, tx, ty);
    setToggleVisual(c.tog, cfgIsOn(c));
    try {
      var _nk = c.tog.ins.add(OFF_CHILD_COUNT).readU16();
      if (_nk > 4) {
        _gdbg("!! toggle '" + c.spec.label + "' childCount=" + _nk + " — HITBOX WILL BE WRONG");
      }
    } catch (e) {
    }
    _showText(c.label, tx + CFG_TOGGLE_LABEL_DX, ty + CFG_TOGGLE_LABEL_DY);
  });
  (built.texts || []).forEach((t) => {
    _showText(t.label, menuBox.left + t.spec.x + (co.dx || 0), menuBox.top + t.spec.y + (co.dy || 0));
  });
}

function relayoutMenu() {
  if (!debugMenu || !menuBox) return;
  var tabX = menuBox.left + SWAP_PAD_X;
  var ty = menuBox.top + SWAP_TOP_PAD;
  for (var cat of debugCategorys) {
    showObject(cat.ins, tabX, ty);
    setObjAlpha(cat.ins, SWAP_ALPHA);
    ty += SWAP_SPACING;
  }
  if (catTitleLabel && openedCatName) {
    var midX = menuBox.left + menuBox.w / 2;
    paintValueLabel(catTitleLabel, openedCatName);
    _showText(catTitleLabel, midX - 2, menuBox.top + CFG_CAT_TITLE_DY);
  }
  layoutCfgControls();
}

function removeMenu() {
  hideObject(debugMenu);
  for (var x of debugCategorys) {
    hideObject(x.ins);
  }
  for (var i in debugButtons) {
    hideObject(debugButtons[i].ins);
  }
  hideAllCfg();
  _hideText(catTitleLabel);
  openedCatName = "";
}

function _gdbg(s) {
  try {
    console.log("[prism-gui] openMenu: " + s);
  } catch (e) {
  }
}

function openMenu() {
  gphase("openMenu" + (debugMenu == null ? " (FIRST — full build)" : " (reopen)"));
  if (debugMenu == null) {
    debugMenu = allocGuiObject();
    debugMenuBase.init(debugMenu);
    debugMenuBase.setTitle(debugMenu, "Prism Client");
    if (_stageAtLeast(3)) {
      debugCategorys.push(debugMenuBase.createCategory("Aimbot", CAT_EXPORT));
      debugCategorys.push(debugMenuBase.createCategory("Dodge", CAT_EXPORT));
      debugCategorys.push(debugMenuBase.createCategory("Killaura", CAT_EXPORT));
      debugCategorys.push(debugMenuBase.createCategory("Utils", CAT_EXPORT));
      debugCategorys.push(debugMenuBase.createCategory("HUD", CAT_EXPORT));
      for (var x of debugCategorys) {
        Stage_addChild2(stageInstance, x.ins);
      }
    }
    if (_stageAtLeast(4)) {
      try {
        buildAllCfg();
      } catch (e) {
        _gdbg("buildAllCfg FAIL: " + e);
      }
    }
  }
  var cv = stageCanvas();
  var sx = MENU_SCALE * MENU_SCALE_W;
  var sy = MENU_SCALE * MENU_SCALE_H;
  setScaleXY(debugMenu, sx, sy);
  var menuW = objWidth(debugMenu);
  if (menuW < 1) {
    menuW = MENU_DESIGN_W;
  }
  var wr = menuW * sx;
  var hr = menuW * MENU_ASPECT * sy;
  var menuX = cv.w / 2 + MENU_DX;
  var menuY = cv.h / 2 + MENU_DY;
  if (MENU_ANCHOR === "topleft") {
    menuX = menuX - wr / 2;
    menuY = menuY - hr / 2;
  } else if (MENU_ANCHOR === "topright") {
    menuX = menuX + wr / 2;
    menuY = menuY - hr / 2;
  } else if (MENU_ANCHOR === "topcenter") {
    menuY = menuY - hr / 2;
  }
  gtrace("geometry: cv " + cv.w + "x" + cv.h + " | objW=" + objWidth(debugMenu).toFixed(1) + " menuW=" + menuW.toFixed(1) + (objWidth(debugMenu) < 1 ? "(fallback)" : "") + " wr=" + wr.toFixed(1) + " hr=" + hr.toFixed(1) + " @ (" + menuX.toFixed(1) + "," + menuY.toFixed(1) + ")");
  setXY(debugMenu, menuX, menuY);
  debugMenu.add(OFF_ALPHA).writeU8(Math.max(0, Math.min(255, Math.round(MENU_ALPHA * 255))));
  debugMenu.add(OFF_VISIBLE).writeU8(1);
  menuBox = { left: menuX - wr / 2, top: menuY, w: wr, h: hr };
  if (!openedCatName && debugCategorys.length) {
    openedCatName = debugCategorys[0].name;
  }
  relayoutMenu();
}

function addDbgBtn() {
  if (debugButton != null) {
    return debugButton;
  }
  gphase("P-button build");
  let btn = allocGuiObject();
  GameButton_GameButton(btn);
  let movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr("debug_button"));
  gtrace("Pbtn: btn=" + gptr(btn) + " getMC(debug_button)=" + gptr(movieClip));
  if (!movieClip || movieClip.isNull()) {
    throw new Error("sc/debug.sc not loaded yet");
  }
  new NativeFunction(btn.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(btn, movieClip, 1);
  try {
    let mTf = MovieClip_getTextFieldByName(movieClip, strPtr("Text"));
    if (mTf && !mTf.isNull()) {
      applyGradient(mTf, PRISM_GRADIENT, 1, 0.5);
    }
  } catch (e) {
  }
  TextField_setText(btn, getScPtr2("<c40e0d0>P</c>"), 1);
  dbgBtnY = stageCanvas().h * 0.96;
  setXY(btn, dbgBtnX, dbgBtnY);
  setHeightWidth(btn, dbgBtnHeight, dbgBtnWidth);
  Stage_addChild2(stageInstance, btn);
  debugButtonMovieClip = movieClip;
  debugButtonEnabled = true;
  debugButton = btn;
  return debugButton;
}

function showDbgBtn() {
  if (!debugButton) {
    debugButton = addDbgBtn();
    showDbgBtn();
    return;
  }
  debugButton.add(OFF_VISIBLE).writeU8(1);
  if (debugButtonMovieClip) {
    try {
      let mTf = MovieClip_getTextFieldByName(debugButtonMovieClip, strPtr("Text"));
      if (mTf && !mTf.isNull()) {
        applyGradient(mTf, PRISM_GRADIENT, 1, 0.5);
      }
    } catch (e) {
    }
    TextField_setText(debugButton, getScPtr2("<c40e0d0>P</c>"), 1);
  } else {
    TextField_setText(debugButton, getScPtr2("<c40e0d0>P</c>"), 1);
  }
  setXY(debugButton, dbgBtnX, dbgBtnY);
  setHeightWidth(debugButton, dbgBtnHeight, dbgBtnWidth);
  debugButtonEnabled = true;
}

function refitDbgBtnText() {
  if (!debugButton || !debugButtonMovieClip) return;
  try {
    let mTf = MovieClip_getTextFieldByName(debugButtonMovieClip, strPtr("Text"));
    if (mTf && !mTf.isNull()) {
      applyGradient(mTf, PRISM_GRADIENT, 1, 0.5);
    }
  } catch (e) {
  }
  try {
    TextField_setText(debugButton, getScPtr2("<c40e0d0>P</c>"), 1);
  } catch (e) {
  }
}

function armScInject() {
  if (_scInjectArmed) return;
  _scInjectArmed = true;
  addfileattach = Interceptor.attach(ResourceListener_addFile, {
    onEnter(args) {
      ResourceListener_addFile(args[0], getScPtr2("sc/debug.sc"), args[2]);
      _addFileFired = true;
      pmile("sc/debug.sc INJECTED into resource load list (addFile hook fired, now detaching)");
      if (addfileattach) {
        addfileattach.detach();
      }
    }
  });
  pmile("addFile hook ARMED @ResourceListener_addFile (stage ready → safe to inject sc/debug.sc)");
}

function debugScReady() {
  try {
    let mc = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr("debug_button"));
    return mc && !mc.isNull();
  } catch (e) {
    return false;
  }
}

function tryPopulateGui(attempt) {
  let stage;
  let stageNull;
  let scReady;
  if (populatedAlredy) return;
  if (!_stageAtLeast(1)) {
    populatedAlredy = true;
    pmile("GUI_STAGE 0 — GUI disabled, nothing will be built");
    return;
  }
  stage = base.add(19866192).readPointer();
  stageNull = stage.isNull();
  scReady = !stageNull && debugScReady();
  if (stageNull || !scReady) {
    if (attempt === 0 || attempt % 10 === 0 || attempt >= POPULATE_MAX_TRIES - 1) {
      pmile("populate not-ready (try " + attempt + "/" + POPULATE_MAX_TRIES + "): stage=" + (stageNull ? "NULL" : "ok") + " debugScReady=" + (stageNull ? "-" : (scReady ? "ok" : "FALSE(sc/debug.sc not parsed)")) + " addFileFired=" + _addFileFired);
    }
    if (attempt < POPULATE_MAX_TRIES) {
      setTimeout(() => tryPopulateGui(attempt + 1), POPULATE_RETRY_MS);
      return;
    }
    populating = false;
    pmile("populate GAVE UP after " + POPULATE_MAX_TRIES + " tries (~" + POPULATE_MAX_TRIES * POPULATE_RETRY_MS / 1000 + "s) — GUI will NOT build this round. addFileFired=" + _addFileFired + " (false ⇒ menu resource never injected)");
    return;
  }
  stageInstance = stage;
  try {
    gphase("populate (try " + attempt + ")");
    gtrace("stage=" + gptr(stage) + " debugScReady=ok");
    pmile("populate STARTING (try " + attempt + ", bootHookFire #" + _bootHookFires + ") — building feature column");
    if (_stageAtLeast(6)) {
      initDebugTextElements();
    } else {
      stageInstance = stage;
      pmile("stage<6 — skipping HUD feature column");
    }
    gtrace("initDebugTextElements done; scheduling Pbtn@" + DBG_BTN_BUILD_MS + "ms, prebuild@" + (DBG_BTN_BUILD_MS + 400) + "ms");
    populatedAlredy = true;
    pmile("populate SUCCEEDED — feature column up; P-button @+" + DBG_BTN_BUILD_MS + "ms, labels @+" + (DBG_BTN_BUILD_MS + 400) + "ms");
    setTimeout(() => {
      try {
        showDbgBtn();
        pmile("P-button BUILT + shown (enabled=" + debugButtonEnabled + ")");
      } catch (e) {
        try {
          pmile("P-button build FAILED: " + e);
          console.log("[prism-gui] dbgbtn build failed: " + e);
        } catch (_e) {
        }
      }
    }, DBG_BTN_BUILD_MS);
    setTimeout(() => refitDbgBtnText(), DBG_BTN_REFIT_MS);
    if (_stageAtLeast(7)) {
      setTimeout(() => {
        try {
          prebuildCfgLabels();
        } catch (e) {
          try {
            pmile("prebuild labels FAILED: " + e);
            console.log("[prism-gui] prebuild labels failed: " + e);
          } catch (_e) {
          }
        }
      }, DBG_BTN_BUILD_MS + 400);
    }
    setTimeout(async () => {
      showFloater("Prism Client Loaded \nscript: v6.4.3 \ndsc.gg/prismclient");
    }, 2000);
  } catch (e) {
    try {
      console.log("[prism-gui] populate failed (try " + attempt + "): " + e);
    } catch (_e) {
    }
    if (attempt < POPULATE_MAX_TRIES) {
      setTimeout(() => tryPopulateGui(attempt + 1), POPULATE_RETRY_MS);
    } else {
      populating = false;
    }
  }
}

var PRISM_GRADIENT = [4278239231, 4282441936, 4286578644, 4282441936, 4278239231];
var base = Process.findModuleByName("libg.so").base;
var GUI_STAGE = 7;
var _stageAtLeast = (n) => GUI_STAGE >= n;
var populatedAlredy = false;
var populating = false;
var _addFileFired = false;
var _bootHookFires = 0;
try {
  Memory.protect(base, Process.findModuleByName("libg.so").size, "rwx");
} catch (e) {
}
var malloc4 = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
var StringCtor = new NativeFunction(base.add(15293804), "pointer", ["pointer", "pointer"]);
var Sprite_Sprite = new NativeFunction(base.add(13389500), "void", ["pointer", "int"]);
var ResourceManager_getMovieClip = new NativeFunction(base.add(13125444), "pointer", ["pointer", "pointer"]);
var Stage_addChild2 = new NativeFunction(base.add(13414284), "pointer", ["pointer", "pointer"]);
var movieClipsettext = new NativeFunction(base.add(13529304), "void", ["pointer", "pointer", "pointer"]);
var GameMain_loadAsset = new NativeFunction(base.add(5058140), "void", ["pointer", "int"]);
var stageInstance;
var StringTable_getMovieClip2 = new NativeFunction(base.add(13125444), "pointer", ["pointer", "pointer"]);
var TextField_setText = new NativeFunction(base.add(6071108), "pointer", ["pointer", "pointer", "bool"]);
var GameButton_GameButton = new NativeFunction(base.add(6069488), "void", ["pointer"]);
var ResourceListener_addFile = new NativeFunction(base.add(13840264), "void", ["pointer", "pointer", "pointer"]);
var dropGUIContainer_DropGUIContainer = base.add(6074680);
var DisplayObject_setPixelSnappedXY = new NativeFunction(base.add(13293704), "pointer", ["pointer", "float", "float"]);
var MovieClip_gotoAndStop = new NativeFunction(base.add(13317696), "void", ["pointer", "int"]);
var TOGGLE_FRAME_OFF = 1;
var TOGGLE_FRAME_ON = 0;
var MC_CHILD_OBJS = 144;
var MC_CHILD_NAMES = 152;
var MC_CHILD_COUNT = 192;
var TOGGLE_INNER_TEXT_RE = /text|txt|label|title|name/i;
var _togChildrenLogged = {};
var _togDumpCount = 0;
var GUI_OBJ_SIZE = 4096;
var GUI_TRACE = true;
var _gtSeq = 0;
var _gtPhase = "boot";
var _gtT0 = Date.now();
pmile("GUI_STAGE = " + GUI_STAGE + " (0=off 1=Pbtn 2=window 3=tabs 4=toggles 5=sliders 6=HUD 7=full)");
var STAGE_LOGICAL_W_OFF = 420;
var STAGE_LOGICAL_H_OFF = 416;
var MENU_EXPORT = "debug_switches_window";
var MENU_ANCHOR = "topcenter";
var MENU_SCALE = 1.125;
var MENU_SCALE_W = 1.3;
var MENU_SCALE_H = 1.4;
var MENU_ASPECT = 0.7;
var MENU_DESIGN_W = 255;
var MENU_ALPHA = 0.85;
var MENU_DX = 0;
var MENU_DY = 0;
var CAT_EXPORT = "debug_menu_item_small";
var SWAP_PAD_X = -133;
var SWAP_TOP_PAD = 46;
var SWAP_SPACING = 39;
var SWAP_ALPHA = 0.75;
var SLIDER_SCALE = 0.7;
var SLIDER_TITLE_DX = 4;
var SLIDER_TITLE_DY = -93;
var SLIDER_TITLE_SCALE = 0.7;
var CFG_SLIDERS_DX = 30;
var CFG_SLIDERS_DY = -50;
var CFG_TOGGLES_DX = 0;
var CFG_TOGGLES_DY = 0;
var CFG_CATEGORY_OFFSET = {
  Aimbot: { dx: 0, dy: 50, tdx: 0, tdy: 0 },
  Dodge: { dx: 0, dy: 40, tdx: 0, tdy: 0 },
  Killaura: { dx: 0, dy: 0, tdx: 0, tdy: 0 },
  Utils: { dx: 0, dy: 0, tdx: 0, tdy: 0 },
  HUD: { dx: 0, dy: 0, tdx: 0, tdy: 0 }
};
var CFG_CAT_TITLE_SCALE = 1;
var CFG_CAT_TITLE_DY = 8;
var CFG_SLIDER_LIMIT = 6969;
var SLIDER_TEXT_MS = 60;
var DBG_BTN_BUILD_MS = 1200;
var DBG_BTN_REFIT_MS = 3200;
String.prototype.ptr = function () {
  return Memory.allocUtf8String(this.toString());
};
String.prototype.scptr = function () {
  let pointer = malloc4(30);
  StringCtor(pointer, this.ptr());
  return pointer;
};
var xPtr = 32;
var yPtr = 36;
var heightPtr = 16;
var widthPtr = 28;
var OFF_VISIBLE = 8;
var OFF_ALPHA = 12;
var OFF_CHILD_COUNT = 78;
var HIDE_XY = 9999;
var textObjects = [];
var debugTextElements = {};
var featureStates = {
  connectionindicator: config.connectionIndicator.enabled,
  holdtoshoot: config.holdToShoot.enabled,
  autocharge: config.autoCharge.enabled,
  showammo: config.showEnemyAmmo.enabled,
  autododge: config.dodge.enabled,
  autoshoot: config.autoShoot.enabled,
  autoulti: config.autoUlti.enabled,
  autospin: config.autospin.enabled,
  antiafk: config.antiAFK.enabled,
  aimbot: config.aimbot.enabled,
  pingdisplay: config.pingDisplay.enabled,
  ipdisplay: config.ipDisplay.enabled,
  featuredisplay: true
};
var featureLabels = {
  connectionindicator: { label: "Conn. Indicator", x: 74 },
  holdtoshoot: { label: "Hold to Shoot", x: 65 },
  autocharge: { label: "Auto Charge", x: 60 },
  autododge: { label: "Auto Dodge", x: 58 },
  autoshoot: { label: "Auto Shoot", x: 56 },
  showammo: { label: "Show Ammo", x: 60 },
  autoulti: { label: "Auto Ultim", x: 54 },
  autospin: { label: "Auto Spin", x: 51 },
  antiafk: { label: "Anti AFK", x: 48 },
  aimbot: { label: "Aimbot", x: 41 },
  pingdisplay: { label: "Ping", x: 30 },
  ipdisplay: { label: "IP", x: 21 }
};
var TITLE_X = 107;
var TITLE_Y = 26;
var TITLE_SCALE = 1.3;
var FEATURE_START_Y = 48;
var FEATURE_SPACING = 18;
var FEATURE_SCALE = 0.8;
var PING_X = 245;
var PING_Y = 25;
var IP_X = 245;
var IP_Y = 9;
var pingHUD = null;
var ipHUD = null;
var inBattle = false;
var debugButtons = [];
var debugCategorys = [];
var openedCatName = "";
var debugMenuBase = {
  init(instance, sc = "sc/debug.sc", exportname = MENU_EXPORT) {
    Sprite_Sprite(instance, 1);
    var movieClip = StringTable_getMovieClip2(strPtr(sc), strPtr(exportname));
    gtrace("window.init: instance=" + gptr(instance) + " getMC(" + exportname + ")=" + gptr(movieClip));
    if (!movieClip || movieClip.isNull()) {
      throw new Error(sc + " export missing: " + exportname);
    }
    debugMenuMovieClip = movieClip;
    new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(instance, movieClip);
    setHeightWidth(instance, 1, 1);
    hideObject(instance);
    Stage_addChild2(stageInstance, instance);
  },
  setTitle(instance, title) {
    try {
      let tf = MovieClip_getTextFieldByName(debugMenuMovieClip, strPtr("title"));
      if (tf && !tf.isNull()) {
        applyGradient(tf, PRISM_GRADIENT, 1, 0.4);
      }
    } catch (e) {
    }
    movieClipsettext(instance, getStrPtr2("title"), getScPtr2("<c40e0d0>".concat(title, "</c>")));
  },
  createCategory(name, exportName = "debug_menu_category") {
    var instance = allocGuiObject();
    GameButton_GameButton(instance);
    var movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr(exportName));
    gtrace("category '" + name + "': btn=" + gptr(instance) + " getMC(" + exportName + ")=" + gptr(movieClip));
    if (!movieClip || movieClip.isNull()) {
      throw new Error("sc/debug.sc export missing: " + exportName);
    }
    new NativeFunction(instance.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(instance, movieClip, 1);
    try {
      let catTf = MovieClip_getTextFieldByName(movieClip, strPtr("Text"));
      if (catTf && !catTf.isNull()) {
        applyGradient(catTf, PRISM_GRADIENT, 1, 0.3);
      }
    } catch (e) {
    }
    TextField_setText(instance, scPtr("<c87cefa>".concat(name, "</c>")), 1);
    hideObject(instance);
    return { ins: instance, name };
  },
  addDebugMenuButton(name, category, exportName = "debug_menu_item") {
    var instance = allocGuiObject();
    GameButton_GameButton(instance);
    var movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr(exportName));
    if (!movieClip || movieClip.isNull()) {
      throw new Error("sc/debug.sc export missing: " + exportName);
    }
    new NativeFunction(instance.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(instance, movieClip, 1);
    try {
      let btnTf = MovieClip_getTextFieldByName(movieClip, strPtr("Text"));
      if (btnTf && !btnTf.isNull()) {
        applyGradient(btnTf, PRISM_GRADIENT, 1, 0.3);
      }
    } catch (e) {
    }
    TextField_setText(instance, scPtr("<c87cefa>".concat(name, "</c>")), 1);
    hideObject(instance);
    return { ins: instance, cat: category, name };
  },
  addToggle(name, category, initial = false, exportName = "debug_togglebutton") {
    var instance = allocGuiObject();
    GameButton_GameButton(instance);
    var movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr(exportName));
    gtrace("toggle '" + name + "': btn=" + gptr(instance) + " getMC(" + exportName + ")=" + gptr(movieClip) + " init=" + !!initial);
    if (!movieClip || movieClip.isNull()) {
      throw new Error("sc/debug.sc export missing: " + exportName);
    }
    new NativeFunction(instance.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(instance, movieClip, 1);
    var tog = { ins: instance, mc: movieClip, cat: category, name, isToggle: true, state: !!initial };
    setToggleVisual(tog, tog.state);
    hideObject(instance);
    return tog;
  },
  closeCategoryAndButtons() {
    openedCatName = "";
    for (let x of debugCategorys) {
      hideObject(x.ins);
    }
    for (let x in debugButtons) {
      hideObject(debugButtons[x].ins);
    }
    debugButtons = [];
    debugCategorys = [];
  },
  openCategory(category) {
    openedCatName = category;
    relayoutMenu();
  }
};
var menuBox = null;
var CFG_TOGGLE_LABEL_DX = 26;
var CFG_TOGGLE_LABEL_DY = -6;
var CFG = {
  Dodge: {
    toggles: [
      { label: "Enabled", path: "dodge.enabled", x: 420, y: 225 - 8 },
      { label: "Curveball", path: "dodge.spikeCurveball", on: true, off: false, x: 420, y: 257 - 4 },
      { label: "Adv Walls", path: "dodge.wallMode", on: "full", off: "simple", x: 420, y: 289 }
    ],
    sliders: [
      { label: "Esc Dirs", path: "dodge.escapeDirections", min: 8, max: 48, dec: 0, x: 45, y: 165 },
      { label: "React Slack", path: "dodge.reactionSlackFrames", min: 0, max: 4, dec: 1, x: 45, y: 220 },
      { label: "Urgency", path: "dodge.interventionUrgency", min: 1, max: 10, dec: 1, x: 45, y: 275, infAtMax: true },
      { label: "Intent", path: "dodge.intentInfluence", min: 0, max: 0.5, dec: 2, x: 45, y: 330 },
      { label: "Radius Pad", path: "dodge.radiusPadding", min: 0, max: 300, dec: 0, x: 235, y: 165 },
      { label: "Range Pad", path: "dodge.rangePadding", min: 0, max: 600, dec: 0, x: 235, y: 220 },
      { label: "Speed Pad", path: "dodge.speedPadding", min: 0, max: 900, dec: 0, x: 235, y: 275 },
      { label: "Hit Slack", path: "dodge.tickHitSlack", min: 0, max: 2, dec: 2, x: 235, y: 330 }
    ]
  },
  Aimbot: {
    toggles: [
      { label: "Enabled", path: "aimbot.enabled", x: 420, y: 225 - 27 - 12 },
      { label: "Juke", path: "aimbot.jukePredict.enabled", x: 420, y: 257 - 27 - 8 },
      { label: "Reactive", path: "aimbot.jukePredict.reactive", x: 420, y: 289 - 27 - 4 },
      { label: "Curve", path: "aimbot.curvePredict.enabled", x: 420, y: 321 - 27 }
    ],
    sliders: [
      { label: "Predict", path: "aimbot.predictionStrength", min: 0, max: 2, dec: 2, x: 45, y: 165 },
      { label: "Lead Time", path: "aimbot.maxLeadTime", min: 0, max: 2, dec: 2, x: 45, y: 220 },
      { label: "Smoothing", path: "aimbot.velocitySmoothing", min: 0, max: 0.9, dec: 2, x: 45, y: 275 },
      { label: "Pos Samples", path: "aimbot.lastpositionsLen", min: 3, max: 12, dec: 0, x: 235, y: 165 },
      { label: "Juke Bias", path: "aimbot.jukePredict.bias", min: 0, max: 1, dec: 2, x: 235, y: 220 },
      { label: "Deadzone", path: "aimbot.deadzoneSpeed", min: 0, max: 400, dec: 0, x: 235, y: 275 }
    ]
  },
  Killaura: {
    texts: [
      { text: "Coming Soon", x: 186, y: 120, scale: 1.3 }
    ],
    toggles: [
      { label: "Auto Shoot", path: "autoShoot.enabled", feature: "autoshoot", x: 50 - 15, y: 170 },
      { label: "Hold to Shoot", path: "holdToShoot.enabled", feature: "holdtoshoot", x: 170 - 15, y: 170 },
      { label: "Auto Ulti", path: "autoUlti.enabled", feature: "autoulti", x: 300 - 15, y: 170 }
    ]
  },
  HUD: {
    toggles: [
      { label: "Ping", path: "pingDisplay.enabled", feature: "pingdisplay", x: 80, y: 65 + 20 },
      { label: "IP", path: "ipDisplay.enabled", feature: "ipdisplay", x: 80, y: 105 + 20 },
      { label: "Conn. Indicator", path: "connectionIndicator.enabled", feature: "connectionindicator", x: 80, y: 145 + 20 },
      { label: "Feature Display", path: "featuredisplay", feature: "featuredisplay", x: 80, y: 185 + 20 }
    ],
    sliders: [
      { label: "Spin Speed", path: "autospin.speed", min: 1, max: 50, dec: 0, x: 80, y: 260 }
    ]
  },
  Utils: {
    toggles: [
      { label: "Auto Spin", path: "autospin.enabled", feature: "autospin", x: 80, y: 165 },
      { label: "Show Ammo", path: "showEnemyAmmo.enabled", feature: "showammo", x: 290, y: 110 },
      { label: "Anti AFK", path: "antiAFK.enabled", feature: "antiafk", x: 290, y: 150 },
      { label: "Auto Charge", path: "autoCharge.enabled", feature: "autocharge", x: 290, y: 190 },
      { label: "Upload Last Log", path: "uploadLog", action: "uploadLog", x: 290, y: 230 }
    ]
  }
};
var cfgBuilt = {};
var cfgToggles = [];
var catTitleLabel = null;
var debugMenu = null;
var debugMenuMovieClip = null;
var debugButton = null;
var debugButtonMovieClip = null;
var debugButtonEnabled = false;
var dbgBtnX = 10;
var dbgBtnY = 600;
var dbgBtnHeight = 1;
var dbgBtnWidth = 1;
var menuOpened = false;
var BTN_FEATURE_KEYS = {
  autododge: "Auto Dodge",
  aimbot: "Aimbot",
  autoshoot: "Auto Shoot",
  autoulti: "Auto Ulti",
  holdtoshoot: "Hold to Shoot",
  autocharge: "Auto Charge",
  autospin: "Auto Spin",
  connectionindicator: "Connection Indicator",
  showammo: "Show Ammo",
  antiafk: "Anti AFK",
  featuredisplay: "Feature Display",
  pingdisplay: "Ping",
  ipdisplay: "IP"
};
Interceptor.attach(base.add(13525780), {
  onEnter(args) {
    try {
      let pressed = args[0];
      for (let cat of debugCategorys) {
        if (cat.ins && pressed.equals(cat.ins)) {
          gphase("tab→" + cat.name);
          debugMenuBase.openCategory(cat.name);
        }
      }
      for (let btn of debugButtons) {
        if (btn.ins && pressed.equals(btn.ins)) {
          let key = BTN_FEATURE_KEYS[btn.name];
          if (key) {
            toggleFeature(key, !featureStates[key]);
          }
        }
      }
      for (let c of cfgToggles) {
        if (c.tog.ins && pressed.equals(c.tog.ins)) {
          if (c.spec.action) {
            runCfgAction(c);
            continue;
          }
          let nowOn = !cfgIsOn(c);
          if (c.spec.feature) {
            toggleFeature(c.spec.feature, nowOn);
          } else {
            cfgSet(c.spec.path, nowOn ? c.onV : c.offV);
          }
          c.tog.state = nowOn;
          setToggleVisual(c.tog, nowOn);
          dumpToggleSubtree(c.tog);
          try {
            console.log("[prism-cfg] " + c.spec.label + " = " + (c.spec.feature ? featureStates[c.spec.feature] : cfgGet(c.spec.path)));
          } catch (e) {
          }
        }
      }
      if (debugButton && pressed.equals(debugButton)) {
        let willOpen = !menuOpened;
        gphase(willOpen ? "P-press → OPEN" : "P-press → CLOSE");
        menuOpened = willOpen;
        if (!_stageAtLeast(2)) {
          pmile("stage<2 — P press acknowledged, menu NOT built");
          return;
        }
        setTimeout(() => {
          try {
            if (willOpen) {
              openMenu();
            } else {
              removeMenu();
            }
          } catch (e) {
            try {
              console.log("[prism-gui] menu " + (willOpen ? "open" : "close") + " failed: " + e);
            } catch (_e) {
            }
            if (willOpen) {
              debugMenu = null;
              debugCategorys = [];
              debugButtons = [];
              menuOpened = false;
            }
          }
        }, 0);
      }
    } catch (e) {
      try {
        console.log("[prism-gui] button handler error: " + e);
      } catch (_e) {
      }
    }
  }
});
var addfileattach = null;
var _scInjectArmed = false;
var POPULATE_RETRY_MS = 200;
var POPULATE_MAX_TRIES = 150;
Interceptor.attach(base.add(10242736), {
  onLeave() {
    _bootHookFires++;
    if (populatedAlredy || populating) {
      if (_bootHookFires <= 3 || _bootHookFires % 100 === 0) {
        pmile("bootstrap hook fire #" + _bootHookFires + " — skip (" + (populatedAlredy ? "already populated" : "populate in progress") + ")");
      }
      return;
    }
    pmile("bootstrap hook FIRST fire #" + _bootHookFires + " @0x009C4AB0 — starting populate (addFileFired=" + _addFileFired + ")");
    armScInject();
    populating = true;
    tryPopulateGui(0);
  }
});
pmile("bootstrap hook ARMED @0x009C4AB0 (GUI populate trigger installed)");
Interceptor.attach(base.add(10204192), {
  onLeave() {
    inBattle = true;
    if (pingHUD && config.pingDisplay.enabled) {
      showGradientMenuText(pingHUD, "Ping: --ms");
    }
    if (ipHUD && config.ipDisplay.enabled) {
      showGradientMenuText(ipHUD, IP);
    }
  }
});
Interceptor.attach(base.add(9803360), {
  onLeave() {
    inBattle = false;
    if (pingHUD) {
      hideMenuText(pingHUD);
    }
    if (ipHUD) {
      hideMenuText(ipHUD);
    }
  }
});
