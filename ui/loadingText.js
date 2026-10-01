var getStrPtr = (str) => Memory.allocUtf8String(str);
require("frida-builtins:/node-globals.js");
var base = Module.findBaseAddress("libg.so");
var connectionCredit = "Prism Client";
var StringTable_getString = new NativeFunction(base.add(10308092), "pointer", ["pointer"]);

Interceptor.attach(base.add(10308092), {
  onEnter(args) {
    var str = Memory.readUtf8String(args[0]);
    this.str = str;
  },
  onLeave(retval) {
    if (this.str === "TID_CONNECTING_TO_SERVER") {
      retval.replace(StringTable_getString(getStrPtr(connectionCredit)));
    }
  }
});
