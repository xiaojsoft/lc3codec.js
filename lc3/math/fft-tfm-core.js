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

/**
 *  Interface of FFT transformer factories.
 * 
 *  @constructor
 */
function IFFTTransformerFactory() {
    //
    //  Public methods.
    //

    /**
     *  Create a transformer.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - Block size is not an unsigned 32-bit integer, or
     *    - Block size is larger than 0x80000000.
     *  @param {Number} N
     *    - The block size.
     *  @returns {InstanceType<typeof IFFTTransformer>}
     *    - The transformer.
     */
    this.create = function(N) {
        throw new Error("Not implemented.");
    };
}

//  Export public APIs.
module.exports = {
    "IFFTTransformer": IFFTTransformer,
    "IFFTTransformerFactory": IFFTTransformerFactory
};