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
    require("./../common/uint");
const Lc3Error = 
    require("./../error");

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
//    [1] https://drive.google.com/file/d/1jp9wSUP0ICZcnVxMh7rotCDYcU5lkzdo/
//    [2] https://drive.google.com/file/d/1Pol4F7TB3XAIUARo_G05hEJBeAw94kkA/
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

    //  Derive N - 1 = 2M - 1.
    let Ns1 = N - 1;

    //  Derive M - 1.
    let Ms1 = M - 1;

    //  Xp[0...N - 1].
    let Xp = new Array(N);

    //  Z[0...M - 1], z[0...M - 1].
    let Z_re = new Array(M);
    let Z_im = new Array(M);

    //  A[0...N - 1].
    let A_re = new Array(N);
    let A_im = new Array(N);

    //  FFT.
    let fft = new FFT(M);

    //  Twiddle factors.

    //  TW1[k] = 0.25 * (e ^ (1j * k * PI / M)).
    let TW1_re = new Array(M);
    let TW1_im = new Array(M);
    for (let k = 0; k < M; ++k) {
        let phi = k * Math.PI / M;
        TW1_re[k] = 0.25 * Math.cos(phi);
        TW1_im[k] = 0.25 * Math.sin(phi);
    }

    //  TW2[n] = (e ^ (1j * (n + 0.5) * PI / M)).
    let TW2_re = new Array(M);
    let TW2_im = new Array(M);
    for (let n = 0; n < M; ++n) {
        let phi = (n + 0.5) * Math.PI / M;
        TW2_re[n] = Math.cos(phi);
        TW2_im[n] = Math.sin(phi);
    }

    //  TW3[n] = (e ^ ((n + 0.5 + M * 0.5) * PI / N)).
    let TW3_re = new Array(N);
    let TW3_im = new Array(N);
    for (
        let n = 0, c = Math.PI / N, phi = 0.5 * (M + 1) * c; 
        n < N; 
        ++n, phi += c
    ) {
        TW3_re[n] = Math.cos(phi);
        TW3_im[n] = Math.sin(phi);
    }

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

        //  Xp[0...N - 1]:
        let Xp_factor = (((M & 1) != 0) ? 1 : -1);
        for (let k1 = 0, k2 = Ns1; k1 < M; ++k1, --k2) {
            Xp[k1] = X[k1];
            Xp[k2] = Xp_factor * X[k1];
        }

        //  Z[0...M - 1]:
        let Xm_factor = 1;
        for (let k = 0, u = 0; k < M; ++k, u += 2) {
            let a_re = Xm_factor * Xp[u], a_im = Xm_factor * Xp[u + 1];
            let b_re = TW1_re[k], b_im = TW1_im[k];
            Z_re[k] = a_re * b_re - a_im * b_im;
            Z_im[k] = a_re * b_im + a_im * b_re;
            Xm_factor = -Xm_factor;
        }

        //  z[0...M - 1]:
        fft.transformInverse(Z_re, Z_im);

        //  A[0...N - 1]:
        for (let k1 = 0, k2 = Ms1, k3 = M; k1 < M; ++k1, --k2, ++k3) {
            let z1_re = Z_re[k1], z1_im = Z_im[k1];
            let z2_re = Z_re[k2], z2_im = Z_im[k2];

            let A_even_re = z1_re + z2_re;
            let A_even_im = z1_im - z2_im;

            let a_re = z1_re - z2_re, a_im = z1_im + z2_im;
            let b_re = TW2_re[k1], b_im = TW2_im[k1];

            let A_odd_re = a_re * b_re - a_im * b_im;
            let A_odd_im = a_re * b_im + a_im * b_re;

            A_re[k1] = A_even_re + A_odd_re;
            A_im[k1] = A_even_im + A_odd_im;
            A_re[k3] = A_even_re - A_odd_re;
            A_im[k3] = A_even_im - A_odd_im;
        }

        //  x[0...N]:
        for (let n = 0; n < N; ++n) {
            Y[n] = TW3_re[n] * A_re[n] - TW3_im[n] * A_im[n];
        }
    };
}

//  Export public APIs.
module.exports = {
    "MDCT": MDCT,
    "IMDCT": IMDCT
};