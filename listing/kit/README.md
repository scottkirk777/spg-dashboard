# SPG listing kit

What an SPG agent gets back from one intake form: a listing page, a prep and staging guide, four emails, four door hangers, MLS remarks and six days of social, all in the agent's name. Rebuilt Nov 10, 2026 on GitHub Pages after the Netlify kit was lost.

- Intake form: https://sierrapacificgroup.homes/listing/start/ (posts to scott@wrspg.com through Web3Forms, subject `[SPG listing intake] <address> from <agent>`)
- Previews build to: https://sierrapacificgroup.homes/listing/preview/<slug>/ (noindexed, unlinked)
- The builder is the hourly scheduled task "Listing intake, build and send the preview". It follows RUNBOOK-AUTOBUILD.md, which outranks everything else.
- Worked example: `example-551-gage/` is Joe Cavazos's 551 Gage Ct campaign, the page and the prep guide, exactly as built. Copy it, do not edit it.

## Layout

```
listing/
  start/                  the intake form and its sent page
  kit/
    README.md             this file
    RUNBOOK-AUTOBUILD.md  the build procedure, step by step
    example-551-gage/     worked example: index.html, prep/index.html, saturday.ics, sunday.ics, img/
    templates/
      emails.md           the four emails with [BRACKETS]
      hangers.html        the four door hangers, two up on letter, black ink
      remarks-and-social.md
  preview/<slug>/         one folder per campaign, same shape as the example
```

## The config

Every campaign starts as a config. Write it as `preview/<slug>/config.json` so the next run can see what was built from what. Every value marked (record) must come from the county record or a MetroList or CoreLogic property report, never the agent's flyer.

```json
{
  "slug": "551-gage",
  "address": "551 Gage Ct, Folsom, CA 95630",
  "address_short": "551 Gage Ct",
  "city": "Folsom",
  "neighborhood": "Broadstone",
  "price": 739000,
  "mls_number": null,
  "record": {
    "beds": 4, "baths_full": 3, "sqft": 1851, "lot_sqft": 5500, "year": 2002,
    "builder": "Elliott Homes", "hoa": "None", "stories": 2, "ground_floor_sqft": 1014,
    "garage": "2 car attached", "street_type": "court",
    "systems": [{"what": "Heating and air", "year": 2012}, {"what": "Gas water heater", "year": 2018}],
    "source": "Sacramento County Assessor, APN 072-0000-000, pulled 2026-09-17"
  },
  "comps": [
    {"address": "1405 Byrne Ct", "when": "Jul 2026", "price": 770000, "sqft": 1851, "same_plan": true},
    {"address": "1384 Walden Dr", "when": "May 2026", "price": 770000, "sqft": 1834, "same_plan": true}
  ],
  "comps_label": "Same plan, closed",
  "comps_source": "Closed prices from Sacramento County public records. Four bed, three bath, two-story Elliott Homes plan, 1,834 to 1,851 square feet.",
  "spread_claim": "Four identical houses on this plan closed between $700,000 and $770,000 in the last year",
  "open_houses": [
    {"day": "Saturday", "date": "2026-09-19", "start": "12:00", "end": "16:00"},
    {"day": "Sunday", "date": "2026-09-20", "start": "12:00", "end": "16:00"}
  ],
  "neighbor_preview": {"day": "Friday", "date": "2026-09-18", "start": "17:30", "end": "19:00"},
  "offer_review_date": null,
  "one_thing_noticed": "The living room ceiling goes up two stories and the staircase is right there when you walk in.",
  "agent": {
    "name": "Joe Cavazos", "title": "Broker Associate, REALTOR", "dre": "00921773",
    "cell": "916-201-8482", "email": "joe@wrspg.com", "headshot": "img/joe.jpg",
    "bio_line": "Joe has sold homes around Folsom for more than 40 years."
  },
  "legacy_table": {"date_long": "January 28, 2027", "time": "6:00 to 7:00 PM"},
  "site_url": "https://sierrapacificgroup.homes/listing/preview/551-gage/",
  "photos": "skip"
}
```

`comps_label` and `spread_claim` exist because the first kit hardcoded "Same floor plan" and "Four identical houses" and put a false claim in front of a seller on a listing where the comps were only same size. Say what is actually true about that set of sales.

## Traps

- The agent's flyer is not a source. On 551 Gage the flyer said 2,450 square feet and the record said 1,851.
- Owner names and non-market transfers (a trust, a family deed) never appear anywhere and are never used as a comp.
- No MLS number means no photos. Build everything else, leave the gallery as a heading with nothing under it, and say so in the email. `"photos": "skip"`.
- The Gage page hardcodes the Legacy Table date in the Prop 19 block. Change it.
- GitHub Pages cannot send an X-Robots-Tag header, so a preview is noindexed two ways, not three: the meta tag on every page and a Disallow line in `/robots.txt` at the repo root. Confirm both on the live URL.
- Forms on the listing page (RSVP, home value) post to Web3Forms with the listing address in the subject and redirect back to the page with `?sent=rsvp#rsvp` or `?sent=value#yours`. The page shows the thank-you itself. Web3Forms delivers to scott@wrspg.com; the agent is told to expect forwards until the agent's own key is set up.
- Phone numbers with hyphens. No em dashes or en dashes anywhere, in copy or in code comments the agent might see.
