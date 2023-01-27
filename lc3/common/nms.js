//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public classes.
//

/**
 *  LC3 frame duration.
 * 
 *  @constructor
 *  @param {Number} us 
 *    - The frame duration in microseconds.
 *  @param {Number} intrid
 *    - The internal index.
 */
function LC3FrameDuration(us, intrid) {
    //
    //  Public methods.
    //

    /**
     *  Get the frame duration in microseconds.
     * 
     *  @returns {Number}
     *    - The frame duration.
     */
    this.toMicroseconds = function() {
        return us;
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

//  Supported frame duration.
LC3FrameDuration.NMS_07500US = new LC3FrameDuration( 7500, 1);  //  7.5ms.
LC3FrameDuration.NMS_10000US = new LC3FrameDuration(10000, 0);  //  10ms.

//  Export public APIs.
module.exports = {
    "LC3FrameDuration": LC3FrameDuration
};