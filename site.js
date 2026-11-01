// Language switch (ru / en) and the change list's search.
(function () {
  var KEY = 'h4forge-lang';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function setLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('.langs button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === lang);
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    filter();
  }

  var input = document.getElementById('cl-search');

  function filter() {
    if (!input) return;
    var lang = document.documentElement.lang;
    var q = input.value.trim().toLowerCase();
    var root = document.querySelector('.cl[lang="' + lang + '"]');
    if (!root) return;
    var shown = 0;
    root.querySelectorAll('.sec').forEach(function (sec) {
      var n = 0;
      sec.querySelectorAll('.entry').forEach(function (e) {
        var hit = !q || e.textContent.toLowerCase().indexOf(q) >= 0;
        e.hidden = !hit;
        if (hit) n++;
      });
      sec.hidden = n === 0;
      shown += n;
    });
    var empty = root.querySelector('.empty');
    if (empty) empty.style.display = shown ? 'none' : 'block';
  }

  document.querySelectorAll('.langs button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  if (input) input.addEventListener('input', filter);

  var nav = (navigator.language || 'en').toLowerCase();
  setLang(stored() || (/^(ru|uk|be|kk)/.test(nav) ? 'ru' : 'en'));

  // Counters. Downloads: the public repository's Releases (download_count of
  // every asset; an asset named H4Forge_RMG* is the generator, any other the
  // mod), which also gives the download buttons the newest file. Visits:
  // GoatCounter's public counter. A counter that fails to load stays hidden.
  var cfg = document.body.dataset;

  function show(kind, value) {
    document.querySelectorAll('[data-count="' + kind + '"]').forEach(function (el) {
      el.textContent = value;
    });
    document.querySelectorAll('[data-count-box="' + kind + '"]').forEach(function (el) {
      el.hidden = false;
    });
  }

  function kindOf(asset) {
    return /^H4Forge_RMG/i.test(asset.name) ? 'rmg' : 'mod';
  }

  if (cfg.repo) {
    fetch('https://api.github.com/repos/' + cfg.repo + '/releases?per_page=100')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (releases) {
        var sum = { mod: 0, rmg: 0 }, newest = {};
        releases.forEach(function (rel) {       // newest release first
          if (rel.draft) return;
          rel.assets.forEach(function (a) {
            var k = kindOf(a);
            sum[k] += a.download_count;
            if (!newest[k]) newest[k] = a.browser_download_url;
          });
        });
        show('mod', sum.mod.toLocaleString());
        show('rmg', sum.rmg.toLocaleString());
        document.querySelectorAll('a[data-asset]').forEach(function (a) {
          if (newest[a.dataset.asset]) a.href = newest[a.dataset.asset];
        });
      })
      .catch(function () {});
  }

  if (cfg.goatcounter) {
    fetch('https://' + cfg.goatcounter + '.goatcounter.com/counter/TOTAL.json')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { show('visits', d.count); })
      .catch(function () {});
  }
})();
