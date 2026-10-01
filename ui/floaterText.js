import "frida-builtins:/node-globals.js";

function getStrPtr(str) {
  return Memory.allocUtf8String(str);
}

function getScPtr(str) {
  var pointer = malloc(40);
  stringctor(pointer, getStrPtr(str));
  return pointer;
}

function showFloater(text) {
  floater(getinstance(), getScPtr(text), 0, -1);
}

var base = Module.getBaseAddress("libg.so");
var getinstance = new NativeFunction(base.add(6042912), "pointer", []);
var floater = new NativeFunction(base.add(8884440), "void", ["pointer", "pointer", "int", "int"]);
var malloc = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
var stringctor = new NativeFunction(base.add(15293804), "pointer", ["pointer", "pointer"]);
