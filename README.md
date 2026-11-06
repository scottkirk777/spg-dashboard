# sierrapacificgroup.homes

Scott's parent dashboard of everything in flight, with a child page per project.

- `data/projects.json` is the parent list: id, group, name, status, health, summary, next, due.
- `data/<id>.json` is the child page: decisions, open, milestones, links, notes.
- `node build.js` regenerates `p/<id>/index.html` for every project. Run it after adding or removing a project. Editing an existing project's JSON needs no build.
- Deploy: commit and push to `main`. GitHub Pages serves the root with the CNAME.
- Passphrase curtain lives in `assets/app.js` (`HASH`). It is a curtain, not a lock: the files are public to anyone with the URL.
