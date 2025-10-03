# Remark Deflist Revisited °// Examples

[![GH][GH Badge]][GH]
[![NPM][NPM Badge]][NPM]
[![JSR][JSR Badge]][JSR]
[![Downloads][Downloads Badge]][Downloads]
[![Socket][Socket Badge]][Socket]

Published example implementations are available in this directory.  
They are also published as standalone repositories (templates):

- **Simple** → [veriKami/remark-deflist-revisited-simple][+:simple]
- **Express.js** → [veriKami/remark-deflist-revisited-express][+:express]
- **Cloudflare Worker** → [veriKami/remark-deflist-revisited-worker][+:worker]
- **Astro** → [veriKami/remark-deflist-revisited-astro][+:astro]

## Sample Revisited

You can play with these examples via **[StackBlitz]** web IDE:

| Simple Example        | Express Example       | Worker Example        | Astro Example         |
|:----------------------|:----------------------|:----------------------|:----------------------|
|[![SB][SB Badge]][SB_s]|[![SB][SB Badge]][SB_e]|[![SB][SB Badge]][SB_w]|[![SB][SB Badge]][SB_a]|

## Installation

### npm + pnpm + yarn

```bash
ツ npm create remark-deflist-revisited@latest
```
```bash
ツ pnpm create remark-deflist-revisited
```
```bash
ツ yarn create remark-deflist-revisited
```

### Cloudflare Worker demo (via module itself)

```bash
ツ npx @verikami/remark-deflist-revisited@latest
ツ npx @verikami/remark-deflist-revisited --help
```

## License

This project is Open Source and available under the MIT License  
2025 © MIT °// [veriKami] °// [Weronika Kami]

[veriKami]: https://verikami.com
[Weronika Kami]: https://linkedin.com/in/verikami

[Remark]: https://github.com/remarkjs/remark
[remark-deflist]: https://www.npmjs.com/package/remark-deflist
[Bun]: https://bun.sh
[Deno]: https://deno.com
[Cloudflare Workers]: https://workers.cloudflare.com
[Astro]: https://astro.build
[StackBlitz]: https://stackblitz.com

[page]: https://verikami.github.io/remark-deflist-revisited
[inline]: https://verikami.github.io/remark-deflist-revisited/script.esm.sh.html
[generated]: https://verikami.github.io/remark-deflist-revisited/generated

[module]: https://github.com/veriKami/remark-deflist-revisited
[+:simple]: https://github.com/veriKami/remark-deflist-revisited-simple
[+:express]: https://github.com/veriKami/remark-deflist-revisited-express
[+:worker]: https://github.com/veriKami/remark-deflist-revisited-worker
[+:astro]: https://github.com/veriKami/remark-deflist-revisited-astro

[GH Badge]: https://img.shields.io/badge/GitHub-Repository-blue?logo=github
[GH]: https://github.com/veriKami/remark-deflist-revisited

[CC Badge]: https://codecov.io/github/veriKami/remark-deflist-revisited/graph/badge.svg?token=0EWE7CIAVI
[CC]: https://codecov.io/github/veriKami/remark-deflist-revisited

[CI Badge]: https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml/badge.svg
[CI]: https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml

[NPM Badge]: https://img.shields.io/npm/v/@verikami/remark-deflist-revisited?logo=npm&logoColor=white&labelColor=red&color=black
[NPM]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited

[JSR Badge]: https://jsr.io/badges/@verikami/remark-deflist-revisited
[JSR]: https://jsr.io/@verikami/remark-deflist-revisited

[Downloads Badge]: https://img.shields.io/npm/dm/@verikami/remark-deflist-revisited.svg
[Downloads]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited

[Socket Badge]: https://badge.socket.dev/npm/package/@verikami/remark-deflist-revisited
[Socket]: https://socket.dev/npm/package/@verikami/remark-deflist-revisited

[SB Badge]: https://developer.stackblitz.com/img/open_in_stackblitz_small.svg
[SB_s]: https://stackblitz.com/github/veriKami/remark-deflist-revisited/tree/main/samples/simple?startScript=start
[SB_e]: https://stackblitz.com/github/veriKami/remark-deflist-revisited/tree/main/samples/express?startScript=start
[SB_w]: https://stackblitz.com/github/veriKami/remark-deflist-revisited/tree/main/samples/worker?startScript=dev
[SB_a]: https://stackblitz.com/github/veriKami/remark-deflist-revisited/tree/main/samples/astro?startScript=dev
