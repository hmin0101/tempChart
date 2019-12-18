// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const { ipcMain } = require('electron');

const xlsx = require('xlsx');
const path = require('path');
const moment = require('./javascripts/moment-2.24.0.min');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/* IPC Event Control (Synchronous) */
// Cache Data
const cache = {
  table: [],
  chart: {
    temp: [],
    rh: [],
    dew: []
  }
};

// FileUpload
ipcMain.on('uploadFile', function(event, arg) {

  const workbook = xlsx.readFile(arg.filePath, {type: "buffer"});
  const sheetName = Object.keys(workbook.Sheets);
  const worksheet = workbook.Sheets[sheetName[0]];

  const size = worksheet['!ref'].split(':');
  const cell = {
    start: size[0].replace(/[^a-zA-Z]/g, ""),
    end: size[size.length - 1].replace(/[^a-zA-Z]/g, ""),
    sIndex: Number(size[0].replace(/[^0-9]/g, "")),
    eIndex: Number(size[size.length - 1].replace(/[^0-9]/g, ""))
  };

  let idx = 0;
  const xLegend = [];
  for (let i=2;i<cell.eIndex;i++) {
    const dateStr = worksheet["B"+i];
    if (dateStr !== undefined) {

      // 오전/오후 구분하여 Date Format 생성
      const tt = dateStr.v.trim().split(' ');
      let date = tt[0], time = null;
      if (tt[1] === "오후") {
        const split = tt[2].split(':');
        time = (Number(split[0]) + 12) + ":" + split[1] + ":" + split[2];
      }
      const calculatedDate = new Date(date + "T" + time);

      const editDate = moment(calculatedDate).format('YYYY-MM-DD HH:mm:ss');

      // Data Array Using Table
      cache.table.push({
        index: idx,
        date: editDate,
        temp: worksheet["C"+i] === undefined ? "" : worksheet["C"+i].v,
        rh: worksheet["D"+i] === undefined ? "" : worksheet["D"+i].v,
        dew: worksheet["E"+i] === undefined ? "" : worksheet["E"+i].v,
      });
      idx++;

      // Data Array Using Graph
      xLegend.push(editDate);
      cache.chart.temp.push([editDate, worksheet["C"+i] === undefined ? "" : worksheet["C"+i].v]);
      cache.chart.rh.push([editDate, worksheet["D"+i] === undefined ? "" : worksheet["D"+i].v]);
      cache.chart.dew.push([editDate, worksheet["E"+i] === undefined ? "" : worksheet["E"+i].v]);
    }
  }

  // Response
  event.returnValue = {
    tableData: cache.table,
    xLegend: xLegend,
    chartData: {
      temp: cache.chart.temp,
      rh: cache.chart.rh,
      dew: cache.chart.dew
    }
  };

});

// Change Data
ipcMain.on('edit', function(event, arg) {

  const data = arg;

  // Table
  cache.table[data.index].temp = data.temp;
  cache.table[data.index].rh = data.rh;
  cache.table[data.index].dew = data.dew;

  // Chart
  cache.chart.temp[data.index][1] = data.temp;
  cache.chart.rh[data.index][1] = data.rh;
  cache.chart.dew[data.index][1] = data.dew;

  event.returnValue = {
    tableData: cache.table,
    chartData: {
      temp: cache.chart.temp,
      rh: cache.chart.rh,
      dew: cache.chart.dew
    },
  };

});