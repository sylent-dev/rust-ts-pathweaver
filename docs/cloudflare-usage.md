# Cloudflare usage

How Pathweaver uses Cloudflare, the limits of the free plan, its terms and the risks accepted. Checked on 2026-11-22 on the pages linked; read by the steps that change the deployment (step 3) or add a service of Cloudflare (version 3).

## What is used

- **A Worker of static assets, without code**: the folder `web/build` uploaded as the assets of a Worker named `pathweaver`, served by Cloudflare as it is ([Static Assets](https://developers.cloudflare.com/workers/static-assets/)). Cloudflare Pages would serve the same files; its own page says « Workers is Cloudflare's primary platform for building applications. Start new projects with Workers. », and version 3 adds its Workers, D1 and R2 to the same project (the owner, 2026-11-22, see [technical-choices.md](technical-choices.md), Host).
- **A custom domain**, `pathweaver.sylent.tools`, in the zone `sylent.tools`, already on Cloudflare: `wrangler deploy` attaches it and Cloudflare creates its DNS record and its certificate ([Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)). Run by the workflow, wrangler replaces a DNS record the subdomain already has, or a Worker it was already attached to, rather than stopping (its options `override_existing_dns_record` and `override_existing_origin`, read in its sources): `pathweaver.sylent.tools` had no record on 2026-11-22, and nothing else may be put at that name.
- **No `workers.dev` address and no version URLs** (`workers_dev` and `preview_urls` set to `false` in `wrangler.jsonc`): the website has one address, so that search engines and the users never find a copy of it elsewhere ([workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/): turning off one doesn't turn off the other).
- **The deployment** by GitHub Actions (`.github/workflows/deploy.yml`) with `wrangler deploy` (Wrangler and `wrangler.jsonc` in `deploy/`, kept out of `web/`: its engine for local runs weighs 155 MB, which every check of the interface would install), at each merge into `main`, rather than a build on Cloudflare: the build needs Rust and `wasm-bindgen`, already set up for the CI ([GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)).

## Limits of the free plan

From [Limits](https://developers.cloudflare.com/workers/platform/limits/) and [Pricing](https://developers.cloudflare.com/workers/platform/pricing/):

- « Requests to static assets are free and unlimited. » The limit of 100,000 requests a day counts the runs of a Worker's code, which Pathweaver has none of in version 1.
- 20,000 files per version of the Worker, 25 MiB per file: the game data of step 4 (one folder per version of the game and per language) and the icons of step 5 stay far below; a step that adds files checks its count against it.
- `_headers`: 100 rules, 2,000 characters a line; `_redirects`: 2,100 rules.
- On the free plan, Cloudflare stops at its quotas rather than bill.

## Terms

- The [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/) (updated on 2025-09-12) lets Cloudflare suspend a service « with or without notice for any reason or no reason at all ».
- The [Service-Specific Terms](https://www.cloudflare.com/service-specific-terms-application-services/) (updated on 2026-09-28), Content Delivery Network: on the free plan, Cloudflare may limit a website that serves « video or a disproportionate percentage of pictures, audio files, or other large files » without a paid service, the Developer Platform being one; no threshold is given. Pathweaver serves pages, its WebAssembly core, JSON data and small images (the portraits, the icons of the passives and of the items).
- The [Privacy Policy](https://www.cloudflare.com/privacypolicy/) (in force on 2025-11-04): Cloudflare processes the IP addresses and the routing data of the visitors of the websites it serves, as a processor; the owner of the website answers for its own privacy policy. Pathweaver itself records nothing and has no logs of its own in version 1.

## Risks

To be accepted by the owner:

- Cloudflare may suspend the website without notice: the files stay in the repository, and the website moves to another static host (GitHub Pages, as Stepwise) by changing the workflow and the DNS record.
- The clause on large files has no threshold: if Cloudflare judges the images of the game too large a share, it may limit the website on the free plan; the way out is the paid plan of Workers (5 dollars a month) or fewer images.
- The token of the deployment (the secret `CLOUDFLARE_API_TOKEN` of the environment `production`) can change the Workers of the account: it is limited to what `wrangler deploy` needs (below), and only the job of deployment on `main` reads it, never a pull request.

## The token of the deployment

Created by the owner in the dashboard (My Profile › API Tokens › Create Token › Custom token), limited to:

- Account › Workers Scripts › Edit, on the owner's account;
- Zone › Workers Routes › Edit, on the zone `sylent.tools`, for the custom domain.

If the first deployment refuses to create the DNS record of the custom domain, Zone › DNS › Edit on the same zone is added (Cloudflare's pages don't say whether the custom domain needs it). The token is saved as the secret `CLOUDFLARE_API_TOKEN`, and the id of the account as `CLOUDFLARE_ACCOUNT_ID`, in the environment `production` of the repository (Settings › Environments), which only the branch `main` may use: the job of the workflow that reads them runs wrangler alone, on the files the job before it built, and a pull request only tries the upload (`wrangler deploy --dry-run`), without them.

Before the merge of the pull request that adds the workflow, in this order, so that the first deployment finds them (a workflow that names a missing environment creates it without any rule):

1. The environment `production` created, its deployments allowed to the branch `main` only.
2. Its two secrets:

```sh
gh secret set CLOUDFLARE_API_TOKEN --env production
gh secret set CLOUDFLARE_ACCOUNT_ID --env production
```

The job of deployment also checks that it runs on `main`, whatever the rule of the environment.
