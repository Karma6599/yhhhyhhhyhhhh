import "frida-builtins:/node-globals.js";
import { setPingHUD } from "../gui/Debug+Toggles.js";

var base = Module.findBaseAddress("libg.so");
var BattleMode_getInstance = new NativeFunction(base.add(10197860), "pointer", ["pointer"]);

Interceptor.attach(base.add(12714096), {
  onEnter() {
    try {
      let battleInstance = BattleMode_getInstance(ptr(0));
      let ping = battleInstance.add(88).readPointer().add(48).readInt();
      setPingHUD(ping);
    } catch (e) {
    }
  }
});
