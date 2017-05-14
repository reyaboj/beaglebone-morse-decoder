/**
   Tests for the decoder application.
 */

const assert = require('assert');
const decoder = require('../src/decoder');
const Decoder = decoder.Decoder;

describe('hooks', function () {
    var dec = null;

    beforeEach('setup', function () {
        dec = new Decoder();
    });


    describe('Decoder', function () {
        describe('#processSignalsOffline', function () {
            it('should decode valid signal stream', function () {
                const code = [1,0,1,1,1, 0,0,0, 1,1,1,0,1,0,1,0,1];
                assert.equal(dec.processSignalsOffline(code).peekMessage(), 'AB');
            });
        });

        describe('#processSignal', function () {
            it('should classify long/short correctly', function () {
                for (c of [1,0,1,1,1,0,0,1,0,1,0])
                    dec.processSignal(c);

                const exp = ['S', 'L', 'S', 'S'];
                assert(dec.motions.every(
                    (motion, i) => motion == exp[i]
                ));
            });
        });
    });
});
