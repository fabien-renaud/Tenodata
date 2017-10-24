const mqtt = require('mqtt');
const client  = mqtt.connect('http://192.168.1.100');
const cpu = require('cpu-stats');

function getCPU() {
    cpu(500, function(error, result) {
        if(error) return console.error('Error: ', error);
        console.info(result[0]['cpu']);
        client.publish('test', result[0]['cpu'].toString());
    })
    setTimeout(function() { getCPU(); }, 1000);
}

client.on('connect', () => {
    client.publish('test', 'New publisher !')
})

getCPU();
