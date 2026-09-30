# Prism Client — Technical Analysis

How the mod works end-to-end, from APK to cheat.

## 1. Delivery architecture

```
APK (fyj.prism.client, "Prism Client")
├── lib/arm64-v8a/libfyj.so            modified Frida Gadget 16.6.6 (QuickJS-only build)
├── lib/arm64-v8a/libfyj.c.so          gadget config: {"interaction":{"type":"script",
│                                          "path":"libcrypto.config.so"}}
├── lib/arm64-v8a/libcrypto.config.so stage-0 bootstrap (36 KB, encrypted)
├── lib/arm64-v8a/libfyj.so           ← gadget loads stage-0 at startup
└── assets/kogcpfofggee.dat           encrypted game data (server-keyed)

stage-0 (bootstrap-android.built.js)
├── PromonTitan attestation hooks (getAppAttestationResposeToken)
├── device identity: /data/data/<pkg>/.prism-id
└── fetchBootloader: POST prismclient.xyz/api/bootloader  (HMAC-signed, per-user HKDF keys)
        ↓
stage-1 (server-delivered, 18 KB)
├── "Prism Client" loading text via game's own StringTable
└── fetchScript: POST prismclient.xyz/api/script      (subscription-gated, 403 without activation)
        ↓
stage-2 = prism-main.bc (THIS repository's reconstruction, 119 KB)
```

The full cheat was obtained from the developer's SwissTransfer share rather than the
subscription server.

## 2. The three script-protection layers

### Layer 1 — blob cipher (FUN_006cd93c in the gadget)

```
p1[i] = gf_mul(data[i] ^ ((i*0x75+0x6F)*i + 0x28), 0xDB)     # GF(2^8), poly 0x1B
p2[i] = p1[i] ^ prev ^ KEY[i & 0xF]                           # CBC-XOR, IV 0xF2
              prev starts 0xF2, then tracks p1[i]
out[i] = ROL(p2[i], i-1) ^ 0x5A                               # rotate + xor
```

KEY (at 0x128b70 in the gadget): `4f0337222f621f6a0513b4f134711445`.
Output is a QuickJS `bjson` container (BC_VERSION 2, CONFIG_BIGNUM build).

### Layer 2 — atom/string scrambling (FUN_0072278c)

Every string in the atom table is decrypted at load-time by a splitmix64-family
keystream + a 256-byte S-box permutation (at 0x1be09e), with the bytes stored in
scattered blocks. Recovered by Unicorn-emulating the gadget function directly
(`scripts/emulate_decode.py`).

### Layer 3 — opcode table permutation

The gadget's opcode table (0x1beac6, 4-byte entries: size/npop/npush/fmt) is a
permutation of stock frida-quickjs opcodes. Additionally the mod:

- widens several 8-bit-operand opcodes to 16-bit (`get_loc`/`put_loc`/`get_arg` = 3 bytes),
- splits index spaces: **`loc` operands index vars only (args excluded), `arg`
  operands index args only** — stock QuickJS uses one unified space,
- keeps short forms (`get_loc0-3`, `put_loc0-3`, `get_arg0-3`, `put_arg0-3`,
  `call0-3`, `push_0-7`) at permuted byte positions,
- uses `catch` markers that push a stack sentinel, stripped by `nip` before
  returns (no exception table — the unwinder scans the stack).

All resolved by reference-function analysis (known library code, the reversed
crypto from stage-0, and structural constraints).

## 3. Runtime behavior of the cheat

- Runs as a Frida-script inside the modified gadget with full `Interceptor`,
  `Memory`, `NativeFunction`, `Java` access.
- All game functions are bound by **absolute offsets from `Module.getBaseAddress("libg.so")`**
  (e.g. `LogicCharacterClient.canMoveAndUseThisSkillSimultaneously @ +11730828`,
  `ClientInputManager.addInput @ +8318548`, the GUI bootstrap trigger `@ 0x9C4AB0`).
- Config persists at `/data/data/<pkg>/.prism-config.json`; device id at
  `.prism-id`; run logs at `.prism-run.log` with upload to
  `prismclient.xyz/api/devlog`.
- The GUI is built from the game's own movie clips: the P-button is the game's
  `debug_button` asset from `sc/debug.sc` (injected into the resource list by
  hooking `ResourceListener.addFile`), toggles/sliders are the game's
  `debug_togglebutton` / `GameSliderComponent` classes.

## 4. File inventory of the original script

| Original file | Lines (bundle) | Reconstructed as |
|---|---|---|
| frida-builtins:/node-globals.js | 1-47 | core/nodeGlobals.js |
| src/utils/runlog.js | 48-235 | utils/runlog.js |
| src/config.js | 237-270 | utils/config.js |
| src/utils/persist.js | 378-514 | utils/persist.js |
| src/gui/floatertext.js | 516-585 | ui/floaterText.js |
| src/utils/gradients.js | 586-700 | utils/gradients.js |
| src/mech/udpHook.js | ~700-760 | features/udpHook.js |
| src/gui/connectionindicator.js | ~760-800 | ui/connectionIndicator.js |
| src/gui/slider.js | 800-1180 | ui/slider.js |
| src/gui/Debug+Toggles.js | 1180-2300 | ui/modMenu.js |
| src/gui/LoadingText.js | ~2300-2350 | ui/loadingText.js |
| src/mech/movement.js | 2350-2700 | features/movement.js |
| src/mech/projectiledetection.js | 2700-3100 | features/projectileDetection.js |
| src/mech/mapDetection.js | 3133-3360 | features/mapDetection.js |
| src/mech/dodgeProfiles.js | 3139-3360 | features/dodgeProfiles.js |
| src/mech/dodge.js | 3363-4130 | features/autoDodge.js |
| src/mech/shooting.js | 4131-4326 | features/aimbot.js |
| src/mech/AutoCharge.js | 4327-4572 | features/autoCharge.js |
| src/mech/frankexploit.js | 4573-4623 | features/frankExploit.js |
| src/utils/antiAfk.js | 4624-4641 | features/antiAfk.js |
| src/mech/enemyAmmo.js | 4642-4675 | features/enemyAmmo.js |
| src/utils/ping.js | 4676-4717 | features/ping.js |
| top-level eval | 4718-end | core/bundle.js |

## 5. Reconstruction tooling (in the analysis workspace)

- `prism_decrypt.py` — layer-1 cipher
- `emulate_decode.py` — Unicorn emulation of layer-2 atom decoding
- `mod_opcodes.json` — extracted layer-3 opcode table
- `qjs_bjson.py` — bjson parser
- `qjs_full.py` — the decompiler (stack simulator + control-flow structurer)
- `gen_tree.py` — module splitter / file generator
