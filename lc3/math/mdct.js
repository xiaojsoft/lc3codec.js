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
//    [2] https://drive.google.com/file/d/1EUS6p3WhfqA4IE1IYL21B9nY2xo1VuJc/
//    [3] https://drive.google.com/file/d/1ga7sLNzTg9zVpe9M8302xDqsUXynaI1z/
//

//
//  Public classes.
//

/**
 *  MDCT transformer.
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Unit size is not an unsigned 32-bit integer, or 
 *    - Unit size is zero, or 
 *    - Unit size is larger than 0x80000000, or 
 *    - The size of the window sequence is not twice of the unit size.
 *  @param {Number} M 
 *    - The unit size.
 *  @param {Number} [C]
 *    - The gain constant.
 *  @param {?(Number[])} [W]
 *    - The window sequence (NULL if not needed).
 */
function MDCT(M, C = 1, W = null) {
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

    //
    //  Members.
    //

    //  Derive N = 2M.
    let N = ((M << 1) >>> 0);

    //  Check the size of `W`.
    if (W !== null) {
        if (W.length != N) {
            throw new LC3IllegalParameterError(
                "The size of the window sequence is not twice of the unit size."
            );
        }
    } else {
        W = new Array(N);
        for (let n = 0; n < N; ++n) {
            W[n] = 1;
        }
    }

    //  Derive constants.
    let C_div_2 = C * 0.5;
    let PI_div_2 = Math.PI * 0.5;
    let PI_div_4 = Math.PI * 0.25;
    let PI_div_2M = Math.PI / N;
    let PI_div_M = Math.PI / M;
    let M_sub_1 = M - 1;

    //  FFT.
    let fft = new FFT(M);

    //  ρ_even[0...M - 1], ρ_odd[0...M - 1].
    let rho_even_re = new Array(M), rho_even_im = new Array(M);
    let rho_odd_re = new Array(M), rho_odd_im = new Array(M);

    //  z[0...M - 1], Z[0...M - 1] (denoted as m[] and M[] in the development 
    //  note).
    let Z_re = new Array(M), Z_im = new Array(M);

    //  Twiddle factors.

    //  TW1[k] = E ^ (-1j * PI * (k + 0.5 + M / 2) / M).
    let TW1_re = new Array(M), TW1_im = new Array(M);

    //  TW2[k] = E ^ (-1j * PI * (k + 0.5) / 2M).
    let TW2_re = new Array(M), TW2_im = new Array(M);

    //  TW3[k] = E ^ (j * (k + 0.5) * PI / 2)
    let TW3_re = new Array(M), TW3_im = new Array(M);

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

        //  z[0...M]:
        for (let n = 0, u = 0; n < M; ++n, u += 2) {
            let x1 = x[u], x2 = x[u + 1];
            Z_re[n] = x1 * rho_even_re[n] + x2 * rho_odd_re[n];
            Z_im[n] = x1 * rho_even_im[n] + x2 * rho_odd_im[n];
        }

        //  Z = DFT{z}:
        fft.transform(Z_re, Z_im);

        //  A[0...M - 1], X[0...M - 1]:
        for (let k1 = 0, k2 = M_sub_1; k1 < M; ++k1, --k2) {
            let z1_re = Z_re[k1], z1_im = Z_im[k1];
            let z2_re = Z_re[k2], z2_im = Z_im[k2];

            let A_even_re = z1_re + z2_re;
            let A_even_im = z1_im - z2_im;

            let t1_re = z1_re - z2_re, t1_im = z1_im + z2_im;
            let t2_re = TW1_re[k1], t2_im = TW1_im[k1];

            let A_odd_re = t1_re * t2_re - t1_im * t2_im;
            let A_odd_im = t1_re * t2_im + t1_im * t2_re;

            t1_re = A_even_re + A_odd_re;
            t1_im = A_even_im + A_odd_im;
            t2_re = TW2_re[k1];
            t2_im = TW2_im[k1];
            let A_re = t1_re * t2_re - t1_im * t2_im;
            let A_im = t1_re * t2_im + t1_im * t2_re;

            X[k1] = TW3_re[k1] * A_re + TW3_im[k1] * A_im;
        }
    };

    //
    //  Initialization.
    //
    for (
        let n = 0, 
            u = 0, 
            phi1 = 0, 
            phi3 = -(0.5 + 0.5 * M) * PI_div_M, 
            phi4 = -0.5 * PI_div_2M, 
            phi5 = PI_div_4; 
        n < M; 
        (
            ++n, 
            u += 2, 
            phi1 -= PI_div_M, 
            phi3 -= PI_div_M, 
            phi4 -= PI_div_2M, 
            phi5 += PI_div_2
        )
    ) {
        let tmp = C_div_2 * W[u];
        rho_even_re[n] = tmp * Math.cos(phi1);
        rho_even_im[n] = tmp * Math.sin(phi1);

        let phi2 = phi1 + PI_div_2;
        tmp = C_div_2 * W[u + 1];
        rho_odd_re[n] = tmp * Math.cos(phi2);
        rho_odd_im[n] = tmp * Math.sin(phi2);

        TW1_re[n] = Math.cos(phi3);
        TW1_im[n] = Math.sin(phi3);

        TW2_re[n] = Math.cos(phi4);
        TW2_im[n] = Math.sin(phi4);

        TW3_re[n] = Math.cos(phi5);
        TW3_im[n] = Math.sin(phi5);
    }
}

/**
 *  IMDCT transformer.
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Unit size is not an unsigned 32-bit integer, or 
 *    - Unit size is zero, or 
 *    - Unit size is larger than 0x80000000, or 
 *    - The count of dynamic gain factors is not twice of the unit size.
 *  @param {Number} M 
 *    - The unit size.
 *  @param {Number} [G_static]
 *    - The static gain factor.
 *  @param {?(Number[])} [G_dynamic]
 *    - The dynamic gain factors (NULL if not needed).
 */
 function IMDCT(M, G_static = 1, G_dynamic = null) {
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

    //  Check the size of G_dynamic[]:
    if (G_dynamic !== null) {
        if (G_dynamic.length != N) {
            throw new LC3IllegalParameterError(
                "The count of dynamic gain factors is not twice of the unit size."
            );
        }
    } else {
        G_dynamic = new Array(N);
        for (let i = 0; i < N; ++i) {
            G_dynamic[i] = 1;
        }
    }

    //  Derive constants.
    let N_sub_1 = N - 1;
    let M_sub_1 = M - 1;

    //  Xp[0...N - 1].
    let Xp = new Array(N);

    //  U[0...M - 1], u[0...M - 1] (denoted as M[] and m[] in the development 
    //  note).
    let U_re = new Array(M);
    let U_im = new Array(M);

    //  FFT.
    let fft = new FFT(M);

    //  Twiddle factors.

    //  TW1[k] = 0.25 * (e ^ (-1j * k * PI / M)) / M.
    let TW1_re = new Array(M);
    let TW1_im = new Array(M);
    for (let k = 0; k < M; ++k) {
        let phi = -k * Math.PI / M;
        TW1_re[k] = 0.25 * G_static * Math.cos(phi) / M;
        TW1_im[k] = 0.25 * G_static * Math.sin(phi) / M;
    }

    //  TW2[n] = (e ^ (-1j * (n + 0.5) * PI / M)).
    let TW2_re = new Array(M);
    let TW2_im = new Array(M);
    for (let n = 0; n < M; ++n) {
        let phi = -(n + 0.5) * Math.PI / M;
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
        for (let k1 = 0, k2 = N_sub_1; k1 < M; ++k1, --k2) {
            Xp[k1] = X[k1];
            Xp[k2] = Xp_factor * X[k1];
        }

        //  U[0...M - 1]:
        let Xm_factor = 1;
        for (let k = 0, u = 0; k < M; ++k, u += 2) {
            let a_re = Xm_factor * Xp[u], a_im = Xm_factor * Xp[u + 1];
            let b_re = TW1_re[k], b_im = TW1_im[k];
            U_re[k] = a_re * b_re - a_im * b_im;
            U_im[k] = a_re * b_im + a_im * b_re;
            Xm_factor = -Xm_factor;
        }

        //  u[0...M - 1]:
        fft.transform(U_re, U_im);

        //  A_conj[0...N - 1], x[0...N]:
        for (let k1 = 0, k2 = M_sub_1, k3 = M; k1 < M; ++k1, --k2, ++k3) {
            let z1_re = U_re[k1], z1_im = U_im[k1];
            let z2_re = U_re[k2], z2_im = U_im[k2];

            let A_conj_even_re = z1_re + z2_re;
            let A_conj_even_im = z1_im - z2_im;

            let a_re = z2_re - z1_re, a_im = -(z2_im + z1_im);
            let b_re = TW2_re[k1], b_im = TW2_im[k1];

            let A_conj_odd_re = a_re * b_re - a_im * b_im;
            let A_conj_odd_im = a_re * b_im + a_im * b_re;

            Y[k1] = (
                TW3_re[k1] * (A_conj_even_re + A_conj_odd_re) + 
                TW3_im[k1] * (A_conj_even_im + A_conj_odd_im)
            ) * G_dynamic[k1];
            Y[k3] = (
                TW3_re[k3] * (A_conj_even_re - A_conj_odd_re) + 
                TW3_im[k3] * (A_conj_even_im - A_conj_odd_im)
            ) * G_dynamic[k3];
        }
    };
}

//  Export public APIs.
module.exports = {
    "MDCT": MDCT,
    "IMDCT": IMDCT
};