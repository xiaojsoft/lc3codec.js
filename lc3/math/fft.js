//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3FftTfmCore = 
    require("./fft-tfm-core");
const Lc3FftTfmBluestein = 
    require("./fft-tfm-bluestein");
const Lc3FftTfmCooleyTukey = 
    require("./fft-tfm-cooleytukey");
const Lc3UInt = 
    require("./../common/uint");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const IFFTTransformerFactory = 
    Lc3FftTfmCore.IFFTTransformerFactory;
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
//  Globals.
//

/**
 *  User-custom FFT transformer factory.
 * 
 *  @type {?(InstanceType<typeof IFFTTransformerFactory>)}
 */
let g_CustomTransformerFactory = null;

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
    if (g_CustomTransformerFactory !== null) {
        transformer = g_CustomTransformerFactory.create(N);
    } else {
        for (let i = 31; i > 0; --i) {
            if (N == ((1 << i) >>> 0)) {
                transformer = new FFTCooleyTukeyTransformer(i);
            }
        }
        if (transformer === null) {
            transformer = new FFTBluesteinTransformer(N);
        }
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
}

//
//  Public functions.
//

/**
 *  Assign a FFT transformer as user-custom FFT transformer.
 * 
 *  @throws {LC3IllegalParameterError}
 *    - Bad transformer factory object.
 *  @param {InstanceType<typeof IFFTTransformerFactory>} factory
 *    - The transformer factory object.
 */
function SetCustomTransformer(factory) {
    //  Check factory object type.
    if (!(factory instanceof IFFTTransformerFactory)) {
        throw new LC3IllegalParameterError(
            "Bad transformer factory object."
        );
    }

    //  Save the factory object.
    g_CustomTransformerFactory = factory;
}

/**
 *  Unset the assigned user-custom FFT transformer.
 */
function UnsetCustomTransformer() {
    //  Clear the factory object.
    g_CustomTransformerFactory = null;
}

//  Export public APIs.
module.exports = {
    "FFT": FFT,
    "SetCustomTransformer": SetCustomTransformer,
    "UnsetCustomTransformer": UnsetCustomTransformer
};