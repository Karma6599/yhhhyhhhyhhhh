# Prism Client v6.4.3 — Full Source Reconstruction

**Deobfuscated & decompiled from `prism-main.bc`** (119,526 bytes of custom-encrypted
QuickJS bytecode shipped with the modified Frida Gadget `libprism.so`).

This is the complete mod-menu source of the **Prism Client** Brawl Stars cheat
(`dsc.gg/prismclient`), reverse-engineered and reconstructed to readable JavaScript.
Original build path: `C:\Users\simon\Desktop\Prism\Builder\out\_cheat_src_android.js`.

---

## Folder layout

```
features/            one file per cheat feature
├── aimbot.js            src/mech/shooting.js — intercept solver, tracking, trigger
├── autoDodge.js         src/mech/dodge.js — raycast + capsule escape engine
├── dodgeProfiles.js     src/mech/dodgeProfiles.js — per-brawler hazard models
├── projectileDetection.js  tracks enemy projectiles, predicts landing
├── mapDetection.js      tile cache + wall / line-of-sight queries
├── movement.js          joystick takeover, auto-spin
├── autoCharge.js        auto attack charge (ClientInput injection)
├── frankExploit.js      Frank move+skill-simultaneously patch
├── antiAfk.js           anti-AFK input injection
├── enemyAmmo.js         enemy ammo bars
├── ping.js              ping + IP HUD
└── udpHook.js           live server address readout

ui/                  in-game GUI (built from the game's own widgets)
├── modMenu.js           src/gui/Debug+Toggles.js — the P-button mod menu
├── slider.js            config sliders (GameSliderComponent hijack)
├── floaterText.js       floating text overlay
├── connectionIndicator.js
└── loadingText.js       "Prism Client" loading screen

utils/               support code
├── config.js            all feature defaults (the config schema)
├── persist.js            .prism-config.json load/save
├── runlog.js             run logging + upload to prismclient.xyz/api/devlog
└── gradients.js          Prism UI gradient theming

core/
├── bundle.js             esbuild runtime + module registry + boot sequence
└── nodeGlobals.js        process/Buffer shims
```

## Features (as wired in the menu)

| Menu entry | Config key | Module |
|---|---|---|
| Aimbot → Enabled | `aimbot.enabled` | features/aimbot.js |
| Aimbot → Juke / Reactive / Curve | `aimbot.jukePredict.*` / `aimbot.curvePredict.*` | features/aimbot.js |
| Aimbot → Predict / Lead Time / Smoothing / Pos Samples / Juke Bias / Deadzone | `aimbot.*` sliders | features/aimbot.js |
| Dodge → Enabled / Curveball / Adv Walls / Esc Dirs / React Slack / Urgency / Intent / Radius-Range-Speed Pad / Hit Slack | `dodge.*` | features/autoDodge.js |
| Auto Shoot / Hold to Shoot / Auto Ulti | `autoShoot.*`, `holdToShoot.*`, `autoUlti.*` | features/aimbot.js |
| Auto Spin + Spin Speed | `autospin.*` | features/movement.js |
| Show Ammo | `showEnemyAmmo.*` | features/enemyAmmo.js |
| Anti AFK | `antiAFK.*` | features/antiAfk.js |
| Auto Charge | `autoCharge.*` | features/autoCharge.js |
| Conn. Indicator | `connectionIndicator.*` | ui/connectionIndicator.js |
| Ping / IP Display | `pingDisplay.*`, `ipDisplay.*` | features/ping.js |

Menu categories: **Aimbot / Dodge / Killaura (stub "Coming Soon" in v6.4.3) / Utils / HUD**.

## How the aimbot works (features/aimbot.js)

1. `updateTracking()` keeps an EMA of the closest enemy's velocity/acceleration.
2. `regress()` least-squares fits the enemy position samples.
3. `solveIntercept()` iterates the classic projectile intercept:
   ```js
   t = hypot(tx-sx, ty-sy) / P;              // P = projectile speed
   for (i = 0; i < 6; i++) {
       px = tx + vx*t + 0.5*ax*t*t;         // kinematic prediction
       py = ty + vy*t + 0.5*ay*t*t;
       nt = hypot(px-sx, py-sy) / P;
       if (nt > maxT) nt = maxT;
       if (Math.abs(nt - t) < 0.0005) break; // converged
       t = nt;
   }
   ```
4. `jukePredict` solves the same system with reversed velocity and blends by `bias`;
   `curvePredict` handles arcing projectiles.
5. `triggerShot()` writes into the shoot/ulti stick memory offsets and calls
   `BattleScreen.activateSkill` for the computed point.

## How auto-dodge works (features/autoDodge.js)

Every enemy projectile spawn is captured (LogicProjectileClient ctor/destruct hooks),
modeled (`compileProjectile`: static/moving discs, capsules, Spike curveball,
Dynamike cross bombs), then each frame the engine:
`gridRaycast` → `losTruncate` → `collectTangents` → score escape directions
(hit/clear margins, urgency, intent influence) → steal the joystick
(`applyChoice` → `move(angle)`).

## Protection layers that were broken (see ANALYSIS.md)

1. **Layer 1** — custom 3-pass cipher on the script blob (GF(2^8) mul, CBC-XOR, rotate).
2. **Layer 2** — splitmix64 keystream + S-box scrambling of the string/atom table.
3. **Layer 3** — permuted opcode table with widened 16-bit local operands and a
   separate var-space/arg-space split.
4. **Server stages** — stage-0 (attestation + bootloader fetch) and stage-1 (GUI
   bootloader) are also fully cracked; see `ANALYSIS.md`.

## Notes on fidelity

- 287/345 functions decompile with zero artifacts; the remainder contain a few
  `<under>` placeholders where stack reconstruction was ambiguous (marked inline).
- Local/argument names come from the debug info embedded in the bytecode — they are
  the author's original names.
- `FUNC_<name>` markers reference closures defined in the same file.
- Comments like `// ---- line 4246 ----` give the original bundle line numbers.
