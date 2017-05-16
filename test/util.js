/**
   Tests for util.js
 */

const assert = require('assert');
const _      = require('lodash');
const util   = require('../src/util');


describe('util', function() {
    describe('#codeToSignals', function() {
        it('should convert SLSSL to 1011101010111', function() {
            assert(
                _.isEqual(
                    util.codeToSignals('SLSSL'),
                    [1,0,1,1,1,0,1,0,1,0,1,1,1]
                )
            );
        });
    });

    describe('#msgToSignals', function() {
        it('should convert AAB to 1011100010111000111010101', function() {
            assert(
                _.isEqual(
                    util.msgToSignals('AAB'),
                    [1,0,1,1,1,0,0,0,1,0,1,1,1,0,0,0,1,1,1,0,1,0,1,0,1]
                )
            );
        });

        it('should convert \"AB Z\" to 10111000111010101000000011101110101', function () {
            assert(
                _.isEqual(
                    util.msgToSignals('AB Z'),
                    [1,0,1,1,1,0,0,0,1,1,1,0,1,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,1,1,1,0,1,0,1]
                )
            );
        });
    });
});
