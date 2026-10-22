---
# Answers as codes, for counting across squads. The questions and codes are in learning/questions.md.
name: Connor Archibald
profession: QA Engineer
role: none
location: remote
# At setup
ai_use_before: 4
hopes: [see-claude, build-fast, other-jobs, new-people]
feeling: excited
# At 19:00
worked_on: [code, design, content]
outside_usual_job: a-lot
got_in_way: [sharing, time]
ai_use_after: 4
enjoyed: loved
pace: right
worked_best: [building, mixed-squad, screen-badges, setup]
again: definitely
badges: [claude-master]
# In the week after
specialist:
helped_squad: []
idea_where: []
ai_use_week_after:
---

# Connor Archibald: learning log

## At setup
- How much I use AI tools in my work today: Every day
- What I'm hoping to get from the hackathon: See what Claude can do; Build something real, fast; Try work outside my usual job; Work with people I don't usually work with
- How I feel about using AI in my work: Excited

## During
<!-- Claude adds one line per moment: prompts that worked (word for word), dead ends, surprises, things done outside my usual job, what made working as a squad easier or harder -->
- 15:56 surprise: I was surprised how well it build it in one prompt. The prompt was "can i grab and build number 1 from your list please", and it built the full Awaab's Law clock (four deadlines, days left on each card, ticking off each step), tested it and shared it.
  - What's still missing or rough, from my QA eye:
    - Bank holidays aren't counted, so a deadline near a holiday could be a day or more out.
    - There's no way to record a delay (the reason, a new date, the interim steps), though the law asks landlords to do this.
    - Only a damp check starts the clock. A questionnaire reply that mentions damp or mould should start it the same day, as Glory decided, but replies don't exist yet.
    - Compensation for a missed deadline is mentioned, but not worked out.
    - A step marked done by mistake can't be undone.
    - A home can be dismissed while its legal clock is still running. That should be blocked, or at least warned.
    - What officers do is saved only in that browser, so the shared screen and each laptop show different things.
    - The timescales are our reading of the guidance and law-firm summaries, not legal advice. Emergencies aren't covered.
    - Not yet tested with a screen reader.
- 16:38 I tested the officer board with a screen reader, normally an accessibility specialist's job: it worked well. Long read-outs, but I think that's mainly because I don't use a screen reader every day, so I'm not used to it. (Before this, Claude had shortened each home's read-out from about 40 words to 8 to 20, and added "Back to the list of homes".)
- 17:16 badge: Claude Master
- 15:21 dead end: the first share stalled for minutes → git was quietly waiting for my SSH key's passphrase out of sight. Unlocking the key with ssh-add fixed it.
- 16:02 surprise: checking the official GOV.UK bank holiday list found a 2026 World Cup bank holiday in Scotland that none of us would have guessed. Checking real sources beat assuming.
- 16:06 prompt: "Yes, move the deadline maths into its own file and add a browser test page for it." → a test page with 26 checks (now 54). Claude broke the 10-day rule on purpose and 3 checks went red, so the tests really catch mistakes.
- 16:26 I checked every page for accessibility (labels, contrast, keyboard, screen reader read-outs, phone width, zoom, tap sizes), normally an accessibility specialist's job: it found real problems the screen didn't show, like errors that weren't read out and a focus ring hidden by shadows, and fixed them.
- 17:39 dead end: Claude made mistakes too: a phone-layout bug from its own clock label, a clashing name in the code that would have broken the board, a test with a miscounted date, and sharing once before reading a warning → each was caught by checking (looking at the page, the tests, or a second look), not by trusting it.
- 17:46 prompt: "we need better reminders for the officers to contact the people that have not been in contact themselves how could we do that?" → three options to choose from, then a contact ladder for tenants who've gone quiet (letter, then phone call, then a door knock), with nudges on the board and the manager summary. It goes straight at the challenge's hardest problem: tenants who never get in touch.
- 17:51 surprise: Claude checked every helpline number on the service's own website before putting it on the tenant page, and wouldn't make up a repairs number for a made-up landlord.
- 16:45 I chose the look of the whole site ("warm and friendly", picked from three options Claude described) and had all the officer, email and letter words rewritten in plain English, normally a designer's and a content designer's job: picking from options was quick, and every change was checked for contrast and accessibility before it was shared.
- 18:10 Working as a squad of two: about 50 shares between us (31 mine, 19 Glory's) with no clashes at all. What made it easy: a clear split (me on the officer pages, Glory on the tenant pages), small shares every few minutes, new things in their own files, and "get the latest" before starting anything.
- 18:06 Claude pushed back twice, and it was right to: it suggested an illustrated map instead of a real one, because made-up homes would have sat on real people's houses; and it wouldn't fake a third person's shares to earn the Tag team badge, suggesting we ask a facilitator instead.
- 18:10 dead end: tooling hiccups. Browsers kept showing old versions until a hard refresh (Cmd+Shift+R), the local preview server sometimes dropped files when pages reloaded quickly, and twice a quick script gave a false alarm that looking at the page cleared up.
- 18:20 I also tested the other pages (reminders, manager summary, map, tenant pages and test page) with a screen reader, not just the officer board.
- 18:10 About the hackathon itself: the Tag team badge (three people sharing within 15 minutes) can't be earned by a squad of two. Worth changing for next time.

## At 19:00
- What I worked on: Code or features; The design or the look; The words people see
- How much of it was outside my usual job: A lot
- What got in the way: Sharing or git; Not enough time
- How much I'd use AI tools in my work now: Every day
- How much I enjoyed the hackathon: Loved it
- The pace of the afternoon: About right
- What worked best for me: Building with Claude; Working in a mixed squad; The shared screen and badges; The setup before the day
- Would I take part in another: Definitely
- One thing to change next time: maybe a bit longer for demos

## In the week after
- Did I still need a human specialist: <answer>, for <what>
- What helped most when building as a squad: <answers>
- The most useful thing I learned: <in my words>
- **One idea to carry forward:** <in my words>, and where it could fit: <answers>
- How much I expect to use AI tools from now on: <answer>

## Three-week check-in (around 12 Nov)
- Did I try, share or suggest my idea anywhere? What happened, or what got in the way?
