/**
   decoder.js

   Morse code decoder.
 */

/*Morse code lookup table*/
const morse = {
    'SL':   'A',
    'LSSS': 'B',
    'LSLS': 'C',
    'LSS':  'D',
    'S':    'E',
    'SSLS': 'F',
    'LLS':  'G',
    'SSSS': 'H',
    'SS':   'I',
    'SLLL': 'J',
    'LSL':  'K',
    'SLSS': 'L',
    'LL':   'M',
    'LS':   'N',
    'LLL':  'O',
    'SLLS': 'P',
    'LLSL': 'Q',
    'SLS':  'R',
    'SSS':  'S',
    'L':    'T',
    'SSL':  'U',
    'SSSL': 'V',
    'SLL':  'W',
    'LSSL': 'X',
    'LSLL': 'Y',
    'LLSS': 'Z'
};

const morseReverse = {};
for (pat in morse) {
    if (pat !== undefined)
        morseReverse[morse[pat]] = pat;
}

/*Gap widths for the signal stream*/
const SMALL_GAP  = 1;
const LETTER_GAP = 3;
const WORD_GAP   = 7;

/*Signals*/
const HIGH = 1;
const LOW  = 0;

/*Motion threshold*/
const LONG_MOTION_LEN = 3;

/*Motions*/
const LONG_MOTION  = 'L';
const SHORT_MOTION = 'S';


/**
   Construct a decoder with initial state.
   @constructor
 */
function Decoder() {
    this.streak = null;  // either 0/1 to indicate LOW/HIGH streaks
    this.count  = 0;     // length of the current streak
    this.motions = [];   // motions for the current to-be-converted code
    this.message = [];   // message encoded so far
}


/**
   Update decoder state using the received signal. Signals are assumed to come in at
   a steady interval. NOTE: this is an online process; the decoder will not commit to
   a decision unless it has guarantee that a future signal wouldn't have altered the
   decoded message.

   @param {number} signal 0 or 1 to indicate LOW/HIGH signals respectively
 */
Decoder.prototype.processSignal = function(signal) {
    if (this.streak === null) {
        this.streak = signal;
        this.count += 1;
    } else if (this.streak === HIGH) {
        if (signal === LOW) {
            if (this.count >= LONG_MOTION_LEN)
                this.motions.push(LONG_MOTION);
            else
                this.motions.push(SHORT_MOTION);

            this.streak = LOW;
            this.count = 1;
        } else {
            this.count += 1;
        }
    } else if (this.streak === LOW) {
        if (signal === HIGH) {
            if (this.count < LETTER_GAP) {
                this.count = 1;
                this.streak = HIGH;
                return;
            }

            this.message.push(morse[this.motions.join('')]);
            this.motions = [];

            if (this.count >= WORD_GAP) {
                this.message.push(' ');
            }

            this.count = 1;
            this.streak = HIGH;
        } else {
            this.count += 1;
        }
    }

    return this;
};


/**
   Stops anticipating more signals and commits the decoder state to update the decoded
   message. After calling this, the decoder is in a valid state and is ready to process
   more signals.
 */
Decoder.prototype.gracefulFinalizeState = function() {
    if (this.streak === HIGH) {
        if (this.count >= LONG_MOTION_LEN) {
            this.motions.push(LONG_MOTION);
        } else {
            this.motions.push(SHORT_MOTION);
        }

        this.message.push(morse[this.motions.join('')]);
    } else if (this.streak === LOW) {
        if (this.count >= LETTER_GAP) {
            this.message.push(morse[this.motions.join('')]);
        }

        if (this.count >= WORD_GAP) {
            this.message.push(' ');
        }
    }

    this.streak = null;
    this.count = 0;
    this.motions = [];
    return this;
};


/**
   Decode signals offline rather than online.

   @param {Array} signals an array of signals (0s/1s)
 */
Decoder.prototype.processSignalsOffline = function (signals) {
    for (signal of signals) {
        this.processSignal(signal);
    }

    this.gracefulFinalizeState();
    return this;
};


/**
   Get the message decoded so far.

   @returns {string} the message
 */
Decoder.prototype.peekMessage = function () {
    return this.message.join('');
};


exports.Decoder = Decoder;

exports.msgToMorse = function (msg) {
    result = [];

    const letters = msg.split('');
    for (letter of letters) {
        if (letter === ' ') {
            for (var i = 0; i < WORD_GAP; i++)
                result.push(LOW);
            continue;
        }

        var code = morseReverse[letter];
        console.log(`${letter} ${code}`);

        for (var i = 0; i < code.length; i++) {
            if (code[i] === SHORT_MOTION) {
                result.push(HIGH);
            } else if (code[i] === LONG_MOTION) {
                for (var j = 0; j < LONG_MOTION_LEN; j++) {
                    result.push(HIGH);
                }
            }
            if (i !== code.length-1)
                result.push(LOW);
        }

        for (var i = 0; i < LETTER_GAP; i++)
            result.push(LOW);
    }

    return result;
};
