# How to Build a Real Web App with Claude Code — A Non-Coder's Practical Guide

**Audience:** Complete beginners. No coding experience required.
**What you'll build:** A full web application — like the ProposalFlow platform (user login, AI-generated content, database, e-signatures, live deployment).
**Tools you'll use:** Claude Code, VS Code, GitHub, Vercel, Supabase.

---

## What Is Claude Code?

Claude Code is an AI assistant made by **Anthropic** that lives inside your code editor. Unlike ChatGPT (which you talk to in a browser), Claude Code can:

- Read every file in your project
- Write and edit code directly
- Run terminal commands on your computer
- Remember your project context across conversations
- Plan entire apps before building them

Think of it as hiring a senior software engineer who never sleeps, never complains, and works inside your computer.

---

## Part 1 — Setting Up Your Computer (One Time Only)

### Step 1: Install VS Code

VS Code is the "workspace" where you and Claude will build together.

1. Open your browser and search **"VS Code download"**
2. Click the result from **code.visualstudio.com**
3. Download the Mac version (`.dmg` file)
4. Open the downloaded file and drag VS Code into your Applications folder
5. Open VS Code

**What you'll see:** A dark window with a welcome screen. This is your code editor.

---

### Step 2: Install Node.js

Node.js is the engine that runs web apps on your computer during development.

1. Search **"Node.js download"** in your browser
2. Go to **nodejs.org**
3. Download the **LTS version** (the recommended one)
4. Open the installer and click through all the defaults
5. When done, open **Terminal** (Cmd + Space → type Terminal → Enter)
6. Type: `node --version` and press Enter
7. You should see something like `v20.11.0` — that means it worked

---

### Step 3: Install Claude Code

Claude Code is an extension that connects VS Code to the Claude AI.

1. Open VS Code
2. Click the **Extensions icon** on the left sidebar (it looks like 4 squares)
3. In the search box, type **"Claude Code"**
4. Click **Install** on the result from Anthropic
5. Once installed, you'll see a Claude icon appear in your sidebar

**Sign in:**
1. Click the Claude icon
2. Click **Sign In**
3. It will open your browser → log in with your Anthropic account (create one free at claude.ai if you don't have one)
4. Come back to VS Code — you're connected

---

### Step 4: Create Accounts You'll Need

Before building, create free accounts on these platforms:

| Service | What It Does | Where |
|---|---|---|
| **GitHub** | Stores your code online | github.com |
| **Supabase** | Your app's database and user login | supabase.com |
| **Vercel** | Publishes your app to the internet | vercel.com |
| **Resend** | Sends emails from your app | resend.com |

Sign up for all four. Use the same email for all of them to keep things simple.

---

## Part 2 — Starting a New Project

### Step 5: Create Your Project Folder

1. On your Mac, go to your **Desktop**
2. Create a new folder — name it something like `MyApp`
3. Open VS Code
4. Click **File → Open Folder**
5. Select the `MyApp` folder you just created
6. VS Code now shows your empty project

---

### Step 6: Open the Claude Chat Panel

1. In VS Code, click the **Claude icon** in the left sidebar
2. A chat panel opens on the right side of your screen
3. This is where you talk to Claude Code — think of it as iMessage but for building apps

---

## Part 3 — Using Plan Mode (The Most Important Step)

**Plan Mode** is how you and Claude design the entire app *before* a single line of code is written. This prevents costly mistakes and wasted time.

### What is Plan Mode?

Plan Mode forces Claude to think through your entire project — the database, the pages, the features, the technical choices — and write it all down as a plan for you to review and approve. Claude cannot write any code until you approve the plan.

### Step 7: Enter Plan Mode

In the Claude chat panel, type:

```
/plan
```

Press Enter. Claude will switch into planning mode and tell you it's ready.

---

### Step 8: Describe Your App

Now describe what you want to build in plain English. Be as detailed as possible. Here is the exact approach that worked for the ProposalFlow app:

**Good description example:**
```
I want to build a proposal generation platform. Here's what it should do:

1. Users sign up and log in with their email and password
2. Once logged in, they see a dashboard with all their proposals
3. They can create a new proposal in two ways:
   - Ask an AI to write it based on a brief they fill in
   - Choose from a set of ready-made templates
4. They can edit the proposal in a rich text editor (like Google Docs)
5. When ready, they click Send — the client receives a link by email
6. The client opens the link and sees a beautiful proposal page with:
   - The company logo and contact info at the top
   - The full proposal content
   - A place to draw their signature
7. After signing, the proposal is marked as "Signed" in the dashboard
8. The company's logo, brand colors, name, address, and phone are all set in Settings

The platform should look professional and work on phones too.
Tech preferences: Next.js, Supabase for the database, and deploy to Vercel.
```

**Tips for a good description:**
- Write it like you're explaining to a new employee on their first day
- Describe what users *do*, not how the app works technically
- Mention every screen or page you want
- Mention any specific services (e.g. "use Stripe for payments" or "use Supabase for the database")

---

### Step 9: Review the Plan

Claude will produce a detailed plan that includes:

- A list of every page/screen
- The database structure (what information gets stored)
- The technical stack (which tools will be used)
- Step-by-step implementation order

**Read through it carefully.** Ask questions in plain English:

```
Can you explain what "Row Level Security" means in plain English?
```

```
Why did you choose Supabase over Firebase?
```

```
Can we add a feature where clients can also pay online after signing?
```

Claude will answer and update the plan accordingly.

**When you're happy with the plan, type:**
```
The plan looks good. Let's build it.
```

Claude will exit Plan Mode and start building.

---

## Part 4 — The CLAUDE.md File

### What is CLAUDE.md?

`CLAUDE.md` is a text file you place in your project folder. Every time Claude opens your project — even in a new conversation — it reads this file first. It tells Claude the rules for your specific project.

Think of it as the **employee handbook** for your AI developer.

### Step 10: Create Your CLAUDE.md

After Claude generates your project, ask it:

```
Create a CLAUDE.md file for this project that explains the tech stack, 
any unusual patterns, and rules Claude should always follow when working 
on this codebase.
```

Claude will create it. A good CLAUDE.md might say things like:

```markdown
# Project Rules

## Stack
- Next.js 16 (App Router)
- Supabase for auth and database
- Tailwind CSS for styling
- Deployed on Vercel

## Important Notes
- This version of Next.js uses proxy.ts instead of middleware.ts
- Never use hardcoded colors — always use the brand_color from the user's profile
- The AI generation endpoint uses claude-haiku-4-5-20251001 model

## Never Do
- Never commit .env.local to git
- Never remove Row Level Security from any Supabase table
```

You can add to CLAUDE.md yourself in plain English as you learn more about your project. Every rule you add saves you from having to repeat it to Claude in future conversations.

---

## Part 5 — Building the App

### Step 11: Follow Claude's Lead

Once building begins, Claude will:

1. Create files and folders automatically
2. Ask you to run commands in the Terminal (always inside VS Code's built-in terminal)
3. Ask you to do things in external services (like creating a Supabase project)
4. Show you what it's building and why

**How to open VS Code's built-in terminal:**
- Press **Ctrl + ` ** (the backtick key, top-left of keyboard)
- A terminal panel opens at the bottom of VS Code
- This is where you paste and run commands Claude gives you

### Step 12: The External Services Setup

Claude will guide you through each of these, but here's what to expect:

#### Supabase (Database)
1. Go to supabase.com → New Project
2. Give it a name (e.g. "MyApp")
3. Set a database password — save it somewhere safe
4. Claude will give you SQL code to run in Supabase's SQL Editor
5. Copy → paste → run it. This creates all your database tables.

#### GitHub (Code Storage)
1. Create a new repository on github.com
2. Make it **Public** (required for free Vercel deployment)
3. Claude will give you terminal commands to connect your project to GitHub

#### Vercel (Live Deployment)
1. Go to vercel.com → Add New Project
2. Connect your GitHub account
3. Select your repository
4. Add your environment variables (Claude will tell you exactly which ones)
5. Click Deploy

---

### Step 13: Environment Variables

Environment variables are secret keys your app uses to connect to external services. They live in a file called `.env.local` in your project — this file is **never uploaded to GitHub** (it stays only on your computer).

Claude will tell you exactly which variables you need. They look like this:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-api03-...
RESEND_API_KEY=re_...
```

**Where to get each key:**
- Supabase keys → Supabase dashboard → Project Settings → API
- Anthropic key → console.anthropic.com → API Keys
- Resend key → resend.com → API Keys

**How to add them to Vercel:**
Vercel Dashboard → Your Project → Settings → Environment Variables → paste each one

---

## Part 6 — Testing Your App Locally

### Step 14: Run the Development Server

Before deploying, you always test on your own computer first.

In VS Code's terminal, type:
```bash
npm run dev
```

Then open your browser and go to:
```
http://localhost:3000
```

You'll see your app running live on your computer. No one else can see it yet — it's just for you to test.

**What to test:**
- Can you sign up with an email?
- Does the dashboard load after logging in?
- Can you create a proposal?
- Does the client link open correctly?

When you find something broken, describe it to Claude in plain English:

```
When I click "Send to Client", nothing happens. The button just stays there. 
No email arrives. What's wrong?
```

Claude will investigate and fix it.

---

## Part 7 — Talking to Claude Effectively

### The Golden Rules of Prompting Claude

These are the most important lessons from building ProposalFlow:

#### Rule 1: Describe the problem, not the solution
**Wrong:** "Add a useEffect hook that fetches the profile data"
**Right:** "When I open Settings, my name and company info don't load. The fields are empty."

You don't need to know what a `useEffect` is. Describe what you see and what you expect.

#### Rule 2: Include error messages exactly
When something breaks, copy the exact error message and paste it to Claude:

```
I'm getting this error in my browser:
"TypeError: Cannot read properties of null (reading 'company_name')"
```

Claude will diagnose it precisely.

#### Rule 3: Say what you see vs what you expected
```
I expected: After signing, the proposal page shows "Signed by John Smith"
What actually happened: The page refreshes but still shows the signature pad
```

#### Rule 4: Ask for explanations in plain English
```
You just added something called "Row Level Security". Can you explain 
what that does and why it matters, without using technical jargon?
```

Claude will always explain clearly when asked.

#### Rule 5: Ask before big changes
```
Before you change the database structure, explain what you're about to 
do and whether it will delete any existing data.
```

---

## Part 8 — Deploying to the Internet

### Step 15: Push to GitHub

Every time you want your changes to go live, you push your code to GitHub. Your Vercel deployment then updates automatically within 1-2 minutes.

**Using GitHub Desktop (easiest):**
1. Open GitHub Desktop
2. You'll see a list of changed files
3. Write a short summary of what changed (e.g. "Fixed logo upload")
4. Click **Commit to main**
5. Click **Push origin**

Vercel detects the push and redeploys your app automatically.

---

### Step 16: Check Your Live Deployment

After pushing:
1. Go to vercel.com → your project
2. Click the **Deployments** tab
3. Wait for the status to show **Ready** (green)
4. Click the URL to open your live app

---

## Part 9 — Growing Your App Over Time

### How to Add New Features

Every new feature follows the same process:

1. **Describe it to Claude** in a new conversation:
   ```
   I want to add a feature where clients can leave a comment or 
   question on the proposal before signing. How would we do this?
   ```

2. **Use Plan Mode** for any feature that touches the database:
   ```
   /plan — I want to add a comments feature to proposals
   ```

3. **Review → Approve → Build → Test → Deploy**

### How to Fix Bugs

1. Copy the error message
2. Describe what you were doing when it happened
3. Paste to Claude
4. Claude fixes it
5. Test it locally
6. Push to GitHub

### The /review Command

After finishing a batch of features, run:
```
/review
```

Claude will automatically check your recent code for:
- Unused imports and dead code
- Inefficient database queries
- Security issues
- Anything that could be simplified

This keeps the codebase clean as it grows.

---

## Part 10 — Common Mistakes to Avoid

| Mistake | What Happens | How to Avoid |
|---|---|---|
| Committing `.env.local` to GitHub | Your secret API keys become public | Claude adds `.gitignore` automatically — never delete it |
| Skipping Plan Mode for big features | You build the wrong thing and have to redo it | Always `/plan` before features that change the database |
| Not testing locally before deploying | Broken app goes live | Always run `npm run dev` and test first |
| Asking Claude to "improve" everything | Claude changes things you didn't ask for | Be specific: "Fix only the logo upload bug" |
| Forgetting to add env vars to Vercel | App works locally but breaks when deployed | After adding a new key to `.env.local`, always add it to Vercel too |

---

## Quick Reference Card

### Commands You'll Use Every Day

| What you want | Command | Where |
|---|---|---|
| Start planning a feature | `/plan` | Claude chat |
| Run your app locally | `npm run dev` | VS Code terminal |
| Install a new package | `npm install [package-name]` | VS Code terminal |
| See recent changes | `git log --oneline -5` | VS Code terminal |
| Run a code review | `/review` | Claude chat |

### The Development Loop

```
1. Describe what you want → Claude
2. Claude builds it
3. npm run dev → test in browser
4. Something broken? → describe to Claude → fix
5. Push to GitHub → Vercel deploys
6. Check live site
7. Repeat
```

### What Claude Can and Cannot Do

**Claude CAN:**
- Write all the code from scratch
- Fix bugs from error messages
- Explain any part of the codebase in plain English
- Suggest better ways to do things
- Set up databases, auth, APIs, email sending
- Review and clean up existing code

**Claude CANNOT:**
- Create accounts on external services for you
- Access your Supabase, GitHub, or Vercel dashboards directly
- Know what your app looks like visually (unless you describe it)
- Guarantee zero bugs — always test before going live

---

## Glossary of Terms You'll Hear

| Term | Plain English Meaning |
|---|---|
| **Repository (repo)** | Your project's folder stored on GitHub |
| **Deploy** | Publishing your app so anyone on the internet can use it |
| **Database** | Where your app stores all its data (users, proposals, etc.) |
| **API** | A way for two services to talk to each other |
| **Environment variable** | A secret key stored outside your code |
| **Frontend** | What users see in their browser |
| **Backend** | The server logic users don't see |
| **Authentication (auth)** | The login/signup system |
| **Migration** | A script that sets up or changes your database structure |
| **npm** | The tool that installs code libraries for your project |
| **localhost:3000** | Your app running on your own computer for testing |

---

*This guide was created based on the real process used to build the ProposalFlow platform — a complete web app with AI generation, e-signatures, email, and live deployment — built without a traditional development team.*
