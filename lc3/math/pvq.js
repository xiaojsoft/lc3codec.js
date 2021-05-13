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
 *    - Vector size mismatches (with N).
 *  @param {Number} N 
 *    - The parameter N.
 *  @param {Number} K 
 *    - The parameter K.
 *  @param {Number[]} X 
 *    - The vector.
 *  @returns 
 *    - The point within PVQ(N, K).
 */
function PVQSearch(N, K, X) {
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

    //  Initiate R[n].
    let R = new Array(N);

    //  Preproject (when K/N > 0.5).
    let k_begin = 0;
    let C_last = 0, E_last = 0;
    if (2 * K > N) {
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

    //  Re-apply S[n] to R[n].
    for (let i = 0; i < N; ++i) {
        R[i] *= S[i];
    }

    return R;
}

//  Export public APIs.
module.exports = {
    "PVQSearch": PVQSearch
};