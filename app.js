const mqtt = require('mqtt');
const address = require('address');
const client  = mqtt.connect('http://192.168.1.100');
const stats = require('sysstats')();
var cpuCounter = stats.cpus(),
    ramCounter = stats.mem();
var cpuPercent = 0,
    cpuIdle = 0,
    cpuTotal = 0,
    cpuIdlep = 0,
    cpuTotalp = 0,
    cpuIdled = 0,
    cpuTotald = 0,
    ramPercent = 0,
    date;
const ip = address.ip();
const mac = address.mac(function(err, addr) {return addr;});

function getCPU() {
    // refresh cpuCounter
    cpuCounter = stats.cpus();
    cpuCounter.forEach(function(e) {
        cpuIdle += e.times.idle;
        cpuTotal += e.times.user + e.times.nice + e.times.sys + e.times.idle + e.times.irq;
    })

    // calculate difference between updated and previous values
    cpuIdled = cpuIdle - cpuIdlep;
    cpuTotald = cpuTotal - cpuTotalp;

    // attribuates new values to previous values
    cpuIdlep = cpuIdle;
    cpuTotalp = cpuTotal;

    // calculate CPU usage in percentage, with 2 decimals
    cpuPercent = (((cpuTotald - cpuIdled)/cpuTotald)*100).toFixed(2);
}

function getRAM(send) {
    // refresh ramCounter
    ramCounter = stats.mem();
    ramPercent = ((ramCounter.used / ramCounter.total)*100).toFixed(2);
}

function publishData() {
    // update CPU and RAM values
    getCPU();
    getRAM();
    date = new Date();

    // send datas to the broker
    client.publish('tenodata', '{"mac":"'+mac+'", "ip":"'+ip+'", "hours":"'+date+'","cpu": "'+cpuPercent+'", "ram":"'+ramPercent+'"}');

    // callback
    setTimeout(function() {publishData();}, 1000);
}

client.on('connect', () => {
    client.publish('test', 'New publisher !');
})

getCPU();
setTimeout(function() {publishData();}, 1000);
