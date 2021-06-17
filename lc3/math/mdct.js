//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3FFT = 
    require("./fft");
const Lc3UInt = 
    require("../common/uint");
const Lc3Error = 
    require("../error");

//  Imported classes.
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;
const FFT = 
    Lc3FFT.FFT;

//  Imported functions.
const IsUInt32 = 
    Lc3UInt.IsUInt32;

//
//  Development Notes:
//    [1] https://drive.google.com/file/d/1q0VB0fDw5i5Z02MNPd7D6jQ4LVT6ipWd/
//

//
//  Public classes.
//

/**
 *  MDCT transformer.
 * 
 *  Note(s):
 *    [1] The patent "WO2001033411 - FAST MODIFIED DISCRETE COSINE TRANSFORM 
 *        METHOD" was implemented as the forward-direction MDCT algorithm.
 *        (see https://patentscope.wipo.int/search/en/detail.jsf?docId=WO2001033411&tab=PCTDOCUMENTS).
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Unit size is not an unsigned 32-bit integer, or 
 *    - Unit size is zero, or 
 *    - Unit size is larger than 0x80000000.
 *  @param {Number} M 
 *    - The unit size.
 */
function MDCT(M) {
    //  Ensure the block size is an integer.
    if (!IsUInt32(M)) {
        throw new LC3IllegalParameterError(
            "Unit size is not an unsigned 32-bit integer."
        );
    }
    if (M == 0) {
        throw new LC3IllegalParameterError(
            "Unit size is zero."
        );
    } else if (M >= 0x80000000) {
        throw new LC3IllegalParameterError(
            "Unit size is larger than 0x80000000."
        );
    }

    //  Derive N = 2M.
    let N = ((M << 1) >>> 0);

    //  Derive Ms1 = M - 1.
    let Ms1 = M - 1;

    //  Derive PI / N.
    let PiDivN = (Math.PI) / N;

    //  FFT.
    let fft = new FFT(M);

    //  Twiddle factor (TW[n] = e ^ (j * n * pi / N)) for (0 <= n < N).
    let TW_re = new Array(N);
    let TW_im = new Array(N);
    for (let i = 0; i < N; ++i) {
        let phi = PiDivN * i;
        TW_re[i] = Math.cos(phi);
        TW_im[i] = Math.sin(phi);
    }

    //  U[k] = pi * (2k + 1) / 4, we need both sin{U[k]} and cos{U[k]} 
    //  (for 0 <= k < M).
    let U_sin = new Array(M);
    let U_cos = new Array(M);

    //  R[k] = pi * (k + 1 / 2) / N, we need both sin{R[k]} and cos{R[k]}
    //  (for 0 <= k < M).
    let R_sin = new Array(M);
    let R_cos = new Array(M);
    for (let k = 0; k < M; ++k) {
        let U_k = (Math.PI * (((k << 1) >>> 0) + 1)) / 4;
        U_sin[k] = Math.sin(U_k);
        U_cos[k] = Math.cos(U_k);

        let R_k = PiDivN * (k + 0.5);
        R_sin[k] = Math.sin(R_k);
        R_cos[k] = Math.cos(R_k);
    }

    //  z[s], Z[s] (buffer):
    let Zs_re = new Array(M);
    let Zs_im = new Array(M);

    //  G[k] (buffer):
    let G_re = new Array(M);
    let G_im = new Array(M);

    //
    //  Public methods.
    //

    /**
     *  Apply transform.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - Input block size is not twice of the unit size, or 
     *    - Output block size is not the unit size.
     *  @param {Number[]} x 
     *    - The input block.
     *  @param {Number[]} X
     *    - The output block.
     */
    this.transform = function(x, X) {
        //  Check the block size.
        if (x.length != N) {
            throw new LC3IllegalParameterError(
                "Input block size is not twice of the unit size."
            );
        }
        if (X.length != M) {
            throw new LC3IllegalParameterError(
                "Output block size is not the unit size."
            );
        }

        //  Let zs[n] = conj{x[2n] + jx[2n + 1] * TW[2n]} (for 0 <= n < M).
        for (let n = 0, i = 0; n < M; ++n, i += 2) {
            let tw2n_re = TW_re[i];
            let tw2n_im = TW_im[i];

            let x_2n = x[i];
            let x_2np1 = x[i + 1];

            Zs_re[n] = tw2n_re * x_2n - tw2n_im * x_2np1;
            Zs_im[n] = -(tw2n_re * x_2np1 + tw2n_im * x_2n);
        }

        //  Let Zs[n] = FFT{zs[n]}.
        fft.transform(Zs_re, Zs_im);

        //  Let G[k] = 1/2 * [
        //      (conj(Zs[k]) + Zs[M - 1 - k]) + 
        //      (e ^ (-pi * (2k + 1) / N)) * (conj(Zs[k]) - Zs[M - 1 - k])
        //  ] (for 0 <= k < M)
        for (let k = 0, i1 = Ms1, i2 = 1; k < M; ++k, --i1, i2 += 2) {
            let Zs_k_r = Zs_re[k];
            let Zs_k_i = Zs_im[k];

            let Zs_M1k_r = Zs_re[i1];
            let Zs_M1k_i = Zs_im[i1];

            let tw2kp1_r = TW_re[i2];
            let tw2kp1_i = TW_im[i2];

            G_re[k] = 0.5 * (
                (Zs_M1k_r + Zs_k_r) + 
                (Zs_k_r - Zs_M1k_r) * tw2kp1_i - 
                (Zs_M1k_i + Zs_k_i) * tw2kp1_r
            );
            G_im[k] = 0.5 * (
                (Zs_M1k_i - Zs_k_i) + 
                (Zs_M1k_r - Zs_k_r) * tw2kp1_r - 
                (Zs_M1k_i + Zs_k_i) * tw2kp1_i
            );
        }

        //  Let X[k] = cos(U[k]) * T1[k] - sin(U[k]) * T2[k], 
        //  where:
        //      [1] T1[k] = real(G[k]) * cos(R[k]) - imag(G[k]) * sin(R[k])
        //      [2] T2[k] = real(G[k]) * sin(R[k]) + imag(G[k]) * cos(R[k])
        //  (for 0 <= k < M).
        for (let k = 0; k < M; ++k) {
            let Rk_c = R_cos[k];
            let Rk_s = R_sin[k];

            let Uk_c = U_cos[k];
            let Uk_s = U_sin[k];

            let Gk_re = G_re[k];
            let Gk_im = G_im[k];

            X[k] = Uk_c * (Gk_re * Rk_c - Gk_im * Rk_s) - 
                   Uk_s * (Gk_re * Rk_s + Gk_im * Rk_c);
        }
    };
}

/**
 *  IMDCT transformer.
 * 
 *  Note(s):
 *    [1] The IMDCT algorithm was derived from the book "Marina Bosi and 
 *        Richard E. Goldberg. 2002. Introduction to Digital Audio Coding and 
 *        Standards. Kluwer Academic Publishers, USA.", page 142-143.
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Unit size is not an unsigned 32-bit integer, or 
 *    - Unit size is zero, or 
 *    - Unit size is larger than 0x80000000.
 *  @param {Number} M 
 *    - The unit size.
 */
function IMDCT(M) {
    //  Ensure the block size is an integer.
    if (!IsUInt32(M)) {
        throw new LC3IllegalParameterError(
            "Unit size is not an unsigned 32-bit integer."
        );
    }
    if (M == 0) {
        throw new LC3IllegalParameterError(
            "Unit size is zero."
        );
    } else if (M >= 0x80000000) {
        throw new LC3IllegalParameterError(
            "Unit size is larger than 0x80000000."
        );
    }

    //  Derive N = 2M.
    let N = ((M << 1) >>> 0);

    //  Derive PI / N.
    let PiDivN = (Math.PI) / N;

    //  Derive N - 1.
    let Ns1 = N - 1;

    //  FFT.
    let fft = new FFT(N);

    //  Derive M0 = (1 / 2 + M / 2).
    let M0 = 0.5 + (M / 2);

    //  Pre-twiddle factor (PRETW[n] = e ^ (j * n * M0 * 2pi / N)) 
    //  (for 0 <= n < N).
    let PRETW_re = new Array(N);
    let PRETW_im = new Array(N);

    //  Post-twiddle factor (PSTW[n] = e ^ (j * (n + M0) * pi / N)) 
    //  (for 0 <= n < N).
    let PSTW_re = new Array(N);
    let PSTW_im = new Array(N);
    for (let n = 0; n < N; ++n) {
        let phi = n * M0 * 2 * PiDivN;
        PRETW_re[n] = Math.cos(phi);
        PRETW_im[n] = Math.sin(phi);

        phi = (n + M0) * PiDivN;
        PSTW_re[n] = Math.cos(phi);
        PSTW_im[n] = Math.sin(phi);
    }

    //  Imaginary parts of X'[k].
    let Xp_im = new Array(N);

    //
    //  Public methods.
    //

    /**
     *  Apply transform.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - Input block size is not the unit size, or 
     *    - Output block size is not twice of the unit size.
     *  @param {Number[]} X 
     *    - The input block.
     *  @param {Number[]} Y
     *    - The array that would contain the output (transformed) block.
     */
    this.transform = function(X, Y) {
        //  Check the block size.
        if (X.length != M) {
            throw new LC3IllegalParameterError(
                "Input block size is not the unit size."
            );
        }
        if (Y.length != N) {
            throw new LC3IllegalParameterError(
                "Output block size is not twice of the unit size."
            );
        }

        //  Generate X'[k] = PRETW[k] * X[k] (for 0 <= k < N), 
        //  where X[k] = X[N - 1 - k] (for M <= k < N).
        let Xp_re = Y;
        for (let k = 0; k < M; ++k) {
            let Xk = X[k];

            Xp_re[k] = Xk * PRETW_re[k];
            Xp_im[k] = Xk * PRETW_im[k];

            let p = Ns1 - k;
            Xp_re[p] = -Xk * PRETW_re[p];
            Xp_im[p] = -Xk * PRETW_im[p];
        }

        //  Let X'[k] = IFFT{X'[k]}.
        fft.transformInverse(Xp_re, Xp_im);

        //  (Post-twiddle) Let X'[k] *= PSTW[k] (for 0 <= k < N).
        for (let k = 0; k < N; ++k) {
            let a_re = Xp_re[k],
                a_im = Xp_im[k];
            
            let tw_re = PSTW_re[k];
            let tw_im = PSTW_im[k];

            Xp_re[k] = a_re * tw_re - a_im * tw_im;
        //    Xp_im[k] = a_re * tw_im + a_im * tw_re;
        }
    };
}

//  Export public APIs.
module.exports = {
    "MDCT": MDCT,
    "IMDCT": IMDCT
};