# 🧠 Developer Git Workflow Guide (For Feature Development)

A simple and safe Git guide for developers working on **feature branches**. Follow every step **exactly** to avoid conflicts and broken code.

## ✅ Prerequisites

- You already cloned the repo.
- You have access to the remote.
- You're working in a team, and `dev` is the base branch.

## 🔁 Step-by-Step Workflow

### 1. Switch to the dev branch

```bash
git checkout dev
```

✅ This ensures you're on the right base branch before starting your work.

### 2. Pull the latest changes from remote

```bash
git pull origin dev
```

✅ Syncs your local `dev` with the latest code on GitHub.

### 3. Create a new feature branch from dev

```bash
git checkout -b feature/your-feature-name
```

✅ Creates and switches to a new branch. Always start your feature branches from **updated** `dev`.

📛 Use branch names like:

- `feature/login-form`
- `feature/payment-api`

### 4. Work on your feature

Make your changes, commit often.

```bash
git add .
git commit -m "feat: add login form UI"
```

✅ Keep commits focused and descriptive.

### 5. Sync your feature branch with dev often (important!)

```bash
git fetch origin
```

✅ Fetches latest changes from GitHub (but doesn't apply them yet).

```bash
git rebase origin/dev
```

✅ Reapplies your commits on top of the latest `dev`.

❗ Rebase helps keep commit history clean and avoids conflicts when merging later.

⚠️ If conflicts happen, fix them manually, then run:

```bash
git add .
git rebase --continue
```

### 6. Push your feature branch to GitHub

```bash
git push -u origin feature/your-feature-name
```

✅ Sends your feature branch to GitHub.

### 7. Create a Pull Request

- Go to GitHub.
- Click "Compare & pull request".
- Make sure the **base branch is** `dev`.
- Title and describe your PR properly.

📌 Example: "Add Login Form UI - feature/login-form"

### 8. After Merge

```bash
git checkout dev
git pull origin dev
```

✅ Update your local `dev` after PR is merged.

```bash
git branch -d feature/your-feature-name
```

✅ Delete old feature branch locally (clean workspace).

## 🔥 Common Errors & Fixes

### 🧨 Error: "Cannot create branch... already exists"

```bash
git branch -d feature
```

❌ You named the branch wrong. Use `feature/your-feature-name`, not just `feature`.

### 🧨 Error during rebase

```bash
git rebase --abort
```

Cancels the rebase if it goes wrong. Start again.

## ✅ Golden Rules

- Always branch from latest `dev`.
- Rebase your feature branch regularly.
- Never push directly to `dev` or `main`.
- Always use `feature/` prefix in branch names.
- Ask if unsure, don't guess.

---

This file is for internal use by the dev team. Keep it open while working.

**Stay clean. Stay synced. Avoid conflicts.** 💪

## Contributors

<a href="https://github.com/celestium-x/triangulum-x/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=celestium-x/triangulum-x&max=400&columns=20" />
</a>

Rishi Kant
