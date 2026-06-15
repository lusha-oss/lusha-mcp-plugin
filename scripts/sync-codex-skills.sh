#!/bin/sh
# Regenerate codex-plugin/skills/ from the canonical root skills/.
# Codex packages a plugin by cloning the repo, and symlinks do not survive its
# install/cache step, so the Codex plugin needs a real (committed) copy of the
# skills. Root skills/ stays the single source of truth; this script mirrors it.
#
# Once Codex preserves symlinks on install, this copy can be replaced by a
# symlink (codex-plugin/skills -> ../skills). Track:
#   https://github.com/openai/codex/issues/18863
#   https://github.com/openai/codex/issues/24770
set -eu

repo_root="$(git rev-parse --show-toplevel)"
src="$repo_root/skills"
dest="$repo_root/codex-plugin/skills"

rm -rf "$dest"
cp -R "$src" "$dest"
find "$dest" -name '.DS_Store' -delete
