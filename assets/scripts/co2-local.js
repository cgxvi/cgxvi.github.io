// assets/scripts/co2-local.js
(function () {
  var out = document.getElementById('co2-now');
  var plot = document.getElementById('co2-plot');

  if (out) {
    fetch('/assets/co2.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        if (!j || !j.ppm || !j.last_updated) throw new Error('bad json');
        out.innerHTML = 'CO₂: <strong>' + j.ppm + ' ppm</strong> (' + j.last_updated + ')';
        out.title = 'NOAA GML daily mean for ' + (j.date || j.last_updated);
      })
      .catch(function () { out.textContent = 'CO₂: unavailable'; });
  }

  if (!plot) return;

  fetch('/assets/co2-history.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (rows) {
      if (!Array.isArray(rows) || rows.length < 2) throw new Error('bad history');
      drawPlot(rows);
    })
    .catch(function () {
      plot.textContent = 'CO₂ history unavailable';
      plot.classList.add('co2-plot-error');
    });

  function drawPlot(rows) {
    var data = rows.map(function (d) {
      var p = String(d.date || '').split('-');
      var year = Number(p[0]), month = Number(p[1]), ppm = Number(d.ppm);
      return { date: d.date, x: year + (month - 0.5) / 12, ppm: ppm };
    }).filter(function (d) { return isFinite(d.x) && isFinite(d.ppm); });

    if (data.length < 2) throw new Error('no valid history');

    var W = 1000, H = 300;
    var M = { top: 14, right: 18, bottom: 38, left: 58 };
    var innerW = W - M.left - M.right, innerH = H - M.top - M.bottom;
    var minX = data[0].x, maxX = data[data.length - 1].x;
    var values = data.map(function (d) { return d.ppm; });
    var yStep = 20;
    var minY = Math.floor(Math.min.apply(null, values) / yStep) * yStep;
    var maxY = Math.ceil(Math.max.apply(null, values) / yStep) * yStep;

    function sx(x) { return M.left + (x - minX) / (maxX - minX) * innerW; }
    function sy(y) { return M.top + (maxY - y) / (maxY - minY) * innerH; }

    var path = data.map(function (d, i) {
      return (i ? 'L' : 'M') + sx(d.x).toFixed(2) + ',' + sy(d.ppm).toFixed(2);
    }).join(' ');

    var svg = [];
    svg.push('<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">');

    for (var y = minY; y <= maxY; y += yStep) {
      var yy = sy(y);
      svg.push('<line class="co2-grid" x1="' + M.left + '" y1="' + yy + '" x2="' + (W - M.right) + '" y2="' + yy + '"></line>');
      svg.push('<text class="co2-axis-label" x="' + (M.left - 10) + '" y="' + (yy + 4) + '" text-anchor="end">' + y + '</text>');
    }

    var startYear = Math.ceil(minX / 10) * 10;
    var endYear = Math.floor(maxX / 10) * 10;
    for (var yr = startYear; yr <= endYear; yr += 10) {
      var xx = sx(yr);
      svg.push('<line class="co2-tick" x1="' + xx + '" y1="' + (H - M.bottom) + '" x2="' + xx + '" y2="' + (H - M.bottom + 5) + '"></line>');
      svg.push('<text class="co2-axis-label" x="' + xx + '" y="' + (H - 12) + '" text-anchor="middle">' + yr + '</text>');
    }

    svg.push('<line class="co2-axis" x1="' + M.left + '" y1="' + M.top + '" x2="' + M.left + '" y2="' + (H - M.bottom) + '"></line>');
    svg.push('<line class="co2-axis" x1="' + M.left + '" y1="' + (H - M.bottom) + '" x2="' + (W - M.right) + '" y2="' + (H - M.bottom) + '"></line>');
    svg.push('<path class="co2-line" d="' + path + '"></path>');
    var latest = data[data.length - 1];
    svg.push('<circle class="co2-latest" cx="' + sx(latest.x) + '" cy="' + sy(latest.ppm) + '" r="3.5"></circle>');
    svg.push('<text class="co2-y-title" x="14" y="' + (M.top + innerH / 2) + '" text-anchor="middle" transform="rotate(-90 14 ' + (M.top + innerH / 2) + ')">CO₂ (ppm)</text>');
    svg.push('</svg>');
    plot.innerHTML = svg.join('');
  }
})();
