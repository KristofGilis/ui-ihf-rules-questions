# Native app branding

The app reuses the website's existing IHF letter-and-handball artwork from `assets/logo.svg`. Its paths, proportions and padding are preserved. Only native assets receive the app palette: a deep blue (`#2047A2`) to navy (`#00206D`) background, white lettering, and a gold (`#B78D15`) ball. Website assets remain unchanged.

`app-icon.svg` and `app-icon-dark.svg` are native vector assets produced directly from the existing SVG, without image generation. The default icon has an opaque blue background; the dark icon has white lettering, brighter gold (`#E8C259`) and transparency so iOS can supply its dark background. Both preserve the original shapes. Rebuild the 1024 × 1024 App Store icons and the Home header's light/dark 1×/2×/3× images with:

```sh
node scripts/generate-native-branding.mjs
```

The generator verifies that all original artwork paths remain identical, the default App Store PNG has no alpha channel, and the dark variant retains transparency. Asset-catalog appearance entries let iOS select the Home Screen icon according to the user's icon appearance setting; older systems use the default icon. The header follows the app's selected appearance and uses a dark navy background in dark mode. The animated court remains in the Home hero.

Apple reference: [Configuring your app icon using an asset catalog](https://developer.apple.com/documentation/xcode/configuring-your-app-icon).
