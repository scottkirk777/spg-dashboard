# sierrapacificgroup.homes

Scott's parent dashboard of everything in flight, with a child page per project.

- `data/projects.json` is the parent list: id, group, name, status, health, summary, next, due.
- `data/<id>.json` is the child page: decisions, open, milestones, links, notes.
- `node build.js` regenerates `p/<id>/index.html` for every project. Run it after adding or removing a project. Editing an existing project's JSON needs no build.
- Deploy: commit and push to `main`. GitHub Pages serves the root with the CNAME.
- Passphrase curtain lives in `assets/app.js` (`HASH`). It is a curtain, not a lock: the files are public to anyone with the URL.

## Two-way
- Each child page has a "Tell Claude" form (Web3Forms → scott@wrspg.com, subject `[SPG dashboard] <id>: <Action>`). An hourly scheduled task reads those emails, does the work, updates the JSON here, pushes, and replies with a receipt.
- `data/<id>.json` may carry `pending: [{title, detail, url}]` for items queued for Scott's decision; they render with Approve / Change / Hold buttons. `projects.json` carries `waiting: <count>` per project so the parent card shows it.
