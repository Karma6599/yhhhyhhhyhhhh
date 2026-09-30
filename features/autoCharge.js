import "frida-builtins:/node-globals.js";
import "../config.js";

var base = Module.findBaseAddress("libg.so");
var malloc = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);

var ClientInputManager_addInput = new NativeFunction(base.add(8318548), "void", ["pointer", "pointer"]);

var BattleMode_getInstance = new NativeFunction(base.add(10197860), "pointer", ["pointer"]);
var ClientInput_constructor = new NativeFunction(base.add(12470332), "void", ["pointer", "int"]);

var LogicBattleModeClient_getOwnCharacter = new NativeFunction(base.add(12722116), "pointer", ["pointer"]);
var LogicGameObjectClient_getData = new NativeFunction(base.add(11912824), "pointer", ["pointer"]);
var LogicData_getName = new NativeFunction(base.add(11283052), "pointer", ["pointer"]);

class NativeString {
  static toJSString(stringPtr) {
    if (!stringPtr || stringPtr.isNull()) return "";
    try {
      let len = stringPtr.add(4).readInt();
      if (len === 0) return "";
      if (len > 7) return stringPtr.add(8).readPointer().readUtf8String(len);
      return stringPtr.add(8).readUtf8String(len);
    } catch (e) {
      return "";
    }
  }
}

setInterval(() => {
  try {
    if (!config.autoCharge.enabled) return;
    let battleInstance = BattleMode_getInstance(ptr(0));
    if (battleInstance.isNull() || battleInstance == ptr(16)) return;
    let logicBattleModeClient = battleInstance.add(40).readPointer();
    if (logicBattleModeClient.isNull()) return;
    let ownChar = LogicBattleModeClient_getOwnCharacter(logicBattleModeClient);
    if (ownChar.isNull()) return;
    let ownCharData = LogicGameObjectClient_getData(ownChar);
    if (ownCharData.isNull()) return;
    let brawlerName = NativeString.toJSString(LogicData_getName(ownCharData));
    if (!config.autoCharge.brawlers.includes(brawlerName)) return;
    let input = malloc(50);
    input.add(44).writeU8(69);
    ClientInput_constructor(input, 13);
    ClientInputManager_addInput(battleInstance.add(88).readPointer(), input);
  } catch (e) {
  }
}, 150);
