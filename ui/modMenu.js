// ==========================================================================
// src/gui/Debug+Toggles.js  —  MOD MENU
// P-button, categories Aimbot/Dodge/Killaura/Utils/HUD, toggles+sliders
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 1068 ----
function anon1068() {
    return setIPHUD;
}

// ---- line 1069 ----
function anon1069() {
    return setPingHUD;
}

// ---- line 1071 ----
function mcChildren(mc) {
    let out;
    out = [];
    try {
        let names;
        let objs;
        let n;
        n = mc.add(MC_CHILD_COUNT).readS16();
        if (((n <= 0) || (n > 64))) {
            return out;
        }
        objs = mc.add(MC_CHILD_OBJS).readPointer();
        names = mc.add(MC_CHILD_NAMES).readPointer();
        let i;
        i = 0;
        while ((i < n)) {
            let nm;
            let o;
            o = null;
            nm = "";
            try {
                if (!(objs.isNull())) {
                    o = objs.add((i * 8)).readPointer();
                }
                continue;
            } catch (e) {
            }
            try {
                if (!(names.isNull())) {
                    let np;
                    np = names.add((i * 8)).readPointer();
                    if (!(np.isNull())) {
                        nm = (np.readUtf8String() || "");
                    }
                }
            } catch (e) {
            }
            {}.name = nm;
            {}.obj = o;
            out.push({});
            i++;
        }
    } catch (e) {
    }
    return out;
}

// ---- line 1097 ----
function hideToggleInnerText(tog) {
    if (!(!(tog))) {
    }
    if (!(tog)) {
        return;
    }
    try {
        let hid;
        let kids;
        kids = mcChildren(tog.mc);
        hid = [];
        let k;
        for (const k of kids) {
            if ((!(k.obj) || k.obj.isNull())) continue;
            if (!(TOGGLE_INNER_TEXT_RE.test(k.name))) continue;
            k.obj.add(OFF_VISIBLE).writeU8(0);
            hid.push(k.name);
        }
        if (!(_togChildrenLogged[tog.name])) {
            _togChildrenLogged[tog.name] = 1;
            _gdbg((((((("toggle '" + tog.name) + "' clip children=[") + kids.map(FUNC_<null-atom>).join(",")) + "] hid=[") + hid.join(",")) + "]"));
        }
        return;
    } catch (e) {
        return;
    }
}
// ---- line 1111 ----
function anon1111(k) {
    return (k.name || "?");
}

// ---- line 1116 ----
function _fieldLine(o) {
    return ((((((((((((("w=" + objWidth(o).toFixed(1)) + " h=") + objHeight(o).toFixed(1)) + " vis=") + o.add(OFF_VISIBLE).readU8()) + " x=") + o.add(32).readFloat().toFixed(1)) + " y=") + o.add(36).readFloat().toFixed(1)) + " sX=") + o.add(16).readFloat().toFixed(2)) + " sY=") + o.add(28).readFloat().toFixed(2));
}

// ---- line 1119 ----
function dumpToggleSubtree(tog) {
    if (!(!(tog))) {
        if (!(!(tog.mc))) {
        }
    }
    if (!(tog)) {
        return;
    }
    _togDumpCount = _togDumpCount;
    _gdbg((("toggle '" + tog.name) + "' post-press:"));
    if (tog.ins) {
        if (!(tog.ins.isNull())) {
            _gdbg((("   INS " + _fieldLine(tog.ins)) + "  <- the actual touch hitbox"));
        }
    }
    _gdbg(("   MC  " + _fieldLine(tog.mc)));
    return;
}
// ---- line 1125 ----
function walk(mc, pad, depth) {
    /* @0 ?? ('unknown', 'special_object', 0) */
    walk = <under>;
    let kids;
    if ((depth < 0)) {
        return;
    }
    kids = mcChildren(mc);
    let i;
    i = 0;
    while ((i < kids.length)) {
        let o;
        o = kids[i].obj;
        if (!((!(o) || o.isNull()))) {
            _gdbg(((((((pad + "[") + i) + "] '") + kids[i].name) + "' ") + _fieldLine(o)));
            walk(o, (pad + "   "), (depth - 1));
        }
        i++;
    }
    return;
}

// ---- line 1136 ----
function setToggleVisual(tog, on) {
    try {
        if (tog) {
            if (tog.mc) {
                if (!(tog.mc.isNull())) {
                    MovieClip_gotoAndStop(tog.mc, (on ? TOGGLE_FRAME_ON : TOGGLE_FRAME_OFF));
                }
            }
        }
    } catch (e) {
    }
    return;
}

// ---- line 1143 ----
function allocGuiObject() {
    let p2;
    p2 = Memory.alloc(GUI_OBJ_SIZE);
    .writeByteArray.Uint8Array(new Uint8Array(GUI_OBJ_SIZE));
    return p2;
}

// ---- line 1148 ----
function gtrace(ev) {
    if (!(GUI_TRACE)) {
        return;
    }
    try {
        _gtSeq = _gtSeq;
        console.log(((((((("[gui] " + ("" + _gtSeq).padStart(3, "0")) + " +") + (Date.now() - _gtT0)) + "ms ") + _gtPhase) + " | ") + ev));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 1155 ----
function gphase(p2) {
    _gtPhase = p2;
    return;
}

// ---- line 1159 ----
function gptr(p2) {
    try {
        return ((p2 == null) ? "nil" : (p2.isNull() ? "0x0\ufffdNULL" : p2.toString()));
    } catch (e) {
        return "?err";
    }
}

// ---- line 1166 ----
function pmile(msg) {
    try {
        console.log(((("[prism-ms] +" + (Date.now() - _gtT0)) + "ms ") + msg));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 1172 ----
function stageCanvas() {
    w = 1024;
    h = 576;
    try {
        _w = stageInstance.add(STAGE_LOGICAL_W_OFF).readFloat();
        if ((<sent> > 1)) {
            if ((_w < 20000)) {
                w = _w;
            }
        }
    } catch (e) {
    }
    try {
        _h = stageInstance.add(STAGE_LOGICAL_H_OFF).readFloat();
        if ((<sent> > 1)) {
            if ((_h < 20000)) {
                h = _h;
            }
        }
    } catch (e) {
    }
    {}.w = w;
    {}.h = h;
    return {};
}

// ---- line 1186 ----
function cfgCatOffset() {
    return (CFG_CATEGORY_OFFSET[openedCatName] || {});
}

// ---- line 1189 ----
function getStrPtr2(str) {
    return Memory.allocUtf8String(str);
}

// ---- line 1192 ----
function strPtr(str) {
    return Memory.allocUtf8String(str);
}

// ---- line 1195 ----
function scPtr(str) {
    pointer = Memory.alloc(32);
    StringCtor(pointer, strPtr(str));
    return pointer;
}

// ---- line 1200 ----
function getScPtr2(str) {
    pointer = malloc4(40);
    StringCtor(pointer, getStrPtr2(str));
    return pointer;
}

// ---- line 1205 ----
function setXY(ptr1, x, y) {
    ptr1.add(xPtr).writeFloat(x);
    return;
}

// ---- line 1209 ----
function setHeightWidth(ptr1, height, width) {
    ptr1.add(heightPtr).writeFloat(height);
    return;
}

// ---- line 1213 ----
function setScaleXY(ptr1, sx, sy) {
    ptr1.add(16).writeFloat(sx);
    return;
}

// ---- line 1217 ----
function _vFloat(obj, slot) {
    try {
        return new NativeFunction(obj.readPointer().add(slot).readPointer(), "float", ["pointer"])(obj);
    } catch (e) {
        return 0;
    }
}

// ---- line 1224 ----
function objWidth(obj) {
    return _vFloat(obj, 88);
}

// ---- line 1227 ----
function objHeight(obj) {
    return _vFloat(obj, 96);
}

// ---- line 1230 ----
function setNodeVisible(ptr1, on, x, y) {
    if (!(ptr1)) {
        return;
    }
    if (on) {
        /* @9 ?? ('unknown', 'UN_0xf5', 9) */
        if (!(x)) {
            if ((y !== undefined)) {
                setXY(ptr1, x, y);
            }
        }
        ptr1.add(OFF_VISIBLE).writeU8(1);
        return;
    }
    ptr1.add(OFF_VISIBLE).writeU8(0);
    setXY(ptr1, HIDE_XY, HIDE_XY);
    return;
}

// ---- line 1240 ----
function hideObject(ptr1) {
    return;
}

// ---- line 1243 ----
function showObject(ptr1, x, y) {
    let y;
    let x;
    let ptr1;
    ptr1 = ptr1;
    /* @13 ?? ('unknown', 'UN_0xf5', 13) */
    if (x) {
        x = 0;
    }
    x = x;
    /* @22 ?? ('unknown', 'UN_0xf5', 22) */
    if (y) {
        y = 0;
    }
    y = y;
    /* @38 ?? ('unknown', 'call', 38) */
    return;
}

// ---- line 1246 ----
function setObjAlpha(ptr1, a) {
    if (!(ptr1)) {
        return;
    }
    return;
}

// ---- line 1250 ----
function createMenuText(x, y, scaleX, scaleY) {
    let scaleY;
    let scaleX;
    let y;
    let x;
    x = x;
    y = y;
    /* @18 ?? ('unknown', 'UN_0xf5', 18) */
    if (scaleX) {
        scaleX = 1;
    }
    scaleX = scaleX;
    /* @27 ?? ('unknown', 'UN_0xf5', 27) */
    if (scaleY) {
        scaleY = 1;
    }
    scaleY = scaleY;
    let obj;
    let mc;
    let sprite;
    sprite = allocGuiObject();
    Sprite_Sprite(sprite, 1);
    mc = ResourceManager_getMovieClip(strPtr("sc/debug.sc"), strPtr("debug_menu_text"));
    gtrace(((("menuText: sprite=" + gptr(sprite)) + " getMC(debug_menu_text)=") + gptr(mc)));
    new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(sprite, mc);
    sprite.add(32).writeFloat(x);
    sprite.add(36).writeFloat(y);
    sprite.add(16).writeFloat(scaleX);
    sprite.add(28).writeFloat(scaleY);
    Stage_addChild2(stageInstance, sprite);
    {}.sprite = sprite;
    {}.movieClip = mc;
    {}.visible = false;
    {}.text = "";
    {}.x = x;
    {}.y = y;
    obj = {};
    setNodeVisible(sprite, false);
    return obj;
}

// ---- line 1265 ----
function showGradientMenuText(obj, text) {
    if (!(obj)) {
        return;
    }
    obj.text = text;
    obj.visible = true;
    /* @43 ?? ('unknown', 'call', 43) */
    try {
        let tf;
        tf = MovieClip_getTextFieldByName(obj.movieClip, strPtr("Text"));
        if (tf) {
            if (!(tf.isNull())) {
                /* @114 ?? ('unknown', 'call', 114) */
            }
        }
    } catch (e) {
    }
    return;
}

// ---- line 1277 ----
function hideMenuText(obj) {
    if ((!(obj) || !(obj.visible))) {
        return;
    }
    obj.visible = false;
    setNodeVisible(obj.sprite, false);
    try {
        movieClipsettext(obj.sprite, "Text".ptr(), "".scptr());
        return;
    } catch (e) {
        return;
    }
}

// ---- line 1286 ----
function setPingHUD(ping) {
    let text;
    if (!(!(pingHUD))) {
    }
    if (!(pingHUD)) {
        return;
    }
    text = "Ping: ".concat(ping, "ms");
    if ((pingHUD.text === text)) {
        return;
    }
    return;
}

// ---- line 1292 ----
function setIPHUD(ip) {
    if ((!(ipHUD) || !(ipHUD.visible))) {
        return;
    }
    return;
}

// ---- line 1296 ----
function createDebugText(initialText, x, y, scaleX, scaleY) {
    let scaleY;
    let scaleX;
    let y;
    let x;
    let initialText;
    /* @17 ?? ('unknown', 'UN_0xf5', 17) */
    if (initialText) {
        initialText = "Hello World";
    }
    initialText = initialText;
    /* @30 ?? ('unknown', 'UN_0xf5', 30) */
    if (x) {
        x = 5;
    }
    x = x;
    /* @39 ?? ('unknown', 'UN_0xf5', 39) */
    if (y) {
        y = 5;
    }
    y = y;
    /* @48 ?? ('unknown', 'UN_0xf5', 48) */
    if (scaleX) {
        scaleX = 1.4;
    }
    scaleX = scaleX;
    /* @60 ?? ('unknown', 'UN_0xf5', 60) */
    if (scaleY) {
        scaleY = 1.4;
    }
    scaleY = scaleY;
    let textObj;
    let movieClip;
    let sprite;
    GameMain_loadAsset("sc/ui.sc".scptr(), 0);
    sprite = allocGuiObject();
    Sprite_Sprite(sprite, 1);
    movieClip = ResourceManager_getMovieClip(strPtr("sc/ui.sc"), strPtr("damage_number"));
    new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(sprite, movieClip);
    sprite.add(32).writeFloat(x);
    sprite.add(36).writeFloat(y);
    sprite.add(16).writeFloat(scaleX);
    sprite.add(28).writeFloat(scaleY);
    Stage_addChild2(stageInstance, sprite);
    movieClipsettext(sprite, "txt".ptr(), initialText.scptr());
    {}.sprite = sprite;
    {}.movieClip = movieClip;
    {}.visible = true;
    {}.text = initialText;
    textObj = {};
    textObjects.push(textObj);
    return textObj;
}

// ---- line 1312 ----
function setPosition(textObj, x, y) {
    if (!(textObj)) {
        return;
    }
    textObj.sprite.add(32).writeFloat(x);
    return;
}

// ---- line 1317 ----
function hideText(textObj) {
    if ((!(textObj) || !(textObj.visible))) {
        return;
    }
    movieClipsettext(textObj.sprite, "txt".ptr(), "".scptr());
    textObj.visible = false;
    return;
}

// ---- line 1322 ----
function showText(textObj, newText) {
    let newText;
    let textObj;
    textObj = textObj;
    /* @10 ?? ('unknown', 'UN_0xf5', 10) */
    if (newText) {
        newText = null;
    }
    newText = newText;
    let textToShow;
    if (!(textObj)) {
        return;
    }
    textToShow = (+(newText) ? newText : textObj.text);
    movieClipsettext(textObj.sprite, "txt".ptr(), textToShow.scptr());
    textObj.visible = true;
    if (!(+(newText))) {
        textObj.text = newText;
    }
    return;
}

// ---- line 1329 ----
function updateFeaturePositions() {
    let currentY;
    currentY = FEATURE_START_Y;
    let key;
    for (const key of Object.keys(featureStates)) {
        if (!(featureStates[key])) continue;
        if (!(debugTextElements[key])) continue;
        setPosition(debugTextElements[key], featureLabels[key].x, currentY);
        currentY = (currentY + FEATURE_SPACING);
    }
    return;
}

// ---- line 1338 ----
function toggleFeature(featureName, enabled) {
    let label;
    featureStates[featureName] = enabled;
    if ((featureName === "autododge")) {
        config.dodge.enabled = enabled;
    } else {
        if ((featureName === "aimbot")) {
            config.aimbot.enabled = enabled;
        } else {
            if ((featureName === "autoshoot")) {
                config.autoShoot.enabled = enabled;
            } else {
                if ((featureName === "autoulti")) {
                    config.autoUlti.enabled = enabled;
                } else {
                    if ((featureName === "holdtoshoot")) {
                        config.holdToShoot.enabled = enabled;
                    } else {
                        if ((featureName === "autocharge")) {
                            config.autoCharge.enabled = enabled;
                        } else {
                            if ((featureName === "autospin")) {
                                config.autospin.enabled = enabled;
                            } else {
                                if ((featureName === "connectionindicator")) {
                                    config.connectionIndicator.enabled = enabled;
                                    setConnectionIndicatorLive(enabled);
                                } else {
                                    if ((featureName === "showammo")) {
                                        config.showEnemyAmmo.enabled = enabled;
                                    } else {
                                        if ((featureName === "antiafk")) {
                                            config.antiAFK.enabled = enabled;
                                        } else {
                                            if ((featureName === "pingdisplay")) {
                                                config.pingDisplay.enabled = enabled;
                                            } else {
                                                if ((featureName === "ipdisplay")) {
                                                    config.ipDisplay.enabled = enabled;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    scheduleSave();
    if ((featureName === "pingdisplay")) {
        if (enabled) {
            if (inBattle) {
                pingHUD(pingHUD.text, (pingHUD.text || "Ping: --ms"));
            }
        }
        hideMenuText(pingHUD);
    }
    if ((featureName === "ipdisplay")) {
        if (enabled) {
            if (inBattle) {
                showGradientMenuText(ipHUD, IP);
            } else {
                hideMenuText(ipHUD);
            }
        }
        hideMenuText(ipHUD);
    }
    if ((featureName === "featuredisplay")) {
        if (enabled) {
            showText(debugTextElements.titleText);
            let key;
            for (const key of Object.keys(featureLabels)) {
                if (!(featureStates[key])) continue;
                if (!(debugTextElements[key])) continue;
                showText(debugTextElements[key]);
            }
            updateFeaturePositions();
        }
        hideText(debugTextElements.titleText);
        let key;
        for (const key of Object.keys(featureLabels)) {
            if (!(debugTextElements[key])) continue;
            hideText(debugTextElements[key]);
        }
        return;
    }
    /* @699 ?? ('unknown', 'UN_0xa4', 699) */
    if (featureLabels[featureName]) {
    } else {
    }
    label = (featureLabels[featureName] || featureName);
    if (enabled) {
        if (featureStates.featuredisplay) {
            showText(debugTextElements[featureName]);
        }
        showFloater("".concat(label, " ON"));
    }
    hideText(debugTextElements[featureName]);
    showFloater("".concat(label, " OFF"));
    return;
}

// ---- line 1414 ----
function applyHudGradient(textObj, speed) {
    try {
        let tf;
        tf = MovieClip_getTextFieldByName(textObj.movieClip, strPtr("txt"));
        if (tf) {
            if (!(tf.isNull())) {
                /* @66 ?? ('unknown', 'call', 66) */
            }
        }
        return;
    } catch (e) {
        return;
    }
}

// ---- line 1421 ----
function initDebugTextElements() {
    let _featCount;
    // module entry: onEnter
    <under>.Interceptor(.attach, base6.add(13107016));
    /* @79 ?? ('unknown', 'call', 79) */
    TITLE_SCALE.titleText = TITLE_SCALE;
    applyHudGradient(debugTextElements.titleText, 0.4);
    let key;
    for (const key of Object.keys(featureStates)) {
        let x;
        let label;
        if (!(featureLabels[key])) continue;
        /* @152 ?? ('unknown', 'UN_0xf5', 152) */
        if (!(undefined)) {
            while (true) {
                /* @155 ?? ('unknown', 'to_object', 155) */
                label = .label;
                x = .x;
                break;
            }
        } else {
            /* goto 155 */
        }
        /* @218 ?? ('unknown', 'call', 218) */
        FEATURE_START_Y[FEATURE_SCALE] = FEATURE_SCALE;
        applyHudGradient(debugTextElements[key], 0.3);
        if (!(!(featureStates[key]))) continue;
        hideText(debugTextElements[key]);
    }
    updateFeaturePositions();
    /* @303 ?? ('unknown', 'call', 303) */
    pingHUD = 1.25;
    /* @332 ?? ('unknown', 'call', 332) */
    ipHUD = 1.25;
    _featCount = Object.keys(featureLabels).filter(FUNC_<null-atom>).length;
    return;
}
// ---- line 1423 ----
function anon1423(args) {
    args[4] = ptr(1);
    return;
}
// ---- line 1439 ----
function anon1439(k) {
    return debugTextElements[k];
}

// ---- line 1442 ----
function runCfgAction(c) {
    if ((c.spec.action !== "uploadLog")) {
        return;
    }
    setToggleVisual(c.tog, false);
    showFloater("Uploading last run's log\u2026");
    return;
}
// ---- line 1446 ----
function anon1446(ok, msg) {
    try {
        showFloater(((ok ? "\u2714 " : "\u2716 ") + msg));
    } catch (e) {
    }
    try {
        console.log(((("[runlog] upload " + (ok ? "OK" : "FAILED")) + ": ") + msg));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 1457 ----
function cfgGet(p2) {
    return p2.split(".").reduce(FUNC_<null-atom>, config);
}
// ---- line 1458 ----
function anon1458(o, k) {
    if ((o == null)) {
        return o;
    }
    return o[k];
}

// ---- line 1462 ----
function cfgSet(p2, v) {
    a = p2.split(".");
    o = config;
    i = 0;
    while ((i < (a.length - 1))) {
        o = o[a[i]];
        i++;
    }
    o[a[(a.length - 1)]] = v;
    return;
}

// ---- line 1468 ----
function fmtNum(v, dec) {
    if ((dec > 0)) {
        return Number(v).toFixed(dec);
    }
    return String(Math.round(v));
}

// ---- line 1471 ----
function cfgIsOn(c) {
    if (c.spec.action) {
        return false;
    }
    if (c.spec.feature) {
        return !(!(featureStates[c.spec.feature]));
    }
    cur = cfgGet(c.spec.path);
    if (!((c.onV === <under>))) {
    }
    return (c.onV === <under>);
}

// ---- line 1477 ----
function _showText(o, x, y) {
    if (o) {
        if (o.sprite) {
            try {
                Stage_addChild2(stageInstance, o.sprite);
            } catch (e) {
            }
            o.x = x;
            o.y = y;
            /* @75 ?? ('unknown', 'call', 75) */
            o.visible = true;
        }
    }
    return;
}

// ---- line 1489 ----
function _hideText(o) {
    if (o) {
        if (o.sprite) {
            setNodeVisible(o.sprite, false);
            o.visible = false;
        }
    }
    return;
}

// ---- line 1495 ----
function createGradientLabel(x, y, scale) {
    let obj;
    let mc;
    let sprite;
    sprite = allocGuiObject();
    Sprite_Sprite(sprite, 1);
    mc = ResourceManager_getMovieClip(strPtr("sc/ui.sc"), strPtr("damage_number"));
    gtrace(((("gradLabel: sprite=" + gptr(sprite)) + " getMC(damage_number)=") + gptr(mc)));
    new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(sprite, mc);
    sprite.add(32).writeFloat(x);
    sprite.add(36).writeFloat(y);
    sprite.add(16).writeFloat(scale);
    sprite.add(28).writeFloat(scale);
    Stage_addChild2(stageInstance, sprite);
    {}.sprite = sprite;
    {}.movieClip = mc;
    {}.visible = false;
    {}.text = "";
    obj = {};
    try {
        movieClipsettext(sprite, "txt".ptr(), getScPtr2(" "));
        obj._grad = createGradient(PRISM_GRADIENT, 1, 0.3);
        if (!(obj._grad)) {
            gtrace("gradLabel: gradient unavailable \u2192 plain text only");
        } else {
            let tf;
            tf = MovieClip_getTextFieldByName(mc, strPtr("txt"));
            if (tf) {
                if (!(tf.isNull())) {
                    obj._df = applyGradientOnly(tf, obj._grad);
                }
            }
            gtrace(((("gradLabel: GRADIENT ok tf=" + gptr(tf)) + " df=") + gptr(obj._df)));
        }
    } catch (e) {
        gtrace((((("gradLabel: DECORATE THREW " + e) + " (mc=") + gptr(mc)) + ") \u2192 plain fallback"));
    }
    setNodeVisible(sprite, false);
    obj.visible = false;
    return obj;
}

// ---- line 1524 ----
function paintValueLabel(obj, text) {
    if ((!(obj) || !(obj.sprite))) {
        return;
    }
    try {
        /* @45 ?? ('unknown', 'call', 45) */
        obj.visible = true;
        movieClipsettext(obj.sprite, "txt".ptr(), getScPtr2((("<c40e0d0>" + text) + "</c>")));
        obj.text = text;
        return;
    } catch (e) {
        if (!(obj._logged)) {
            obj._logged = 1;
            _gdbg(((("label '" + text) + "' ERR: ") + e));
        }
        return;
    }
}

// ---- line 1538 ----
function prebuildCfgLabels() {
    jobs = [];
    names = [];
    for (const cn in CFG) {
        specs = (CFG[cn].sliders || []);
        i = 0;
        while ((i < specs.length)) {
            jobs.push(specs[i]);
            names.push(((cn + "/") + specs[i].label));
            i++;
        }
        texts = (CFG[cn].texts || []);
        j = 0;
        while ((j < texts.length)) {
            jobs.push(texts[j]);
            names.push(((cn + "/txt:") + texts[j].text));
            j++;
        }
    }
    gphase((("prebuild-labels (" + jobs.length) + " + cat-title)"));
    return;
}
// ---- line 1553 ----
function next(i2) {
    /* @0 ?? ('unknown', 'special_object', 0) */
    next = <under>;
    if ((i2 >= jobs.length)) {
        gtrace("prebuild: cat-title");
        try {
            if (!(catTitleLabel)) {
                catTitleLabel = createGradientLabel(0, 0, CFG_CAT_TITLE_SCALE);
            }
        } catch (e) {
            gtrace(("prebuild cat-title FAIL: " + e));
        }
        return;
    }
    gtrace(((((("prebuild [" + (i2 + 1)) + "/") + jobs.length) + "] ") + names[i2]));
    try {
        if (!(jobs[i2]._label)) {
            createGradientLabel._label = 0(0, jobs[i2].scale, (jobs[i2].scale || SLIDER_TITLE_SCALE));
        }
    } catch (e) {
        gtrace(("prebuild label FAIL: " + e));
    }
    return;
}
// ---- line 1570 ----
function anon1570() {
    return;
}

// ---- line 1575 ----
function makeCfgSlider(spec) {
    paint = FUNC_paint;
    apply = FUNC_apply;
    dec = (spec.dec || 0);
    mult = Math.pow(10, dec);
    sMin = Math.round((spec.min * mult));
    sMax = Math.round((spec.max * mult));
    cur = cfgGet(spec.path);
    if (spec.infAtMax) {
        if ((cur === Infinity)) {
            init = sMax;
        } else {
            init = Math.round((((typeof (cur) === "number") ? cur : spec.min) * mult));
        }
    }
    init = Math.round((((typeof (cur) === "number") ? cur : spec.min) * mult));
    if ((init < sMin)) {
        init = sMin;
    }
    if ((init > sMax)) {
        init = sMax;
    }
    title = (spec._label || createGradientLabel(0, 0, SLIDER_TITLE_SCALE));
    _tLast = 0;
    _tStr = null;
    _tPend = null;
    apply(init);
    _hideText(title);
    {}.kind = "slider";
    {}.spec = spec;
    {}.title = title;
    {}.slider = null;
    {}.apply = apply;
    {}.sMin = sMin;
    {}.sMax = sMax;
    {}.init = init;
    return {};
}
// ---- line 1585 ----
function paint(str) {
    _tStr = str;
    _tLast = Date.now();
    return;
}
// ---- line 1590 ----
function apply(sliderInt) {
    if (spec.infAtMax) {
        if ((sliderInt >= sMax)) {
            cfgSet(spec.path, Infinity);
            str = (spec.label + ": Inf");
        } else {
            real = (sliderInt / mult);
            cfgSet(spec.path, real);
            str = ((spec.label + ": ") + fmtNum(real, dec));
        }
    }
    real = (sliderInt / mult);
    cfgSet(spec.path, real);
    str = ((spec.label + ": ") + fmtNum(real, dec));
    if ((str === _tStr)) {
        return;
    }
    if (((Date.now() - _tLast) >= SLIDER_TEXT_MS)) {
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
    _tPend = setTimeout(FUNC_<null-atom>, SLIDER_TEXT_MS);
    return;
}
// ---- line 1609 ----
function anon1609() {
    _tPend = null;
    if ((cfgGet(spec.path) === Infinity)) {
    } else {
    }
    return;
}

// ---- line 1619 ----
function makeCfgToggle(spec) {
    onV = (("on" in spec) ? spec.on : true);
    offV = (("off" in spec) ? spec.off : false);
    {}.kind = "toggle";
    {}.spec = spec;
    {}.tog = null;
    {}.label = null;
    {}.onV = onV;
    {}.offV = offV;
    ctrl = {};
    on = cfgIsOn(ctrl);
    if (spec.path) {
        cfgSet(spec.path, (on ? onV : offV));
    }
    tog = debugMenuBase.addToggle(spec.label, "__cfg", on);
    Stage_addChild2(stageInstance, tog.ins);
    /* @171 ?? ('unknown', 'call', 171) */
    label = 1;
    showGradientMenuText(label, spec.label);
    _hideText(label);
    ctrl.tog = tog;
    ctrl.label = label;
    return ctrl;
}

// ---- line 1634 ----
function buildCfgCategory(catName) {
    if (cfgBuilt[catName]) {
        return cfgBuilt[catName];
    }
    gphase(("build:" + catName));
    def = CFG[catName];
    {}.sliders = [];
    {}.toggles = [];
    {}.texts = [];
    built = {};
    if (def) {
        if (_stageAtLeast(5)) {
        }
        if (_stageAtLeast(7)) {
        }
    }
    if (def) {
    }
    if (def) {
    }
    gtrace(((((((((((("built '" + catName) + "': sliders ") + built.sliders.length) + "/") + 0) + ", toggles ") + built.toggles.length) + "/") + 0) + ", texts ") + built.texts.length));
    cfgBuilt[catName] = built;
    return built;
}
// ---- line 1639 ----
function anon1639(spec) {
    gtrace((("+slider '" + spec.label) + "'"));
    try {
        built.sliders.push(makeCfgSlider(spec));
        return;
    } catch (e) {
        gtrace(((("SLIDER '" + spec.label) + "' FAIL: ") + e));
        return;
    }
}
// ---- line 1647 ----
function anon1647(spec) {
    gtrace((("+toggle '" + spec.label) + "'"));
    try {
        t = makeCfgToggle(spec);
        built.toggles.push(t);
        cfgToggles.push(t);
        return;
    } catch (e) {
        gtrace(((("TOGGLE '" + spec.label) + "' FAIL: ") + e));
        return;
    }
}
// ---- line 1657 ----
function anon1657(spec) {
    gtrace((("+text '" + spec.text) + "'"));
    try {
        if (!(spec._label)) {
        }
        obj = spec._label;
        paintValueLabel(obj, spec.text);
        _hideText(obj);
        {}.spec = spec;
        {}.label = obj;
        built.texts.push({});
        return;
    } catch (e) {
        gtrace(((("TEXT '" + spec.text) + "' FAIL: ") + e));
        return;
    }
}

// ---- line 1673 ----
function buildAllCfg() {
    for (const cn in CFG) {
        buildCfgCategory(cn);
    }
    return;
}

// ---- line 1676 ----
function hideAllCfg() {
    for (const cn in cfgBuilt) {
        cfgBuilt[cn].sliders.forEach(FUNC_<null-atom>);
        cfgBuilt[cn].toggles.forEach(FUNC_<null-atom>);
    }
    return;
}
// ---- line 1678 ----
function anon1678(c) {
    try {
        if (c.slider) {
            c.slider.hide();
        }
    } catch (e) {
    }
    return;
}
// ---- line 1685 ----
function anon1685(c) {
    hideObject(c.tog.ins);
    return;
}
// ---- line 1689 ----
function anon1689(t) {
    return;
}

// ---- line 1694 ----
function layoutCfgControls() {
    if (!(menuBox)) {
        return;
    }
    hideAllCfg();
    built = cfgBuilt[openedCatName];
    if (!(<under>)) {
        return;
    }
    gtrace((((((((("layout '" + openedCatName) + "': show ") + built.sliders.length) + " sliders, ") + built.toggles.length) + " toggles, ") + built.texts.length) + " texts"));
    co = cfgCatOffset();
    built.sliders.forEach(FUNC_<null-atom>);
    built.toggles.forEach(FUNC_<null-atom>);
    return;
}
// ---- line 1701 ----
function anon1701(c, i) {
    sx = (co.dx + (co.dx || 0));
    sy = (co.dy + (co.dy || 0));
    try {
        if (!(c.slider)) {
            /* @138 ?? ('unknown', 'call', 138) */
            SLIDER_SCALE.slider = c.apply;
        } else {
            c.slider.show(sx, sy);
        }
        if ((i === 0)) {
            n = c.slider.node;
            ct = c.slider.container;
            _gdbg(((((((((((((((((((((((((((("show '" + c.spec.label) + "' NODE vis=") + n.add(OFF_VISIBLE).readU8()) + " nkids=") + n.add(OFF_CHILD_COUNT).readU16()) + " a=") + n.add(OFF_ALPHA).readU8()) + " x=") + n.add(32).readFloat().toFixed(0)) + " y=") + n.add(36).readFloat().toFixed(0)) + " sX=") + n.add(16).readFloat().toFixed(2)) + " | CONTAINER=") + ct) + " vis=") + ct.add(OFF_VISIBLE).readU8()) + " nkids=") + ct.add(OFF_CHILD_COUNT).readU16()) + " a=") + ct.add(OFF_ALPHA).readU8()) + " x=") + ct.add(32).readFloat().toFixed(0)) + " y=") + ct.add(36).readFloat().toFixed(0)) + " sX=") + ct.add(16).readFloat().toFixed(2)));
        }
    } catch (e) {
        _gdbg(((("show '" + c.spec.label) + "' FAIL: ") + e));
    }
    return;
}
// ---- line 1715 ----
function anon1715(c) {
    tx = (co.tdx + (co.tdx || 0));
    ty = (co.tdy + (co.tdy || 0));
    showObject(c.tog.ins, tx, ty);
    setToggleVisual(c.tog, cfgIsOn(c));
    try {
        _nk = c.tog.ins.add(OFF_CHILD_COUNT).readU16();
        if ((<sent> > 4)) {
            _gdbg((((("!! toggle '" + c.spec.label) + "' childCount=") + _nk) + " \u2014 HITBOX WILL BE WRONG"));
        }
    } catch (e) {
    }
    return;
}
// ---- line 1726 ----
function anon1726(t) {
    return;
}

// ---- line 1730 ----
function relayoutMenu() {
    if ((!(debugMenu) || !(menuBox))) {
        return;
    }
    tabX = (menuBox.left + SWAP_PAD_X);
    ty = (menuBox.top + SWAP_TOP_PAD);
    for (const cat of debugCategorys) {
        showObject(cat.ins, tabX, ty);
        setObjAlpha(cat.ins, SWAP_ALPHA);
        ty = (ty + SWAP_SPACING);
    }
    if (catTitleLabel) {
        if (openedCatName) {
            midX = (menuBox.left + (menuBox.w / 2));
            paintValueLabel(catTitleLabel, openedCatName);
            _showText(catTitleLabel, (midX - 2), (menuBox.top + CFG_CAT_TITLE_DY));
        }
    }
    return;
}

// ---- line 1746 ----
function removeMenu() {
    hideObject(debugMenu);
    for (const x of debugCategorys) {
        hideObject(x.ins);
    }
    for (const i in debugButtons) {
        hideObject(debugButtons[i].ins);
    }
    hideAllCfg();
    _hideText(catTitleLabel);
    openedCatName = "";
    return;
}

// ---- line 1754 ----
function _gdbg(s) {
    try {
        console.log(("[prism-gui] openMenu: " + s));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 1760 ----
function openMenu() {
    gphase(("openMenu" + ((debugMenu == null) ? " (FIRST \u2014 full build)" : " (reopen)")));
    if ((debugMenu == null)) {
        debugMenu = allocGuiObject();
        debugMenuBase.init(debugMenu);
        debugMenuBase.setTitle(debugMenu, "Prism Client");
        if (_stageAtLeast(3)) {
            debugCategorys.push(debugMenuBase.createCategory("Aimbot", CAT_EXPORT));
            debugCategorys.push(debugMenuBase.createCategory("Dodge", CAT_EXPORT));
            debugCategorys.push(debugMenuBase.createCategory("Killaura", CAT_EXPORT));
            debugCategorys.push(debugMenuBase.createCategory("Utils", CAT_EXPORT));
            debugCategorys.push(debugMenuBase.createCategory("HUD", CAT_EXPORT));
            for (const x of debugCategorys) {
                Stage_addChild2(stageInstance, x.ins);
            }
        }
        if (_stageAtLeast(4)) {
            try {
                buildAllCfg();
            } catch (e) {
                _gdbg(("buildAllCfg FAIL: " + e));
            }
        }
    }
    cv = stageCanvas();
    sx = (MENU_SCALE * MENU_SCALE_W);
    sy = (MENU_SCALE * MENU_SCALE_H);
    setScaleXY(debugMenu, sx, sy);
    menuW = objWidth(debugMenu);
    if ((1 < <under>)) {
        menuW = MENU_DESIGN_W;
    }
    wr = (menuW * sx);
    hr = ((menuW * MENU_ASPECT) * sy);
    menuX = ((cv.w / 2) + MENU_DX);
    menuY = ((cv.h / 2) + MENU_DY);
    if ((MENU_ANCHOR === "topleft")) {
        menuX = (menuX - (wr / 2));
        menuY = (menuY - (hr / 2));
    } else {
        if ((MENU_ANCHOR === "topright")) {
            menuX = (menuX + (wr / 2));
            menuY = (menuY - (hr / 2));
        } else {
            if ((MENU_ANCHOR === "topcenter")) {
                menuY = (menuY - (hr / 2));
            }
        }
    }
    gtrace(((((((((((((((((("geometry: cv " + cv.w) + "x") + cv.h) + " | objW=") + objWidth(debugMenu).toFixed(1)) + " menuW=") + menuW.toFixed(1)) + ((objWidth(debugMenu) < 1) ? "(fallback)" : "")) + " wr=") + wr.toFixed(1)) + " hr=") + hr.toFixed(1)) + " @ (") + menuX.toFixed(1)) + ",") + menuY.toFixed(1)) + ")"));
    setXY(debugMenu, menuX, menuY);
    debugMenu.add(OFF_ALPHA).writeU8(Math.max(0, Math.min(255, Math.round((MENU_ALPHA * 255)))));
    debugMenu.add(OFF_VISIBLE).writeU8(1);
    {}.left = (menuX - (wr / 2));
    {}.top = menuY;
    {}.w = wr;
    {}.h = hr;
    menuBox = {};
    if (!(openedCatName)) {
        if (debugCategorys.length) {
            openedCatName = debugCategorys[0].name;
        }
    }
    return;
}

// ---- line 1808 ----
function addDbgBtn() {
    let movieClip;
    let btn;
    if ((debugButton != null)) {
        return debugButton;
    }
    gphase("P-button build");
    btn = allocGuiObject();
    GameButton_GameButton(btn);
    movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr("debug_button"));
    gtrace(((("Pbtn: btn=" + gptr(btn)) + " getMC(debug_button)=") + gptr(movieClip)));
    if ((!(movieClip) || movieClip.isNull())) {
        throw new Error("sc/debug.sc not loaded yet");
    }
    new NativeFunction(btn.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(btn, movieClip, 1);
    try {
        let mTf;
        mTf = MovieClip_getTextFieldByName(movieClip, strPtr("Text"));
        if (mTf) {
            if (!(mTf.isNull())) {
                /* @288 ?? ('unknown', 'call', 288) */
            }
        }
    } catch (e) {
    }
    TextField_setText(btn, getScPtr2("<c40e0d0>P</c>"), 1);
    dbgBtnY = (stageCanvas().h * 0.96);
    setXY(btn, dbgBtnX, dbgBtnY);
    setHeightWidth(btn, dbgBtnHeight, dbgBtnWidth);
    Stage_addChild2(stageInstance, btn);
    debugButtonMovieClip = movieClip;
    debugButtonEnabled = true;
    debugButton = btn;
    return debugButton;
}

// ---- line 1832 ----
function showDbgBtn() {
    if (debugButton) {
        debugButton.add(OFF_VISIBLE).writeU8(1);
        if (debugButtonMovieClip) {
            try {
                let mTf;
                mTf = MovieClip_getTextFieldByName(debugButtonMovieClip, strPtr("Text"));
                if (mTf) {
                    if (!(mTf.isNull())) {
                        /* @111 ?? ('unknown', 'call', 111) */
                    }
                }
            } catch (e) {
            }
            TextField_setText(debugButton, getScPtr2("<c40e0d0>P</c>"), 1);
        }
        TextField_setText(debugButton, getScPtr2("<c40e0d0>P</c>"), 1);
        setXY(debugButton, dbgBtnX, dbgBtnY);
        setHeightWidth(debugButton, dbgBtnHeight, dbgBtnWidth);
        debugButtonEnabled = true;
        return;
    }
    debugButton = addDbgBtn();
    showDbgBtn();
    return;
}

// ---- line 1853 ----
function refitDbgBtnText() {
    if ((!(debugButton) || !(debugButtonMovieClip))) {
        return;
    }
    try {
        let mTf;
        mTf = MovieClip_getTextFieldByName(debugButtonMovieClip, strPtr("Text"));
        if (mTf) {
            if (!(mTf.isNull())) {
                /* @85 ?? ('unknown', 'call', 85) */
            }
        }
    } catch (e) {
    }
    try {
        TextField_setText(debugButton, getScPtr2("<c40e0d0>P</c>"), 1);
        return;
    } catch (e) {
        return;
    }
}

// ---- line 1865 ----
function armScInject() {
    if (_scInjectArmed) {
        return;
    }
    _scInjectArmed = true;
    // module entry: onEnter
    addfileattach = <under>.Interceptor(.attach, ResourceListener_addFile);
    return;
}
// ---- line 1869 ----
function anon1869(args) {
    ResourceListener_addFile(args[0], getScPtr2("sc/debug.sc"), args[2]);
    _addFileFired = true;
    pmile("sc/debug.sc INJECTED into resource load list (addFile hook fired, now detaching)");
    if (addfileattach) {
        addfileattach.detach();
    }
    return;
}

// ---- line 1878 ----
function debugScReady() {
    try {
        let mc;
        mc = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr("debug_button"));
        return (mc && !(mc.isNull()));
    } catch (e) {
        return false;
    }
}

// ---- line 1886 ----
function tryPopulateGui(attempt) {
    let scReady;
    let stageNull;
    let stage;
    if (populatedAlredy) {
        return;
    }
    if (!(_stageAtLeast(1))) {
        populatedAlredy = true;
        return;
    }
    stage = base6.add(19866192).readPointer();
    stageNull = stage.isNull();
    scReady = (!(stageNull) && debugScReady());
    if ((stageNull || !(scReady))) {
        if (!((attempt === 0))) {
        }
        if ((attempt === 0)) {
            pmile(((((((((("populate not-ready (try " + attempt) + "/") + POPULATE_MAX_TRIES) + "): stage=") + (stageNull ? "NULL" : "ok")) + " debugScReady=") + (stageNull ? "-" : (scReady ? "ok" : "FALSE(sc/debug.sc not parsed)"))) + " addFileFired=") + _addFileFired));
        }
        if ((attempt < POPULATE_MAX_TRIES)) {
            setTimeout(FUNC_<null-atom>, POPULATE_RETRY_MS);
            return;
        }
        populating = false;
        pmile((((((("populate GAVE UP after " + POPULATE_MAX_TRIES) + " tries (~") + ((POPULATE_MAX_TRIES * POPULATE_RETRY_MS) / 1000)) + "s) \u2014 GUI will NOT build this round. addFileFired=") + _addFileFired) + " (false \u21d2 menu resource never injected)"));
        return;
    }
    stageInstance = stage;
    try {
        gphase((("populate (try " + attempt) + ")"));
        gtrace((("stage=" + gptr(stage)) + " debugScReady=ok"));
        pmile((((("populate STARTING (try " + attempt) + ", bootHookFire #") + _bootHookFires) + ") \u2014 building feature column"));
        if (_stageAtLeast(6)) {
            initDebugTextElements();
        } else {
            stageInstance = stage;
            pmile("stage<6 \u2014 skipping HUD feature column");
        }
        gtrace((((("initDebugTextElements done; scheduling Pbtn@" + DBG_BTN_BUILD_MS) + "ms, prebuild@") + (DBG_BTN_BUILD_MS + 400)) + "ms"));
        populatedAlredy = true;
        pmile((((("populate SUCCEEDED \u2014 feature column up; P-button @+" + DBG_BTN_BUILD_MS) + "ms, labels @+") + (DBG_BTN_BUILD_MS + 400)) + "ms"));
        setTimeout(FUNC_<null-atom>, DBG_BTN_BUILD_MS);
        setTimeout(FUNC_<null-atom>, DBG_BTN_REFIT_MS);
        if (_stageAtLeast(7)) {
            setTimeout(FUNC_<null-atom>, (DBG_BTN_BUILD_MS + 400));
        }
        setTimeout(FUNC_<null-atom>, 2000);
        return;
    } catch (e) {
        console.log(((("[prism-gui] populate failed (try " + attempt) + "): ") + e));
    }
}
// ---- line 1899 ----
function anon1899() {
    return tryPopulateGui((attempt + 1));
}
// ---- line 1919 ----
function anon1919() {
    try {
        showDbgBtn();
        pmile((("P-button BUILT + shown (enabled=" + debugButtonEnabled) + ")"));
        return;
    } catch (e) {
        pmile(("P-button build FAILED: " + e));
        try {
            console.log(("[prism-gui] dbgbtn build failed: " + e));
        } catch (_e) {
        }
    }
}
// ---- line 1931 ----
function anon1931() {
    return refitDbgBtnText();
}
// ---- line 1932 ----
function anon1932() {
    try {
        prebuildCfgLabels();
        return;
    } catch (e) {
        pmile(("prebuild labels FAILED: " + e));
        try {
            console.log(("[prism-gui] prebuild labels failed: " + e));
        } catch (_e) {
        }
    }
}
// ---- line 1943 ----
function anon1943() {
    showFloater("Prism Client Loaded \nscript: v6.4.3 \ndsc.gg/prismclient");
    return;
}
// ---- line 1951 ----
function anon1951() {
    return tryPopulateGui((attempt + 1));
}

// --------------------------------------------------------------------------
// module body (src/gui/Debug+Toggles.js)
// --------------------------------------------------------------------------
// ---- line 1957 ----
function anon1957() {
    init_node_globals();
    init_config();
    init_floatertext();
    init_persist();
    init_gradients();
    init_udpHook();
    init_connectionindicator();
    init_slider();
    init_runlog();
    PRISM_GRADIENT = [4278239231, 4282441936, 4286578644, 4282441936, 4278239231];
    base6 = Process.findModuleByName("libg.so").base;
    GUI_STAGE = 7;
    _stageAtLeast = FUNC_<null-atom>;
    populatedAlredy = false;
    populating = false;
    _addFileFired = false;
    _bootHookFires = 0;
    try {
        Memory.protect(base6, Process.findModuleByName("libg.so").size, "rwx");
    } catch (e) {
    }
    malloc4 = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
    StringCtor = new NativeFunction(base6.add(15293804), "pointer", ["pointer", "pointer"]);
    Sprite_Sprite = new NativeFunction(base6.add(13389500), "void", ["pointer", "int"]);
    ResourceManager_getMovieClip = new NativeFunction(base6.add(13125444), "pointer", ["pointer", "pointer"]);
    Stage_addChild2 = new NativeFunction(base6.add(13414284), "pointer", ["pointer", "pointer"]);
    movieClipsettext = new NativeFunction(base6.add(13529304), "void", ["pointer", "pointer", "pointer"]);
    GameMain_loadAsset = new NativeFunction(base6.add(5058140), "void", ["pointer", "int"]);
    StringTable_getMovieClip2 = new NativeFunction(base6.add(13125444), "pointer", ["pointer", "pointer"]);
    TextField_setText = new NativeFunction(base6.add(6071108), "pointer", ["pointer", "pointer", "bool"]);
    GameButton_GameButton = new NativeFunction(base6.add(6069488), "void", ["pointer"]);
    ResourceListener_addFile = new NativeFunction(base6.add(13840264), "void", ["pointer", "pointer", "pointer"]);
    dropGUIContainer_DropGUIContainer = base6.add(6074680);
    DisplayObject_setPixelSnappedXY = new NativeFunction(base6.add(13293704), "pointer", ["pointer", "float", "float"]);
    MovieClip_gotoAndStop = new NativeFunction(base6.add(13317696), "void", ["pointer", "int"]);
    TOGGLE_FRAME_OFF = 1;
    TOGGLE_FRAME_ON = 0;
    MC_CHILD_OBJS = 144;
    MC_CHILD_NAMES = 152;
    MC_CHILD_COUNT = 192;
    TOGGLE_INNER_TEXT_RE = /\u0002\u0001\u0000w\u0000\u0000\u0000\b\u0006\u0000\u0000\u0000\u0004\u0007\ufffd\ufffd\ufffd\ufffd\u000b\u0000\tV\u0000\u0000\u0000\t=\u0000\u0000\u0000\t$\u0000\u0000\u0000\t\u0011\u0000\u0000\u0000\u0001T\u0000\u0001E\u0000\u0001X\u0000\u0001T\u0000\u0007\t\u0000\u0000\u0000\u0001T\u0000\u0001X\u0000\u0001T\u0000\u0007\u000f\u0000\u0000\u0000\u0001L\u0000\u0001A\u0000\u0001B\u0000\u0001E\u0000\u0001L\u0000\u0007\u000f\u0000\u0000\u0000\u0001T\u0000\u0001I\u0000\u0001T\u0000\u0001L\u0000\u0001E\u0000\u0007\f\u0000\u0000\u0000\u0001N\u0000\u0001A\u0000\u0001M\u0000\u0001E\u0000\f\u0000\n/;
    _togChildrenLogged = {};
    _togDumpCount = 0;
    GUI_OBJ_SIZE = 4096;
    GUI_TRACE = true;
    _gtSeq = 0;
    _gtPhase = "boot";
    _gtT0 = Date.now();
    pmile((("GUI_STAGE = " + GUI_STAGE) + " (0=off 1=Pbtn 2=window 3=tabs 4=toggles 5=sliders 6=HUD 7=full)"));
    STAGE_LOGICAL_W_OFF = 420;
    STAGE_LOGICAL_H_OFF = 416;
    MENU_EXPORT = "debug_switches_window";
    MENU_ANCHOR = "topcenter";
    MENU_SCALE = 1.125;
    MENU_SCALE_W = 1.3;
    MENU_SCALE_H = 1.4;
    MENU_ASPECT = 0.7;
    MENU_DESIGN_W = 255;
    MENU_ALPHA = 0.85;
    MENU_DX = 0;
    MENU_DY = 0;
    CAT_EXPORT = "debug_menu_item_small";
    SWAP_PAD_X = -133;
    SWAP_TOP_PAD = 46;
    SWAP_SPACING = 39;
    SWAP_ALPHA = 0.75;
    SLIDER_SCALE = 0.7;
    SLIDER_TITLE_DX = 4;
    SLIDER_TITLE_DY = -93;
    SLIDER_TITLE_SCALE = 0.7;
    CFG_SLIDERS_DX = 30;
    CFG_SLIDERS_DY = -50;
    CFG_TOGGLES_DX = 0;
    CFG_TOGGLES_DY = 0;
    {}.dx = 0;
    {}.dy = 50;
    {}.tdx = 0;
    {}.tdy = 0;
    {}.Aimbot = {};
    {}.dx = 0;
    {}.dy = 40;
    {}.tdx = 0;
    {}.tdy = 0;
    {}.Dodge = {};
    {}.dx = 0;
    {}.dy = 0;
    {}.tdx = 0;
    {}.tdy = 0;
    {}.Killaura = {};
    {}.dx = 0;
    {}.dy = 0;
    {}.tdx = 0;
    {}.tdy = 0;
    {}.Utils = {};
    {}.dx = 0;
    {}.dy = 0;
    {}.tdx = 0;
    {}.tdy = 0;
    {}.HUD = {};
    CFG_CATEGORY_OFFSET = {};
    CFG_CAT_TITLE_SCALE = 1;
    CFG_CAT_TITLE_DY = 8;
    CFG_SLIDER_LIMIT = 6969;
    SLIDER_TEXT_MS = 60;
    DBG_BTN_BUILD_MS = 1200;
    DBG_BTN_REFIT_MS = 3200;
    String.prototype.ptr = FUNC_<null-atom>;
    String.prototype.scptr = FUNC_<null-atom>;
    xPtr = 32;
    yPtr = 36;
    heightPtr = 16;
    widthPtr = 28;
    OFF_VISIBLE = 8;
    OFF_ALPHA = 12;
    OFF_CHILD_COUNT = 78;
    HIDE_XY = 9999;
    textObjects = [];
    debugTextElements = {};
    {}.connectionindicator = config.connectionIndicator.enabled;
    {}.holdtoshoot = config.holdToShoot.enabled;
    {}.autocharge = config.autoCharge.enabled;
    {}.showammo = config.showEnemyAmmo.enabled;
    {}.autododge = config.dodge.enabled;
    {}.autoshoot = config.autoShoot.enabled;
    {}.autoulti = config.autoUlti.enabled;
    {}.autospin = config.autospin.enabled;
    {}.antiafk = config.antiAFK.enabled;
    {}.aimbot = config.aimbot.enabled;
    {}.pingdisplay = config.pingDisplay.enabled;
    {}.ipdisplay = config.ipDisplay.enabled;
    {}.featuredisplay = true;
    featureStates = {};
    {}.label = "Conn. Indicator";
    {}.x = 74;
    {}.connectionindicator = {};
    {}.label = "Hold to Shoot";
    {}.x = 65;
    {}.holdtoshoot = {};
    {}.label = "Auto Charge";
    {}.x = 60;
    {}.autocharge = {};
    {}.label = "Auto Dodge";
    {}.x = 58;
    {}.autododge = {};
    {}.label = "Auto Shoot";
    {}.x = 56;
    {}.autoshoot = {};
    {}.label = "Show Ammo";
    {}.x = 60;
    {}.showammo = {};
    {}.label = "Auto Ultim";
    {}.x = 54;
    {}.autoulti = {};
    {}.label = "Auto Spin";
    {}.x = 51;
    {}.autospin = {};
    {}.label = "Anti AFK";
    {}.x = 48;
    {}.antiafk = {};
    {}.label = "Aimbot";
    {}.x = 41;
    {}.aimbot = {};
    {}.label = "Ping";
    {}.x = 30;
    {}.pingdisplay = {};
    {}.label = "IP";
    {}.x = 21;
    {}.ipdisplay = {};
    featureLabels = {};
    TITLE_X = 107;
    TITLE_Y = 26;
    TITLE_SCALE = 1.3;
    FEATURE_START_Y = 48;
    FEATURE_SPACING = 18;
    FEATURE_SCALE = 0.8;
    PING_X = 245;
    PING_Y = 25;
    IP_X = 245;
    IP_Y = 9;
    pingHUD = null;
    ipHUD = null;
    inBattle = false;
    debugButtons = [];
    debugCategorys = [];
    openedCatName = "";
    // module entry: init
    // module entry: setTitle
    // module entry: createCategory
    // module entry: addDebugMenuButton
    // module entry: addToggle
    // module entry: closeCategoryAndButtons
    // module entry: openCategory
    debugMenuBase = NativeFunction;
    menuBox = null;
    CFG_TOGGLE_LABEL_DX = 26;
    CFG_TOGGLE_LABEL_DY = -6;
    {}.label = "Enabled";
    {}.path = "dodge.enabled";
    {}.x = 420;
    {}.y = (225 - 8);
    {}.label = "Curveball";
    {}.path = "dodge.spikeCurveball";
    {}.on = true;
    {}.off = false;
    {}.x = 420;
    {}.y = (257 - 4);
    {}.label = "Adv Walls";
    {}.path = "dodge.wallMode";
    {}.on = "full";
    {}.off = "simple";
    {}.x = 420;
    {}.y = 289;
    {}.toggles = [{}, {}, {}];
    {}.label = "Esc Dirs";
    {}.path = "dodge.escapeDirections";
    {}.min = 8;
    {}.max = 48;
    {}.dec = 0;
    {}.x = 45;
    {}.y = 165;
    {}.label = "React Slack";
    {}.path = "dodge.reactionSlackFrames";
    {}.min = 0;
    {}.max = 4;
    {}.dec = 1;
    {}.x = 45;
    {}.y = 220;
    {}.label = "Urgency";
    {}.path = "dodge.interventionUrgency";
    {}.min = 1;
    {}.max = 10;
    {}.dec = 1;
    {}.x = 45;
    {}.y = 275;
    {}.infAtMax = true;
    {}.label = "Intent";
    {}.path = "dodge.intentInfluence";
    {}.min = 0;
    {}.max = 0.5;
    {}.dec = 2;
    {}.x = 45;
    {}.y = 330;
    {}.label = "Radius Pad";
    {}.path = "dodge.radiusPadding";
    {}.min = 0;
    {}.max = 300;
    {}.dec = 0;
    {}.x = 235;
    {}.y = 165;
    {}.label = "Range Pad";
    {}.path = "dodge.rangePadding";
    {}.min = 0;
    {}.max = 600;
    {}.dec = 0;
    {}.x = 235;
    {}.y = 220;
    {}.label = "Speed Pad";
    {}.path = "dodge.speedPadding";
    {}.min = 0;
    {}.max = 900;
    {}.dec = 0;
    {}.x = 235;
    {}.y = 275;
    {}.label = "Hit Slack";
    {}.path = "dodge.tickHitSlack";
    {}.min = 0;
    {}.max = 2;
    {}.dec = 2;
    {}.x = 235;
    {}.y = 330;
    {}.sliders = [{}, {}, {}, {}, {}, {}, {}, {}];
    {}.Dodge = {};
    {}.label = "Enabled";
    {}.path = "aimbot.enabled";
    {}.x = 420;
    {}.y = ((225 - 27) - 12);
    {}.label = "Juke";
    {}.path = "aimbot.jukePredict.enabled";
    {}.x = 420;
    {}.y = ((257 - 27) - 8);
    {}.label = "Reactive";
    {}.path = "aimbot.jukePredict.reactive";
    {}.x = 420;
    {}.y = ((289 - 27) - 4);
    {}.label = "Curve";
    {}.path = "aimbot.curvePredict.enabled";
    {}.x = 420;
    {}.y = (321 - 27);
    {}.toggles = [{}, {}, {}, {}];
    {}.label = "Predict";
    {}.path = "aimbot.predictionStrength";
    {}.min = 0;
    {}.max = 2;
    {}.dec = 2;
    {}.x = 45;
    {}.y = 165;
    {}.label = "Lead Time";
    {}.path = "aimbot.maxLeadTime";
    {}.min = 0;
    {}.max = 2;
    {}.dec = 2;
    {}.x = 45;
    {}.y = 220;
    {}.label = "Smoothing";
    {}.path = "aimbot.velocitySmoothing";
    {}.min = 0;
    {}.max = 0.9;
    {}.dec = 2;
    {}.x = 45;
    {}.y = 275;
    {}.label = "Pos Samples";
    {}.path = "aimbot.lastpositionsLen";
    {}.min = 3;
    {}.max = 12;
    {}.dec = 0;
    {}.x = 235;
    {}.y = 165;
    {}.label = "Juke Bias";
    {}.path = "aimbot.jukePredict.bias";
    {}.min = 0;
    {}.max = 1;
    {}.dec = 2;
    {}.x = 235;
    {}.y = 220;
    {}.label = "Deadzone";
    {}.path = "aimbot.deadzoneSpeed";
    {}.min = 0;
    {}.max = 400;
    {}.dec = 0;
    {}.x = 235;
    {}.y = 275;
    {}.sliders = [{}, {}, {}, {}, {}, {}];
    {}.Aimbot = {};
    {}.text = "Coming Soon";
    {}.x = 186;
    {}.y = 120;
    {}.scale = 1.3;
    {}.texts = [{}];
    {}.label = "Auto Shoot";
    {}.path = "autoShoot.enabled";
    {}.feature = "autoshoot";
    {}.x = (50 - 15);
    {}.y = 170;
    {}.label = "Hold to Shoot";
    {}.path = "holdToShoot.enabled";
    {}.feature = "holdtoshoot";
    {}.x = (170 - 15);
    {}.y = 170;
    {}.label = "Auto Ulti";
    {}.path = "autoUlti.enabled";
    {}.feature = "autoulti";
    {}.x = (300 - 15);
    {}.y = 170;
    {}.toggles = [{}, {}, {}];
    {}.Killaura = {};
    {}.label = "Ping";
    {}.path = "pingDisplay.enabled";
    {}.feature = "pingdisplay";
    {}.x = 80;
    {}.y = (65 + 20);
    {}.label = "IP";
    {}.path = "ipDisplay.enabled";
    {}.feature = "ipdisplay";
    {}.x = 80;
    {}.y = (105 + 20);
    {}.label = "Conn. Indicator";
    {}.path = "connectionIndicator.enabled";
    {}.feature = "connectionindicator";
    {}.x = 80;
    {}.y = (145 + 20);
    {}.label = "Feature Display";
    {}.feature = "featuredisplay";
    {}.x = 80;
    {}.y = (185 + 20);
    {}.toggles = [{}, {}, {}, {}];
    {}.HUD = {};
    {}.label = "Spin Speed";
    {}.path = "autospin.speed";
    {}.min = 1;
    {}.max = 50;
    {}.dec = 0;
    {}.x = 80;
    {}.y = 260;
    {}.sliders = [{}];
    {}.label = "Auto Spin";
    {}.path = "autospin.enabled";
    {}.feature = "autospin";
    {}.x = 80;
    {}.y = 165;
    {}.label = "Show Ammo";
    {}.path = "showEnemyAmmo.enabled";
    {}.feature = "showammo";
    {}.x = 290;
    {}.y = 110;
    {}.label = "Anti AFK";
    {}.path = "antiAFK.enabled";
    {}.feature = "antiafk";
    {}.x = 290;
    {}.y = 150;
    {}.label = "Auto Charge";
    {}.path = "autoCharge.enabled";
    {}.feature = "autocharge";
    {}.x = 290;
    {}.y = 190;
    {}.label = "Upload Last Log";
    {}.action = "uploadLog";
    {}.x = 290;
    {}.y = 230;
    {}.toggles = [{}, {}, {}, {}, {}];
    {}.Utils = {};
    CFG = {};
    cfgBuilt = {};
    cfgToggles = [];
    catTitleLabel = null;
    debugMenu = null;
    debugMenuMovieClip = null;
    debugButton = null;
    debugButtonMovieClip = null;
    debugButtonEnabled = false;
    dbgBtnX = 10;
    dbgBtnY = 600;
    dbgBtnHeight = 1;
    dbgBtnWidth = 1;
    menuOpened = false;
    {}.Auto Dodge = "autododge";
    {}.Aimbot = "aimbot";
    {}.Auto Shoot = "autoshoot";
    {}.Auto Ulti = "autoulti";
    {}.Hold to Shoot = "holdtoshoot";
    {}.Auto Charge = "autocharge";
    {}.Auto Spin = "autospin";
    {}.Connection Indicator = "connectionindicator";
    {}.Show Ammo = "showammo";
    {}.Anti AFK = "antiafk";
    {}.Feature Display = "featuredisplay";
    {}.Ping = "pingdisplay";
    {}.IP = "ipdisplay";
    BTN_FEATURE_KEYS = {};
    // module entry: onEnter
    NativeFunction.Interceptor(.attach, base6.add(13525780));
    addfileattach = null;
    _scInjectArmed = false;
    POPULATE_RETRY_MS = 200;
    POPULATE_MAX_TRIES = 150;
    // module entry: onLeave
    NativeFunction.Interceptor(.attach, base6.add(10242736));
    pmile("bootstrap hook ARMED @0x009C4AB0 (GUI populate trigger installed)");
    // module entry: onLeave
    NativeFunction.Interceptor(.attach, base6.add(10204192));
    // module entry: onLeave
    return;
}
// ---- line 1970 ----
function anon1970(n) {
    return (GUI_STAGE >= n);
}
// ---- line 2047 ----
function anon2047() {
    this = this;
    return Memory.allocUtf8String(this.toString());
}
// ---- line 2050 ----
function anon2050() {
    this = this;
    let pointer;
    pointer = malloc4(30);
    StringCtor(pointer, this.ptr());
    return pointer;
}
// ---- line 2136 ----
function anon2136(instance, sc, exportname) {
    let exportname;
    let sc;
    let instance;
    instance = instance;
    /* @13 ?? ('unknown', 'UN_0xf5', 13) */
    if (sc) {
        sc = "sc/debug.sc";
    }
    sc = sc;
    /* @26 ?? ('unknown', 'UN_0xf5', 26) */
    if (exportname) {
        exportname = MENU_EXPORT;
    }
    exportname = exportname;
    Sprite_Sprite(instance, 1);
    movieClip = StringTable_getMovieClip2(strPtr(sc), strPtr(exportname));
    gtrace(((((("window.init: instance=" + gptr(instance)) + " getMC(") + exportname) + ")=") + gptr(movieClip)));
    if ((!(movieClip) || movieClip.isNull())) {
        throw new Error(((sc + " export missing: ") + exportname));
    }
    debugMenuMovieClip = movieClip;
    new NativeFunction(dropGUIContainer_DropGUIContainer, "void", ["pointer", "pointer"])(instance, movieClip);
    setHeightWidth(instance, 1, 1);
    hideObject(instance);
    return;
}
// ---- line 2147 ----
function anon2147(instance, title) {
    try {
        let tf;
        tf = MovieClip_getTextFieldByName(debugMenuMovieClip, strPtr("title"));
        if (tf) {
            if (!(tf.isNull())) {
                /* @66 ?? ('unknown', 'call', 66) */
            }
        }
    } catch (e) {
    }
    return;
}
// ---- line 2155 ----
function anon2155(name, exportName) {
    let exportName;
    let name;
    name = name;
    /* @10 ?? ('unknown', 'UN_0xf5', 10) */
    if (exportName) {
        exportName = "debug_menu_category";
    }
    exportName = exportName;
    instance = allocGuiObject();
    GameButton_GameButton(instance);
    movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr(exportName));
    gtrace(((((((("category '" + name) + "': btn=") + gptr(instance)) + " getMC(") + exportName) + ")=") + gptr(movieClip)));
    if ((!(movieClip) || movieClip.isNull())) {
        throw new Error(("sc/debug.sc export missing: " + exportName));
    }
    new NativeFunction(instance.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(instance, movieClip, 1);
    try {
        let catTf;
        catTf = MovieClip_getTextFieldByName(movieClip, strPtr("Text"));
        if (catTf) {
            if (!(catTf.isNull())) {
                /* @273 ?? ('unknown', 'call', 273) */
            }
        }
    } catch (e) {
    }
    TextField_setText(instance, scPtr("<c87cefa>".concat(name, "</c>")), 1);
    hideObject(instance);
    {}.ins = instance;
    {}.name = name;
    return {};
}
// ---- line 2171 ----
function anon2171(name, category, exportName) {
    let exportName;
    let category;
    let name;
    name = name;
    category = category;
    /* @15 ?? ('unknown', 'UN_0xf5', 15) */
    if (exportName) {
        exportName = "debug_menu_item";
    }
    exportName = exportName;
    instance = allocGuiObject();
    GameButton_GameButton(instance);
    movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr(exportName));
    if ((!(<under>) || movieClip.isNull())) {
        throw new Error(("sc/debug.sc export missing: " + exportName));
    }
    new NativeFunction(instance.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(instance, movieClip, 1);
    try {
        let btnTf;
        btnTf = MovieClip_getTextFieldByName(movieClip, strPtr("Text"));
        if (btnTf) {
            if (!(btnTf.isNull())) {
                /* @231 ?? ('unknown', 'call', 231) */
            }
        }
    } catch (e) {
    }
    TextField_setText(instance, scPtr("<c87cefa>".concat(name, "</c>")), 1);
    hideObject(instance);
    {}.ins = instance;
    {}.cat = category;
    {}.name = name;
    return {};
}
// ---- line 2189 ----
function anon2189(name, category, initial, exportName) {
    let exportName;
    let initial;
    let category;
    let name;
    name = name;
    category = category;
    /* @18 ?? ('unknown', 'UN_0xf5', 18) */
    if (initial) {
        initial = false;
    }
    initial = initial;
    /* @27 ?? ('unknown', 'UN_0xf5', 27) */
    if (exportName) {
        exportName = "debug_togglebutton";
    }
    exportName = exportName;
    instance = allocGuiObject();
    GameButton_GameButton(instance);
    movieClip = StringTable_getMovieClip2(strPtr("sc/debug.sc"), strPtr(exportName));
    gtrace(((((((((("toggle '" + name) + "': btn=") + gptr(instance)) + " getMC(") + exportName) + ")=") + gptr(movieClip)) + " init=") + !(!(initial))));
    if ((!(movieClip) || movieClip.isNull())) {
        throw new Error(("sc/debug.sc export missing: " + exportName));
    }
    new NativeFunction(instance.readPointer().add(360).readPointer(), "void", ["pointer", "pointer", "bool"])(instance, movieClip, 1);
    {}.ins = instance;
    {}.mc = movieClip;
    {}.cat = category;
    {}.name = name;
    {}.isToggle = true;
    {}.state = !(!(initial));
    tog = {};
    setToggleVisual(tog, tog.state);
    hideObject(instance);
    return tog;
}
// ---- line 2201 ----
function anon2201() {
    openedCatName = "";
    for (const x of debugCategorys) {
        hideObject(x.ins);
    }
    for (const x in debugButtons) {
        hideObject(debugButtons[x].ins);
    }
    debugButtons = [];
    debugCategorys = [];
    return;
}
// ---- line 2208 ----
function anon2208(category) {
    openedCatName = category;
    return;
}
// ---- line 2326 ----
function anon2326(args) {
    try {
        let pressed;
        pressed = args[0];
        let cat;
        for (const cat of debugCategorys) {
            if (!(cat.ins)) continue;
            if (!(pressed.equals(cat.ins))) continue;
            gphase(("tab\u2192" + cat.name));
            debugMenuBase.openCategory(cat.name);
        }
        let btn;
        for (const btn of debugButtons) {
            if (!(btn.ins)) continue;
            if (!(pressed.equals(btn.ins))) continue;
            let key;
            key = BTN_FEATURE_KEYS[btn.name];
            if (!(key)) continue;
            toggleFeature(key, !(featureStates[key]));
        }
        let c;
        for (const c of cfgToggles) {
            if (!(c.tog.ins)) continue;
            if (!(pressed.equals(c.tog.ins))) continue;
            let nowOn;
            if (c.spec.action) {
                runCfgAction(c);
            } else {
                nowOn = !(cfgIsOn(c));
                if (c.spec.feature) {
                    toggleFeature(c.spec.feature, nowOn);
                } else {
                    cfgSet(c.spec.path, (nowOn ? c.onV : c.offV));
                }
                c.tog.state = nowOn;
                setToggleVisual(c.tog, nowOn);
                dumpToggleSubtree(c.tog);
                try {
                    console.log(((("[prism-cfg] " + c.spec.label) + " = ") + (c.spec.feature ? featureStates[c.spec.feature] : cfgGet(c.spec.path))));
                    continue;
                } catch (e) {
                }
            }
        }
        if (debugButton) {
            if (pressed.equals(debugButton)) {
                let willOpen;
                willOpen = !(menuOpened);
                gphase((willOpen ? "P-press \u2192 OPEN" : "P-press \u2192 CLOSE"));
                menuOpened = willOpen;
                if (!(_stageAtLeast(2))) {
                    pmile("stage<2 \u2014 P press acknowledged, menu NOT built");
                    return <under>;
                }
                setTimeout(FUNC_<null-atom>, 0);
            }
        }
        return;
    } catch (e) {
        console.log(("[prism-gui] button handler error: " + e));
    }
}
// ---- line 2367 ----
function anon2367() {
    try {
        return;
    } catch (e) {
    }
}
// ---- line 2398 ----
function anon2398() {
    _bootHookFires = _bootHookFires;
    if ((populatedAlredy || populating)) {
        if (((_bootHookFires <= 3) || ((_bootHookFires % 100) === 0))) {
            pmile((((("bootstrap hook fire #" + _bootHookFires) + " \u2014 skip (") + (populatedAlredy ? "already populated" : "populate in progress")) + ")"));
        }
        return;
    }
    pmile((((("bootstrap hook FIRST fire #" + _bootHookFires) + " @0x009C4AB0 \u2014 starting populate (addFileFired=") + _addFileFired) + ")"));
    armScInject();
    populating = true;
    return;
}
// ---- line 2414 ----
function anon2414() {
    inBattle = true;
    if (pingHUD) {
        if (config.pingDisplay.enabled) {
            showGradientMenuText(pingHUD, "Ping: --ms");
        }
    }
    if (ipHUD) {
        if (config.ipDisplay.enabled) {
            showGradientMenuText(ipHUD, IP);
        }
    }
    return;
}
// ---- line 2422 ----
function anon2422() {
    inBattle = false;
    if (pingHUD) {
        hideMenuText(pingHUD);
    }
    if (ipHUD) {
        hideMenuText(ipHUD);
    }
    return;
}
