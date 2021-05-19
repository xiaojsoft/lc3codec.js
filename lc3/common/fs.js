//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public classes.
//

/**
 *  LC3 sample rate.
 * 
 *  @constructor
 *  @param {Number} hz 
 *    - The sample rate.
 *  @param {Number} hzsc 
 *    - The scaled sample rate.
 *  @param {Number} fsind
 *    - The sampling rate index.
 *  @param {Number} intrid
 *    - The internal index.
 */
function LC3SampleRate(hz, hzsc, fsind, intrid) {
    //
    //  Public methods.
    //

    /**
     *  Get the sample rate.
     * 
     *  @returns {Number}
     *    - The sample rate.
     */
    this.getSampleRate = function() {
        return hz;
    };

    /**
     *  Get the scaled sample rate.
     * 
     *  @returns {Number}
     *    - The scaled sample rate.
     */
    this.getScaledSampleRate = function() {
        return hzsc;
    };

    /**
     *  Get the sample rate index.
     * 
     *  @returns {Number}
     *    - The sample rate index.
     */
    this.getSampleRateIndex = function() {
        return fsind;
    };

    /**
     *  Get the internal index.
     * 
     *  @ignore
     *  @returns {Number}
     *    - The internal index.
     */
    this.getInternalIndex = function() {
        return intrid;
    };
}

//  Supported sample rates.
LC3SampleRate.FS_08000 = new LC3SampleRate( 8000,  8000, 0, 0);
LC3SampleRate.FS_16000 = new LC3SampleRate(16000, 16000, 1, 1);
LC3SampleRate.FS_24000 = new LC3SampleRate(24000, 24000, 2, 2);
LC3SampleRate.FS_32000 = new LC3SampleRate(32000, 32000, 3, 3);
LC3SampleRate.FS_44100 = new LC3SampleRate(44100, 48000, 4, 4);
LC3SampleRate.FS_48000 = new LC3SampleRate(48000, 48000, 4, 5);

//  Export public APIs.
module.exports = {
    "LC3SampleRate": LC3SampleRate
};