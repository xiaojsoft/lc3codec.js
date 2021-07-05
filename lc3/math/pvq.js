//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3UInt = 
    require("./../common/uint");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;

//  Imported functions.
const IsUInt32 = 
    Lc3UInt.IsUInt32;

//
//  Public functions.
//

/**
 *  Search the point of PVQ(N, K) which has the minimum Euclidian distance 
 *  between specified vector.
 * 
 *  Note(s):
 *    [1] The patent "WO2016018185A1 - PYRAMID VECTOR QUANTIZER SHAPE SEARCH"
 *        was implemented.
 * 
 *  @throws {LC3IllegalParameterError}
 *    - N is not an unsigned 32-bit integer, or 
 *    - K is not a non-negative integer, or 
 *    - Vector size mismatches (with N), or 
 *    - Point buffer size mismatches (with N).
 *  @param {Number} N 
 *    - The parameter N.
 *  @param {Number} K 
 *    - The parameter K.
 *  @param {Number[]} X 
 *    - The vector.
 *  @param {?(Number[])} [R]
 *    - The point buffer (used for reducing array allocation, set to NULL if 
 *      not needed).
 *  @returns {Number[]}
 *    - The point within PVQ(N, K).
 */
function PVQSearch(N, K, X, R = null) {
    //  Check N.
    if (!IsUInt32(N)) {
        throw new LC3IllegalParameterError(
            "N is not an unsigned 32-bit integer."
        );
    }

    //  Check K.
    if (!(Number.isInteger(K) && K >= 0)) {
        throw new LC3IllegalParameterError(
            "K is not a non-negative integer."
        );
    }

    //  Check the size of X.
    if (X.length != N) {
        throw new LC3IllegalParameterError(
            "Vector size mismatches (with N)."
        );
    }

    //  Check the size of R.
    if (R !== null) {
        if (R.length != N) {
            throw new LC3IllegalParameterError(
                "Point buffer size mismatches (with N)."
            );
        }
    } else {
        //  Initiate R[n].
        R = new Array(N);
    }

    //  Prepare S[n] = sgn(X[n]), XabsSum = sum(|X[n]|).
    let S = new Array(N);
    let XabsSum = 0;
    for (let i = 0; i < N; ++i) {
        if (X[i] < 0) {
            S[i] = -1;
            X[i] = -X[i];
        } else {
            S[i] = 1;
        }
        XabsSum += X[i];
    }

    //  Preproject (when K/N > 0.5).
    let k_begin = 0;
    let C_last = 0, E_last = 0;
    if (2 * K > N && XabsSum >= 1E-2) {
        let factor = (K - 1) / XabsSum;
        for (let i = 0; i < N; ++i) {
            let Ri = Math.floor(X[i] * factor);
            R[i] = Ri;
            C_last += X[i] * Ri;
            E_last += Ri * Ri;
            k_begin += Ri;
        }
    } else {
        for (let i = 0; i < N; ++i) {
            R[i] = 0;
        }
    }

    //  Add pulses.
    for (let k = k_begin; k < K; ++k) {
        let n_best = -1;
        let C_best = 0, C_bestSq = 0, E_best = 0;
        for (let n = 0; n < N; ++n) {
            let Xn = X[n];
            let Rn = R[n];
            let C = C_last + Xn;
            let E = E_last + 2 * Rn + 1;
            if (n_best < 0 || C * C * E_best > C_bestSq * E) {
                n_best = n;
                C_best = C;
                C_bestSq = C * C;
                E_best = E;
            }
        }
        C_last = C_best;
        E_last = E_best;
        ++(R[n_best]);
    }

    //  Re-apply S[n] to X[n] and R[n].
    for (let i = 0; i < N; ++i) {
        X[i] *= S[i];
        R[i] *= S[i];
    }

    return R;
}

/**
 *  Normalize a point of PVQ(N, K).
 * 
 *  @throws {LC3IllegalParameterError}
 *    - Normalized point buffer size mismatches (with the size of X).
 *  @param {Number[]} X 
 *    - The point to be normalized.
 *  @param {?(Number[])} [Y] 
 *    - The normalized point buffer (used for reducing array allocation, set to 
 *      NULL if not needed).
 *  @returns {Number[]}
 *    - The normalized point.
 */
function PVQNormalize(X, Y = null) {
    let N = X.length;

    //  Check the size of Y.
    if (Y !== null) {
        if (Y.length != N) {
            throw new LC3IllegalParameterError(
                "Normalized point buffer size mismatches (with the size of X)."
            );
        }
    } else {
        //  Initiate Y[n].
        Y = new Array(N);
    }

    //  Get the normalization factor.
    let Fnorm = 0;
    for (let i = 0; i < N; ++i) {
        let Xi = X[i];
        Fnorm += Xi * Xi;
    }
    Fnorm = Math.sqrt(Fnorm);

    //  Normalize.
    for (let i = 0; i < N; ++i) {
        Y[i] = X[i] / Fnorm;
    }

    return Y;
}

//  Export public APIs.
module.exports = {
    "PVQSearch": PVQSearch,
    "PVQNormalize": PVQNormalize
};