# Repository Agent Rules

## Biome Quality Gate (required)

After making any code changes in this repository, always run Biome and ensure it passes before finishing.

Run these commands from the repo root:

```bash
bunx @biomejs/biome format --write web/src
bunx @biomejs/biome lint --write web/src
bunx @biomejs/biome check web/src
```

Do not skip these checks. If Biome reports issues, fix them and rerun until clean.
