#!/usr/bin/env python3
"""
patch-id-graph-add-zai-sts-008.py

Add the missing ZAI-STS-008 (skill-creator) node + its Related edge to
STD-SKILL-001, then recompute degrees and update the summary block.

This is the only gap between data/id-graph-full.json (24 ZAI-* nodes) and
the authoritative zai-skills/skills/INDEX.md catalog (25 ZAI-* skills).

Idempotent: if ZAI-STS-008 is already in the JSON, exits without changes.
"""
import json
import sys
from pathlib import Path

GRAPH_FILE = Path("/home/z/my-project/Z.ai-Dense-graph/data/id-graph-full.json")
NEW_NODE_ID = "ZAI-STS-008"
NEW_NODE = {
    "id": NEW_NODE_ID,
    "repo": "skills",
    "file": "zai-skills/skills/skill-creator/SKILL.md",
    "fmt": "frontmatter",
    "title": "Skill Creator",
    "prefix": "ZAI",
    "out_deg": 1,  # → STD-SKILL-001
    "in_deg": 0,
    "total_deg": 1,
}
NEW_EDGE = {
    "src": NEW_NODE_ID,
    "tgt": "STD-SKILL-001",
    "src_repo": "skills",
    "tgt_repo": "standards",
    "type": "related",
}


def recompute_degrees(nodes, links):
    """Recompute out_deg, in_deg, total_deg for every node based on links."""
    out_count = {n["id"]: 0 for n in nodes}
    in_count = {n["id"]: 0 for n in nodes}
    for link in links:
        if link["src"] in out_count:
            out_count[link["src"]] += 1
        if link["tgt"] in in_count:
            in_count[link["tgt"]] += 1
    for n in nodes:
        n["out_deg"] = out_count.get(n["id"], 0)
        n["in_deg"] = in_count.get(n["id"], 0)
        n["total_deg"] = n["out_deg"] + n["in_deg"]


def update_summary(summary, nodes, links):
    """Update the summary block to reflect new counts."""
    from collections import Counter
    prefix_counts = Counter(n.get("prefix", "?") for n in nodes)
    repo_counts = Counter(n.get("repo", "?") for n in nodes)
    type_counts = Counter(l.get("type", "?") for l in links)
    summary["ids_total"] = len(nodes)
    summary["related_edges"] = type_counts.get("related", 0)
    summary["aligned_edges"] = type_counts.get("aligned", 0)
    summary["total_edges"] = len(links)
    summary["prefixes"] = dict(prefix_counts)
    summary["by_repo"] = dict(repo_counts)


def main():
    if not GRAPH_FILE.exists():
        print(f"ERROR: {GRAPH_FILE} not found", file=sys.stderr)
        sys.exit(2)

    data = json.loads(GRAPH_FILE.read_text(encoding="utf-8"))
    nodes = data["nodes"]
    links = data["links"]
    summary = data.get("summary", {})

    # Idempotency check
    existing_ids = {n["id"] for n in nodes}
    if NEW_NODE_ID in existing_ids:
        print(f"{NEW_NODE_ID} already present. No changes made.")
        return 0

    # Validate target node exists
    if "STD-SKILL-001" not in existing_ids:
        print(f"ERROR: target node STD-SKILL-001 not found", file=sys.stderr)
        sys.exit(3)

    # Add node (preserve sorted order: insert after the last ZAI-* node)
    insert_idx = len(nodes)  # default: append
    for i, n in enumerate(nodes):
        if n.get("prefix") == "ZAI" and n["id"] < NEW_NODE_ID:
            insert_idx = i + 1
    nodes.insert(insert_idx, NEW_NODE)
    print(f"Inserted {NEW_NODE_ID} at index {insert_idx}")

    # Add edge
    links.append(NEW_EDGE)
    print(f"Appended edge: {NEW_EDGE['src']} → {NEW_EDGE['tgt']} ({NEW_EDGE['type']})")

    # Recompute degrees for all nodes
    recompute_degrees(nodes, links)
    print("Recomputed degrees for all nodes")

    # Update summary
    update_summary(summary, nodes, links)
    print(f"Updated summary: {summary['ids_total']} nodes, {summary['total_edges']} edges")
    print(f"  Prefixes: {summary['prefixes']}")
    print(f"  Repos: {summary['by_repo']}")

    # Write back
    GRAPH_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nWrote {GRAPH_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
