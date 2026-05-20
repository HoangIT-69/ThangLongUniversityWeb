# AGENTS.md

## Read first

Before making any code changes, read these files in order:

1. docs/PROJECT.md
2. docs/FRONTEND_RULES.md
3. docs/API_GUIDE.md
4. docs/COMPONENT_MAP.md
5. docs/TASKS.md
6. docs/profilethanglong.md

## Project rules

- Follow FRONTEND_RULES.md strictly.
- Use existing components from COMPONENT_MAP.md before creating new ones.
- Use API patterns from API_GUIDE.md.
- Check TASKS.md before starting a feature.
- Do not modify generated files such as routeTree.gen.ts unless required.
- Do not use `any` in TypeScript.
- Use TanStack Query for server state.
- Use shadcn/ui and TailwindCSS only for UI.
- After changes, run:
  - npm run lint
  - npm run build

## Working style

- Explain what files will be changed before editing.
- Keep changes small and task-focused.
- Do not rewrite unrelated code.