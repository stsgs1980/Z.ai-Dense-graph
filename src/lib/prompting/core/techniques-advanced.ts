/**
 * @stsgs/prompting -- Advanced Techniques (10/20)
 * Second half of the techniques array.
 */

import type { PromptTechnique, OutputFormat } from './types'

export const advancedTechniques: PromptTechnique[] = [
  {
    id: 'output-masking',
    name: 'Output Masking (Redaction)',
    description:
      'Instruct the model to mask or redact sensitive information in its output. This is useful ' +
      'when processing logs, user data, or code that may contain secrets, PII, or credentials. ' +
      'Combine with negative constraints for maximum effectiveness. The model should replace ' +
      'sensitive values with consistent placeholders.',
    category: 'constraint',
    applicableTo: ['json', 'plain-text', 'code'] as OutputFormat[],
    difficulty: 'intermediate',
    example:
      'Review this code for security issues. When showing the code in your response:\n' +
      '- Replace all API keys with [API_KEY_REDACTED]\n' +
      '- Replace all URLs containing credentials with [URL_REDACTED]\n' +
      '- Replace all email addresses with [EMAIL_REDACTED]\n' +
      '- Replace all file paths containing usernames with [PATH_REDACTED]',
  },
  // ── Role-Play ────────────────────────────────────────────
  {
    id: 'adversarial-reviewer',
    name: 'Adversarial Reviewer',
    description:
      'Assign a model the role of a harsh critic who must find flaws in a given solution, code, ' +
      'or design. This technique exploits the model\'s ability to analyze from multiple perspectives ' +
      'and often surfaces issues that a single-pass review misses. The adversarial framing forces ' +
      'the model to look for problems rather than validate assumptions.',
    category: 'role-play',
    applicableTo: ['markdown', 'plain-text', 'code'] as OutputFormat[],
    difficulty: 'advanced',
    example:
      'You are a senior security auditor who has seen thousands of vulnerabilities. ' +
      'Your job is to find EVERY possible flaw in this authentication flow. ' +
      'Be harsh. Assume the attacker is skilled and motivated. ' +
      'Rate each issue as Critical / High / Medium / Low with a concrete attack scenario.',
  },
  {
    id: 'stakeholder-simulation',
    name: 'Stakeholder Simulation',
    description:
      'Ask the model to adopt multiple stakeholder personas and give each one\'s perspective on ' +
      'a decision or design. This surfaces conflicting requirements early and helps find solutions ' +
      'that satisfy multiple constituencies. Each stakeholder should have a distinct voice, ' +
      'priority set, and concern focus.',
    category: 'role-play',
    applicableTo: ['markdown', 'conversation'] as OutputFormat[],
    difficulty: 'advanced',
    example:
      'Discuss this API design decision from 4 perspectives:\n' +
      '1. Frontend Developer (wants simple, typed responses)\n' +
      '2. Backend Engineer (wants performance and scalability)\n' +
      '3. Product Manager (wants flexibility for future features)\n' +
      '4. Security Engineer (wants minimal attack surface)\n\n' +
      'Each stakeholder gives their verdict: Approve / Reject / Approve with conditions.',
  },
  // ── Formatting ───────────────────────────────────────────
  {
    id: 'delimiter-pattern',
    name: 'Delimiter Pattern',
    description:
      'Use clear delimiters (---, ###, XML tags) to separate different sections of the prompt ' +
      'and expected output. Delimiters help the model understand where instructions end and ' +
      'data begins. They also make prompts more readable for humans and easier to debug. ' +
      'Triple-dash or XML-style tags work best for section separation.',
    category: 'formatting',
    applicableTo: ['json', 'markdown', 'code', 'yaml', 'plain-text'] as OutputFormat[],
    difficulty: 'beginner',
    example:
      '<instructions>\n' +
      'Extract all error codes from the log below. Return JSON with fields: code, message, count.\n' +
      '</instructions>\n\n' +
      '<data>\n' +
      '[ERROR] E1001: Database connection failed (x15)\n' +
      '[WARN] E2003: Cache miss rate above threshold (x8)\n' +
      '</data>',
  },
  {
    id: 'xml-tag-structure',
    name: 'XML Tag Structure',
    description:
      'Wrap different prompt sections in semantic XML tags to give the model explicit ' +
      'structure. This technique is used in production prompt engineering at scale because ' +
      'it eliminates ambiguity about which part of the prompt is an instruction vs data vs ' +
      'context vs example. Tags can be nested for complex prompts.',
    category: 'formatting',
    applicableTo: ['json', 'code', 'yaml', 'markdown'] as OutputFormat[],
    difficulty: 'intermediate',
    example:
      '<role>You are a TypeScript code reviewer.</role>\n' +
      '<task>Review the code for type safety issues.</task>\n' +
      '<rules>\n' +
      '  <rule priority="critical">No `any` types allowed.</rule>\n' +
      '  <rule priority="high">All props must have explicit types.</rule>\n' +
      '</rules>\n' +
      '<code>${userCode}</code>',
  },
  // ── Meta ─────────────────────────────────────────────────
  {
    id: 'meta-prompting',
    name: 'Meta-Prompting (Prompt for Prompt)',
    description:
      'Ask the model to generate or improve a prompt before executing it. This two-step ' +
      'process leverages the model\'s understanding of what makes effective prompts. In step 1, ' +
      'the model creates an optimized prompt. In step 2, that prompt is used (manually or ' +
      'automatically) to get the final result. Works best for complex, multi-step tasks.',
    category: 'meta',
    applicableTo: ['plain-text', 'markdown'] as OutputFormat[],
    difficulty: 'advanced',
    example:
      'I want to create a prompt that will generate a comprehensive REST API specification. ' +
      'First, generate the BEST possible prompt for this task. Your prompt should include ' +
      'role, context, constraints, output format, and examples. Output ONLY the prompt, ' +
      'ready to be pasted into a new conversation.',
  },
  {
    id: 'prompt-chaining',
    name: 'Prompt Chaining',
    description:
      'Break a complex task into a sequence of smaller prompts, where each prompt\'s output ' +
      'feeds into the next. This prevents context window overflow and allows each step to ' +
      'focus on a single responsibility. Chain boundaries should align with natural task ' +
      'boundaries. Store intermediate results to avoid recomputation.',
    category: 'meta',
    applicableTo: ['json', 'code', 'markdown', 'plain-text'] as OutputFormat[],
    difficulty: 'advanced',
    example:
      'Chain: Design -> Implement -> Test -> Review\n' +
      'Step 1: "Design the database schema for a project management app. Output SQL."\n' +
      'Step 2 (input: Step 1 output): "Generate TypeScript types matching this schema."\n' +
      'Step 3 (input: Step 2 output): "Write Zod validators for these types."\n' +
      'Step 4 (input: Step 3 output): "Review all 3 outputs for consistency."',
  },
  // ── Chain-of-Thought ─────────────────────────────────────
  {
    id: 'tree-of-thought',
    name: 'Tree of Thought',
    description:
      'Ask the model to explore multiple reasoning paths in parallel (like a search tree), ' +
      'evaluate each path, and backtrack if a path leads to a dead end. This is more powerful ' +
      'than linear chain-of-thought because it allows the model to recover from wrong reasoning ' +
      'directions. Best for problems with branching decision trees.',
    category: 'chain-of-thought',
    applicableTo: ['plain-text', 'markdown'] as OutputFormat[],
    difficulty: 'advanced',
    example:
      'Explore 3 possible approaches to this architecture decision:\n\n' +
      'Path A: Microservices with event-driven communication\n' +
      '  - Pros: ...\n' +
      '  - Cons: ...\n' +
      '  - Verdict: Continue or Abandon?\n\n' +
      'Path B: Modular monolith with shared libraries\n' +
      '  - Pros: ...\n' +
      '  - Cons: ...\n' +
      '  - Verdict: Continue or Abandon?\n\n' +
      'Path C: Serverless functions per domain\n' +
      '  - Pros: ...\n' +
      '  - Cons: ...\n' +
      '  - Verdict: Continue or Abandon?\n\n' +
      'Select the best path and explain why.',
  },
  {
    id: 'least-to-most',
    name: 'Least-to-Most Prompting',
    description:
      'Decompose a complex problem into a series of increasingly complex subproblems. Solve the ' +
      'simplest subproblem first, then use that solution to inform the next. This bottom-up ' +
      'approach ensures the model has correct building blocks before attempting the full solution. ' +
      'Each subproblem should be independently verifiable.',
    category: 'chain-of-thought',
    applicableTo: ['code', 'plain-text', 'markdown'] as OutputFormat[],
    difficulty: 'intermediate',
    example:
      'Build a URL parser incrementally:\n' +
      'Sub-problem 1: Extract the protocol (http/https) from a URL.\n' +
      'Sub-problem 2: Extract the hostname (using solution from step 1 as context).\n' +
      'Sub-problem 3: Extract the port number.\n' +
      'Sub-problem 4: Extract the path segments.\n' +
      'Sub-problem 5: Extract query parameters.\n' +
      'Final: Combine all into a single parseUrl(url: string) function.',
  },
  {
    id: 'plan-and-solve',
    name: 'Plan and Solve',
    description:
      'First, ask the model to create a detailed plan. Then, ask it to execute each plan step. ' +
      'This two-phase approach prevents the model from jumping to solutions without understanding ' +
      'the full scope. The planning phase should be separate from the execution phase -- do not ' +
      'let the model start solving while it is still planning.',
    category: 'chain-of-thought',
    applicableTo: ['markdown', 'code', 'plain-text'] as OutputFormat[],
    difficulty: 'intermediate',
    example:
      'PHASE 1 - PLAN (do NOT write code yet):\n' +
      'Create a numbered plan for implementing user authentication with NextAuth.js.\n' +
      'Each step should be specific enough that a developer could implement it without guessing.\n\n' +
      'PHASE 2 - EXECUTE (only after plan is approved):\n' +
      'Implement each plan step in order. Show the code for each step.',
  },
]