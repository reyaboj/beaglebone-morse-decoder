/**
   Morse code decoder application.

   Client-server architecture with the following responsibilities for each host:
     - Server
       Read signals from the motion sensor and decodes signals as Morse code.
       Push message to Firebase as it gets decoded.

     - Client
       Listens to Firebase for updates and displays the decoded message to the user.
 */

const EventEmitter = require('events');
const nodeUtil = require('util');
const util = require('./util');
const initDecoder = require('./server').initDecoder;


function MorseEmitter(msg) {
    EventEmitter.call(this);
    this.msg = util.msgToSignals(msg);
}

nodeUtil.inherits(MorseEmitter, EventEmitter);

MorseEmitter.prototype.start = function(tickSize) {
    tickSize = tickSize || 2000;
    const msg = this.msg;
    var pos = 0;
    const self = this;

    this.timer = setInterval(
        () => {
            self.emit('data', {detectedMotion: msg[pos]});

            if (pos === msg.length-1)
                for (var i = 0; i < util.LETTER_GAP; i++)
                    self.emit('data', {detectedMotion: util.LOW});

            pos = (pos+1) % msg.length;
        },
        tickSize
    );

    return this.timer;
};


if (process.argv.length !== 3) {
    console.log('Usage: node mock-server <message>');
    process.exit(1);
}

const msg = process.argv[2];
const mockStream = new MorseEmitter(msg);
const decoder = initDecoder(mockStream);
decoder.on();
mockStream.start();
