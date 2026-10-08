// assets/scripts/co2-local.js
(function () {
  var out = document.getElementById('co2-now');
  var plot = document.getElementById('co2-plot');
  var cantPlot = document.getElementById('cant-plot');

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

  if (!plot && !cantPlot) return;

  Promise.all([
    fetch('/assets/co2-history.json', { cache: 'no-cache' }).then(function (r) {
      return r.ok ? r.json() : Promise.reject(new Error('Mauna Loa history unavailable'));
    }),
    fetch('/assets/co2-global.json', { cache: 'no-cache' }).then(function (r) {
      return r.ok ? r.json() : Promise.reject(new Error('Global history unavailable'));
    }),
    fetch('/assets/RECCAP2_regional_equilibrium_Cant.csv', { cache: 'no-cache' }).then(function (r) {
      return r.ok ? r.text() : Promise.reject(new Error('Cant history unavailable'));
    })
  ])
    .then(function (sets) {
      var monthly = parseMonthly(sets[0]);
      var globalAnnual = parseGlobal(sets[1]);
      var cant = parseCantCsv(sets[2]);
      if (monthly.length < 2) throw new Error('no valid monthly history');

      // Both figures use the same x-domain: first Mauna Loa monthly point
      // through the latest available NOAA monthly point.
      var minX = monthly[0].x;
      var maxX = monthly[monthly.length - 1].x;

      if (plot) drawAtmospheric(plot, monthly, globalAnnual, minX, maxX);
      if (cantPlot) drawCant(cantPlot, cant, minX, maxX);
    })
    .catch(function () {
      if (plot) {
        plot.textContent = 'CO₂ history unavailable';
        plot.classList.add('co2-plot-error');
      }
      if (cantPlot) {
        cantPlot.textContent = 'Cₐₙₜ history unavailable';
        cantPlot.classList.add('co2-plot-error');
      }
    });

  function parseMonthly(rows) {
    return rows.map(function (d) {
      var p = String(d.date || '').split('-');
      var year = Number(p[0]), month = Number(p[1]), ppm = Number(d.ppm);
      return { date: d.date, x: year + (month - 0.5) / 12, ppm: ppm };
    }).filter(function (d) { return isFinite(d.x) && isFinite(d.ppm); });
  }

  function parseGlobal(rows) {
    return rows.map(function (d) {
      return { x: Number(d.year) + 0.5, ppm: Number(d.ppm) };
    }).filter(function (d) { return isFinite(d.x) && isFinite(d.ppm); });
  }

  function parseCantCsv(text) {
    var lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    var headers = lines[0].split(',').map(function (s) { return s.trim(); });
    return lines.slice(1).map(function (line) {
      var v = line.split(',');
      var row = {};
      headers.forEach(function (h, i) { row[h] = v[i]; });
      return {
        x: Number(row.year) + 0.5,
        atlantic: Number(row.cant_atlantic),
        pacific: Number(row.cant_pacific),
        indian: Number(row.cant_indian),
        arctic: Number(row.cant_arctic),
        southern: Number(row.cant_southern)
      };
    }).filter(function (d) {
      return isFinite(d.x) && isFinite(d.atlantic) && isFinite(d.pacific) &&
        isFinite(d.indian) && isFinite(d.arctic) && isFinite(d.southern);
    });
  }

  function geometry() {
    var W = 1000, H = 300;
    var M = { top: 14, right: 18, bottom: 38, left: 82 };
    return { W: W, H: H, M: M, innerW: W - M.left - M.right, innerH: H - M.top - M.bottom };
  }

  function axes(svg, g, minX, maxX, minY, maxY, yStep, yTitle) {
    function sx(x) { return g.M.left + (x - minX) / (maxX - minX) * g.innerW; }
    function sy(y) { return g.M.top + (maxY - y) / (maxY - minY) * g.innerH; }

    for (var y = minY; y <= maxY + 1e-9; y += yStep) {
      var yy = sy(y);
      svg.push('<line class="co2-grid" x1="' + g.M.left + '" y1="' + yy + '" x2="' + (g.W - g.M.right) + '" y2="' + yy + '"></line>');
      svg.push('<text class="co2-axis-label" x="' + (g.M.left - 10) + '" y="' + (yy + 4) + '" text-anchor="end">' + Math.round(y) + '</text>');
    }

    var startYear = Math.ceil(minX / 10) * 10;
    var endYear = Math.floor(maxX / 10) * 10;
    for (var yr = startYear; yr <= endYear; yr += 10) {
      var xx = sx(yr);
      svg.push('<line class="co2-tick" x1="' + xx + '" y1="' + (g.H - g.M.bottom) + '" x2="' + xx + '" y2="' + (g.H - g.M.bottom + 5) + '"></line>');
      svg.push('<text class="co2-axis-label" x="' + xx + '" y="' + (g.H - 12) + '" text-anchor="middle">' + yr + '</text>');
    }

    svg.push('<line class="co2-axis" x1="' + g.M.left + '" y1="' + g.M.top + '" x2="' + g.M.left + '" y2="' + (g.H - g.M.bottom) + '"></line>');
    svg.push('<line class="co2-axis" x1="' + g.M.left + '" y1="' + (g.H - g.M.bottom) + '" x2="' + (g.W - g.M.right) + '" y2="' + (g.H - g.M.bottom) + '"></line>');
    svg.push('<text class="co2-y-title" x="18" y="' + (g.M.top + g.innerH / 2) + '" text-anchor="middle" transform="rotate(-90 18 ' + (g.M.top + g.innerH / 2) + ')">' + yTitle + '</text>');

    return { sx: sx, sy: sy };
  }

  function pathFor(series, xKey, yKey, sx, sy) {
    return series.map(function (d, i) {
      return (i ? 'L' : 'M') + sx(d[xKey]).toFixed(2) + ',' + sy(d[yKey]).toFixed(2);
    }).join(' ');
  }

  function drawAtmospheric(target, data, globalData, minX, maxX) {
    var g = geometry();
    var values = data.map(function (d) { return d.ppm; }).concat(globalData.map(function (d) { return d.ppm; }));
    var yStep = 20;
    var minY = Math.floor(Math.min.apply(null, values) / yStep) * yStep;
    var maxY = Math.ceil(Math.max.apply(null, values) / yStep) * yStep;
    var svg = ['<svg viewBox="0 0 ' + g.W + ' ' + g.H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'];
    var a = axes(svg, g, minX, maxX, minY, maxY, yStep, 'CO₂ (ppm)');

    svg.push('<path class="co2-global-line" d="' + pathFor(globalData, 'x', 'ppm', a.sx, a.sy) + '"></path>');
    svg.push('<path class="co2-line" d="' + pathFor(data, 'x', 'ppm', a.sx, a.sy) + '"></path>');

    var latest = data[data.length - 1];
    svg.push('<circle class="co2-latest" cx="' + a.sx(latest.x) + '" cy="' + a.sy(latest.ppm) + '" r="3.5"></circle>');
    svg.push('</svg>');
    target.innerHTML = svg.join('');
  }

  function drawCant(target, data, minX, maxX) {
    data = data.filter(function (d) { return d.x >= minX; });
    if (data.length < 2) throw new Error('no valid Cant history');

    var g = geometry();
    var vals = [];
    data.forEach(function (d) { vals.push(d.atlantic, d.pacific, d.indian, d.arctic, d.southern); });
    var yStep = 20;
    var minY = Math.floor(Math.min.apply(null, vals) / yStep) * yStep;
    var maxY = Math.ceil(Math.max.apply(null, vals) / yStep) * yStep;
    var svg = ['<svg viewBox="0 0 ' + g.W + ' ' + g.H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'];
    var a = axes(svg, g, minX, maxX, minY, maxY, yStep, 'Cₐₙₜ (µmol kg⁻¹)');

    ['atlantic', 'pacific', 'indian', 'southern', 'arctic'].forEach(function (region) {
      svg.push('<path class="cant-line cant-' + region + '" d="' + pathFor(data, 'x', region, a.sx, a.sy) + '"></path>');
    });

    svg.push('</svg>');
    target.innerHTML = svg.join('');
  }
})();
