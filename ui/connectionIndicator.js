import "frida-builtins:/node-globals.js";

export function setConnectionIndicatorLive(enabled) {
  if (!combatHUDInstance) return;
  try {
    combatHUDInstance.add(1056).readPointer().add(8).writeU8(enabled ? 1 : 0);
  } catch (e) {
  }
}

var base = Module.getBaseAddress("libg.so");
var combatHUDInstance = null;

Interceptor.attach(base.add(5789296), {
  onEnter(args) {
    this.a1 = args[0];
  },
  onLeave(retval) {
    combatHUDInstance = this.a1;
    let ptr2 = this.a1.add(1056).readPointer();
    if (config.connectionIndicator.enabled) {
      ptr2.add(8).writeU8(1);
    } else {
      ptr2.add(8).writeU8(0);
    }
  }
});
