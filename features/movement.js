import "frida-builtins:/node-globals.js";
import "../config.js";

export function move(angle) {
  moveAngle = (angle - 90) % 360 * Math.PI / 180;
  isMoving = true;
}

export function moveStop() {
  isMoving = false;
  Memory.writeU8(p.add(joy.STATE), 0);
}

export function moveRelease() {
  isMoving = false;
}

export function moveDisable() {
  blockMovement = true;
}

export function moveEnable() {
  blockMovement = false;
}

var base = Module.findBaseAddress("libg.so");

var offsets = {

  updateMovement: 8792592

};

var joy = {

  FG_X: 2592,
  FG_Y: 2596,
  BG_X: 2600,
  BG_Y: 2604,
  STATE: 3912

};

var isMoving = false;
var blockMovement = false;
var moveAngle = 0;
var autoSpinAngle = 0;
var p = null;
var originalX = null;
var originalY = null;
var originalBgX = null;
var originalBgY = null;
var originalState = null;
export var userMoveAngle = null;

Interceptor.attach(base.add(offsets.updateMovement), {
  onEnter(args) {
    p = args[0];
    originalBgX = p.add(joy.BG_X).readFloat();
    originalBgY = p.add(joy.BG_Y).readFloat();
    originalX = p.add(joy.FG_X).readFloat();
    originalY = p.add(joy.FG_Y).readFloat();
    originalState = Memory.readU8(p.add(joy.STATE));
    if (originalState === 1) {
      userMoveAngle = ((Math.atan2(originalY - originalBgY, originalX - originalBgX) * 180 / Math.PI + 90 + 360) % 360).toFixed(0);
    } else {
      userMoveAngle = false;
    }

    if (blockMovement && !isMoving && !config.autospin.enabled) {
      let val1 = 500000;
      let val2 = 500000;
      Memory.writeFloat(p.add(joy.FG_X), val1);
      Memory.writeFloat(p.add(joy.FG_Y), val2);
      Memory.writeFloat(p.add(joy.BG_X), 500000);
      Memory.writeFloat(p.add(joy.BG_Y), 500000);
      Memory.writeU8(p.add(joy.STATE), 1);
      return;
    }
    if (isMoving) {
      if (originalState === 1) {
        Memory.writeFloat(p.add(joy.FG_X), originalBgX + 100 * Math.cos(moveAngle));

        Memory.writeFloat(p.add(joy.FG_Y), originalBgY + 100 * Math.sin(moveAngle));

        return;
      }
      Memory.writeFloat(p.add(joy.FG_X), 500000 + 100 * Math.cos(moveAngle));

      Memory.writeFloat(p.add(joy.FG_Y), 500000 + 100 * Math.sin(moveAngle));

      Memory.writeFloat(p.add(joy.BG_X), 500000);
      Memory.writeFloat(p.add(joy.BG_Y), 500000);
      Memory.writeU8(p.add(joy.STATE), 1);

      return;
    }
    if (config.autospin.enabled) {
      autoSpinAngle += config.autospin.speed;
      if (autoSpinAngle >= 360) autoSpinAngle = 0;
      let spinRad = (autoSpinAngle - 90) * Math.PI / 180;
      if (originalState === 1) {
        Memory.writeFloat(p.add(joy.FG_X), originalBgX + 100 * Math.cos(spinRad));

        Memory.writeFloat(p.add(joy.FG_Y), originalBgY + 100 * Math.sin(spinRad));

        return;
      }
      Memory.writeFloat(p.add(joy.FG_X), 500000 + 100 * Math.cos(spinRad));

      Memory.writeFloat(p.add(joy.FG_Y), 500000 + 100 * Math.sin(spinRad));

      Memory.writeFloat(p.add(joy.BG_X), 500000);
      Memory.writeFloat(p.add(joy.BG_Y), 500000);
      Memory.writeU8(p.add(joy.STATE), 1);
    }
  },

  onLeave(retval) {
    Memory.writeFloat(p.add(joy.FG_X), originalX);
    Memory.writeFloat(p.add(joy.FG_Y), originalY);
    Memory.writeFloat(p.add(joy.BG_X), originalBgX);
    Memory.writeFloat(p.add(joy.BG_Y), originalBgY);
    Memory.writeU8(p.add(joy.STATE), originalState);
  }
});
