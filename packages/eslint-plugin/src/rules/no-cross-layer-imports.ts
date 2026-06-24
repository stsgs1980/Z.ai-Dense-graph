import type { Rule } from 'eslint'

interface LayerRule {
  from: RegExp
  forbiddenImports: RegExp[]
  message: string
}

const LAYER_RULES: LayerRule[] = [
  {
    from: /\/shared\/ui\//,
    forbiddenImports: [
      /\/shared\/hooks\//,
      /\/features\//,
      /\/app\//,
      /\/entities\//,
    ],
    message:
      'shared/ui/ (base layer) cannot import from features/, entities/, app/, or shared/hooks/. Use only external libs.',
  },
  {
    from: /\/shared\/lib\//,
    forbiddenImports: [
      /\/features\//,
      /\/app\//,
    ],
    message:
      'shared/lib/ (utilities layer) cannot import from features/ or app/. Dependencies flow into lib/, not out.',
  },
  {
    from: /\/shared\/hooks\//,
    forbiddenImports: [
      /\/features\//,
      /\/app\//,
    ],
    message:
      'shared/hooks/ cannot import from features/ or app/. Should only depend on shared/lib/, shared/config/, or external deps.',
  },
  {
    from: /\/shared\/config\//,
    forbiddenImports: [
      /\/features\//,
      /\/app\//,
    ],
    message:
      'shared/config/ (static data) cannot import from features/ or app/. Must be self-contained.',
  },
]

export const noCrossLayerImports: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce FSD layer boundaries in src/ — forbid upward imports',
      category: 'Architecture',
      recommended: true,
    },
    messages: {
      crossLayerImport:
        '{{message}} File: "{{fromFile}}" imports "{{importPath}}".',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename.replace(/\\/g, '/')

    if (!filename.includes('/src/')) return {}

    const matchedRule = LAYER_RULES.find((rule) => rule.from.test(filename))
    if (!matchedRule) return {}

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value as string
        if (importPath.startsWith('.')) {
          const resolved = resolveRelativeImport(filename, importPath)
          if (resolved && matchedRule.forbiddenImports.some((p) => p.test(resolved))) {
            context.report({
              node: node.source,
              messageId: 'crossLayerImport',
              data: { message: matchedRule.message, fromFile: filename, importPath },
            })
          }
        } else if (importPath.startsWith('@/')) {
          const resolved = importPath.replace(/^@\//, '/src/')
          if (matchedRule.forbiddenImports.some((p) => p.test(resolved))) {
            context.report({
              node: node.source,
              messageId: 'crossLayerImport',
              data: { message: matchedRule.message, fromFile: filename, importPath },
            })
          }
        }
      },
    }
  },
}

function resolveRelativeImport(fromFile: string, importPath: string): string | null {
  const fromDir = fromFile.substring(0, fromFile.lastIndexOf('/'))
  const normalized = importPath.replace(/^\.\//, '')
  const segments = normalized.split('/')
  let depth = 0
  const pathSegments: string[] = fromDir.split('/').filter(Boolean)

  for (const seg of segments) {
    if (seg === '..') {
      if (pathSegments.length > 0) pathSegments.pop()
      else return null
    } else if (seg !== '.') {
      pathSegments.push(seg)
    }
  }

  return '/' + pathSegments.join('/')
}
