import "frida-builtins:/node-globals.js";
import "../config.js";

var base = Module.getBaseAddress("libg.so");
var Character_updateHealthBar = new NativeFunction(base.add(5420332), "void", ["pointer", "float"]);

var ammoBarOffset = 2872;

Interceptor.replace(base.add(5420332), new NativeCallback(function (character, time) {
  Character_updateHealthBar(character, time);
  let ammoBar = character.add(ammoBarOffset).readPointer();
  if (!ammoBar.isNull()) {
    ammoBar.add(Process.pointerSize).writeU8(config.showEnemyAmmo.enabled ? 1 : 0);
  }
}, "void", ["pointer", "float"]));
