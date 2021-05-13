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
//  Classes.
//

/**
 *  MPVQ indexer/de-indexer.
 * 
 *  Note(s):
 *    [1] The patent "WO2015130210A1 - METHOD AND APPARATUS FOR PYRAMID VECTOR 
 *        QUANTIZATION INDEXING AND DE-INDEXING OF AUDIO/VIDEO SAMPLE VECTORS"
 *        was implemented.
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Nmax is not an unsigned 32-bit integer, or 
 *    - Kmax is not a non-negative integer.
 *  @param {Number} Nmax 
 *    - The maximum size of vectors (i.e. MAX{N}).
 *  @param {Number} Kmax 
 *    - The maximum count of pulses (i.e. MAX{K}).
 */
function MPVQ(Nmax, Kmax) {
    //  Check Nmax.
    if (!IsUInt32(Nmax)) {
        throw new LC3IllegalParameterError(
            "Nmax is not an unsigned 32-bit integer."
        );
    }

    //  Check Kmax.
    if (!(Number.isInteger(Kmax) && Kmax >= 0)) {
        throw new LC3IllegalParameterError(
            "Kmax is not a non-negative integer."
        );
    }
    //
    //  Members.
    //

    //  Table MPVQ_offsets[n][k] = A[n + 1][k], where:
    //    A[n][k] = 0 (for n >= 1 and k = 0),
    //    A[n][k] = 1 (for n = 1 and k > 0),
    //    A[n][k] = A[n - 1][k - 1] + A[n][k - 1] + A[n - 1][k] (otherwise).
    let MPVQ_offsets = new Array(Nmax);
    {
        let Arow = new Array(Kmax + 1);
        Arow[0] = 0;
        for (let k = 1; k <= Kmax; ++k) {
            Arow[k] = 1;
        }
        MPVQ_offsets[0] = Arow;
    }
    for (let n = 1; n < Nmax; ++n) {
        let Aprevrow = MPVQ_offsets[n - 1];
        let Arow = new Array(Kmax + 1);
        Arow[0] = 0;
        for (let k = 1; k <= Kmax; ++k) {
            Arow[k] = Aprevrow[k - 1] + Aprevrow[k] + Arow[k - 1];
        }
        MPVQ_offsets[n] = Arow;
    }

    //
    //  Public methods.
    //

    /**
     *  Enumerate the index of specified vector X[n] within MPVQ(N, K), where 
     *  N = X.length and K = SUM{X[n]}.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - Vector length exceeds N, or 
     *    - SUM{x[n]} exceeds Kmax.
     *  @param {Number[]} X
     *    - The vector.
     *  @returns {[Number, Number]}
     *    - An array (denotes as R[0...1]), where:
     *      - R[0] is the MPVQ leading sign indication (LS_ind).
     *      - R[1] is the MPVQ index.
     */
    this.enumerate = function(X) {
        //  (Get and) check N.
        let N = X.length;
        if (N > Nmax) {
            throw new LC3IllegalParameterError("Vector length exceeds N.");
        }

        //  Do step 306 (Fig. 7A).
        let k_acc = 0;
        let index = 0;
        let next_sign_ind = 0;
        let got_sign_flag = false;

        for (let pos = N - 1, n = 0; pos >= 0; --pos, ++n) {
            //  Do step 308 (Fig. 7A).
            let val = X[pos];
            if (val != 0 && got_sign_flag /*  Do step 310 (Fig. 7A).  */) {
                //  Do step 312 (Fig. 7A).
                index = index * 2 + next_sign_ind;
            }

            //  Do step 314, 316, 318, 320, 322 (Fig. 7A).
            if (val > 0) {
                got_sign_flag = true;
                next_sign_ind = 0;
            } else if (val < 0) {
                got_sign_flag = true;
                next_sign_ind = 1;
            }

            //  Do step 324 (Fig. 7B).
            index += MPVQ_offsets[n][k_acc];

            //  Do step 326 (Fig. 7B).
            k_acc += Math.abs(val);
            if (k_acc > Kmax) {
                throw new LC3IllegalParameterError(
                    "SUM{x[n]} exceeds Kmax."
                );
            }
        }

        return [next_sign_ind, index];
    };

    /**
     *  Deenumerate MPVQ index back to vector.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - N is not an unsigned 32-bit integer, or 
     *    - N exceeds Nmax, or 
     *    - K is not a non-negative integer, or 
     *    - K exceeds Kmax, or 
     *    - MPVQ index is not a non-negative integer.
     *  @param {Number} N 
     *    - The size of the vector (i.e. N).
     *  @param {Number} K 
     *    - The count of pulses (i.e. K).
     *  @param {Number} LS_ind 
     *    - The MPVQ leading sign indication.
     *  @param {Number} index 
     *    - The MPVQ index.
     *  @returns {Number[]}
     *    - The vector.
     */
    this.deenumerate = function(N, K, LS_ind, index) {
        //  Check N.
        if (!IsUInt32(N)) {
            throw new LC3IllegalParameterError(
                "N is not an unsigned 32-bit integer."
            );
        }
        if (N > Nmax) {
            throw new LC3IllegalParameterError(
                "N exceeds Nmax."
            );
        }

        //  Check K.
        if (!(Number.isInteger(K) && K >= 0)) {
            throw new LC3IllegalParameterError(
                "K is not a non-negative integer."
            );
        }
        if (K > Kmax) {
            throw new LC3IllegalParameterError(
                "K exceeds Kmax."
            );
        }

        //  Check the index.
        if (!(Number.isInteger(index) && index >= 0)) {
            throw new LC3IllegalParameterError(
                "MPVQ index is not a non-negative integer."
            );
        }

        //  Do step 522 (Fig. 13).
        let vec = new Array(N);
        for (let n = 0; n < N; ++n) {
            vec[n] = 0;
        }

        //  Do step 524 (Fig. 13).
        let k_max_local = K;

        for (let pos = 0, n = N - 1; pos < N; ++pos, --n) {
            //  Do step 528 (Fig. 13).
            if (index == 0) {
                //  Do step 530 (Fig. 13).
                if (LS_ind < 0) {
                    vec[pos] = -k_max_local;
                } else {
                    vec[pos] = k_max_local;
                }
                break;
            }

            //  (Tree search) Do step 562 (Fig. 14).
            let low = 0;
            let high = k_max_local;
            let amp_offset = MPVQ_offsets[n][high], k_test = high;
            while (high >= low /*  Do step 574 (Fig. 14)  */) {
                //  Do step 564 (Fig. 14).
                k_test = ((low + high) >>> 1);
                amp_offset = MPVQ_offsets[n][k_test];

                if (amp_offset == index /*  Do step 570 (Fig. 14)  */) {
                    break;
                } else if (amp_offset < index /*  Do step 566 (Fig. 14)  */) {
                    low = k_test + 1;
                } else {
                    high = k_test - 1;
                }
            }

            //  Do step 576 (Fig. 14).
            let k_delta = k_max_local - k_test;

            //  Do step 534 (Fig. 13).
            index -= amp_offset;

            if (k_delta != 0 /*  Do step 536 (Fig. 13)  */) {
                //  Do step 538 (Fig. 13).
                if (LS_ind < 0) {
                    vec[pos] = -k_delta;
                } else {
                    vec[pos] = k_delta;
                }

                //  Do step 584, 586, 588, 590 (Fig. 15).
                //  GET NEXT LEAD SIGN...
                if ((index & 1) != 0) {
                    LS_ind = -1;
                } else {
                    LS_ind = 0;
                }
                index >>>= 1;

                //  Do step 542 (Fig. 13).
                k_max_local -= k_delta;
            }
        }

        return vec;
    };
}

//  Export public APIs.
module.exports = {
    "MPVQ": MPVQ
};