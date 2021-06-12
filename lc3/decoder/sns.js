//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3TblSns = require("./../tables/sns");
const Lc3Pvq = require("./../math/pvq");
const Lc3Mpvq = require("./../math/mpvq");
const Lc3Error = require("./../error");

//  Imported classes.
const MPVQ = Lc3Mpvq.MPVQ;
const LC3BugError = Lc3Error.LC3BugError;

//  Imported functions.
const PVQNormalize = Lc3Pvq.PVQNormalize;

//
//  Constants.
//

//  Minimum noise floor (= 2 ^ 32, Eq. 23).
const DCTII_16x16 = Lc3TblSns.DCTII_16x16;
const HFCB = Lc3TblSns.HFCB;
const LFCB = Lc3TblSns.LFCB;
const GIJ = Lc3TblSns.GIJ;
const MPVQ_16x10 = new MPVQ(16, 10);

//
//  Public classes.
//

/**
 *  LC3 spectral noise shaping decoder.
 * 
 *  @constructor
 *  @param {Number} NF
 *    - The frame size.
 *  @param {Number} NB
 *    - The number of bands.
 *  @param {Number[]} Ifs
 *    - The Ifs table.
 */
function LC3SpectralNoiseShapingDecoder(NF, NB, Ifs) {
    //
    //  Members.
    //

    //  Algorithm contexts.
    let st1 = new Array(16);

    let mpvq_buf_x6 = new Array(6);
    let mpvq_buf_x10 = new Array(10);

    let xq_shape_j = new Array(16);
    let y_shape_j = new Array(16);

    let scfQ = new Array(16);
    let scfQint = new Array(64);
    let scfQint_tmp = new Array(64);

    let gsns = new Array(64);

    let X_hat = new Array(NF)

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number} ind_LF 
     *    - The `ind_LF` parameter.
     *  @param {Number} ind_HF 
     *    - The `ind_LF` parameter.
     *  @param {Number} shape_j 
     *    - The `ind_LF` parameter.
     *  @param {Number} gain_i 
     *    - The `ind_LF` parameter.
     *  @param {Number} LS_indA 
     *    - The `ind_LF` parameter.
     *  @param {Number} idxA 
     *    - The `ind_LF` parameter.
     *  @param {Number} LS_indB 
     *    - The `ind_LF` parameter.
     *  @param {Number} idxB 
     *    - The `ind_LF` parameter.
     *  @param {Number[]} Xs_hat 
     *    - The shaped spectrum coefficients.
     *  @returns {Boolean}
     *    - True if succeed.
     */
    this.update = function(
        ind_LF, 
        ind_HF, 
        shape_j, 
        gain_i, 
        LS_indA, 
        idxA, 
        LS_indB, 
        idxB,
        Xs_hat
    ) {
        //  Stage 1 SNS VQ decoding.

        //  The first stage indices ind_LF and ind_HF shall be converted into 
        //  signal st1[n] according to Eq. 39 and 40 in Section 3.3.7.3.2:
        // console.log("ind_LF=" + ind_LF);
        // console.log("ind_HF=" + ind_HF);
        let LFCB_ind_LF = LFCB[ind_LF], HFCB_ind_HF = HFCB[ind_HF];
        for (let n = 0; n < 8; ++n) {
            st1[n] = LFCB_ind_LF[n];                                //  Eq. 39
            st1[n + 8] = HFCB_ind_HF[n];                            //  Eq. 40
        }
        // console.log("st1[]=" + st1.toString());

        //  Stage 2 SNS VQ decoding (3.4.7.2.2).

        //  De-enumeration of the shape indices (3.4.7.2.2.1).
        // console.log("shape_j=" + shape_j);
        switch (shape_j) {
        case 0:
            try {
                MPVQ_16x10.deenumerate(10, 10, LS_indA, idxA, mpvq_buf_x10);
                MPVQ_16x10.deenumerate(6, 1, LS_indB, idxB, mpvq_buf_x6);
            } catch(error) {
                return false;
            }
            for (let n = 0; n < 10; ++n) {
                y_shape_j[n] = mpvq_buf_x10[n];
            }
            for (let n = 10; n < 16; ++n) {
                y_shape_j[n] = mpvq_buf_x6[n - 10];
            }
            break;
        case 1:
            try {
                MPVQ_16x10.deenumerate(10, 10, LS_indA, idxA, mpvq_buf_x10);
            } catch(error) {
                return false;
            }
            for (let n = 0; n < 10; ++n) {
                y_shape_j[n] = mpvq_buf_x10[n];
            }
            for (let n = 10; n < 16; ++n) {
                y_shape_j[n] = 0;
            }
            break;
        case 2:
            try {
                MPVQ_16x10.deenumerate(16, 8, LS_indA, idxA, y_shape_j);
            } catch(error) {
                return false;
            }
            break;
        case 3:
            try {
                MPVQ_16x10.deenumerate(16, 6, LS_indA, idxA, y_shape_j);
            } catch(error) {
                return false;
            }
            break;
        default:
            throw new LC3BugError("Bad shape_j.");
        }
        // console.log("y_shape_j[]=" + y_shape_j.toString());

        //  Unit energy normalization of the received shape (3.4.7.2.3).
        PVQNormalize(y_shape_j, xq_shape_j);
        // console.log("xq_shape_j[]=" + xq_shape_j.toString());

        //  Reconstruction of the quantized SNS scale factors (3.4.7.2.4).

        //  The adjustment gain value G for gain_i and shape_j shall be 
        //  determined based on table lookup (see Table 3.11).
        let G = GIJ[shape_j][gain_i];
        // console.log("G=" + G.toString());

        //  Finally, the synthesis of the quantized scale factor vector scfQ[n] 
        //  shall be performed in the same way as on the encoder side in 
        //  3.3.7.3.
        for (let n = 0; n < 16; ++n) {
            let tmp = 0;
            for (let col = 0; col < 16; ++col) {
                tmp += xq_shape_j[col] * DCTII_16x16[n][col];
            }
            scfQ[n] = st1[n] + G * tmp;
        }
        // console.log("scfQ[]=" + scfQ.toString());

        //  SNS scale factors interpolation (3.4.7.3).
        scfQint[0] = scfQ[0];                                      //  Eq. 123
        scfQint[1] = scfQ[0];
        for (let n = 0; n < 15; ++n) {
            let t1 = scfQ[n];
            let t2 = (scfQ[n + 1] - t1) / 8;
            let t3 = 4 * n;
            scfQint[t3 + 2] = t1 +     t2;
            scfQint[t3 + 3] = t1 + 3 * t2;
            scfQint[t3 + 4] = t1 + 5 * t2;
            scfQint[t3 + 5] = t1 + 7 * t2;
        }
        {
            let t1 = scfQ[15];
            let t2 = (t1 - scfQ[14]) / 8;
            scfQint[62] = t1 +     t2;
            scfQint[63] = t1 + 3 * t2;
        }
        // console.log("scfQint[]=" + scfQint);

        //  If the configuration of the codec results in a number of bands 
        //  NB < 64, the number of scale factors shall be reduced:
        let scfQint_use = scfQint;
        if (NB < 64) {
            let i = 0, iEnd = 64 - NB, j = 0;
            for (; i < iEnd; ++i, j += 2) {
                scfQint_tmp[i] = 0.5 * (scfQint[j] + scfQint[j + 1]);
            }
            for (; i < NB; ++i) {
                scfQint_tmp[i] = scfQint[iEnd + i];
            }
            scfQint_use = scfQint_tmp;
        }

        //  The scale factors are then transformed back into the linear domain:
        for (let b = 0; b < NB; ++b) {                             //  Eq. 124
            gsns[b] = Math.pow(2, scfQint_use[b]);
        }
        for (let b = NB; b < 64; ++b) {
            gsns[b] = 0;
        }

        //  Spectral Shaping (3.4.7.4).
        for (let k = 0; k < NF; ++k) {
            X_hat[k] = 0;
        }
        for (let b = 0; b < NB; ++b) {
            let gsns_b = gsns[b];
            for (let k = Ifs[b], kEnd = Ifs[b + 1]; k < kEnd; ++k) {
                X_hat[k] = Xs_hat[k] * gsns_b;
            }
        }
        // console.log("X_hat[]=" + X_hat.toString());

        return true;
    };

    /**
     *  Get the spectrum coefficients.
     * 
     *  @returns {Number[]}
     *    - The spectrum coefficients.
     */
    this.getSpectrumCoefficients = function() {
        return X_hat;
    };
}

//  Export public APIs.
module.exports = {
    "LC3SpectralNoiseShapingDecoder": LC3SpectralNoiseShapingDecoder
};