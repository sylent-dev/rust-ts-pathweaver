# Pathweaver

**The build viewer and planner of Path of Exile 2.** See, edit and share the `.build` files of the Build Planner of Path of Exile 2, in the browser: drop a file, then follow its passive tree, its skills and its inventory level by level.

The `.build` format is the one Grinding Gear Games documents for the in-game Build Planner: a file made by any tool (poe.ninja, a Path of Building converter, a guide site) opens here, and a file saved here opens in the game. The core is written in Rust, compiled to WebAssembly; the interface is written in TypeScript with Svelte. Everything runs in the browser: no account, no server, for now.

The website: <https://pathweaver.sylent.tools>.

The project is being built: see [specs.md](specs.md) for what the application does, and [roadmap.md](roadmap.md) for its progress.

## The website and its network

- **Served by Cloudflare**, as static files, at its own domain; published at each merge into `main` by the workflow `.github/workflows/deploy.yml`, with Wrangler (`deploy/`). See [docs/cloudflare-usage.md](docs/cloudflare-usage.md).
- **What it calls**: its own files only, from its own address; no analytics, no cookies, no font or script of another site. Cloudflare, which serves them, processes the IP address of each visitor, as any host does ([its privacy policy](https://www.cloudflare.com/privacypolicy/)).
- **What it keeps in the browser**: nothing yet; the library of version 1 will keep the builds opened, in this browser only. A build never leaves the browser without the user's action: it is shared as its `.build` file.

## Layout

- `crates/build-file`: the `.build` files, read, checked and written back without loss, a plain Rust library.
- `crates/wasm`: the bridge that exposes the core to the interface, compiled to WebAssembly.
- `deploy`: Wrangler and its configuration, which upload `web/build` to Cloudflare.
- `web`: the interface, a SvelteKit application in TypeScript built as a static website; its texts in `web/locales/`.

## Requirements

- Rust 1.93 or later (stable toolchain, see `rust-toolchain.toml`, which also installs the `wasm32-unknown-unknown` target)
- The `wasm-bindgen` command-line tool, at the exact version of the `wasm-bindgen` crate in `Cargo.toml`: `cargo install wasm-bindgen-cli --version <version> --locked` (the build gives the command with its version when the tool is missing or at another version)
- Node.js 24 or later, with npm

## Build

```sh
cd web
npm install
npm run dev     # the website at http://localhost:5173, the core built in debug
npm run build   # the static website in web/build, the core optimized
```

Each command builds the core to WebAssembly first (`npm run wasm`, see `web/scripts/build-wasm.ts`), and stops at once if the `wasm-bindgen` tool isn't at the version of the crate.

## Development

The Rust code, from the root of the repository:

```sh
cargo fmt --all
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo clippy --workspace --all-features --target wasm32-unknown-unknown -- -D warnings
cargo test --workspace --all-features
```

The interface, from `web/`:

```sh
npm run format   # Prettier
npm run lint     # Prettier and ESLint
npm run check    # svelte-check: TypeScript and Svelte
npm test         # Vitest
```

## Disclaimer

Pathweaver isn't affiliated with or endorsed by Grinding Gear Games. Path of Exile is a trademark of Grinding Gear Games; the game data belong to them. The portraits of the classes and ascendancies come from the passive tree export of Grinding Gear Games and belong to them; Pathweaver's other shapes and icons are its own.

## License

Licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))
- MIT license ([LICENSE-MIT](LICENSE-MIT))

at your option.
