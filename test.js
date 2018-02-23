var rados = require('rados')
var zlib = require('zlib')
var io = require('io')
var hs = require('hyperscan');
var fs = require('fs');
var cluster = new rados.Rados('ceph', 'client.admin', '/etc/ceph/ceph.conf');
cluster.connect()

var hsReg = hs.compile('117.100.187.110', "L");
var eolReg = hs.compile('\n', "L");
console.log('connect success...');

//console.log(cluster.listPool());
//cluster.createPool('auth');
//console.log(cluster.listPool());
//var ioctx = cluster.createIoCtx('test')
var ioctx = cluster.createIoCtx('logs')
var stream = ioctx.open('124.207.253.85/2017-08-28/04:28')

console.time('read');
let buf = stream.read();
console.timeEnd('read');
console.log(buf.length);
//stream.close();
fs.writeFile('test.gz', buf);

console.time('gunzip');
var buffer = zlib.gunzip(buf);
console.timeEnd('gunzip');
console.log(buffer.length);
stream.rewind();
//
var ms = new io.MemoryStream();
var gunzipStream = zlib.createGunzip(ms);
console.time('copyTo');
while(stream.copyTo(gunzipStream, 1000000) !== 0){
       	//ms.read();
};
console.timeEnd('copyTo');
stream.close();

cluster.shutdown();
