// assets/scripts/co2-local.js
(function () {
  var out = document.getElementById('co2-now');
  if (!out) return;

  fetch('/assets/co2.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(j => {
      if (!j || !j.ppm || !j.last_updated) throw new Error('bad json');
      out.innerHTML =
        'CO₂: <strong>' + j.ppm + ' ppm</strong> (last update ' + j.last_updated + ')';
      out.title = 'NOAA GML daily mean for ' + (j.date || j.last_updated);
    })
    .catch(() => {
      out.textContent = 'CO₂: unavailable';
    });
})();
