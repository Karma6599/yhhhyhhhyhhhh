import "frida-builtins:/node-globals.js";
import { setIPHUD } from "../gui/Debug+Toggles.js";

function readScString(strObj) {
  let len = strObj.add(4).readInt();
  if (len > 7) return strObj.add(8).readPointer().readUtf8String(len); return strObj.add(8).readUtf8String(len);
}

var base = Module.findBaseAddress("libg.so");
var getPort = new NativeFunction(base.add(12709600), "int", ["pointer"]);
export var IP = "penis:1337";

Interceptor.attach(base.add(12709584), {
  onEnter(args) {
    let a1 = args[0];
    IP = readScString(a1.add(152).readPointer()) + ":" + getPort(a1);

    setIPHUD(IP);
  }
});
