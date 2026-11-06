/* SPG dashboard. Data in /data. Parent = index.html, child = /p/<id>/ */
(function () {
  // ---------- passphrase curtain (not real security; a curtain, not a lock) ----------
  // sha256 of the passphrase. To change it: run in a browser console
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('new phrase')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  var HASH = '8c9f6c4806e7d4fb4abe6acaa20cbb545a1ddd97de1a3b3f9159ee880b7c238a';
  var ROOT = document.documentElement.getAttribute('data-root') || '';
  function sha(s) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    });
  }
  function ok() { try { return localStorage.getItem('spg-gate') === HASH; } catch (e) { return false; } }
  function gate(then) {
    if (ok()) { then(); return; }
    var g = document.createElement('div'); g.id = 'gate';
    g.innerHTML = '<form><h1>Sierra Pacific Group</h1><input type="password" placeholder="Passphrase" autofocus autocomplete="current-password"><button>Open</button><div class="err"></div></form>';
    document.body.appendChild(g);
    var f = g.querySelector('form'), i = g.querySelector('input'), e = g.querySelector('.err');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      sha(i.value.trim()).then(function (h) {
        if (h === HASH) { try { localStorage.setItem('spg-gate', h); } catch (x) {} g.remove(); then(); }
        else { e.textContent = 'Not it.'; i.select(); }
      });
    });
  }

  // ---------- helpers ----------
  function el(tag, cls, html) { var d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fmt(d) { if (!d) return ''; var p = d.split('-'); var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return m[+p[1] - 1] + ' ' + (+p[2]) + (p[0] != new Date().getFullYear() ? ' ' + p[0] : ''); }
  function hcls(h) { h = (h || '').toLowerCase(); return h.indexOf('needs') > -1 ? 'h-needs' : h.indexOf('block') > -1 ? 'h-blocked' : h.indexOf('wait') > -1 ? 'h-wait' : 'h-ok'; }
  function pills(p) {
    var w = el('div', 'pills');
    w.appendChild(el('span', 'pill', esc(p.status)));
    w.appendChild(el('span', 'pill ' + hcls(p.health), esc(p.health)));
    if (p.due) w.appendChild(el('span', 'pill due' + (p.due < today() ? ' late' : ''), 'Due ' + fmt(p.due)));
    return w;
  }
  function getJSON(u) { return fetch(u, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }

  // ---------- parent ----------
  function parent(data) {
    var ps = data.projects, main = document.getElementById('main');
    document.getElementById('updated').textContent = 'Updated ' + fmt(data.updated);
    var needs = ps.filter(function (p) { return hcls(p.health) !== 'h-ok' && hcls(p.health) !== 'h-wait'; }).length;
    var due = ps.filter(function (p) { return p.due; }).sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    var hero = el('div', 'hero');
    hero.appendChild(el('div', 'stat', '<div class="n">' + ps.length + '</div><div class="l">things going</div>'));
    hero.appendChild(el('div', 'stat', '<div class="n">' + needs + '</div><div class="l">need you</div>'));
    var nd = due[0];
    hero.appendChild(el('div', 'stat plain', '<div class="n" style="font-size:22px;padding-top:6px">' + (nd ? fmt(nd.due) : 'None') + '</div><div class="l">' + (nd ? 'next date: ' + esc(nd.name) : 'no dated items') + '</div>'));
    main.appendChild(hero);

    var tb = el('div', 'toolbar');
    var filt = 'all';
    var btns = [['all', 'Everything'], ['needs', 'Needs me'], ['dated', 'Has a date']].map(function (b) {
      var x = el('button', b[0] === 'all' ? 'on' : '', b[1]); x.dataset.f = b[0]; return x;
    });
    var q = el('input'); q.placeholder = 'Find';
    btns.forEach(function (b) { tb.appendChild(b); }); tb.appendChild(q);
    main.appendChild(tb);

    var body = el('div');
    main.appendChild(body);
    function render() {
      body.innerHTML = '';
      var s = q.value.trim().toLowerCase();
      data.groups.forEach(function (g) {
        var list = ps.filter(function (p) {
          if (p.group !== g.id) return false;
          if (filt === 'needs' && hcls(p.health) !== 'h-needs' && hcls(p.health) !== 'h-blocked') return false;
          if (filt === 'dated' && !p.due) return false;
          if (s && (p.name + ' ' + p.summary + ' ' + p.next).toLowerCase().indexOf(s) < 0) return false;
          return true;
        });
        if (!list.length) return;
        body.appendChild(el('h2', 'group', esc(g.name)));
        var grid = el('div', 'grid');
        list.forEach(function (p) {
          var a = el('a', 'card'); a.href = ROOT + 'p/' + p.id + '/';
          a.appendChild(el('h3', '', esc(p.name)));
          a.appendChild(pills(p));
          a.appendChild(el('div', 'sum', esc(p.summary)));
          a.appendChild(el('div', 'next', '<b>Next:</b> ' + esc(p.next)));
          grid.appendChild(a);
        });
        body.appendChild(grid);
      });
      if (!body.children.length) body.appendChild(el('p', 'empty', 'Nothing matches.'));
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { btns.forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); filt = b.dataset.f; render(); }); });
    q.addEventListener('input', render);
    render();
  }

  // ---------- child ----------
  function child(id, data, d) {
    var p = data.projects.filter(function (x) { return x.id === id; })[0];
    var main = document.getElementById('main');
    if (!p) { main.appendChild(el('p', 'empty', 'No project with id "' + esc(id) + '" in data/projects.json.')); return; }
    document.title = p.name + ' | SPG';
    var g = data.groups.filter(function (x) { return x.id === p.group; })[0];
    main.appendChild(el('div', 'crumb', '<a href="' + ROOT + '">All projects</a> &nbsp;/&nbsp; ' + esc(g ? g.name : '')));
    var head = el('div', 'head');
    var hl = el('div'); hl.appendChild(el('h1', '', esc(p.name))); hl.appendChild(pills(p)); hl.appendChild(el('p', 'sum', esc(p.summary)));
    head.appendChild(hl); main.appendChild(head);
    main.appendChild(el('div', 'nextbox', '<div class="k">Next action</div><div class="v">' + esc(p.next) + '</div>'));

    var cols = el('div', 'cols');
    function panel(title, items, render, full) {
      var pn = el('div', 'panel' + (full ? ' full' : '')); pn.appendChild(el('h2', '', title));
      if (!items || !items.length) { pn.appendChild(el('p', 'empty', 'Nothing here.')); }
      else { var u = el('ul', render === ms ? 'ms' : ''); items.forEach(function (it) { u.appendChild(render(it)); }); pn.appendChild(u); }
      return pn;
    }
    function li(t) { return el('li', '', esc(t)); }
    function ms(m) { return el('li', '', '<span class="d">' + fmt(m.date) + '</span><span class="' + (m.done ? 'done' : 'todo') + '">' + (m.done ? '&#10003;' : '&#9675;') + '</span> ' + esc(m.text)); }
    cols.appendChild(panel('Open items', d.open, li));
    cols.appendChild(panel('Milestones', (d.milestones || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }), ms));
    cols.appendChild(panel('Decisions made', d.decisions, li, true));
    var lk = el('div', 'panel full'); lk.appendChild(el('h2', '', 'Links'));
    if (d.links && d.links.length) { var w = el('div', 'links'); d.links.forEach(function (l) { var a = el('a', '', esc(l.label)); a.href = l.url; a.target = '_blank'; a.rel = 'noopener'; w.appendChild(a); }); lk.appendChild(w); }
    else lk.appendChild(el('p', 'empty', 'No links yet.'));
    cols.appendChild(lk);
    if (d.notes) { var n = el('div', 'panel full'); n.appendChild(el('h2', '', 'Notes')); n.appendChild(el('p', '', esc(d.notes))); cols.appendChild(n); }
    main.appendChild(cols);
    main.appendChild(el('p', 'foot', 'Edit data/' + esc(id) + '.json and data/projects.json to update this page.'));
  }

  // ---------- boot ----------
  var id = document.documentElement.getAttribute('data-project');
  gate(function () {
    getJSON(ROOT + 'data/projects.json').then(function (data) {
      if (id) return getJSON(ROOT + 'data/' + id + '.json').then(function (d) { child(id, data, d); });
      parent(data);
    }).catch(function (e) { document.getElementById('main').appendChild(el('p', 'empty', 'Could not load data: ' + esc(e.message))); });
  });
})();
