# Mould Breakers: 2-minute show and tell

Presenter: Connor Archibald. Click-through slides: open `src/show-and-tell.html` (on the shared screen: http://localhost:8765/show-and-tell.html). About 250 spoken words.

## 0 to 60 seconds: what we built, and for whom

- **For Cloch's housing officers and tenants.** Damp and mould make people ill, and the tenants most at risk are often the ones who never get in touch. Awaab's Law now gives landlords strict deadlines.
- **The officer board** puts homes most at risk first, says why in plain words, and a person always decides. It runs the Awaab's Law deadlines (with bank holidays, delays and a compensation estimate), reaches tenants who've gone quiet (letter, then call, then a door knock), and has monthly reminders, a manager summary, a map and cold snap alerts.
- **The tenant page** is kind and blame-free: "Damp and mould are not your fault". A report lands on the board straight away and starts the legal clock. Show it live if there's time.

## 60 to 90 seconds: one thing that didn't work

- **The two sides only link up in the same browser.** There's no real back end yet, so it's a convincing demo, not a service.
- **Claude made mistakes too**: a phone layout bug, a clash in the code, a miscounted test. Every one was caught by checking (looking at the page, 54 automated checks, a screen reader), never by trusting it.

## 90 to 120 seconds: one surprise from the tooling

- **It pushed back like a careful colleague.** It pointed out a neighbour can't agree to share a tenant's health details, wouldn't put made-up homes on real people's houses, found a 2026 World Cup bank holiday, and checked every helpline number.
- **Two people who aren't developers built all of this.** A delivery manager built the tenant side and a QA engineer built a legal deadline engine, in about 50 shares with no clashes.
