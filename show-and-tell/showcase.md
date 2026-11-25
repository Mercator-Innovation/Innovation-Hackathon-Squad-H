# Mould Breakers: showcase (Wed 25 Nov)

10-minute slot: about 9 minutes presenting, then 1 minute for questions. Around 1,100 spoken words.
Squad: Glory Eyo (delivery manager, product owner) and Connor Archibald (QA engineer, merge captain).
Before you start: say `get the latest and make it run for me`, so the demo shows the squad's latest version.
Slides, with the script for each slide in its speaker notes: https://claude.ai/artifact/W75qK6knL4ZJFEexeZZf9V (12 slides; the live demo is slide 10).

> Note: Glory's week-after reflection and three-week check-in aren't in her log yet, so sections 7 and 8 lean on Connor's. Add Glory's words if she does them before 14:00.

---

## 1. The challenge and what we built (0:00 to 1:30)

- **Challenge 1, Healthier homes:** find tenants at risk from damp, mould and cold before they get ill, including the ones who never get in touch.
- We chose it because Glory's early research on Awaab's Law and what Cloch says made it feel real and urgent, before we'd even picked it.
- **What we built:** a board for Cloch's housing officers that shows which homes to help first. It brings together signals Cloch already has: the home's condition, money worries, homes gone quiet, and support notes (only with consent).
- Every flag says **why** in plain words. The officer chooses what to do: energy advice, a damp check that starts the Awaab's Law clock, a wellbeing call, or a letter. **A person always makes the final call.**
- Around it: a kind, no-blame tenant page to report damp, a manager summary, reminders, cold snap alerts, sensor readings and an illustrated map. All made-up data.

**Demo (optional, about 45 seconds):** tenant page → report damp for H-104 → officer board shows H-104 flagged with the Awaab's Law clock already running. Click path is in `demo-click-path.md`.

## 2. How the afternoon actually went (1:30 to 3:00)

- **15:05 to 15:40:** named the squad, picked the challenge, and Glory turned her research into a backlog and decisions.
- **15:44:** first version on the shared screen, about 40 minutes in.
- **15:53:** the full Awaab's Law clock, four deadlines with days left on each card, from one prompt.
- **16:00 to 17:15:** both building side by side. Connor on the officer pages, Glory on the tenant pages. Accessibility fixes, a warm look, plain-English words, a tenant form that lands on the board straight away.
- **17:15 look together:** the reasons for each flag, the clock and the tenant form worked. Confusing: the tenant and officer pages only link up in the same browser. Missing: real data, sign-in and privacy, testing with real people, other languages.
- **17:25 to 18:35:** Glory built the manager summary, letters, cold snap alerts and the map. Connor built a contact ladder for tenants who've gone quiet. Then show and tell.
- **In numbers:** about 50 shares between two people, and no clashes that held us up.

## 3. What didn't work, and why (3:00 to 4:15)

- **It's a convincing demo, not a service.** The tenant and officer pages only talk to each other in the same browser. There's no real data, no sign-in, and nothing tested with real tenants or officers.
- **Claude made mistakes too.** A phone-layout bug it caused itself, a clash in the code that would have broken the board, a test with a miscounted date, and sharing once before reading a warning. Every one was caught by checking: looking at the page, running the tests, or a second look. Not by trusting it.
- **Tooling hiccups:** the first share stalled because git was waiting for a password out of sight. Glory got stuck at GitHub's sign-in the day before. Browsers kept showing old versions. Glory's laptop had no Python, so Claude found another way to preview the pages.
- **The Awaab's Law timings** are our reading of the guidance, not legal advice.

## 4. Where the tooling surprised us (4:15 to 6:00)

Prompts, word for word:

- Connor: **"can i grab and build number 1 from your list please"** → the full Awaab's Law clock, tested and shared.
- Connor: **"Yes, move the deadline maths into its own file and add a browser test page for it."** → 54 checks. Claude broke a rule on purpose and 3 went red, so the tests really catch mistakes.
- Glory: **"Lets make those assumptions"** → when we couldn't find how Cloch's tenants report repairs, Claude wrote realistic assumptions, clearly labelled to check with Cloch.
- Glory: **"As a tenant, create a page with a simple form that I can complete to notify the officer that my home has damp or mould issues that adds a flag on the officer's page"** → a working tenant page, linked to the board.

It pushed back like a careful colleague:

- Glory asked for "report for someone else". Claude pointed out **a neighbour can't agree to share the tenant's health information**, and hid that question for them.
- It spotted that under Awaab's Law **the clock starts when the tenant's reply arrives**, not when an officer reads it. Glory changed our decision.
- It **wouldn't put made-up homes on a real map**, because they'd sit on real people's houses.
- It **checked every helpline number** on the service's own site, and wouldn't invent a repairs number for a made-up landlord.
- It found a **2026 World Cup bank holiday in Scotland** none of us would have guessed.

## 5. Who did what outside their usual job (6:00 to 7:15)

- **Glory, delivery manager:** did the research and the backlog (a researcher's and a BA's job), tested the board as a housing officer, then built what she found was missing (a tester's and a developer's job). Later built cold snap alerts, sensor readings and the map. In her words: *"as a delivery manager I could ask for exactly what the officer needed and see it working within minutes."*
- **Connor, QA engineer:** chose the look of the whole site and had every word rewritten in plain English (a designer's and a content designer's job). Checked every page for accessibility and tested it with a screen reader (an accessibility specialist's job). Built most of the officer board.
- **Neither of us is a developer.** A week later, Connor said he never needed a human specialist.

## 6. Working as a squad with AI (7:15 to 8:00)

- **Easy:** a clear split (officer pages and tenant pages), small shares every few minutes, new things in their own files, and "get the latest" before starting anything. The shared screen kept us both looking at the same thing.
- **Hard:** we often changed the same files at once. Talking to each other about what we were changing is what kept it clean.
- **A squad of two** can't earn the Tag team badge (three people sharing within 15 minutes). Claude wouldn't fake a third person to earn it.

## 7. Ideas to carry forward, and where they went (8:00 to 8:30)

- Connor: **get more people skilled up on AI**, for internal work, bids, and client work where the tools are allowed.
- Three weeks on: **not tried yet**. Project work got in the way.
- Connor's most useful lesson: *"just learning what Claude is capable of even compared to the last hackathon."*

## 8. What Mercator should take from this (8:30 to 9:00)

- People can go far beyond their job title. A QA engineer and a delivery manager built a working, accessible prototype in an afternoon.
- **Checking still matters.** Claude was a careful colleague, but it made mistakes, and checking caught them.
- **Make time for it afterwards.** Good ideas stall when project work takes over.
- Both of us would come back. Both asked for **longer for demos**: Glory suggested 5 minutes per squad, to show the thinking as well as the build.

---

*Questions (1 minute)*
