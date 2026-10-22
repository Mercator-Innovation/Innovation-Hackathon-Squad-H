# Product backlog: Challenge 1, Healthier homes

Drafted by Glory Eyo (product owner) with Claude, 22 October 2026. **A draft for the squad to change.** The challenge and the idea are the squad's choice. Built on [our research note](research-awaabs-law-and-cloch.md), including its made-up assumptions.

**Who it's for first:** a Cloch housing officer, deciding which tenants to help before they get ill.
**Ordered by priority**, using MoSCoW (Must, Should, Could, Won't this time). The Musts are what we'd build today, in about three hours, with made-up data.

## Must have (the first version)

| # | As a… | I want… | So that… | Done when |
|---|---|---|---|---|
| M1 | squad | about 30 made-up homes and households, using the signals Cloch probably already has (energy rating, repeat condensation jobs, rent arrears, fuel vouchers, no access at gas check, energy advice notes) | we can build and demo without real data | the data is in `src/data/`, clearly fake, and no real names or addresses |
| M2 | housing officer | a list of homes, most at risk first | I know who to help first | the list loads, sorted, and works at phone width |
| M3 | housing officer | to see **why** each home is flagged, in plain words | I can trust it, check it and explain it | every flag shows its reasons, such as "3 condensation jobs in a year" |
| M4 | housing officer | to choose what to do, who does it and how urgently (energy advice visit, damp check, fuel support, wellbeing call) | the information leads to action | I can pick an action, a team and an urgency for any home |
| M5 | housing officer | a person, not the tool, to make the final call | no tenant is judged by a score alone | nothing happens until a person confirms it, and they can dismiss a flag with a reason |

## Should have (next, once the first version is up)

| # | As a… | I want… | So that… |
|---|---|---|---|
| S1 | housing officer | an Awaab's Law clock when damp or mould is found: investigate in 10 working days, written summary in 3, start repairs in 5, finish in 20 | we meet the legal deadlines |
| S2 | housing officer | to record what happened and whether the risk went down | we know if it worked |
| S3 | tenant | a simple, friendly way to say "my home is cold or damp", with no blame, by text, phone or a short form | I get help without it feeling like a complaint |
| S4 | tenant | to see and agree what information is used about me, especially health | I don't feel watched, and my privacy is respected |
| S5 | housing officer | to filter by area, team and urgency | I can plan my week |
| S6 | everyone | it to work with a keyboard and a screen reader, with good contrast | anyone can use it |

## Could have (if there's time)

| # | As a… | I want… |
|---|---|---|
| C1 | tenant | the written summary of what was found, in plain words, drafted for staff to check and send |
| C2 | manager | a summary: how many homes at risk, deadlines coming up, figures for the regulator |
| C3 | housing officer | a cold snap to raise the priority of the most vulnerable homes |
| C4 | housing officer | a map of flagged homes by street, to plan visits |
| C5 | housing officer | readings from the homes in the sensor pilot, where there are any |

## Won't have (this time)

- **Real tenant data**, or links to Cloch's real systems.
- **Decisions made automatically** without a person checking.
- **Sensors in every home.** Too costly, as the challenge says.
- **A complex prediction model.** Simple, explainable rules are enough to show the idea.

## Questions for the squad

- Is the housing officer the right person to start with, or the tenant?
- Do we agree on the five Musts for the first version?
- Which signals do we trust, and which feel too intrusive?
