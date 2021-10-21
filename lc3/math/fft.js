//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3FftMx60 = 
    require("./fft-mx-60");
const Lc3FftMx80 = 
    require("./fft-mx-80");
const Lc3FftMx120 = 
    require("./fft-mx-120");
const Lc3FftMx160 = 
    require("./fft-mx-160");
const Lc3FftMx180 = 
    require("./fft-mx-180");
const Lc3FftMx240 = 
    require("./fft-mx-240");
const Lc3FftMx320 = 
    require("./fft-mx-320");
const Lc3FftMx360 = 
    require("./fft-mx-360");
const Lc3FftMx480 = 
    require("./fft-mx-480");
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
const ApplyMixedRadixFFT_60 = 
    Lc3FftMx60.ApplyMixedRadixFFT_60;
const ApplyMixedRadixFFT_80 = 
    Lc3FftMx80.ApplyMixedRadixFFT_80;
const ApplyMixedRadixFFT_120 = 
    Lc3FftMx120.ApplyMixedRadixFFT_120;
const ApplyMixedRadixFFT_160 = 
    Lc3FftMx160.ApplyMixedRadixFFT_160;
const ApplyMixedRadixFFT_180 = 
    Lc3FftMx180.ApplyMixedRadixFFT_180;
const ApplyMixedRadixFFT_240 = 
    Lc3FftMx240.ApplyMixedRadixFFT_240;
const ApplyMixedRadixFFT_320 = 
    Lc3FftMx320.ApplyMixedRadixFFT_320;
const ApplyMixedRadixFFT_360 = 
    Lc3FftMx360.ApplyMixedRadixFFT_360;
const ApplyMixedRadixFFT_480 = 
    Lc3FftMx480.ApplyMixedRadixFFT_480;

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
    let mx_func = null;
    let transformer = null;
    if (g_CustomTransformerFactory !== null) {
        transformer = g_CustomTransformerFactory.create(N);
    } else {
        //  Try prebuilt mixed-radix Cooley-Tukey FFT algorithm.
        if (N == 60) {
            mx_func = ApplyMixedRadixFFT_60;
        } else if (N == 80) {
            mx_func = ApplyMixedRadixFFT_80;
        } else if (N == 120) {
            mx_func = ApplyMixedRadixFFT_120;
        } else if (N == 160) {
            mx_func = ApplyMixedRadixFFT_160;
        } else if (N == 180) {
            mx_func = ApplyMixedRadixFFT_180;
        } else if (N == 240) {
            mx_func = ApplyMixedRadixFFT_240;
        } else if (N == 320) {
            mx_func = ApplyMixedRadixFFT_320;
        } else if (N == 360) {
            mx_func = ApplyMixedRadixFFT_360;
        } else if (N == 480) {
            mx_func = ApplyMixedRadixFFT_480;
        } else {
            //  Fallback to other algorithms.

            //  Try 2-radix Cooley-Tukey FFT algorithm.
            for (let i = 31; i > 0; --i) {
                if (N == ((1 << i) >>> 0)) {
                    transformer = new FFTCooleyTukeyTransformer(i);
                }
            }

            //  Try Bluestein's FFT algorithm.
            if (transformer === null) {
                transformer = new FFTBluesteinTransformer(N);
            }
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
        if (mx_func !== null) {
            mx_func.call(this, x_re, x_im);
            return;
        }
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