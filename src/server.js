/**
   Morse code decoder application.

   Client-server architecture with the following responsibilities for each host:
     - Server
       Read signals from the motion sensor and decodes signals as Morse code.
       Push message to Firebase as it gets decoded.

     - Client
       Listens to Firebase for updates and displays the decoded message to the user.
 */

const five = require('johnny-five');
const bbio = require('beaglebone-io');
const dec  = require('./decoder');


const beagle = new five.Board({
    io: new bbio(),
    repl: false
});

beagle.on('ready', function () {
    const SENSOR_PIN = 'P8_8';  // PIR sensor output signal pin
    const POLL_FREQ = 1000;  // polling frequency in milliseconds

    const sensor = new five.Motion({
        pin: SENSOR_PIN,
        freq: POLL_FREQ
    });

    sensor.on('calibrated', function () {
        console.log(
            `[Calibrated]\n`
                + `Pin = ${SENSOR_PIN}\n`
                + `Polling Rate = every ${POLL_FREQ} msecs\n`
        );

        sensor.on('data', function (data) {
            console.log(
                `Timestamp{${data.timestamp}}  ${data.detectedMotion ? 'HIGH' : 'LOW'}`
            );
        });
    });
});
