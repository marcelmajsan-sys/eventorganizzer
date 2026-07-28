---
name: sync
description: Mirror the local dev code copy (cro-commerce-portal/cro-commerce-portal/src) into the root src/ that Vercel deploys, before committing. Use when changes were made in the dev copy and need to be promoted to root (e.g. "sync the copies", "copy dev to root", "promote my changes").
---

# sync

This repo keeps **two copies of the code**:

- **Dev copy (where edits are made):** `cro-commerce-portal/cro-commerce-portal/src/`
- **Root copy (what Vercel deploys):** `src/`

Changes made in the dev copy must be mirrored into root `src/` **before committing**, or the deploy ships stale code. This skill performs that mirror safely.

## Steps

1. **See what diverges.** Diff the two copies so you know exactly what will change in root:
   ```bash
   diff -ruq "cro-commerce-portal/cro-commerce-portal/src" "src"
   ```
   Show the user the list of differing files before copying. If nothing differs, say so and stop.

2. **Confirm direction.** The default and intended direction is **dev → root** (dev is where edits happen; root is the deploy target). If the diff suggests root has newer changes the dev copy lacks, STOP and flag it to the user rather than silently overwriting — do not assume.

3. **Mirror dev → root.** Copy the changed files from the dev `src/` into root `src/`, preserving structure:
   ```bash
   cp -r "cro-commerce-portal/cro-commerce-portal/src/." "src/"
   ```
   (Or copy only the specific changed files if the change is narrow — prefer narrow when the user named specific files.)

4. **Verify they now match.** Re-run the diff from step 1 and confirm it is clean (no differences in the files you intended to sync).

5. **Hand off to commit/push.** Once root `src/` matches, the change is ready to ship. Remind the user to run `/ship` (or commit + push) from the **root** — and that Vercel won't go live until the deploy finishes (~1–2 min).

## Guardrails

- **Never blind-overwrite.** Always diff first and show the user what changes. Quote paths with parentheses (Next.js `(dashboard)` route groups) when needed.
- Mirror **only `src/`** unless the user changed other tracked dirs (e.g. `public/`, config) — in that case diff and sync those too, explicitly.
- If dev and root have conflicting independent edits, surface the conflict; don't pick a winner yourself.
- This skill only copies between local copies — it does not commit or push. Use `/ship` for that.
