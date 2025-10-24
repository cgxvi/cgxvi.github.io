// assets/scripts/co2-local.js
(function () {
  var out = document.getElementById('co2-now');
  if (!out) return;

  // Read the file your workflow updates daily
  fetch('/assets/co2.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (j) {
      if (!j || !j.ppm || !j.last_updated) throw new Error('bad json');
      out.textContent = 'CO₂: ' + j.ppm + ' ppm (last update ' + j.last_updated + ')';
      out.title = 'NOAA GML daily mean for ' + (j.date || j.last_updated);
    })
    .catch(function () {
      out.textContent = 'CO₂: unavailable';
    });
})();
