var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __esm = (fn, res) => function __init() {
  if (fn) {
    res = fn[__getOwnPropNames(fn)[0]](fn = 0);
  }
  return res;
};

var __commonJS = (cb, mod) => function __require() {
  if (!mod) {
    mod = { exports: {} };
    cb[__getOwnPropNames(cb)[0]](mod.exports, mod);
  }
  return mod.exports;
};

var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

var init_node_globals = __esm({
  "frida-builtins:/node-globals.js"() {
  }
});

var runlog_exports = {};
__export(runlog_exports, {
  RUNLOG_ENABLED: () => RUNLOG_ENABLED,
  initRunLog: () => initRunLog,
  prevRunSize: () => prevRunSize,
  uploadPrevRun: () => uploadPrevRun
});
var init_runlog = __esm({
  "src/utils/runlog.js"() {

  }
});

var init_config = __esm({
  "src/config.js"() {

  }
});

var persist_exports = {};
__export(persist_exports, {
  loadConfig: () => loadConfig,
  scheduleSave: () => scheduleSave
});
var init_persist = __esm({
  "src/utils/persist.js"() {

  }
});

var init_floatertext = __esm({
  "src/gui/floatertext.js"() {

  }
});

var init_gradients = __esm({
  "src/utils/gradients.js"() {

  }
});

var udpHook_exports = {};
__export(udpHook_exports, {
  IP: () => IP
});
var init_udpHook = __esm({
  "src/mech/udpHook.js"() {

  }
});

var connectionindicator_exports = {};
__export(connectionindicator_exports, {
  setConnectionIndicatorLive: () => setConnectionIndicatorLive
});
var init_connectionindicator = __esm({
  "src/gui/connectionindicator.js"() {

  }
});

var init_slider = __esm({
  "src/gui/slider.js"() {

  }
});

var Debug_Toggles_exports = {};
__export(Debug_Toggles_exports, {
  setIPHUD: () => setIPHUD,
  setPingHUD: () => setPingHUD
});
var init_Debug_Toggles = __esm({
  "src/gui/Debug+Toggles.js"() {

  }
});

var require_LoadingText = __commonJS({
  "src/gui/LoadingText.js"() {

  }
});

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

  }
});

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

  }
});

var mapDetection_exports = {};
__export(mapDetection_exports, {
  tileCache: () => tileCache
});
var init_mapDetection = __esm({
  "src/mech/mapDetection.js"() {

  }
});

var init_dodgeProfiles = __esm({
  "src/mech/dodgeProfiles.js"() {

  }
});

var dodge_exports = {};
var init_dodge = __esm({
  "src/mech/dodge.js"() {

  }
});

var shooting_exports = {};
var init_shooting = __esm({
  "src/mech/shooting.js"() {

  }
});

var AutoCharge_exports = {};
var init_AutoCharge = __esm({
  "src/mech/AutoCharge.js"() {

  }
});

var frankexploit_exports = {};
var init_frankexploit = __esm({
  "src/mech/frankexploit.js"() {

  }
});

var antiAfk_exports = {};
var init_antiAfk = __esm({
  "src/utils/antiAfk.js"() {

  }
});

var enemyAmmo_exports = {};
var init_enemyAmmo = __esm({
  "src/mech/enemyAmmo.js"() {

  }
});

var ping_exports = {};
var init_ping = __esm({
  "src/utils/ping.js"() {

  }
});

function mlog(msg) {
  try {
    console.log("[prism-ms] +" + (Date.now() - _bootT0) + "ms(boot) " + msg);
  } catch (e) {
  }
}

init_node_globals();
var _bootT0 = Date.now();

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
