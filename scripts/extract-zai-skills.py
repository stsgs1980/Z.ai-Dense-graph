#!/usr/bin/env python3
"""
extract-zai-skills.py

Extract ZAI-* skill metadata from each skill's SKILL.md frontmatter.
Output: scripts/data/zai-skills-extracted.json with structure:
  [
    {
      "id": "ZAI-ARCH-001",
      "name": "mermaid-diagrams",
      "version": "1.0",
      "description": "...",
      "related": ["STD-SKILL-001", ...],
      "file": "zai-skills/skills/mermaid-diagrams/SKILL.md"
    },
    ...
  ]
"""
import json
import os
import re
import sys
from pathlib import Path

SKILLS_DIR = Path("/home/z/my-project/Z.ai-Dense-graph/zai-skills/skills")
OUTPUT = Path("/home/z/my-project/Z.ai-Dense-graph/scripts/data/zai-skills-extracted.json")

def parse_frontmatter(text):
    """Parse YAML-like frontmatter between --- markers."""
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    fm_text = parts[1].strip()
    body = parts[2]
    fm = {}
    current_key = None
    current_list = None
    for line in fm_text.split("\n"):
        line = line.rstrip()
        if not line:
            continue
        # List item under current key
        list_match = re.match(r"^\s+-\s+(.+)$", line)
        if list_match and current_key:
            if current_list is None:
                current_list = []
            current_list.append(list_match.group(1).strip())
            continue
        # Save previous list if any
        if current_key and current_list is not None:
            fm[current_key] = current_list
            current_list = None
        # Key: value
        kv_match = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$", line)
        if kv_match:
            key = kv_match.group(1)
            val = kv_match.group(2).strip()
            if val == "":
                # Could be start of list
                current_key = key
                current_list = []  # tentatively start a list; will keep only if next line is list item
            else:
                # Strip quotes
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                fm[key] = val
                current_key = key
                current_list = None
    # Save trailing list
    if current_key and current_list is not None and len(current_list) > 0:
        fm[current_key] = current_list
    elif current_key and current_list is not None and len(current_list) == 0:
        # Was tentatively a list, but no items followed — leave as empty string
        if current_key not in fm:
            fm[current_key] = ""
    return fm, body

def extract_description(body):
    """First non-empty, non-frontmatter line as description."""
    for line in body.split("\n"):
        s = line.strip()
        if not s:
            continue
        if s.startswith("#"):
            continue
        if s.startswith(">"):
            continue
        return s
    return ""

def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    skills = []
    for skill_dir in sorted(SKILLS_DIR.iterdir()):
        if not skill_dir.is_dir():
            continue
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue
        text = skill_md.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(text)
        zai_id = fm.get("id", "").strip()
        if not zai_id.startswith("ZAI-"):
            continue  # Skip skills without ZAI-* ID
        name = fm.get("name", skill_dir.name)
        version = str(fm.get("version", ""))
        description = fm.get("description", "") or extract_description(body)
        related = fm.get("related", [])
        if isinstance(related, str):
            related = [related] if related else []
        # Also extract "Aligned_with:" if present
        aligned = fm.get("Aligned_with", [])
        if isinstance(aligned, str):
            aligned = [aligned] if aligned else []
        related = list(related) + list(aligned)
        # Strip duplicates but preserve order
        seen = set()
        related_unique = []
        for r in related:
            if r not in seen:
                seen.add(r)
                related_unique.append(r)
        skills.append({
            "id": zai_id,
            "name": name,
            "version": version,
            "description": description[:200],  # truncate to 200 chars for JSON sanity
            "related": related_unique,
            "file": f"zai-skills/skills/{skill_dir.name}/SKILL.md",
            "repo": "zai-skills",
        })
    # Manual override: skill-creator is ZAI-STS-008 per INDEX.md catalog,
    # but its SKILL.md frontmatter is missing the `id:` field (catalog audit
    # correction 2026-06-21). We inject it from the authoritative INDEX.md.
    catalog_overrides = [
        {
            "id": "ZAI-STS-008",
            "name": "skill-creator",
            "version": "1.0",
            "description": "Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.",
            "related": ["STD-SKILL-001"],
            "file": "zai-skills/skills/skill-creator/SKILL.md",
            "repo": "zai-skills",
        },
    ]
    existing_ids = {s["id"] for s in skills}
    for override in catalog_overrides:
        if override["id"] not in existing_ids:
            skills.append(override)
            print(f"  [override] added {override['id']} from INDEX.md catalog (missing in SKILL.md frontmatter)")
    OUTPUT.write_text(json.dumps(skills, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Extracted {len(skills)} ZAI-* skills → {OUTPUT}")
    print(f"Total related edges available: {sum(len(s['related']) for s in skills)}")
    # Print summary
    for s in skills:
        print(f"  {s['id']:20s} | {s['name']:35s} | v{s['version']:8s} | related={s['related']}")

if __name__ == "__main__":
    main()
