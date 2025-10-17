// assets/scripts/theme.js
(function () {
  var STORAGE_KEY = 'site-theme-href'; // remembers the last CSS file used

  // Required DOM elements
  var linkEl = document.getElementById('theme-css');   // <link id="theme-css" ... data-href-light=... data-href-hacker=...>
  var btnEl  = document.getElementById('theme-toggle'); // <button id="theme-toggle">...</button>
  if (!linkEl || !btnEl) return;

  // Read real URLs from data-attributes on the <link>
  var LIGHT  = linkEl.dataset.hrefLight;
  var HACKER = linkEl.dataset.hrefHacker;
  if (!LIGHT || !HACKER) return; // prevent "/undefined" requests

  // Helpers
  function pathnameOf(href) {
    try { return new URL(href, window.location.origin).pathname; }
    catch { return (href || ''); }
  }
  function isHackerActive() {
    return pathnameOf(linkEl.href) === pathnameOf(HACKER);
  }

  // Swap any themed assets by id (extend the list if you add more)
  function swapThemeAssets() {
    var hackerOn = isHackerActive();

    // Add classes on <html> for optional CSS tweaks
    document.documentElement.classList.toggle('theme-hacker', hackerOn);
    document.documentElement.classList.toggle('theme-light', !hackerOn);

    // IDs to swap (must exist in your HTML/Markdown)
    ['site-logo', 'home-hero'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var nextSrc = hackerOn ? el.dataset.srcHacker : el.dataset.srcLight;
      if (nextSrc && pathnameOf(el.src) !== pathnameOf(nextSrc)) {
        el.src = nextSrc;
      }
    });
  }

  // Update button label (works with two spans or falls back to text)
 function syncButton() {
  var hackerOn = isHackerActive();
  // Keep labels as-is; just set aria & HTML classes are handled elsewhere.
  btnEl.setAttribute('aria-pressed', String(hackerOn));
}


  // Central setter: change CSS, persist, then sync assets & button
  function setThemeHref(nextHref) {
    if (!nextHref) return;
    // Only update if it's actually different
    if (pathnameOf(nextHref) !== pathnameOf(linkEl.href)) {
      linkEl.href = nextHref;
      try { localStorage.setItem(STORAGE_KEY, nextHref); } catch (_) {}
    }
    swapThemeAssets();
    syncButton();
  }

  // 1) Apply saved theme (if any) before first sync
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && pathnameOf(saved) !== pathnameOf(linkEl.href)) {
      linkEl.href = saved;
    }
  } catch (_) {}

  // 2) Initial sync
  swapThemeAssets();
  syncButton();

  // 3) Toggle on click
  btnEl.addEventListener('click', function () {
    var next = isHackerActive() ? LIGHT : HACKER;
    setThemeHref(next);
  });

  // 4) Optional: keyboard shortcut (press "t")
  document.addEventListener('keydown', function (e) {
    if (!e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 't') {
      btnEl.click();
    }
  });
})();
