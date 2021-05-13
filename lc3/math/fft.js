//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3FftTfmBluestein = 
    require("./fft-tfm-bluestein");
const Lc3FftTfmCooleyTukey = 
    require("./fft-tfm-cooleytukey");
const Lc3UInt = 
    require("./../common/uint");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const FFTBluesteinTransformer = 
    Lc3FftTfmBluestein.FFTBluesteinTransformer;
const FFTCooleyTukeyTransformer = 
    Lc3FftTfmCooleyTukey.FFTCooleyTukeyTransformer;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;

//  Imported functions.
const IsUInt32 = 
    Lc3UInt.IsUInt32;

//
//  Public classes.
//

/**
 *  FFT transformer (for both forward and reverse direction).
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Block size is not an unsigned 32-bit integer, or
 *    - Block size is larger than 0x80000000.
 *  @param {Number} N 
 *    - The block size.
 */
function FFT(N) {
    //  Ensure the block size is an integer.
    if (!IsUInt32(N)) {
        throw new LC3IllegalParameterError(
            "Block size is not an unsigned 32-bit integer."
        );
    }
    if (N > 0x80000000) {
        throw new LC3IllegalParameterError(
            "Block size is larger than 0x80000000."
        );
    }

    //  FFT transformer.
    let transformer = null;
    for (let i = 31; i > 0; --i) {
        if (N == ((1 << i) >>> 0)) {
            transformer = new FFTCooleyTukeyTransformer(i);
        }
    }
    if (transformer === null) {
        transformer = new FFTBluesteinTransformer(N);
    }

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
        //  Check the block size.
        if (x_re.length != N || x_im.length != N) {
            throw new LC3IllegalParameterError("Incorrect block size.");
        }

        //  Apply transform.
        transformer.transform(x_re, x_im);
    };

    /**
     *  Apply inverse transform.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - Incorrect block size.
     *  @param {Number[]} x_re 
     *    - The real part of each point.
     *  @param {Number[]} x_im 
     *    - The imaginary part of each point.
     */
    this.transformInverse = function(x_re, x_im) {
        //  Check the size.
        if (x_re.length != N || x_im.length != N) {
            throw new LC3IllegalParameterError("Incorrect block size.");
        }

        //  This algorithm was taken from official solution #2 of problem 9.1 of
        //  the book "Discrete-Time Signal Processing (Third Edition)" written 
        //  by Alan V. Oppenheim and Ronald W. Schafer.
        for (let i = 0; i < N; ++i) {
            x_im[i] = -x_im[i];
        }
        transformer.transform(x_re, x_im);
        for (let i = 0; i < N; ++i) {
            x_re[i] /= N;
            x_im[i]  = (-x_im[i]) / N;
        }
    };
}

//  Export public APIs.
module.exports = {
    "FFT": FFT
};