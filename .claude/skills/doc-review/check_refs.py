"""Mechanical part of doc-review: finds what the documentation points at and no longer exists.

Read-only. Run from anywhere inside the repo:  python .claude/skills/doc-review/check_refs.py
It checks:
- paths between backticks in the documents (relative to the repo, to frontend/src, to backend,
  to backend/app or to the document's own folder);
- skills named in CLAUDE.md as **`name`** that have no .claude/skills/<name>/SKILL.md;
- CLAUDE.md files in folders above the repo, which Claude Code also loads.
It cannot judge meaning: contradictions and redundancies are for the reviewer.
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(
    subprocess.run(
        ["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True
    ).stdout.strip()
)
DOCS = ["CLAUDE.md", "README.md", "INVENTORY.md", ".claude/skills/*/SKILL.md"]
# Files of the apps that use viti-ui, named where the inventory says who uses each piece.
APP_FILES = {"App.vue", "main.ts", "SidebarMenu.vue", "HourSchedule.vue", "MonthStrip.vue"}
BASES = ["", "src"]
# Something that looks like a file or folder of the repo, not a command or a value.
# Bare file names only count with a code extension: a .json or .sql name is usually an example
# or a file somewhere else.
PATH_LIKE = re.compile(r"^[\w.\-]+(/[\w.\-]+)+/?$|^[\w\-]+\.(vue|ts|py|ps1|sh|css)$")
IGNORED = re.compile(
    r"[<>*]|^(https?:|/|~|\$|\.\./)|^[\w.-]+@"
    r"|^[\d.]+/\d+$|^\d+/(tcp|udp)$"  # networks and ports
    r"|^(feat|fix|chore|docs|refactor|origin)/"  # branches
    r"|^[a-z0-9-]+(\.[a-z0-9-]+)+/"  # domains
    r"|NNN"  # placeholders
    r"|^viti-ui/"  # public import paths, resolved through package.json exports
    r"|^\.claude/settings\.local\.json$"  # personal, never committed
)


def documents() -> list[Path]:
    found: list[Path] = []
    for pattern in DOCS:
        found.extend(sorted(ROOT.glob(pattern)))
    return found


def exists(ref: str, doc: Path) -> bool:
    ref = ref.rstrip("/")
    candidates = [ROOT / base / ref for base in BASES] + [doc.parent / ref]
    if any(c.exists() for c in candidates):
        return True
    # A bare file name: anywhere in the repo will do.
    if "/" not in ref:
        return any(
            p for p in ROOT.rglob(ref) if "node_modules" not in p.parts
        )
    return False


def main() -> int:
    problems = 0
    for doc in documents():
        text = doc.read_text(encoding="utf-8")
        for lineno, line in enumerate(text.splitlines(), 1):
            for ref in re.findall(r"`([^`\s]+)`", line):
                if IGNORED.search(ref) or not PATH_LIKE.match(ref) or ref in APP_FILES:
                    continue
                if not exists(ref, doc):
                    problems += 1
                    print(f"NO EXISTE  {doc.relative_to(ROOT)}:{lineno}  {ref}")

    claude_md = ROOT / "CLAUDE.md"
    if claude_md.exists():
        for name in re.findall(r"\*\*`([a-z][a-z0-9-]+)`\*\*", claude_md.read_text(encoding="utf-8")):
            if "." in name:
                continue
            if not (ROOT / ".claude" / "skills" / name / "SKILL.md").exists():
                problems += 1
                print(f"SIN SKILL  CLAUDE.md nombra la skill `{name}`, que no existe")

    for parent in ROOT.parents:
        if (parent / "CLAUDE.md").exists():
            problems += 1
            print(f"CLAUDE.md DE FUERA  {parent / 'CLAUDE.md'} también se carga en cada sesión")

    print("OK" if problems == 0 else f"{problems} referencias rotas")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
