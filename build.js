// node build.js  -> makes p/<id>/index.html for every project in data/projects.json
const fs = require('fs'), path = require('path');
const data = JSON.parse(fs.readFileSync('data/projects.json', 'utf8'));
const page = (id, title, root) => `<!doctype html>
<html lang="en" data-root="${root}"${id ? ` data-project="${id}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${title}</title>
<link rel="stylesheet" href="${root}assets/style.css">
</head>
<body>
<div class="top"><div class="in"><a class="brand" href="${root}">Sierra Pacific Group</a><span class="sub">Everything in flight</span><span class="right" id="updated"></span></div></div>
<main class="wrap" id="main"></main>
<script src="${root}assets/app.js"></script>
</body>
</html>
`;
fs.writeFileSync('index.html', page('', 'SPG | Everything in flight', ''));
for (const p of data.projects) {
  if (!fs.existsSync(`data/${p.id}.json`)) { console.error('missing data/' + p.id + '.json'); process.exit(1); }
  fs.mkdirSync(`p/${p.id}`, { recursive: true });
  fs.writeFileSync(`p/${p.id}/index.html`, page(p.id, p.name + ' | SPG', '../../'));
}
// prune folders for projects no longer listed
for (const d of fs.existsSync('p') ? fs.readdirSync('p') : []) if (!data.projects.some(p => p.id === d)) fs.rmSync('p/' + d, { recursive: true });
console.log('built', data.projects.length, 'project pages');
