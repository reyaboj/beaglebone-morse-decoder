/**
   util.js

   Utilities.
 */
'use strict';

/*Signals*/
const HIGH = 1;
const LOW  = 0;

exports.HIGH = HIGH;
exports.LOW  = LOW;

/*Motions*/
const LONG_MOTION  = 'L';
const SHORT_MOTION = 'S';

exports.LONG_MOTION  = LONG_MOTION;
exports.SHORT_MOTION = SHORT_MOTION;

/*Motion lengths*/
const SHORT_MOTION_LEN = 1;
const LONG_MOTION_LEN  = 3;

exports.SHORT_MOTION_LEN = SHORT_MOTION_LEN;
exports.LONG_MOTION_LEN  = LONG_MOTION_LEN;

/*Gap widths for the signal stream*/
const SMALL_GAP  = 1;
const LETTER_GAP = 3;
const WORD_GAP   = 7;

exports.SMALL_GAP  = SMALL_GAP;
exports.LETTER_GAP = LETTER_GAP;
exports.WORD_GAP   = WORD_GAP;

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
exports.morse = morse;

/*Morse code reverse lookup*/
const morseReverse = {};
for (var pat in morse) {
    if (pat !== undefined)
        morseReverse[morse[pat]] = pat;
}
exports.morseReverse = morseReverse;

/*Unknown Character to use for failed lookups*/
const UNKNOWN = String.fromCodePoint(0xfffd);
exports.UNKNOWN = UNKNOWN;


/**
   Convert a given code to its corresponding signal sequence.

   @example
   console.log(codeToSignals('SL'))  // prints [1,0,1,1,1]

   @param {Array|String} code morse code over 'S' and 'L'
   @returns {Array} an array of signals that correspond to this code
 */
function codeToSignals(code) {
    const signals = [];

    for (var i = 0; i < code.length; i++) {
        var motion = code[i];
        var reps = motion === SHORT_MOTION? SHORT_MOTION_LEN : LONG_MOTION_LEN;

        for (var rep = 0; rep < reps; rep++) {
            signals.push(HIGH);
        }

        if (i !== code.length-1) {  // add the intraletter gap
            signals.push(LOW);
        }
    }

    return signals;
}
exports.codeToSignals = codeToSignals;


/**
   Convert a message to its corresponding signal sequence.

   @
 */
function msgToSignals(msg) {
    var signals = [];

    for (var i = 0; i < msg.length; i++) {
        if (msg[i] == ' ') {
            for (var j = 0; j < WORD_GAP; j++)
                signals.push(LOW);
            continue;
        }

        const code = morseReverse[msg[i]];
        for (var signal of codeToSignals(code))
            signals.push(signal);

        if (i !== msg.length-1 && msg[i+1] != ' ')
            for (var j = 0; j < LETTER_GAP; j++)
                signals.push(LOW);
    }

    return signals;
}
exports.msgToSignals = msgToSignals;
