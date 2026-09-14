# sacred

Personal site: https://sacredcodr.github.io/

Static HTML and CSS. No build step or JavaScript dependencies.

## Local preview

Run `python -m http.server 8766 --bind 127.0.0.1` in this directory, then open http://127.0.0.1:8766/.

## Files

- `index.html`: home and introduction.
- `writing/`: writing index and articles.
- `style.css`: shared layout and cat animations.
- `assets/`: cat artwork and browser masks that preserve the white facial details.
- `favicon.svg` and `.nojekyll`: site icon and GitHub Pages support.

The cat drawings were made with image generation from a supplied visual reference. Their motion is implemented in CSS.

GitHub Pages serves the repository root from `main`.
