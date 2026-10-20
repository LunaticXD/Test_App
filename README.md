# CyberSpace

## Run locally (pnpm)

```
corepack enable            # or: npm i -g pnpm
pnpm install --frozen-lockfile
pnpm dev                   # http://localhost:3000
```

Optional: copy `.env.example` to `.env` and set `GEMINI_API_KEY` for the AI features.

## Security setup (npm supply-chain hardening)

Configured in `pnpm-workspace.yaml`, `package.json` and `pnpm-lock.yaml`:

| Strategy | How it is applied |
| --- | --- |
| Package cooldown | `minimumReleaseAge: 10080` rejects versions published < 7 days ago |
| No postinstall scripts | `onlyBuiltDependencies: []` – no dependency may run install scripts |
| Block git/URL dependencies | `blockExoticSubdeps: true` (and none are used directly) |
| Trust downgrade check | `trustPolicy: no-downgrade` |
| Lockfile review | `pnpm-lock.yaml` is committed; check its diff in every PR |
| Clean installs | use `pnpm install --frozen-lockfile` (the equivalent of `npm ci`) |
| Careful upgrades | upgrade deliberately (`pnpm outdated`, `pnpm update --interactive`), not blindly |
| Scan before install | run `npx socket npm info <pkg>` or `npx npq install <pkg>` before adding a package |
