//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public classes.
//

/**
 *  Interface of FFT transformers.
 * 
 *  @constructor
 */
function IFFTTransformer() {
    //
    //  Public methods.
    //

    /**
     *  Apply transform.
     *  
     *  @throws {LC3IllegalParameterError}
     *    - Incorrect block size.
     *  @param {Number[]} x_re 
     *    - The real part of each point.
     *  @param {Number[]} x_im 
     *    - The imaginary part of each point.
     */
    this.transform = function(x_re, x_im) {
        throw new Error("Not implemented.");
    };
}

//  Export public APIs.
module.exports = {
    "IFFTTransformer": IFFTTransformer
};