# Antigravity Project Instructions — Vercel Deployment

## Goal

Prepare the current React/Vite project for a reproducible GitHub → Vercel deployment. Do not replace the existing project or create a second nested app.

## Work order

1. Find the project root containing `package.json`.
2. Read `package.json` and identify the actual build command.
3. Run:

```bash
npm install
npm run build
```

4. If the build fails, report the first failing command and first actionable error. Fix only the smallest cause, then rerun the build.
5. Verify the expected output directory. For Vite this is normally `dist/` unless the config says otherwise.
6. Verify `.gitignore` contains:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

7. Scan tracked source for API keys, tokens, passwords, private URLs, and real personal data. Stop before commit if any are found.
8. Do not initialize another Git repository when `.git/` already exists.
9. Show `git status` and `git remote -v` before changing the remote.
10. Prepare these commands using the repository URL supplied by the human:

```bash
git add .
git commit -m "deploy: prepare vercel"
git branch -M main
git push -u origin main
```

11. For Vercel, use:
   - Framework: Vite or detected framework
   - Build command: the verified package script
   - Output directory: the verified build output
   - Root directory: the directory containing `package.json`
12. Only if React Router deep-link refresh returns 404, create `vercel.json` with a rewrite to `/index.html`.
13. After deployment, verify the production URL from a new browser context and report the visible result.

## Boundaries

- Never print or commit secrets.
- Never claim deployment success from local build success.
- Never claim form responses are stored unless an actual external storage/form endpoint returns a receipt.
- A static Vercel deployment has no durable response storage by itself.
- Do not add a database, analytics, authentication, or external form service unless explicitly requested.
- Do not use learner conversations, learner examples, or learner-submitted artifacts as source material.

## Required receipt

Return exactly:

```text
PROJECT_ROOT=
BUILD_COMMAND=
BUILD_RESULT=
OUTPUT_DIRECTORY=
GIT_REMOTE=
COMMIT=
VERCEL_URL=
EXTERNAL_OPEN_RESULT=
RESPONSE_STORAGE=NONE|VERIFIED_ENDPOINT
REMAINING_BLOCKER=NONE|...
```
