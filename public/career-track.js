/* Analytics for the server-rendered Career Hub pages (/careers and /careers/<role>).
   Sends the same pageview and cta_click events as the main app (same visitor id, session id, opt-out switch)
   so these pages show up in /admin. Never throws. Opt out on a device with /?notrack=1 (turn back on with /?notrack=0). */
(function () {
  try {
    var ls = window.localStorage, ss = window.sessionStorage;
    var q = new URLSearchParams(location.search);
    if (q.get('notrack') === '1') ls.setItem('hwg_noTrack', '1');
    else if (q.get('notrack') === '0') ls.removeItem('hwg_noTrack');
    if (ls.getItem('hwg_noTrack') === '1') return;
    var id = function () {
      return window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    };
    var vid = ls.getItem('hwg_vid');
    if (!vid) {
      vid = id();
      ls.setItem('hwg_vid', vid);
    }
    var session = function () {
      var now = Date.now(), cur = null;
      try { cur = JSON.parse(ss.getItem('hwg_sid') || 'null'); } catch (e) { /* ignore */ }
      if (!cur || typeof cur.sid !== 'string' || typeof cur.last !== 'number' || now - cur.last > 1800000) return { sid: id(), last: now, attr: false };
      cur.last = now;
      return cur;
    };
    var send = function (type, name, meta) {
      var s = session();
      var b = { vid: vid, sid: s.sid, type: type, path: location.pathname };
      if (name) { b.name = name; if (meta) b.meta = meta; }
      if (!s.attr) {
        if (document.referrer) b.ref = document.referrer;
        [['utmSource', 'utm_source'], ['utmMedium', 'utm_medium'], ['utmCampaign', 'utm_campaign']].forEach(function (p) {
          var v = q.get(p[1]);
          if (v) b[p[0]] = v;
        });
        s.attr = true;
      }
      ss.setItem('hwg_sid', JSON.stringify(s));
      fetch('/api/t', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).catch(function () {});
    };
    send('pageview');
    document.addEventListener('click', function (e) {
      try {
        var a = e.target && e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href') || '';
        var box = a.closest('[data-build]');
        var where = box ? 'careers_' + box.getAttribute('data-build') : a.classList.contains('hcta') ? 'careers_header' : null;
        if (!where && !/^\/(builder|pro|templates|tools\/cv-checker)/.test(href)) return;
        send('event', 'cta_click', { where: where || 'careers_link', to: href.split('?')[0].slice(0, 40) });
      } catch (err) { /* never break the page */ }
    });
  } catch (e) { /* never break the page */ }
})();
