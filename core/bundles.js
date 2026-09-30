// ============================================================================
// bundles.js — Prism Client v6.4.3 — bundle runtime + module registry + boot
// ============================================================================
//
// Manually reconstructed from prism-main.bc (119,526 bytes of custom-encrypted
// QuickJS bytecode). Every construct below was verified instruction-by-
// instruction against the raw bytecode of the top-level <eval> function
// (8,247 bytes) and its constant pool. Bytecode positions are cited as
// [bp NNNN]; constant-pool entries as eval.cpool[N].
//
// Original build path:
//   C:\Users\simon\Desktop\Prism\Builder\out\_cheat_src_android.js
//
// The original file is a FLAT esbuild-style bundle. Instead of giving each
// module its own closure, the builder flattened every module into the single
// top-level scope:
//
//   * module vars live in the bundle scope (name collisions get 2/3/4/5...
//     suffixes: base, base2, base3...; _open, _open2; MODE_0600, MODE_06002)
//   * module function declarations are hoisted to the top level (the eval's
//     prologue is ~3,480 bytes of define_var + define_func instructions)
//   * each module is registered as `var init_X = __esm({ "src/..."() {...} })`
//     where the method body holds only the module's side-effectful
//     statements
//   * the entry point runs at the end (boot sequence, bp 8217-8246)
//
// This file reconstructs everything that lives at bundle scope:
//   1. the esbuild runtime helpers        [bp 7128-7278]
//   2. the module registry, source order  [bp 7283-8212]
//   3. mlog() — boot log helper            eval.cpool[207], source line 4718
//   4. the async boot entry                eval.cpool[208], source line 4724
//
// Module bodies (the "src/..."() {...} methods) are reconstructed in their
// own files under ../features, ../ui, ../utils — the registration stubs
// below cross-reference them. The registry section also documents each
// module's imports (verified from the head of every module body).
// ============================================================================


// ============================================================================
// 1. esbuild runtime
//    [bp 7128-7218: the six Object method aliases]
//    [bp 7223-7278: the five helpers, each an arrow returning a closure]
// ============================================================================

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

// [bp 7223] eval.cpool[0] -> cpool[0][0] "src line 7"
// var __esm = (fn, res) => function __init() {
//   if (fn) {
//     res = fn[__getOwnPropNames(fn)[0]](fn = 0);
//   }
//   return res;
// };
//
// Byte-exact shape:
//   c3 get_var_ref0 (fn) / 1d dup / e8 if_false8 -> 20      ; if (!fn) skip
//   ...look up the single method of the { "src/..."() {...} } object by its
//   first own property name, call it exactly once, and zero `fn` inside the
//   argument slot (the `fn = 0` guard makes re-calls no-ops).
// The method is invoked with one dead argument (all module bodies are
// 0-arg), the call's return value is cached in `res` and returned forever
// after (lazy memoization).
var __esm = (fn, res) => function __init() {
  if (fn) {
    res = fn[__getOwnPropNames(fn)[0]](fn = 0);
  }
  return res;
};

// [bp 7235] eval.cpool[1] -> cpool[1][0] "src line 10"
// var __commonJS = (cb, mod) => function __require() {
//   if (!mod) {
//     mod = { exports: {} };
//     cb[__getOwnPropNames(cb)[0]](mod.exports, mod);
//   }
//   return mod.exports;
// };
//
// Byte-exact shape:
//   c3 get_var_ref0 (mod) / 1d dup / e9 if_true8 -> 31      ; if (mod) skip
//   9b object / 9b object / 61 define_field 'exports'        ; {exports:{}}
//   c7 set_var_ref0 (mod = ...) / 53 get_field 'exports'     ; (mod=...).exports
//   c3 get_var_ref0 (mod) / cd call2                         ; factory(exports, mod)
// The factory receives (exports, module) — exports first.
var __commonJS = (cb, mod) => function __require() {
  if (!mod) {
    mod = { exports: {} };
    cb[__getOwnPropNames(cb)[0]](mod.exports, mod);
  }
  return mod.exports;
};

// [bp 7247] eval.cpool[2] "src line 13" — 34 bytes, exact stock-esbuild form.
//   f0 get_arg1 (all) / 80 for_in_start / ea goto8 -> 29 (test)
//   4: e4 put_loc0 (name) / 3e get_var __defProp / ef get_arg0 (target) /
//   bb get_loc0 (name) / 9b object / f0 get_arg1 / bb get_loc0 /
//   29 get_array_el / 61 define_field 'get' / a8 push_true /
//   61 define_field 'enumerable' / ce call3 / 32 drop
//   29: 83 for_in_next / e8 if_false8 -> 4 / 32 drop / 01 return_undef
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// [bp 7259] eval.cpool[3] "src line 17" — 130 bytes, exact stock-esbuild form.
// Guard: `f0 get_arg1 (from) / 1d dup / e8 if_false8 -> 13 / 15 typeof /
// 07 push_atom 'object' / 14 eq_strict ... f4 typeof_is_function / e8 if_false8 -> 128`
// (the modded QuickJS folds `typeof from === "function"` into the
// typeof_is_function opcode 0xf4).
// Getter: eval.cpool[3][0] = () => from[key]  (6 bytes: c3 / 5c ref1 / 29 / 44)
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

// [bp 7271] eval.cpool[4] "src line 25" — 76 bytes, exact stock-esbuild form.
//   ef get_arg0 / 97 null / a7 neq / e8 if_false8 -> 20       ; mod != null
//   5: __create(__getProtoOf(mod)) : {} -> c1 put_arg2 (target)
//   22: get_var __copyProps / isNodeMode || !mod || !mod.__esModule
//       ? __defProp(target, "default", { value: mod, enumerable: true })
//       : target
//   76: 23 tail_call 2  __copyProps(that, mod)
var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);


// ============================================================================
// 2. Module registry — EXACT source order, verified from [bp 7283-8212]
// ============================================================================

// ---- frida-builtins:/node-globals.js ------------------------------------
// [bp 7283-7298] eval.cpool[5] — the module body is literally one `return`
// (1 byte, 0x01): the node-globals shim is empty because the QuickJS gadget
// already provides the globals. Reconstructed in core/nodeGlobals.js.
var init_node_globals = __esm({
  "frida-builtins:/node-globals.js"() {
  }
});

// ---- src/utils/runlog.js -------------------------------------------------
// [bp 7303-7304] var runlog_exports = {};
// [bp 7309-7368] __export call — getters are 6-byte closures
//   eval.cpool[6] @43 RUNLOG_ENABLED, [7] @44 initRunLog,
//   [8] @45 prevRunSize, [9] @46 uploadPrevRun
// [bp 7370-7385] registration — body = eval.cpool[21], 522 B, line 236
//   imports: init_node_globals()
// Module functions hoisted to bundle scope: _i, _u8len, _readFileText,
//   _pkgName, _rawWrite, _line, initRunLog, prevRunSize, _jsonStr,
//   _strBytes, uploadPrevRun (lines 48-235). See utils/runlog.js.
var runlog_exports = {};
__export(runlog_exports, {
  RUNLOG_ENABLED: () => RUNLOG_ENABLED,
  initRunLog: () => initRunLog,
  prevRunSize: () => prevRunSize,
  uploadPrevRun: () => uploadPrevRun
});
var init_runlog = __esm({
  "src/utils/runlog.js"() {
    // module body — reconstructed in utils/runlog.js
  }
});

// ---- src/config.js -------------------------------------------------------
// [bp 7390-7405] registration — body = eval.cpool[22], 384 B, line 271
//   imports: init_node_globals(); sets `config = { ...defaults }`
//   (cpool holds the float consts 0.4 / 0.8 / 0.9)
// No exports object. See utils/config.js.
var init_config = __esm({
  "src/config.js"() {
    // module body — reconstructed in utils/config.js
  }
});

// ---- src/utils/persist.js ------------------------------------------------
// [bp 7410-7411] var persist_exports = {};
// [bp 7416-7451] __export — eval.cpool[23] @377 loadConfig, [24] @378 scheduleSave
// [bp 7453-7468] registration — body = eval.cpool[36], 327 B, line 515
//   imports: init_config()
// Module functions: _i2, _replacer, _reviver, _pkgName2, _utf8Len,
//   _readText, _writeTextAtomic, _mergeInto, loadConfig, _saveNow,
//   scheduleSave (lines 380-509). See utils/persist.js.
var persist_exports = {};
__export(persist_exports, {
  loadConfig: () => loadConfig,
  scheduleSave: () => scheduleSave
});
var init_persist = __esm({
  "src/utils/persist.js"() {
    // module body — reconstructed in utils/persist.js
  }
});

// ---- src/gui/floatertext.js ----------------------------------------------
// [bp 7473-7488] registration — body = eval.cpool[40], 240 B, line 547
//   no imports; binds libg directly (Module.findBaseAddress("libg.so"))
// Module functions: getStrPtr, getScPtr, showFloater (lines 534-546).
// See ui/floaterText.js.
var init_floatertext = __esm({
  "src/gui/floatertext.js"() {
    // module body — reconstructed in ui/floaterText.js
  }
});

// ---- src/utils/gradients.js ----------------------------------------------
// [bp 7493-7508] registration — body = eval.cpool[48], 757 B, line 651
//   no imports; binds libg (Process.findModuleByName("libg.so").base)
// Module functions: zalloc, _warnOnce, _makeSafeColumn, _buildCsvRow,
//   createGradient, applyGradientOnly, applyGradient (lines 558-647).
// See utils/gradients.js.
var init_gradients = __esm({
  "src/utils/gradients.js"() {
    // module body — reconstructed in utils/gradients.js
  }
});

// ---- src/mech/udpHook.js -------------------------------------------------
// [bp 7513-7514] var udpHook_exports = {};
// [bp 7519-7542] __export — eval.cpool[49] @722 IP
// [bp 7544-7559] registration — body = eval.cpool[51], 139 B, line 730
//   imports: init_Debug_Toggles()
// Module functions: readScString (line 724). See features/udpHook.js.
var udpHook_exports = {};
__export(udpHook_exports, {
  IP: () => IP
});
var init_udpHook = __esm({
  "src/mech/udpHook.js"() {
    // module body — reconstructed in features/udpHook.js
  }
});

// ---- src/gui/connectionindicator.js --------------------------------------
// [bp 7564-7565] var connectionindicator_exports = {};
// [bp 7570-7593] __export — eval.cpool[52] @752 setConnectionIndicatorLive
// [bp 7595-7610] registration — body = eval.cpool[54], 104 B, line 761
//   imports: init_config()
// See ui/connectionIndicator.js.
var connectionindicator_exports = {};
__export(connectionindicator_exports, {
  setConnectionIndicatorLive: () => setConnectionIndicatorLive
});
var init_connectionindicator = __esm({
  "src/gui/connectionindicator.js"() {
    // module body — reconstructed in ui/connectionIndicator.js
  }
});

// ---- src/gui/slider.js ---------------------------------------------------
// [bp 7615-7630] registration — body = eval.cpool[66], 933 B, line 1025
//   imports: init_node_globals(); then Process.getModuleByName("libg.so")
// No exports object. Module functions: u, _slStage, _notify,
//   _installVtableDriver, _armGlobalPump, _ensureUpdateHook, _hide, _log,
//   _sp, strace, createSlider (lines 785-1024). See ui/slider.js.
var init_slider = __esm({
  "src/gui/slider.js"() {
    // module body — reconstructed in ui/slider.js
  }
});

// ---- src/gui/Debug+Toggles.js — THE MOD MENU ------------------------------
// [bp 7636-7637] var Debug_Toggles_exports = {};
// [bp 7641-7676] __export — eval.cpool[67] @1068 setIPHUD, [68] @1069 setPingHUD
// [bp 7678-7693] registration — body = eval.cpool[134], 4762 B (the biggest
//   module), lines 1957-2432
//   imports: init_node_globals(), init_config(), init_floatertext(),
//             init_persist(), init_gradients(), init_slider() ...
// Module functions (lines 1071-1956): mcChildren, hideToggleInnerText,
//   _fieldLine, dumpToggleSubtree, setToggleVisual, allocGuiObject, gtrace,
//   gphase, gptr, pmile, stageCanvas, cfgCatOffset, getStrPtr2, strPtr,
//   scPtr, getScPtr2, setXY, setHeightWidth, setScaleXY, _vFloat, objWidth,
//   objHeight, setNodeVisible, hideObject, showObject, setObjAlpha,
//   createMenuText, showGradientMenuText, hideMenuText, setPingHUD,
//   setIPHUD, createDebugText, setPosition, hideText, showText,
//   updateFeaturePositions, toggleFeature, applyHudGradient,
//   initDebugTextElements, runCfgAction, cfgGet, cfgSet, fmtNum, cfgIsOn,
//   _showText, _hideText, createGradientLabel, paintValueLabel,
//   prebuildCfgLabels, makeCfgSlider, makeCfgToggle, buildCfgCategory,
//   buildAllCfg, hideAllCfg, layoutCfgControls, relayoutMenu, removeMenu,
//   _gdbg, openMenu, addDbgBtn, showDbgBtn, refitDbgBtnText, armScInject,
//   debugScReady, tryPopulateGui. See ui/modMenu.js.
var Debug_Toggles_exports = {};
__export(Debug_Toggles_exports, {
  setIPHUD: () => setIPHUD,
  setPingHUD: () => setPingHUD
});
var init_Debug_Toggles = __esm({
  "src/gui/Debug+Toggles.js"() {
    // module body — reconstructed in ui/modMenu.js
  }
});

// ---- src/gui/LoadingText.js — the only __commonJS module ------------------
// [bp 7698-7713] registration via __commonJS (not __esm!)
//   body = eval.cpool[135], 125 B, line 2433
//   imports: init_node_globals(); then Module.findBaseAddress("libg.so")
// See ui/loadingText.js.
var require_LoadingText = __commonJS({
  "src/gui/LoadingText.js"() {
    // module body — reconstructed in ui/loadingText.js
  }
});

// ---- src/mech/movement.js ------------------------------------------------
// [bp 7718-7719] var movement_exports = {};
// [bp 7724-7819] __export — eval.cpool[136] @2459 move, [137] moveDisable,
//   [138] moveEnable, [139] moveRelease, [140] moveStop, [141] p,
//   [142] userMoveAngle
// [bp 7821-7836] registration — body = eval.cpool[148], 247 B, line 2486
//   imports: init_node_globals()
// Module functions (lines 2467-2485): move, moveStop, moveRelease,
//   moveDisable, moveEnable (move() takes the target angle in degrees).
//   See features/movement.js.
var movement_exports = {};
__export(movement_exports, {
  move: () => move,
  moveDisable: () => moveDisable,
  moveEnable: () => moveEnable,
  moveRelease: () => moveRelease,
  moveStop: () => moveStop,
  p: () => p,
  userMoveAngle: () => userMoveAngle
});
var init_movement = __esm({
  "src/mech/movement.js"() {
    // module body — reconstructed in features/movement.js
  }
});

// ---- src/mech/projectiledetection.js --------------------------------------
// [bp 7842-7843] var projectiledetection_exports = {};
// [bp 7847-7942] __export — eval.cpool[149] @2576 getObjX, [150] getObjY,
//   [151] liveProjectiles, [152] observedProjectileRange,
//   [153] rangeExpiryNames, [154] spikeVariant, [155] state
// [bp 7944-7959] registration — body = eval.cpool[164], 2158 B, line 2673
//   imports: init_node_globals(), init_config()
// Module functions (lines 2584-2672): getObjX, getObjY,
//   recordObservedRange, detectSpikeVariant, normalizeAngle, calculateAngle,
//   fitParabolaFindZero, calculateTarget. See features/projectileDetection.js.
var projectiledetection_exports = {};
__export(projectiledetection_exports, {
  getObjX: () => getObjX,
  getObjY: () => getObjY,
  liveProjectiles: () => liveProjectiles,
  observedProjectileRange: () => observedProjectileRange,
  rangeExpiryNames: () => rangeExpiryNames,
  spikeVariant: () => spikeVariant,
  state: () => state
});
var init_projectiledetection = __esm({
  "src/mech/projectiledetection.js"() {
    // module body — reconstructed in features/projectileDetection.js
  }
});

// ---- src/mech/mapDetection.js ---------------------------------------------
// [bp 7964-7965] var mapDetection_exports = {};
// [bp 7970-7993] __export — eval.cpool[165] @3002 tileCache
// [bp 7995-8010] registration — body = eval.cpool[168], 780 B, line 3039
//   imports: init_node_globals(), init_config()
// Module functions (lines 3004-3038): buildTileCache, findTilePosition.
// See features/mapDetection.js.
var mapDetection_exports = {};
__export(mapDetection_exports, {
  tileCache: () => tileCache
});
var init_mapDetection = __esm({
  "src/mech/mapDetection.js"() {
    // module body — reconstructed in features/mapDetection.js
  }
});

// ---- src/mech/dodgeProfiles.js --------------------------------------------
// [bp 8015-8030] registration — body = eval.cpool[175], 502 B, line 3216
//   imports: init_node_globals(), init_config(), init_projectiledetection()
// No exports object. Module functions (lines 3133-3215): spikeModel,
//   registerProfile, getProfile, compileGeneric, finite, makeCrossProfile.
// See features/dodgeProfiles.js.
var init_dodgeProfiles = __esm({
  "src/mech/dodgeProfiles.js"() {
    // module body — reconstructed in features/dodgeProfiles.js
  }
});

// ---- src/mech/dodge.js — AUTO-DODGE ---------------------------------------
// [bp 8035-8036] var dodge_exports = {};   (empty — no __export call)
// [bp 8041-8056] registration — body = eval.cpool[191], 1072 B, line 3902
//   imports: init_node_globals(), init_config(), init_projectiledetection(),
//             init_mapDetection(), init_dodgeProfiles()
// Module functions (lines 3363-3901): tileStops, gridRaycast, losTruncate,
//   mapSpanUnits, compileProjectile, gatherHazards, discTest, mergeG,
//   capsuleTest, evalMotion, collectTangents, release, clearCommitment,
//   applyChoice, update. See features/autoDodge.js.
var dodge_exports = {};
var init_dodge = __esm({
  "src/mech/dodge.js"() {
    // module body — reconstructed in features/autoDodge.js
  }
});

// ---- src/mech/shooting.js — AIMBOT ----------------------------------------
// [bp 8061-8062] var shooting_exports = {};   (empty)
// [bp 8067-8082] registration — body = eval.cpool[201], 1820 B, line 4327
//   imports: init_node_globals(), init_config()
// Module functions (lines 4131-4326): clamp, hypot, regress, estimateAccel,
//   updateTracking, solveIntercept, computeAimPoint, applyAimbotConfig,
//   triggerShot. See features/aimbot.js.
var shooting_exports = {};
var init_shooting = __esm({
  "src/mech/shooting.js"() {
    // module body — reconstructed in features/aimbot.js
  }
});

// ---- src/mech/AutoCharge.js -----------------------------------------------
// [bp 8087-8088] var AutoCharge_exports = {};   (empty)
// [bp 8093-8108] registration — body = eval.cpool[202], 430 B, line 4573
//   imports: init_node_globals(), init_config()
// See features/autoCharge.js.
var AutoCharge_exports = {};
var init_AutoCharge = __esm({
  "src/mech/AutoCharge.js"() {
    // module body — reconstructed in features/autoCharge.js
  }
});

// ---- src/mech/frankexploit.js ---------------------------------------------
// [bp 8113-8114] var frankexploit_exports = {};   (empty)
// [bp 8119-8134] registration — body = eval.cpool[203], 96 B, line 4624
//   imports: init_config(); then Module.getBaseAddress("libg.so")
// See features/frankExploit.js.
var frankexploit_exports = {};
var init_frankexploit = __esm({
  "src/mech/frankexploit.js"() {
    // module body — reconstructed in features/frankExploit.js
  }
});

// ---- src/utils/antiAfk.js -------------------------------------------------
// [bp 8139-8140] var antiAfk_exports = {};   (empty)
// [bp 8145-8160] registration — body = eval.cpool[204], 424 B, line 4642
//   imports: init_config(); then Module.findBaseAddress("libg.so")
// See features/antiAfk.js.
var antiAfk_exports = {};
var init_antiAfk = __esm({
  "src/utils/antiAfk.js"() {
    // module body — reconstructed in features/antiAfk.js
  }
});

// ---- src/mech/enemyAmmo.js ------------------------------------------------
// [bp 8165-8166] var enemyAmmo_exports = {};   (empty)
// [bp 8171-8186] registration — body = eval.cpool[205], 162 B, line 4676
//   imports: init_config(); then Module.getBaseAddress("libg.so")
// See features/enemyAmmo.js.
var enemyAmmo_exports = {};
var init_enemyAmmo = __esm({
  "src/mech/enemyAmmo.js"() {
    // module body — reconstructed in features/enemyAmmo.js
  }
});

// ---- src/utils/ping.js ----------------------------------------------------
// [bp 8191-8192] var ping_exports = {};   (empty)
// [bp 8197-8212] registration — body = eval.cpool[206], 127 B, line 4696
//   imports: init_Debug_Toggles(); then Module.findBaseAddress("libg.so")
// See features/ping.js.
var ping_exports = {};
var init_ping = __esm({
  "src/utils/ping.js"() {
    // module body — reconstructed in features/ping.js
  }
});


// ============================================================================
// 3. mlog — boot log helper
//    eval.cpool[207], source line 4718 — declared right before the entry.
//    [bp 0-53]  try { console.log(...) }
//    [bp 54-62] catch (e) {}  — the catch block is intentionally empty
// ============================================================================

function mlog(msg) {
  try {
    console.log("[prism-ms] +" + (Date.now() - _bootT0) + "ms(boot) " + msg);
  } catch (e) {
  }
}


// ============================================================================
// 4. Boot entry — top-level statements of the eval + async IIFE
//    [bp 8217-8223]  init_node_globals();        (the entry's own import)
//    [bp 8224-8237]  var _bootT0 = Date.now();   (boot timestamp for mlog)
//    [bp 8242-8245]  (async () => { ... })();    (eval.cpool[208], 676 B)
// ============================================================================

init_node_globals();
var _bootT0 = Date.now();

// The import boundaries compile to a fixed pattern (verified at every one):
//
//     1f undefined            ; the neutralized `import()` expression
//     1d dup / f5 is_undef_or_null / e9 if_true8 -> <fallback>
//     (dead path: to_object(undefined).<binding>)
//     fallback: 32 drop / Promise.resolve() .then(<thunk>) / 8e await / goto
//
// i.e. `await (undefined ?? Promise.resolve().then(() => (init_x(), x_exports)))`
// — the builder lowered every `await import("./x.js")` to a microtask that
// runs the module's lazy wrapper and resolves to its namespace. The `A ?? B`
// short-circuit always takes the B path (A is the literal `undefined`), so
// the dead A path survives only as bytecode.
(async () => {
  const { initRunLog: initRunLog2 } = await (undefined ?? Promise.resolve().then(() => (init_runlog(), runlog_exports)));
  initRunLog2("6.4.3");
  mlog("cheat entry — waiting for libg.so");
  await new Promise((resolve) => {
    (function check() {
      if (Process.findModuleByName("libg.so")) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    })();
  });
  mlog("restoring saved config from disk");
  const { loadConfig: loadConfig2 } = await (undefined ?? Promise.resolve().then(() => (init_persist(), persist_exports)));
  loadConfig2();
  mlog("saved config restored");
  mlog("libg.so present — arming 0x009C4AB0 stage-ready hook NOW (win the race; sc/debug.sc inject is deferred to stage-ready inside)");
  await Promise.resolve().then(() => (init_Debug_Toggles(), Debug_Toggles_exports));
  mlog("GUI stage-ready hook armed — settling before the rest of the hooks");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("libg.so loaded, initializing...");
  mlog("settle done — importing remaining cheat modules");
  await Promise.resolve().then(() => __toESM(require_LoadingText()));
  await Promise.resolve().then(() => (init_movement(), movement_exports));
  await Promise.resolve().then(() => (init_projectiledetection(), projectiledetection_exports));
  await Promise.resolve().then(() => (init_mapDetection(), mapDetection_exports));
  await Promise.resolve().then(() => (init_dodge(), dodge_exports));
  await Promise.resolve().then(() => (init_shooting(), shooting_exports));
  await Promise.resolve().then(() => (init_AutoCharge(), AutoCharge_exports));
  await Promise.resolve().then(() => (init_frankexploit(), frankexploit_exports));
  await Promise.resolve().then(() => (init_udpHook(), udpHook_exports));
  await Promise.resolve().then(() => (init_connectionindicator(), connectionindicator_exports));
  await Promise.resolve().then(() => (init_antiAfk(), antiAfk_exports));
  await Promise.resolve().then(() => (init_enemyAmmo(), enemyAmmo_exports));
  await Promise.resolve().then(() => (init_ping(), ping_exports));
  mlog("all cheat modules imported");
  const { IP: IP2 } = await (undefined ?? Promise.resolve().then(() => (init_udpHook(), udpHook_exports)));
  console.log("Prism Client Loaded");
  console.log("Current IP: " + IP2);
})();


// ============================================================================
// VERIFICATION NOTES (how this file was checked against the bytecode)
// ============================================================================
//
// Opcode pins used throughout (mod byte -> semantics, proven by context):
//   d0 fclosure8 / 02 push_const   — cpool references
//   3e get_var / 3f put_var        — 5-byte atom operands
//   45 define_method / 61 define_field / 62 set_name / 53 get_field
//   54 get_field2 + 24 call_method — method-call form (this = receiver)
//   cb/cc/cd/ce call0..call3 / 21 call_constructor / 23 tail_call
//   9b object (starts object literal) / 07 push_atom_value (string consts)
//   da/db/dc/dd push_0..push_3    — pinned via _u8len's UTF-8 branches
//   1f undefined / 97 null / a8 push_true / 37 push_false
//   e8 if_false8 / e9 if_true8    — pinned via _u8len loop + __require guard
//   f5 is_undefined_or_null       — pinned via the ?? import pattern
//   8e await                      — pinned via `await new Promise(...)` sites
//   f4 typeof_is_function         — folded `typeof x === "function"`
//   96 special_object 2           — this-function (named fn-expr self ref)
//   57 set_loc_uninit / 5f close_loc — let/const TDZ bracket
//   95 ret_gen / 44 ret_op        — async vs plain return
//
// Structural facts verified:
//   * eval prologue [bp 0-7121]: one define_var per bundle-scope var (980
//     vars) and one define_func per hoisted module function (156 functions),
//     emitted in source order of the var statements
//   * runtime assignments [bp 7128-7278] — exact order:
//     __create, __defProp, __getOwnPropDesc, __getOwnPropNames, __getProtoOf,
//     __hasOwnProp (6 aliases), then __esm, __commonJS, __export, __copyProps,
//     __toESM (each: fclosure8 N / set_name / put_var)
//   * registry [bp 7283-8212]: 22 registrations in source order — 21 __esm
//     (call1, magic 63) + 1 __commonJS (LoadingText) — and 8 __export calls
//     (call2, magic 228) with 25 getters total, each a 6-byte `() => var`
//   * boot tail [bp 8217-8246]: init_node_globals() (call0), _bootT0 =
//     Date.now() (get_field2 'now' + call_method 0), then the async IIFE
//     (fclosure8 208 / call0); its completion value is the eval's result
//   * the async IIFE ends `1f undefined / 95 ret_gen` — implicit return
//
// Notable reverse-engineering finds in this file:
//   * the mod's QuickJS emits coalesce (`A ?? B`) with inverted branch
//     polarity compared to stock quickjs (if_true into the B path instead of
//     if_false over it) — both interpretations agree on semantics
//   * module wrappers keep their debug names (__init, __require, check) —
//     the bjson function-name field survives the custom serialization
//   * the boot imports udpHook twice: once mid-sequence (line 4751) and once
//     at the end (line 4757) to destructure `IP` for the final console.log
// ============================================================================
