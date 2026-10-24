# ADT identity placement

The portrait introduces Aaradhya. The monogram identifies the site and signs the work.

| Surface | Placement |
| --- | --- |
| Homepage | One circular portrait in the profile panel; no large competing crest. |
| Shared navigation | One 20-pixel square monogram beside the name, inside the named home link. Preserve the existing fixed navigation slot and wordmark collapse. |
| Shared footer | One 88 by 55-pixel full-artwork signature, linked home. No second ADT wordmark. |
| About | One full-artwork showcase beside the engineering principles. |
| Access control | Lock icon, instructions, and form controls; no decorative crest. |
| Projects and credentials | Let project media and credentials lead. Shared navigation and footer supply site branding. |
| Optional terminal | The `brand`, `logo`, and `crests` commands expose all seven variants together. |
| Browser tab | Compact ADT favicon, available before JavaScript loads. |
| Installed app | Gold ADT icons; a separate padded maskable export protects the entire mark. |
| Social previews | One portrait, the full name, and a small gold signature in the shared 1200 by 630-pixel card. |

Gold is the default dark-mode identity. Light mode uses ink on parchment. Explicit user accent selections continue to select the matching navigation, footer, About, and browser-tab variants. Installed-app and social assets keep a stable gold identity because they are exported independently of page theme state.

Use square assets for icons and preserve the 8:5 ratio of full artwork. Allow clear space around each mark. Keep branding free of repeating glints, image zoom, and stacked decorative borders. Home links need a visible focus indicator and an accessible name; images inside an already named link have empty alternative text.

## Asset generation

The source composition embeds the existing portrait and gold artwork without changing those source photographs or logo variants:

```powershell
python scripts/generate_og_cards.py --card master
```

To also export the browser-rendered PNGs with Playwright and an installed Google Chrome:

```powershell
uv run --with playwright python scripts/generate_og_cards.py --card master --raster
```

This produces `assets/images/og/og-master.svg`, its 1200 by 630-pixel PNG, and `assets/images/branding/adt-maskable.svg` with its 512-pixel PNG. The maskable composition places the entire 288-pixel square mark within the central 80-percent safe circle. Page metadata references the PNG for social-platform compatibility. Keep the manifest, Apple touch icons, static favicons, and service-worker asset list aligned when replacing these exports.

Tracked in #34; homepage portrait tracked in #33.
