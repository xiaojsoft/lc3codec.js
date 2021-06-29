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
const Lc3FftTfmCooleyTukey = 
    require("./fft-tfm-cooleytukey");
const Lc3ObjUtil = 
    require("./../common/object_util");
const Lc3UInt = 
    require("./../common/uint");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const IFFTTransformer = 
    Lc3FftTfmCore.IFFTTransformer;
const FFTCooleyTukeyTransformer = 
    Lc3FftTfmCooleyTukey.FFTCooleyTukeyTransformer;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;

//  Imported functions.
const IsUInt32 = 
    Lc3UInt.IsUInt32;
const Inherits = 
    Lc3ObjUtil.Inherits;

//
//  Public classes.
//

/**
 *  FFT Chirp-Z transformer (using Bluestein's algorithm).
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Block size is not an unsigned 32-bit integer, or 
 *    - Block size is not less than 0xF0000000.
 *  @param {Number} N
 *    - The block size (32-bit unsigned integer, less than 0x80000000).
 */
function FFTBluesteinTransformer(N) {
    //  Let parent class initialize.
    IFFTTransformer.call(this);

    //  Check the block size.
    if (!IsUInt32(N)) {
        throw new LC3IllegalParameterError(
            "Block size is not an unsigned 32-bit integer."
        );
    }
    if (N >= 0x80000000) {
        throw new LC3IllegalParameterError(
            "Block size is not less than 0x80000000."
        );
    }

    //
    //  Members.
    //

    //  Padded sequence length.
    let M = 1;
    let log2M = 0;
    {
        let Mleast = (((N << 1) >>> 0) - 1);
        while (M < Mleast) {
            M = ((M << 1) >>> 0);
            ++(log2M);
        }
    }

    //  Precalculate several constants.
    let PiDivN = Math.PI / N;
    let MsN = M - N;

    //  FFT transformer (for block size `M`).
    let fft = new FFTCooleyTukeyTransformer(log2M);

    //  FFT of the chirp sequence.
    let B_RE = new Array(M);
    let B_IM = new Array(M);

    //  Twiddle factor (TW[n] = e ^ (pi * (n ^ 2) / N)) (for 0 <= n < N).
    let TW_RE = new Array(N);
    let TW_IM = new Array(N);
    for (let n = 0, m = M; n < N; ++n, --m) {
        //  Generate TW[n].
        let phi = PiDivN * (n * n);
        let phi_c = Math.cos(phi);
        let phi_s = Math.sin(phi);
        TW_RE[n] = phi_c;
        TW_IM[n] = phi_s;

        //  Generate chirp b[n] and b[M - n (= m)] (for 0 <= n < N).
        B_RE[n] = phi_c;
        B_IM[n] = phi_s;
        if (n != 0) {
            B_RE[m] = phi_c;
            B_IM[m] = phi_s;
        }
    }
    for (let n = N; n <= MsN; ++n) {
        //  Generate b[n] = 0 (for N <= n <= M - N).
        B_RE[n] = 0;
        B_IM[n] = 0;
    }

    //  B[n] = FFT{b[n]}.
    fft.transform(B_RE, B_IM);

    //  A[n].
    let A_RE = new Array(M);
    let A_IM = new Array(M);

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

        //  Generate sequence a[n] = x[n] * (TW[n] ^ -1) (for 0 <= n < N).
        for (let n = 0; n < N; ++n) {
            let xn_re = x_re[n], 
                xn_im = x_im[n];

            let twn_re = TW_RE[n];
            let twn_im = -TW_IM[n];

            A_RE[n] = xn_re * twn_re - xn_im * twn_im;
            A_IM[n] = xn_im * twn_re + xn_re * twn_im;
        }
        for (let n = N; n < M; ++n) {
            //  a[n] = 0 (for N <= n < M).
            A_RE[n] = 0;
            A_IM[n] = 0;
        }

        //  Let A[n] = FFT{a[n]}.
        fft.transform(A_RE, A_IM);

        //  Let a[n] = IFFT{A[n] * B[n]} (for 0 <= n < M).
        //
        //  Steps:
        //    [1] Let A[n] = (conj(A[n] * B[n])) / M
        //    [2] Let a[n] = FFT{A[n]}
        //    [3] Let a[n] = conj(a[n]).
        for (let n = 0; n < M; ++n) {
            let a_re = A_RE[n],
                a_im = A_IM[n];
            
            let b_re = B_RE[n],
                b_im = B_IM[n];

            //  Do step [1].
            A_RE[n] = (a_re * b_re - a_im * b_im) / M;
            A_IM[n] = -(a_im * b_re + a_re * b_im) / M;
        }

        //  Do step [2].
        fft.transform(A_RE, A_IM);

        //  Do step [3] and generate sequence X[n] = A[n] * (TW[n] ^ -1)
        //  (for 0 <= n < N only).
        for (let n = 0; n < N; ++n) {
            let a_re = A_RE[n], 
                a_im = -A_IM[n];

            let twn_re = TW_RE[n];
            let twn_im = -TW_IM[n];

            x_re[n] = a_re * twn_re - a_im * twn_im;
            x_im[n] = a_im * twn_re + a_re * twn_im;
        }
    };
}

//
//  Imports.
//
Inherits(FFTBluesteinTransformer, IFFTTransformer);

//  Export public APIs.
module.exports = {
    "FFTBluesteinTransformer": FFTBluesteinTransformer
};