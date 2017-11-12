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
    //Refresh cpuCounter
    cpuCounter = stats.cpus();
    cpuCounter.forEach(function(e) {
        cpuIdle += e.times.idle;
        cpuTotal += e.times.user + e.times.nice + e.times.sys + e.times.idle + e.times.irq;
    })

    //Calculate difference between updated and previous values
    cpuIdled = cpuIdle - cpuIdlep;
    cpuTotald = cpuTotal - cpuTotalp;

    //Attribuates new values to previous values
    cpuIdlep = cpuIdle;
    cpuTotalp = cpuTotal;

    //Calculate CPU usage in percentage, with 2 decimals
    cpuPercent = (((cpuTotald - cpuIdled)/cpuTotald)*100).toFixed(2);
}

function getRAM(send) {
    //Refresh ramCounter
    ramCounter = stats.mem();
    ramPercent = ((ramCounter.used / ramCounter.total)*100).toFixed(2);
}

function publishData() {
    //Update CPU and RAM values
    getCPU();
    getRAM();
    date = new Date();

    //Send datas to the broker
    client.publish('tenodata', '{"mac":"'+mac+'", "ip":"'+ip+'", "date":"'+date+'","cpu": "'+cpuPercent+'", "ram":"'+ramPercent+'"}');

    //Callback
    setTimeout(function() {publishData();}, 1000);
}

//MQTT Publisher initialize
client.on('connect', () => {
    client.publish('tenodata', 'New publisher !');
})

//Repeat getCPU()
getCPU();
setTimeout(function() {publishData();}, 1000);
