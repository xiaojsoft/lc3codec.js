//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Fs = 
    require("./../common/fs");
const Lc3Nms = 
    require("./../common/nms");
const Lc3TblI = 
    require("./../tables/i");
const Lc3TblNB = 
    require("./../tables/nb");
const Lc3TblNF = 
    require("./../tables/nf");
const Lc3TblSns = 
    require("./../tables/sns");
const Lc3Dct2_16 = 
    require("./../math/dct2-16");
const Lc3Pvq = 
    require("./../math/pvq");
const Lc3Mpvq = 
    require("./../math/mpvq");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const MPVQ = 
    Lc3Mpvq.MPVQ;
const LC3BugError = 
    Lc3Error.LC3BugError;

//  Imported functions.
const PVQNormalize = 
    Lc3Pvq.PVQNormalize;
const DCTIIInverse_16 = 
    Lc3Dct2_16.DCTIIInverse_16;

//  Imported constants.
const NB_TBL = 
    Lc3TblNB.NB_TBL;
const NF_TBL = 
    Lc3TblNF.NF_TBL;
const I_TBL = 
    Lc3TblI.I_TBL;
const HFCB = 
    Lc3TblSns.HFCB;
const LFCB = 
    Lc3TblSns.LFCB;
const GIJ = 
    Lc3TblSns.GIJ;

//
//  Constants.
//

//  MPVQ(16, 10).
const MPVQ_16x10 = new MPVQ(16, 10);

//
//  Public classes.
//

/**
 *  LC3 spectral noise shaping decoder.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3SpectralNoiseShapingDecoder(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Fs and Nms.
    let index_Fs = Fs.getInternalIndex();
    let index_Nms = Nms.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];
    let NB = NB_TBL[index_Nms][index_Fs];
    let Ifs = I_TBL[index_Nms][index_Fs];

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

    let X_hat = new Array(NF);

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
        {
            //  The first stage indices ind_LF and ind_HF shall be converted 
            //  into signal st1[n]:

            let codebook;

            //  Eq. 39
            codebook = LFCB[ind_LF];
            st1[ 0] = codebook[0];
            st1[ 1] = codebook[1];
            st1[ 2] = codebook[2];
            st1[ 3] = codebook[3];
            st1[ 4] = codebook[4];
            st1[ 5] = codebook[5];
            st1[ 6] = codebook[6];
            st1[ 7] = codebook[7];

            //  Eq. 40
            codebook = HFCB[ind_HF];
            st1[ 8] = codebook[0];
            st1[ 9] = codebook[1];
            st1[10] = codebook[2];
            st1[11] = codebook[3];
            st1[12] = codebook[4];
            st1[13] = codebook[5];
            st1[14] = codebook[6];
            st1[15] = codebook[7];
        }
        // console.log("st1[]=" + st1.toString());

        //  Stage 2 SNS VQ decoding (3.4.7.2.2).
        {
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
                y_shape_j[ 0] = mpvq_buf_x10[0];
                y_shape_j[ 1] = mpvq_buf_x10[1];
                y_shape_j[ 2] = mpvq_buf_x10[2];
                y_shape_j[ 3] = mpvq_buf_x10[3];
                y_shape_j[ 4] = mpvq_buf_x10[4];
                y_shape_j[ 5] = mpvq_buf_x10[5];
                y_shape_j[ 6] = mpvq_buf_x10[6];
                y_shape_j[ 7] = mpvq_buf_x10[7];
                y_shape_j[ 8] = mpvq_buf_x10[8];
                y_shape_j[ 9] = mpvq_buf_x10[9];
                y_shape_j[10] = mpvq_buf_x6[0];
                y_shape_j[11] = mpvq_buf_x6[1];
                y_shape_j[12] = mpvq_buf_x6[2];
                y_shape_j[13] = mpvq_buf_x6[3];
                y_shape_j[14] = mpvq_buf_x6[4];
                y_shape_j[15] = mpvq_buf_x6[5];
                break;
            case 1:
                try {
                    MPVQ_16x10.deenumerate(10, 10, LS_indA, idxA, mpvq_buf_x10);
                } catch(error) {
                    return false;
                }
                y_shape_j[ 0] = mpvq_buf_x10[0];
                y_shape_j[ 1] = mpvq_buf_x10[1];
                y_shape_j[ 2] = mpvq_buf_x10[2];
                y_shape_j[ 3] = mpvq_buf_x10[3];
                y_shape_j[ 4] = mpvq_buf_x10[4];
                y_shape_j[ 5] = mpvq_buf_x10[5];
                y_shape_j[ 6] = mpvq_buf_x10[6];
                y_shape_j[ 7] = mpvq_buf_x10[7];
                y_shape_j[ 8] = mpvq_buf_x10[8];
                y_shape_j[ 9] = mpvq_buf_x10[9];
                y_shape_j[10] = 0;
                y_shape_j[11] = 0;
                y_shape_j[12] = 0;
                y_shape_j[13] = 0;
                y_shape_j[14] = 0;
                y_shape_j[15] = 0;
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
        }
        // console.log("y_shape_j[]=" + y_shape_j.toString());

        {
            //  Unit energy normalization of the received shape (3.4.7.2.3).
            PVQNormalize(y_shape_j, xq_shape_j);
        }
        // console.log("xq_shape_j[]=" + xq_shape_j.toString());

        {
            //  Reconstruction of the quantized SNS scale factors (3.4.7.2.4).

            //  The adjustment gain value G for gain_i and shape_j shall be 
            //  determined based on table lookup (see Table 3.11).
            let G = GIJ[shape_j][gain_i];
            // console.log("G=" + G.toString());

            //  Finally, the synthesis of the quantized scale factor vector 
            //  scfQ[n] shall be performed in the same way as on the encoder 
            //  side.
            let c1 = 0.25 * G, c2 = 0.3535533905932738 * G;
            scfQ[ 0] = xq_shape_j[ 0] * c1;
            scfQ[ 1] = xq_shape_j[ 1] * c2;
            scfQ[ 2] = xq_shape_j[ 2] * c2;
            scfQ[ 3] = xq_shape_j[ 3] * c2;
            scfQ[ 4] = xq_shape_j[ 4] * c2;
            scfQ[ 5] = xq_shape_j[ 5] * c2;
            scfQ[ 6] = xq_shape_j[ 6] * c2;
            scfQ[ 7] = xq_shape_j[ 7] * c2;
            scfQ[ 8] = xq_shape_j[ 8] * c2;
            scfQ[ 9] = xq_shape_j[ 9] * c2;
            scfQ[10] = xq_shape_j[10] * c2;
            scfQ[11] = xq_shape_j[11] * c2;
            scfQ[12] = xq_shape_j[12] * c2;
            scfQ[13] = xq_shape_j[13] * c2;
            scfQ[14] = xq_shape_j[14] * c2;
            scfQ[15] = xq_shape_j[15] * c2;
            DCTIIInverse_16(scfQ, scfQ);
            scfQ[ 0] += st1[ 0];
            scfQ[ 1] += st1[ 1];
            scfQ[ 2] += st1[ 2];
            scfQ[ 3] += st1[ 3];
            scfQ[ 4] += st1[ 4];
            scfQ[ 5] += st1[ 5];
            scfQ[ 6] += st1[ 6];
            scfQ[ 7] += st1[ 7];
            scfQ[ 8] += st1[ 8];
            scfQ[ 9] += st1[ 9];
            scfQ[10] += st1[10];
            scfQ[11] += st1[11];
            scfQ[12] += st1[12];
            scfQ[13] += st1[13];
            scfQ[14] += st1[14];
            scfQ[15] += st1[15];
        }
        // console.log("scfQ[]=" + scfQ.toString());

        //  SNS scale factors interpolation (3.4.7.3).
        {
            let t1, t2;

            //  The quantized scale factors scfQ(n) shall be interpolated:

            //  Eq. 123
            scfQint[0] = scfQ[0];
            scfQint[1] = scfQ[0];
            t1 = scfQ[ 0];
            t2 = (scfQ[ 1] - t1) / 8;
            scfQint[ 2] = t1 +     t2;
            scfQint[ 3] = t1 + 3 * t2;
            scfQint[ 4] = t1 + 5 * t2;
            scfQint[ 5] = t1 + 7 * t2;

            t1 = scfQ[ 1];
            t2 = (scfQ[ 2] - t1) / 8;
            scfQint[ 6] = t1 +     t2;
            scfQint[ 7] = t1 + 3 * t2;
            scfQint[ 8] = t1 + 5 * t2;
            scfQint[ 9] = t1 + 7 * t2;

            t1 = scfQ[ 2];
            t2 = (scfQ[ 3] - t1) / 8;
            scfQint[10] = t1 +     t2;
            scfQint[11] = t1 + 3 * t2;
            scfQint[12] = t1 + 5 * t2;
            scfQint[13] = t1 + 7 * t2;

            t1 = scfQ[ 3];
            t2 = (scfQ[ 4] - t1) / 8;
            scfQint[14] = t1 +     t2;
            scfQint[15] = t1 + 3 * t2;
            scfQint[16] = t1 + 5 * t2;
            scfQint[17] = t1 + 7 * t2;

            t1 = scfQ[ 4];
            t2 = (scfQ[ 5] - t1) / 8;
            scfQint[18] = t1 +     t2;
            scfQint[19] = t1 + 3 * t2;
            scfQint[20] = t1 + 5 * t2;
            scfQint[21] = t1 + 7 * t2;

            t1 = scfQ[ 5];
            t2 = (scfQ[ 6] - t1) / 8;
            scfQint[22] = t1 +     t2;
            scfQint[23] = t1 + 3 * t2;
            scfQint[24] = t1 + 5 * t2;
            scfQint[25] = t1 + 7 * t2;

            t1 = scfQ[ 6];
            t2 = (scfQ[ 7] - t1) / 8;
            scfQint[26] = t1 +     t2;
            scfQint[27] = t1 + 3 * t2;
            scfQint[28] = t1 + 5 * t2;
            scfQint[29] = t1 + 7 * t2;

            t1 = scfQ[ 7];
            t2 = (scfQ[ 8] - t1) / 8;
            scfQint[30] = t1 +     t2;
            scfQint[31] = t1 + 3 * t2;
            scfQint[32] = t1 + 5 * t2;
            scfQint[33] = t1 + 7 * t2;

            t1 = scfQ[ 8];
            t2 = (scfQ[ 9] - t1) / 8;
            scfQint[34] = t1 +     t2;
            scfQint[35] = t1 + 3 * t2;
            scfQint[36] = t1 + 5 * t2;
            scfQint[37] = t1 + 7 * t2;

            t1 = scfQ[ 9];
            t2 = (scfQ[10] - t1) / 8;
            scfQint[38] = t1 +     t2;
            scfQint[39] = t1 + 3 * t2;
            scfQint[40] = t1 + 5 * t2;
            scfQint[41] = t1 + 7 * t2;

            t1 = scfQ[10];
            t2 = (scfQ[11] - t1) / 8;
            scfQint[42] = t1 +     t2;
            scfQint[43] = t1 + 3 * t2;
            scfQint[44] = t1 + 5 * t2;
            scfQint[45] = t1 + 7 * t2;

            t1 = scfQ[11];
            t2 = (scfQ[12] - t1) / 8;
            scfQint[46] = t1 +     t2;
            scfQint[47] = t1 + 3 * t2;
            scfQint[48] = t1 + 5 * t2;
            scfQint[49] = t1 + 7 * t2;

            t1 = scfQ[12];
            t2 = (scfQ[13] - t1) / 8;
            scfQint[50] = t1 +     t2;
            scfQint[51] = t1 + 3 * t2;
            scfQint[52] = t1 + 5 * t2;
            scfQint[53] = t1 + 7 * t2;

            t1 = scfQ[13];
            t2 = (scfQ[14] - t1) / 8;
            scfQint[54] = t1 +     t2;
            scfQint[55] = t1 + 3 * t2;
            scfQint[56] = t1 + 5 * t2;
            scfQint[57] = t1 + 7 * t2;

            t1 = scfQ[14];
            t2 = (scfQ[15] - t1) / 8;
            scfQint[58] = t1 +     t2;
            scfQint[59] = t1 + 3 * t2;
            scfQint[60] = t1 + 5 * t2;
            scfQint[61] = t1 + 7 * t2;

            t1 = scfQ[15];
            scfQint[62] = t1 +     t2;
            scfQint[63] = t1 + 3 * t2;
        }
        // console.log("scfQint[]=" + scfQint);

        let scfQint_use;
        {
            //  If the configuration of the codec results in a number of bands 
            //  NB < 64, the number of scale factors shall be reduced:
            if (NB < 64) {
                let i = 0, iEnd = 64 - NB, j = 0;
                for (; i < iEnd; ++i, j += 2) {
                    scfQint_tmp[i] = 0.5 * (scfQint[j] + scfQint[j + 1]);
                }
                for (; i < NB; ++i) {
                    scfQint_tmp[i] = scfQint[iEnd + i];
                }
                scfQint_use = scfQint_tmp;
            } else {
                scfQint_use = scfQint;
            }
        }

        {
            //  The scale factors are then transformed back into the linear 
            //  domain:

            //  Eq. 124
            for (let b = 0; b < NB; ++b) {
                gsns[b] = Math.pow(2, scfQint_use[b]);
            }
            for (let b = NB; b < 64; ++b) {
                gsns[b] = 0;
            }
        }

        {
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