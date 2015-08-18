var AV = require('leanengine');

var APP_ID = process.env.LC_APP_ID || 'n4ibkpr4z9d8tkdlg7k0j6xywwwb28k2jw8fzmj5vrxeve4c'; // your app id
var APP_KEY = process.env.LC_APP_KEY || 'ehsn3wgg56185yofd51sdh9ccifhb1cpa4m8s1stm4slrbef'; // your app key
var MASTER_KEY = process.env.LC_APP_MASTER_KEY || ''; // your app master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);

var app = require('./app');

// 端口一定要从环境变量 `LC_APP_PORT` 中获取。
// LeanEngine 运行时会分配端口并赋值到该变量。
var PORT = parseInt(process.env.LC_APP_PORT || 3000);
var server = app.listen(PORT, function () {
  console.log('Node app is running, port:', PORT);
});