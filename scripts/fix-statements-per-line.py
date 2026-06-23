"""Fix max-statements-per-line warnings by splitting multi-statement lines.

Targets the common patterns:
1. `if (cond) { stmt1; stmt2 }` → multi-line
2. `const x = a, y = b` → keep (idiomatic, max:2 allows this)
3. Inline `score += X; feedback.push(...)` in scoring files
"""

import re, sys, os
from pathlib import Path

def fix_scoring_line(line: str) -> str:
    """Fix pattern: if (cond) { score += N; feedback.push('...') }"""
    # Pattern: if (...) { score += N; feedback.push('...') }
    m = re.match(r'^(\s*)if\s*\((.+?)\)\s*\{\s*(score\s*\+=\s*[\d.]+)\s*;\s*(feedback\.push\(.+?\))\s*\}(.*)$', line)
    if m:
        indent, cond, s1, s2, rest = m.groups()
        return f"{indent}if ({cond}) {{\n{indent}  {s1}\n{indent}  {s2}\n{indent}}}{rest}\n"
    return line

def fix_generic_multi_stmt(line: str) -> str:
    """Split lines with 3+ statements separated by semicolons inside braces or not."""
    # Count semicolons that are actual statement separators
    stripped = line.rstrip()
    indent = len(stripped) - len(stripped.lstrip())
    indent_str = stripped[:indent]
    content = stripped[indent:]

    # Skip import lines, comments, single-line returns
    if content.startswith('//') or content.startswith('*') or content.startswith('import') or content.startswith('export'):
        return line
    if content.startswith('return'):
        return line

    # Pattern: { stmt1; stmt2; stmt3 } or just stmt1; stmt2; stmt3
    # We only fix lines with 3+ semicolons (since max:2 allows 2)
    stmt_count = content.count(';')
    if stmt_count < 2:  # 2 statements = 1 semicolon between them, allowed by max:2
        return line

    # Try to split by semicolons while respecting parens/brackets
    parts = []
    depth = 0
    current = []
    for ch in content:
        if ch in '({[':
            depth += 1
        elif ch in ')}]':
            depth -= 1
        if ch == ';' and depth == 0:
            parts.append(''.join(current).strip())
            current = []
        else:
            current.append(ch)
    if current:
        remaining = ''.join(current).strip()
        if remaining:
            parts.append(remaining)

    if len(parts) < 3:
        return line

    # Check if it's wrapped in braces
    wrapped = False
    if content.startswith('{') and content.endswith('}'):
        wrapped = True
        parts[0] = parts[0][1:].strip()  # remove leading {
        parts[-1] = parts[-1][:-1].strip()  # remove trailing }

    # Reconstruct with each statement on its own line
    inner_indent = indent_str + '  '
    result_lines = []
    if wrapped:
        result_lines.append(indent_str + '{')
    for p in parts:
        p = p.strip()
        if p:
            result_lines.append(inner_indent + p)
    if wrapped:
        result_lines.append(indent_str + '}')

    return '\n'.join(result_lines) + '\n'

def fix_file(filepath: str) -> int:
    """Fix a single file, return number of lines changed."""
    with open(filepath, 'r') as f:
        lines = f.readlines()

    new_lines = []
    changes = 0
    for line in lines:
        # Try scoring-specific fix first
        fixed = fix_scoring_line(line)
        if fixed != line:
            new_lines.append(fixed)
            changes += 1
            continue

        # Generic multi-statement fix
        fixed = fix_generic_multi_stmt(line)
        if fixed != line:
            new_lines.append(fixed)
            changes += 1
            continue

        new_lines.append(line)

    if changes > 0:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)

    return changes

def main():
    # Get files from eslint output that have max-statements-per-line warnings
    import subprocess
    result = subprocess.run(
        ['npx', 'eslint', 'src/', '--format', 'json'],
        capture_output=True, text=True, cwd='/home/z/my-project', timeout=120
    )

    import json
    try:
        data = json.loads(result.stdout)
    except:
        print("Could not parse eslint JSON output")
        return

    files_with_stmt_issues = set()
    for item in data:
        for msg in item.get('messages', []):
            if 'max-statements-per-line' in msg.get('ruleId', ''):
                files_with_stmt_issues.add(item['filePath'])

    print(f"Files with max-statements-per-line: {len(files_with_stmt_issues)}")

    total_changes = 0
    for fp in sorted(files_with_stmt_issues):
        changes = fix_file(fp)
        if changes:
            rel = os.path.relpath(fp, '/home/z/my-project')
            print(f"  {rel}: {changes} lines fixed")
            total_changes += changes

    print(f"\nTotal: {total_changes} lines fixed")

if __name__ == '__main__':
    main()