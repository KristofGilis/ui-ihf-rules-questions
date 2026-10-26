# Native app branding

At the operator's request, the proposed native app icon reuses the website's existing IHF letter-and-handball artwork from `assets/logo.svg`, rendered entirely white. Its paths, proportions and placement are preserved, with no additional wording in the icon. The native app name is **Handball Rules Quiz**. Website assets remain unchanged.

`app-icon.svg` and `app-icon-dark.svg` are native vector assets produced directly from the existing SVG, without image generation. The light background runs from deep blue (`#2047A2`) to navy (`#00206D`); the dark background runs from `#001235` to `#000918`. Both PNG variants have opaque backgrounds. Rebuild the 1024 × 1024 icons and header images with:

```sh
node scripts/generate-native-branding.mjs
```

Add `--preview` to create the comparison in `native/previews/`. The generator verifies that all artwork paths remain identical and both 1024-pixel PNG variants are opaque. Asset-catalog entries let iOS select the Home Screen icon according to its icon appearance setting; older systems use the default icon. The header follows the app's appearance and displays the artwork beside the full app name. The animated court remains in Home.

## Permission status

On 26 October 2026 the operator clarified that approval to use the IHF logo is not clear. The operator subsequently requested this artwork as a proposed Apple review candidate. This request does not establish permission from IHF. Do not claim logo permission is confirmed in store declarations or infer it from Apple's review outcome. Rights for the rules and question content are a separate check before public submission.

Apple reference: [Configuring your app icon using an asset catalog](https://developer.apple.com/documentation/xcode/configuring-your-app-icon).
