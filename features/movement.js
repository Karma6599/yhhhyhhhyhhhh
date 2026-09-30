// ==========================================================================
// src/mech/movement.js  —  movement control
// joystick takeover, auto-spin, block movement
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 2459 ----
function anon2459() {
    return move;
}

// ---- line 2460 ----
function anon2460() {
    return moveDisable;
}

// ---- line 2461 ----
function anon2461() {
    return moveEnable;
}

// ---- line 2462 ----
function anon2462() {
    return moveRelease;
}

// ---- line 2463 ----
function anon2463() {
    return moveStop;
}

// ---- line 2464 ----
function anon2464() {
    return p;
}

// ---- line 2465 ----
function anon2465() {
    return userMoveAngle;
}

// ---- line 2467 ----
function move(angle) {
    moveAngle = ((((angle - 90) % 360) * Math.PI) / 180);
    isMoving = true;
    return;
}

// ---- line 2471 ----
function moveStop() {
    isMoving = false;
    return;
}

// ---- line 2475 ----
function moveRelease() {
    isMoving = false;
    return;
}

// ---- line 2478 ----
function moveDisable() {
    blockMovement = true;
    return;
}

// ---- line 2481 ----
function moveEnable() {
    blockMovement = false;
    return;
}

// --------------------------------------------------------------------------
// module body (src/mech/movement.js)
// --------------------------------------------------------------------------
// ---- line 2486 ----
function anon2486() {
    init_node_globals();
    init_config();
    base7 = Module.findBaseAddress("libg.so");
    {}.updateMovement = 8792592;
    offsets = {};
    {}.FG_X = 2592;
    {}.FG_Y = 2596;
    {}.BG_X = 2600;
    {}.BG_Y = 2604;
    {}.STATE = 3912;
    joy = {};
    isMoving = false;
    blockMovement = false;
    moveAngle = 0;
    autoSpinAngle = 0;
    p = null;
    originalX = null;
    originalY = null;
    originalBgX = null;
    originalBgY = null;
    originalState = null;
    userMoveAngle = null;
    // module entry: onEnter
    // module entry: onLeave
    return;
}
// ---- line 2515 ----
function anon2515(args) {
    p = args[0];
    originalBgX = p.add(joy.BG_X).readFloat();
    originalBgY = p.add(joy.BG_Y).readFloat();
    originalX = p.add(joy.FG_X).readFloat();
    originalY = p.add(joy.FG_Y).readFloat();
    originalState = Memory.readU8(p.add(joy.STATE));
    if ((originalState === 1)) {
        userMoveAngle = (((((Math.atan2((originalY - originalBgY), (originalX - originalBgX)) * 180) / Math.PI) + 90) + 360) % 360).toFixed(0);
    } else {
        userMoveAngle = false;
    }
    if (blockMovement) {
        if (!(isMoving)) {
            if (!(config.autospin.enabled)) {
                let val2;
                let val1;
                val1 = 500000;
                val2 = 500000;
                Memory.writeFloat(p.add(joy.FG_X), val1);
                Memory.writeFloat(p.add(joy.FG_Y), val2);
                Memory.writeFloat(p.add(joy.BG_X), 500000);
                Memory.writeFloat(p.add(joy.BG_Y), 500000);
                Memory.writeU8(p.add(joy.STATE), 1);
                return;
            }
        }
    }
    if (isMoving) {
        if ((originalState === 1)) {
            Memory.writeFloat(p.add(joy.FG_X), (originalBgX + (100 * Math.cos(moveAngle))));
            Memory.writeFloat(p.add(joy.FG_Y), (originalBgY + (100 * Math.sin(moveAngle))));
            return;
        }
        Memory.writeFloat(p.add(joy.FG_X), (500000 + (100 * Math.cos(moveAngle))));
        Memory.writeFloat(p.add(joy.FG_Y), (500000 + (100 * Math.sin(moveAngle))));
        Memory.writeFloat(p.add(joy.BG_X), 500000);
        Memory.writeFloat(p.add(joy.BG_Y), 500000);
        Memory.writeU8(p.add(joy.STATE), 1);
        return;
    }
    if (config.autospin.enabled) {
        let spinRad;
        autoSpinAngle = (autoSpinAngle + config.autospin.speed);
        if ((autoSpinAngle >= 360)) {
            autoSpinAngle = 0;
        }
        spinRad = (((autoSpinAngle - 90) * Math.PI) / 180);
        if ((originalState === 1)) {
            Memory.writeFloat(p.add(joy.FG_X), (originalBgX + (100 * Math.cos(spinRad))));
            Memory.writeFloat(p.add(joy.FG_Y), (originalBgY + (100 * Math.sin(spinRad))));
            return;
        }
        Memory.writeFloat(p.add(joy.FG_X), (500000 + (100 * Math.cos(spinRad))));
        Memory.writeFloat(p.add(joy.FG_Y), (500000 + (100 * Math.sin(spinRad))));
        Memory.writeFloat(p.add(joy.BG_X), 500000);
        Memory.writeFloat(p.add(joy.BG_Y), 500000);
        Memory.writeU8(p.add(joy.STATE), 1);
    }
    return;
}
// ---- line 2562 ----
function anon2562(retval) {
    Memory.writeFloat(p.add(joy.FG_X), originalX);
    Memory.writeFloat(p.add(joy.FG_Y), originalY);
    Memory.writeFloat(p.add(joy.BG_X), originalBgX);
    Memory.writeFloat(p.add(joy.BG_Y), originalBgY);
    return;
}
