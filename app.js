const mqtt = require('mqtt');
const client  = mqtt.connect('http://192.168.1.100');
var stats = require('sysstats')();
var cpuCounter = stats.cpus(),
    ramCounter = stats.mem();
var cpuPercent = 0,
    cpuIdle = 0,
    cpuTotal = 0,
    cpuIdlep = 0,
    cpuTotalp = 0,
    cpuIdled = 0,
    cpuTotald = 0;

function getCPU(send) {
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

    // publish data on the broker
    if(send == true) {
        client.publish('cpu', cpuPercent.toString());
    }

    // callback getCPU()
    setTimeout(function() { getCPU(true); }, 1000);
}

client.on('connect', () => {
    client.publish('test', 'New publisher !')
})

getCPU(false);
