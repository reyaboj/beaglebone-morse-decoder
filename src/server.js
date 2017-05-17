/**
   Morse code decoder application.

   Client-server architecture with the following responsibilities for each host:
     - Server
       Read signals from the motion sensor and decodes signals as Morse code.
       Push message to Firebase as it gets decoded.

     - Client
       Listens to Firebase for updates and displays the decoded message to the user.
 */


const dec  = require('./decoder');

function initDecoder(sensor) {
    const fireadmin = require('firebase-admin');
    const serviceAcc = require('./morsedecoder-key.json');

    fireadmin.initializeApp({
        credential: fireadmin.credential.cert(serviceAcc),
        databaseURL: 'https://morsedecoder-fc3e1.firebaseio.com'
    });

    const firedb = fireadmin.database();
    const dbRoot = firedb.ref();

    dbRoot.set({
        signal: null,
        motion: null,
        message: null
    });

    const dbSignal = dbRoot.child('signal');
    const dbMotion = dbRoot.child('motion');
    const dbMessage = dbRoot.child('message');


    const decoder = new dec.Decoder(
        (motion) => dbMotion.push(motion),
        (letter) => dbMessage.push(letter)
    );

    function decoderPush(data) {
        data = data.detectedMotion? 1 : 0;
        dbSignal.push(data);
        decoder.processSignal(data);
        console.log(JSON.stringify(decoder, null, 2));
    }

    const iface = {
        pushing: false,

        off: function() {
            if (!this.pushing)
                return;

            sensor.removeListener('data', decoderPush);
            this.pushing = false;
        },

        on: function() {
            if (this.pushing)
                return;

            sensor.on('data', decoderPush);
            this.pushing = true;
        }
    };

    return iface;
}
exports.initDecoder = initDecoder;


function startServer() {
    const five = require('johnny-five');
    const bbio = require('beaglebone-io');

    const beagle = new five.Board({
        io: new bbio(),
        repl: false
    });

    beagle.on('ready', function () {
        const SENSOR_PIN = 'P8_8';  // PIR sensor output signal pin
        const POLL_FREQ = 3000;  // polling frequency in milliseconds

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

            initDecoder(sensor).on();
        });
    });
}


if (require.main === module) {  // run as a script; not required by another module
    startServer();
}
