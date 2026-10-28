# Shipmate

**You start it. We ship it.**

Shipmate is a landing page for a service that pairs you with a dedicated builder to take your half-built project across the finish line.

**Live site:** https://harshvishwakarma0.github.io/shipmate/

> **Status: early prototype.** This is a front-end landing page only — there is no product, backend, or signup flow behind it yet.

![Shipmate hero](public/images/hero-boat.webp)

## Stack

- [Vite 7](https://vite.dev/) — vanilla JS, no framework
- Custom CSS with Bricolage Grotesque + DM Sans variable fonts
- Phosphor Icons, Simple Icons

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

The build uses `base: './'` (see `vite.config.js`) so the static output works under a GitHub Pages project subpath.

## Deployment

The site is served by GitHub Pages from the `gh-pages` branch. To redeploy:

1. `npm run build`
2. Push the contents of `dist/` to the `gh-pages` branch (including `.nojekyll`).

## Feedback

This is a prototype exploring the idea — feedback is welcome via issues or on the announcement threads:

- X: https://x.com/RimuruT49244926/status/2115430414953398371
- Reddit: https://www.reddit.com/r/SideProject/comments/1xhnnme/i_built_a_landing_page_for_shipmate_you_start_the/
