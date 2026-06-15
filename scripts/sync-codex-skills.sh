#!/bin/sh
# Regenerate codex-plugin/skills/ from the canonical root skills/.
# Codex packages a plugin by cloning the repo, and symlinks do not survive its
# install/cache step, so the Codex plugin needs a real (committed) copy of the
# skills. Root skills/ stays the single source of truth; this script mirrors it.
set -eu

repo_root="$(git rev-parse --show-toplevel)"
src="$repo_root/skills"
dest="$repo_root/codex-plugin/skills"

rm -rf "$dest"
cp -R "$src" "$dest"
find "$dest" -name '.DS_Store' -delete
