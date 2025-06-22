// برای Looker Studio Community Visualization
// نیاز به بارگذاری Chart.js دارد (CDN)
// می‌توانید کد را مستقیماً با chart.js CDN استفاده کنید یا به صورت باندل‌شده
// اگر خواستی کد را گسترش بده یا استایل سفارشی بده

function drawViz(data, element) {
  element.innerHTML = ''; // پاک کردن محتوا

  // ---- ۱. کارت‌های KPI ----
  let kpiHtml = `
    <div style="display:flex;gap:18px;margin-bottom:28px;">
      ${renderKPI("Sessions", 0)}
      ${renderKPI("Bounce Rate", 1, "%")}
      ${renderKPI("Avg. Session Duration", 2, "s")}
      ${renderKPI("Conversion Rate", 3, "%")}
      ${renderKPI("Revenue", 4, "$")}
    </div>
  `;

  // ---- ۲. چارت خطی Sessions Over Time ----
  let timeSeriesLabels = [];
  let timeSeriesValues = [];
  if (data.tables.DEFAULT && data.tables.DEFAULT.length > 0) {
    data.tables.DEFAULT.forEach(row => {
      timeSeriesLabels.push(row.dimensions[0]);
      timeSeriesValues.push(row.metrics[0]);
    });
  }
  let chartHtml = `<canvas id="sessionChart" width="500" height="180" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #e0e4ef1a"></canvas>`;

  // ---- ۳. نمودار دایره‌ای Channel Breakdown ----
  // فرض بر این است که جدول CHANNEL_STATS داده شده (channelName, sessions)
  let pieLabels = [];
  let pieValues = [];
  if (data.tables.CHANNEL_STATS && data.tables.CHANNEL_STATS.length > 0) {
    data.tables.CHANNEL_STATS.forEach(row => {
      pieLabels.push(row.dimensions[0]);
      pieValues.push(row.metrics[0]);
    });
  }
  let pieHtml = `<canvas id="channelPie" width="280" height="180" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #e0e4ef1a"></canvas>`;

  // ---- ۴. جدول عملکرد کانال‌ها ----
  let channelTable = `<table style="width:100%;margin-top:28px;border-collapse:collapse;background:#fff;border-radius:12px;box-shadow:0 2px 8px #e0e4ef1a">
    <tr style="background:#f6f6fa;">
      <th style="padding:8px;">Channel</th>
      <th style="padding:8px;">Sessions</th>
      <th style="padding:8px;">Revenue</th>
      <th style="padding:8px;">Conversion Rate</th>
    </tr>`;
  if (data.tables.CHANNEL_STATS && data.tables.CHANNEL_STATS.length > 0) {
    data.tables.CHANNEL_STATS.forEach(row => {
      channelTable += `
        <tr>
          <td style="padding:8px;">${row.dimensions[0]}</td>
          <td style="padding:8px;">${row.metrics[0]}</td>
          <td style="padding:8px;">$${row.metrics[1]}</td>
          <td style="padding:8px;">${row.metrics[2]}%</td>
        </tr>`;
    });
  }
  channelTable += `</table>`;

  // ---- تجمیع همه ----
  element.innerHTML = `
    <div style="font-family:Inter,sans-serif;background:#f7f7fb;padding:36px;">
      <h2 style="margin-bottom:18px;">Digital Performance Overview</h2>
      ${kpiHtml}
      <div style="display:flex;gap:36px;">
        <div style="flex:2;">${chartHtml}</div>
        <div style="flex:1;">${pieHtml}</div>
      </div>
      ${channelTable}
    </div>
  `;

  // ---- بارگذاری Chart.js ----
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = renderCharts;
    document.body.appendChild(script);
  } else {
    renderCharts();
  }

  // -------- توابع کمکی -----------
  function renderKPI(label, idx, suffix="") {
    let val = (data.tables.KPI && data.tables.KPI[0]) ? data.tables.KPI[0].metrics[idx] : "--";
    return `
      <div style="flex:1;background:#fff;padding:16px 10px 12px 10px;border-radius:12px;box-shadow:0 1px 8px #cfd4df25;text-align:center;">
        <div style="font-size:14px; color:#7a7e8b;">${label}</div>
        <div style="font-size:22px; color:#182142; font-weight:600">${val}${suffix}</div>
      </div>
    `;
  }

  function renderCharts() {
    // چارت خطی
    if (window.Chart && document.getElementById('sessionChart')) {
      new Chart(document.getElementById('sessionChart').getContext('2d'), {
        type: 'line',
        data: {
          labels: timeSeriesLabels,
          datasets: [{
            label: 'Sessions',
            data: timeSeriesValues,
            borderWidth: 2,
            borderColor: "#3b6ff5",
            backgroundColor: "#d4e2ff70",
            pointRadius: 3,
            fill: true,
            tension: 0.25
          }]
        },
        options: {
          plugins: { legend: { display: false }},
          scales: {
            x: { display: true, title: { display: false }},
            y: { display: true, title: { display: false }, beginAtZero: true }
          }
        }
      });
    }
    // نمودار دایره‌ای
    if (window.Chart && document.getElementById('channelPie')) {
      new Chart(document.getElementById('channelPie').getContext('2d'), {
        type: 'pie',
        data: {
          labels: pieLabels,
          datasets: [{
            data: pieValues,
            backgroundColor: [
              "#3b6ff5", "#f4b400", "#0bb197", "#e34c67", "#8057c7", "#2e9efb"
            ]
          }]
        },
        options: { plugins: { legend: { position: "bottom" } } }
      });
    }
  }
}
