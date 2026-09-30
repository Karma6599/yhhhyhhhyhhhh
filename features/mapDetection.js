import "frida-builtins:/node-globals.js";
import "../config.js";

function buildTileCache(logicBattle) {
  let tileMap = natives.LogicBattleModeClient_getTileMap(logicBattle);
  let width = tileMap.add(196).readU32();
  let height = tileMap.add(200).readU32();
  let tiles = Array(width * height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let tileData = Memory.readPointer(natives.LogicTileMap_getTile(tileMap, x, y));
      tiles[x * height + y] = {
        name: NativeString.toJSString(natives.LogicData_getName(tileData)),
        code: natives.LogicTileData_getTileCode(tileData),
        blocksMovement: natives.LogicTileData_blocksMovement(tileData),
        blocksProjectiles: natives.LogicTileData_blocksProjectiles(tileData),
        isDestructible: natives.LogicTileData_isDestructibleAny(tileData),
        isDestructibleWithPiercing: natives.LogicTileData_isDestructibleWithPiercing(tileData)
      };
    }
  }
  tileCache = { width, height, tiles, version: 0 };
  console.log("apDetection] tile cache built: ".concat(width, "x", height));
}

function findTilePosition(tileMap, targetTile) {
  let width = tileMap.add(196).readU32();
  let height = tileMap.add(200).readU32();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (natives.LogicTileMap_getTile(tileMap, x, y).equals(targetTile)) {
        return { x, y };
      }
    }
  }
  return null;
}

var base = Module.findBaseAddress("libg.so");
var offsets = {

  LogicBattleModeClient_getTileMap: 12721988,

  LogicBattleModeClient_update: 12714096,

  LogicTileMap_getTile: 10820784,

  LogicTileData_isDestructibleAny: 11664548,

  LogicTileData_isDestructibleWithPiercing: 11664556,

  LogicTileData_blocksProjectiles: 11664540,

  LogicTileData_blocksMovement: 11664532,

  LogicTile_destroyTile: 10816040,

  LogicData_getName: 11283052,

  LogicTileData_getTileCode: 11664480,

  BattleMode_enter: 10204192

};

var natives = {
  LogicBattleModeClient_getTileMap: new NativeFunction(base.add(offsets.LogicBattleModeClient_getTileMap), "pointer", ["pointer"]),
  LogicTileMap_getTile: new NativeFunction(base.add(offsets.LogicTileMap_getTile), "pointer", ["pointer", "uint32", "uint32"]),

  LogicTileData_getTileCode: new NativeFunction(base.add(offsets.LogicTileData_getTileCode), "uint32", ["pointer"]),
  LogicData_getName: new NativeFunction(base.add(offsets.LogicData_getName), "pointer", ["pointer"]),

  LogicTileData_blocksMovement: new NativeFunction(base.add(offsets.LogicTileData_blocksMovement), "bool", ["pointer"]),
  LogicTileData_blocksProjectiles: new NativeFunction(base.add(offsets.LogicTileData_blocksProjectiles), "bool", ["pointer"]),

  LogicTileData_isDestructibleAny: new NativeFunction(base.add(offsets.LogicTileData_isDestructibleAny), "bool", ["pointer"]),
  LogicTileData_isDestructibleWithPiercing: new NativeFunction(base.add(offsets.LogicTileData_isDestructibleWithPiercing), "bool", ["pointer"])
};

class NativeString {
  static toJSString(stringPtr) {
    let len = stringPtr.add(4).readInt();
    if (len > 7) return stringPtr.add(8).readPointer().readUtf8String(len);
    return stringPtr.add(8).readUtf8String(len);
  }
}

export var tileCache = null;
var currentLogicBattle = null;
var newGame = false;

Interceptor.attach(base.add(offsets.BattleMode_enter), {
  onEnter(args) {
    newGame = true;
  }
});

Interceptor.attach(base.add(offsets.LogicBattleModeClient_update), {
  onEnter(args) {
    currentLogicBattle = args[0];
    if (newGame) {
      buildTileCache(args[0]);
      newGame = false;
    }
  }
});

Interceptor.attach(base.add(offsets.LogicTile_destroyTile), {
  onEnter(args) {
    if (!tileCache || !currentLogicBattle) return;
    try {
      let tileMap = natives.LogicBattleModeClient_getTileMap(currentLogicBattle);
      this.position = findTilePosition(tileMap, args[0]);
    } catch (e) {
    }
  },
  onLeave(retval) {
    if (!tileCache || !currentLogicBattle || !this.position) return;
    try {
      let tileMap = natives.LogicBattleModeClient_getTileMap(currentLogicBattle);
      let tileData = Memory.readPointer(natives.LogicTileMap_getTile(tileMap, this.position.x, this.position.y));
      tileCache.tiles[this.position.x * tileCache.height + this.position.y] = {
        name: NativeString.toJSString(natives.LogicData_getName(tileData)),
        code: natives.LogicTileData_getTileCode(tileData),
        blocksMovement: natives.LogicTileData_blocksMovement(tileData),
        blocksProjectiles: natives.LogicTileData_blocksProjectiles(tileData),
        isDestructible: natives.LogicTileData_isDestructibleAny(tileData),
        isDestructibleWithPiercing: natives.LogicTileData_isDestructibleWithPiercing(tileData)
      };
      tileCache.version++;
    } catch (e) {
    }
  }
});
