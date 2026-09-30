import "frida-builtins:/node-globals.js";
import "../config.js";

var base = Module.findBaseAddress("libg.so");
var malloc = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);

var ClientInputManager_addInput = new NativeFunction(base.add(8318548), "void", ["pointer", "pointer"]);

var BattleMode_getInstance = new NativeFunction(base.add(10197860), "pointer", ["pointer"]);
var ClientInput_constructor = new NativeFunction(base.add(12470332), "void", ["pointer", "int"]);

var LogicGameObjectClient_getX = new NativeFunction(base.add(11913624), "uint32", ["pointer"]);
var LogicGameObjectClient_getY = new NativeFunction(base.add(11913632), "uint32", ["pointer"]);
var LogicBattleModeClient_getOwnCharacter = new NativeFunction(base.add(12722116), "pointer", ["pointer"]);

Interceptor.attach(base.add(8837472), {
  onLeave(retval) {
    if (retval == 1 && config.antiAFK.enabled) {
      let battleInstance = BattleMode_getInstance(ptr(0));
      let logicBattleModeClient = battleInstance.add(40).readPointer();
      let input = malloc(64);
      let ownGameObject = LogicBattleModeClient_getOwnCharacter(logicBattleModeClient);
      ClientInput_constructor(input, 2);
      input.add(18).writeInt(LogicGameObjectClient_getX(ownGameObject));
      input.add(16).writeInt(LogicGameObjectClient_getY(ownGameObject));
      ClientInputManager_addInput(battleInstance.add(88).readPointer(), input);
      retval.replace(0);
    }
  }
});
