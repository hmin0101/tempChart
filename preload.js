const { ipcRenderer } = require('electron');
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});

// Upload File
window.uploadFile = function(file, ft, chart, option) {
  const result = ipcRenderer.sendSync('uploadFile', {filePath: file.path});
  // Refresh Table
  ft.rows.load(result.tableData);
  // Refresh Graph
  option.xAxis.data = result.xLegend;
  option.series[0].data = result.chartData.temp;
  option.series[1].data = result.chartData.rh;
  option.series[2].data = result.chartData.dew;
  chart.setOption(option);
};

// Edit Data
window.edit = function(data, ft, chart, option) {
  const result = ipcRenderer.sendSync('edit', data);
  // Refresh Table
  ft.rows.load(result.tableData);
  // Refresh Graph
  option.series[0].data = result.chartData.temp;
  option.series[1].data = result.chartData.rh;
  option.series[2].data = result.chartData.dew;
  chart.setOption(option);
};