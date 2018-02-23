var rados = require('rados')
var zlib = require('zlib')
var io = require('io')
var fs = require('fs');
var cluster = new rados.Rados('ceph', 'client.admin', '/etc/ceph/ceph.conf');
cluster.connect()

console.log('connect success...');

var ioctx = cluster.createIoCtx('logs')
var stream = ioctx.open('124.207.253.85/2017-08-28/04:28')

console.time('read');
let buf = stream.read();
console.timeEnd('read');
console.log(buf.length);
fs.writeFile('test.gz', buf);

console.time('gunzip');
var buffer = zlib.gunzip(buf);
console.timeEnd('gunzip');
console.log(buffer.length);
stream.rewind();

var ms = new io.MemoryStream();
var gunzipStream = zlib.createGunzip(ms);
console.time('copyTo');
while(stream.copyTo(gunzipStream, 1000000) !== 0){
       	//ms.read();
};
console.timeEnd('copyTo');
stream.close();

cluster.shutdown();
