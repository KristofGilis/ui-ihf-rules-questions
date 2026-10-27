# Native app branding

The native app icon uses the operator's selected **option A**: a sweeping checkmark, two motion trails and a flat illustrated handball. The user's supplied handball reference guides the large rounded panel shapes and adjacent groups of blue and white panels. Fine navy seams separate the panels. At the user's request, the gold side swooshes are included as illustrated shapes. The ball has no photographic texture, lettering or logos. The native app name is **Handball Rules Quiz**. Website assets remain unchanged.

`handball-checkmark.png` is the composed transparent foreground. The built-in image generation tool created the ball separately (`handball-trace.png`, then `handball-gold.png`) so its geometry can be revised without changing the checkmark and trails. Prompts are saved in `handball-trace-prompt.md` and `handball-gold-prompt.md`. Its white, navy (`#00206D`), blue (`#3C80C1`, `#2047A2`) and gold (`#B78D15`) palette follows `PlayfulStyle.swift`. `app-icon.svg` and `app-icon-dark.svg` embed that raster artwork on opaque backgrounds: white/slate for light appearance and deep navy for dark. These wrappers are not vector masters. Rebuild the composition, then the 1024 × 1024 icons and header images with:

```sh
node scripts/compose-native-ball.mjs
node scripts/generate-native-branding.mjs
```

Add `--preview` to create the comparison in `native/previews/`. The generator verifies that both 1024-pixel PNG variants are opaque. Asset-catalog entries let iOS select the Home Screen icon according to its icon appearance setting; older systems use the default icon. The header uses the transparent foreground in both appearances, without the Home Screen icon backgrounds, and displays the artwork beside the full app name. The generator checks header alpha and transparent corners separately from opaque app icons. The animated court remains in Home.

## Native artwork

The native app uses its own handball/checkmark artwork, with no IHF logo in its icon, header or launch screen. The earlier logo-specific release hold is resolved. Website branding is separate. See `docs/MOBILE_RELEASE.md` for verified delivery status.

The launch screen centers a 160-point transparent mark on an adaptive light/dark background matching the app. `generate-native-branding.mjs` exports crisp 1x/2x/3x launch images and named background colors. The native storyboard uses Auto Layout for iPhone, iPad and orientation changes, with no text, progress indicator or artificial startup delay.

Apple reference: [Configuring your app icon using an asset catalog](https://developer.apple.com/documentation/xcode/configuring-your-app-icon).
