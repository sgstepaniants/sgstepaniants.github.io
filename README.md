# George Stepaniants Personal Website

This is a static, single-page academic portfolio hosted with GitHub Pages.

- `content/academic-profile.yaml` is the authoritative source for academic and resume content.
- `index.html` contains the About, Research, Teaching, CV, and Contact tabs. Sections between `GENERATED` comments are rebuilt from the YAML and should not be edited directly.
- `assets/` contains the compiled styles, JavaScript, images, and icons.
- `resume/` contains both the LaTeX CV source and the PDF embedded by the site.

## Updating the website and CV

Edit `content/academic-profile.yaml`, then run `npm run update` from the repository root. This validates the YAML, regenerates the website and LaTeX content, and compiles the PDF. XeLaTeX auxiliary files stay in `resume/.build/`; run `npm run clean` to remove them.

Research figures can set `thumbnail.crop: [x, y, width, height]` in source-image pixels, `thumbnail.padding` in display pixels, and `thumbnail.alt` to describe a selected panel. Crops are applied in the page without modifying the PNGs; each pop-up links to the full card figure. Use `npm run content:render` for changes that only affect the website.

Run `npm run check` to verify that generated content is current and the JavaScript is valid. For an AI-assisted review of official sources, use `prompts/review-academic-updates.md`; it is deliberately review-first and never publishes automatically.
