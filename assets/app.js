/* SPG dashboard. Data in /data. Parent = index.html, child = /p/<id>/ */
(function () {
  // ---------- passphrase curtain (not real security; a curtain, not a lock) ----------
  // sha256 of the passphrase. To change it: run in a browser console
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('new phrase')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  var HASH = '8c9f6c4806e7d4fb4abe6acaa20cbb545a1ddd97de1a3b3f9159ee880b7c238a';
  var ROOT = document.documentElement.getAttribute('data-root') || '';
  // Pure-JS SHA-256 so the gate works on plain http too (crypto.subtle needs https)
  function sha256(str) {
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var bytes = Array.from(new TextEncoder().encode(str)), l = bytes.length * 8;
    bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (var i = 7; i >= 0; i--) bytes.push((l / Math.pow(2, i * 8)) & 0xff);
    var rotr = function (x, n) { return (x >>> n) | (x << (32 - n)); };
    for (var off = 0; off < bytes.length; off += 64) {
      var w = [];
      for (var t = 0; t < 16; t++) w[t] = (bytes[off+t*4]<<24)|(bytes[off+t*4+1]<<16)|(bytes[off+t*4+2]<<8)|bytes[off+t*4+3];
      for (t = 16; t < 64; t++) { var s0 = rotr(w[t-15],7)^rotr(w[t-15],18)^(w[t-15]>>>3), s1 = rotr(w[t-2],17)^rotr(w[t-2],19)^(w[t-2]>>>10); w[t] = (w[t-16]+s0+w[t-7]+s1)|0; }
      var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for (t = 0; t < 64; t++) {
        var S1 = rotr(e,6)^rotr(e,11)^rotr(e,25), ch = (e&f)^(~e&g), t1 = (h+S1+ch+K[t]+w[t])|0;
        var S0 = rotr(a,2)^rotr(a,13)^rotr(a,22), maj = (a&b)^(a&c)^(b&c), t2 = (S0+maj)|0;
        h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
      }
      H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0; H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }
  function sha(s) { return Promise.resolve(sha256(s)); }
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
    if (p.waiting) w.appendChild(el('span', 'pill h-needs', p.waiting + ' waiting on you'));
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

    // ---- Waiting on you: items Claude queued for a decision, one tap each ----
    var pending = d.pending || [];
    var pend = el('div', 'panel full pend'); pend.appendChild(el('h2', '', 'Waiting on you'));
    if (!pending.length) pend.appendChild(el('p', 'empty', 'Nothing waiting. When Claude queues something for a decision it shows up here.'));
    pending.forEach(function (it) {
      var row = el('div', 'prow');
      var txt = el('div', 'ptxt', '<b>' + esc(it.title) + '</b>' + (it.detail ? '<div class="pdet">' + esc(it.detail) + '</div>' : ''));
      if (it.url) { var a = el('a', 'plink', 'Open'); a.href = it.url; a.target = '_blank'; a.rel = 'noopener'; txt.appendChild(a); }
      row.appendChild(txt);
      var acts = el('div', 'pacts');
      ['Approve', 'Change', 'Hold'].forEach(function (act) {
        var b = el('button', 'pbtn ' + act.toLowerCase(), act);
        b.addEventListener('click', function () { prefill(act, it.title); });
        acts.appendChild(b);
      });
      row.appendChild(acts); pend.appendChild(row);
    });
    cols.appendChild(pend);

    // ---- Tell Claude: lands in scott@wrspg.com tagged [SPG dashboard]; an hourly task acts on it ----
    var tc = el('div', 'panel full tell'); tc.appendChild(el('h2', '', 'Tell Claude'));
    tc.innerHTML += '<form class="tcf">' +
      '<div class="tcrow"><label>Action</label><select name="action"><option>Approve</option><option>Change</option><option>Hold</option><option>Done</option><option>Note</option></select></div>' +
      '<div class="tcrow"><label>About</label><input name="about" placeholder="Which item (optional)"></div>' +
      '<div class="tcrow"><label>Note</label><textarea name="note" rows="3" placeholder="What you want done, in your words"></textarea></div>' +
      '<div class="tcrow"><span></span><button type="submit">Send to Claude</button><span class="tcmsg"></span></div></form>';
    var form = tc.querySelector('form'), msg = tc.querySelector('.tcmsg');
    function prefill(act, about) { form.action.value = act; form.about.value = about; form.note.focus(); tc.scrollIntoView({ behavior: 'smooth' }); }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var act = form.action.value, about = form.about.value.trim(), note = form.note.value.trim();
      if (!note && !about) { msg.textContent = 'Say what, at least.'; return; }
      msg.textContent = 'Sending';
      var body = {
        access_key: '15d8a1cf-91e6-41c7-a007-feb5318450eb',
        subject: '[SPG dashboard] ' + id + ': ' + act,
        from_name: 'SPG dashboard',
        project: p.name, project_id: id, action: act, about: about, note: note,
        page: location.href, sent: new Date().toString()
      };
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j.success) { msg.textContent = 'Sent. Claude picks it up within the hour.'; form.note.value = ''; form.about.value = ''; } else { msg.textContent = 'Did not send: ' + (j.message || 'unknown'); } })
        .catch(function () { msg.textContent = 'Did not send. Check your connection.'; });
    });

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
    cols.appendChild(tc);
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
