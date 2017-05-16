/**
   decoder.js

   Morse code decoder.
 */
'use strict';

const morseUtil = require('./util');


/*Morse code lookup table: code -> letter*/
const morse = morseUtil.morse;

/*Morse code reverse lookup table: letter -> code*/
const morseReverse = morseUtil.morseReverse;

/*Gap widths for the signal stream*/
const SMALL_GAP  = morseUtil.SMALL_GAP;
const LETTER_GAP = morseUtil.LETTER_GAP;
const WORD_GAP   = morseUtil.WORD_GAP;

/*Signals*/
const HIGH = morseUtil.HIGH;
const LOW  = morseUtil.LOW;

/*Motion lengths*/
const LONG_MOTION_LEN = morseUtil.LONG_MOTION_LEN;

/*Motions*/
const LONG_MOTION  = morseUtil.LONG_MOTION;
const SHORT_MOTION = morseUtil.SHORT_MOTION;

/*Unknown Character to use for failed lookups*/
const UNKNOWN = morseUtil.UNKNOWN;


/**
   Construct a decoder with initial state.
   @constructor
 */
function Decoder(motionCallback, letterCallback) {
    this.streak = null;  // either 0/1 to indicate LOW/HIGH streaks
    this.count  = 0;     // length of the current streak
    this.motions = [];   // motions for the current to-be-converted code
    this.message = [];   // message encoded so far
    this.motionCallback = motionCallback;  // called when a new motion is classified
    this.letterCallback = letterCallback;  // called when a new letter is added to msg
}


/**
   Update decoder state using the received signal. Signals are assumed to come in at
   a steady interval.

   NOTE: this is an online process; the decoder will not commit to a decision unless it
   has guarantee that a future signal wouldn't have forced a different choice for the
   decoded letter. The limitation with this process is that the interface is awkward:
   the client must call @{link gracefulFinalizeState} to force the process to decide
   based on the current state, i.e. assuming the end of the signal stream.

   @param {number} signal 0 or 1 to indicate LOW/HIGH signals respectively
 */
Decoder.prototype.processSignal = function(signal) {
    if (this.streak === null) {
        this.streak = signal;
        this.count += 1;
    } else if (this.streak === HIGH) {
        if (signal === LOW) {
            const motion = this.count >= LONG_MOTION_LEN? LONG_MOTION : SHORT_MOTION;
            this.motions.push(motion);
            this.streak = LOW;
            this.count = 1;

            this.motionCallback(motion);
        } else {
            this.count += 1;
        }
    } else if (this.streak === LOW) {
        if (signal === HIGH) {
            if (this.count < LETTER_GAP) {
                this.count = 1;
                this.streak = HIGH;
                return this;
            }

            const char = morse[this.motions.join('')];
            const pushChar = char? char : UNKNOWN;
            this.message.push(pushChar);
            this.motions = [];
            this.letterCallback(pushChar);

            if (this.count >= WORD_GAP) {
                this.message.push(' ');
                this.letterCallback(' ');
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
    if (this.motions.length === 0)
        return this;

    if (this.streak === HIGH) {
        const motion = this.count >= LONG_MOTION_LEN? LONG_MOTION : SHORT_MOTION;
        this.motions.push(motion);
        this.motionCallback(motion);

        const char = morse[this.motions.join('')];
        const pushChar = char? char : UNKNOWN;
        this.message.push(pushChar);
        this.letterCallback(pushChar);
    } else if (this.streak === LOW) {
        if (this.count >= LETTER_GAP) {
            const char = morse[this.motions.join('')];
            const pushChar = char? char : UNKNOWN;
            this.message.push(pushChar);
            this.letterCallback(pushChar);
        }

        if (this.count >= WORD_GAP) {
            this.message.push(' ');
            this.letterCallback(' ');
        }
    }

    this.streak = null;
    this.count = 0;
    this.motions = [];
    return this;
};


/**
   Decode signals offline rather than online. Call @{link peekMessage} afterwards to
   retrieve the decoded message.

   @param {Array} signals an array of signals (0s/1s)
 */
Decoder.prototype.processSignalsOffline = function (signals) {
    for (var signal of signals) {
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
