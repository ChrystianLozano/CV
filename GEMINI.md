# Project Overview: CV-Astro (Chrystian Lozano)

This project is a high-performance, retro-styled digital CV/Portfolio for **Chrystian Lozano**, built using **Astro**. It features a modern frontend stack with a "pixel-art" aesthetic, emphasizing performance (SEO-friendly) and clean typography.

## Core Technologies
- **Framework:** [Astro v4+](https://astro.build/)
- **Styling:** Custom Vanilla CSS with custom properties and animations (no utility frameworks like Tailwind are currently implemented in the code, though mentioned in the CV content).
- **Fonts:** IBM Plex Sans & Press Start 2P (via Google Fonts).
- **Interactivity:** Custom JavaScript for a typewriter effect, carousel, and project modals.
- **Deployment:** [GitHub Pages](https://chrystian.dev) via GitHub Actions.

## Project Structure
- `src/pages/index.astro`: Main entry point containing the CV data object (`cv`) and the page structure.
- `src/styles/global.css`: Centralized stylesheet managing the retro theme, animations (`reveal`, `pixel-rise`), and responsive layout.
- `public/`: Static assets including project screenshots (`01.png` - `07.png`), icons, and videos.
- `.github/workflows/deploy.yml`: Automated CI/CD pipeline for building and deploying to GitHub Pages.

## Building and Running

### Development
Start the development server with hot-reloading:
```bash
npm run dev
```

### Build
Generate a static production-ready site in the `dist/` directory:
```bash
npm run build
```

### Preview
Preview the production build locally:
```bash
npm run preview
```

## Development Conventions

### Content Management
The CV content is managed directly within the `cv` object inside `src/pages/index.astro`. To update experience, projects, or skills, modify this object.

### Styling
- **Theming:** Use CSS variables defined in `:root` (e.g., `--accent`, `--glow`).
- **Animations:** Use the `reveal` class for scroll-triggered animations. Text animations use the `typewriter` class.
- **Responsive Design:** The layout switches to a single column below 900px.

### Interaction
- Modals and carousels are handled by inline scripts in `src/pages/index.astro` for simplicity and performance (minimal bundle size).
- The `typewriter` effect is triggered via `IntersectionObserver`.

### Deployment
Pushes to the `main` branch automatically trigger the `Deploy to GitHub Pages` workflow.
