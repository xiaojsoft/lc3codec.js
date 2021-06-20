//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
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
const Lc3TblNF = 
    require("./../tables/nf");
const Lc3TblTns = 
    require("./../tables/tns");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;

//  Imported constants.
const AC_TNS_ORDER_BITS = 
    Lc3TblTns.AC_TNS_ORDER_BITS;
const AC_TNS_COEF_BITS = 
    Lc3TblTns.AC_TNS_COEF_BITS;
const TNS_PARAM_NUM_TNS_FILTERS = 
    Lc3TblTns.TNS_PARAM_NUM_TNS_FILTERS;
const TNS_PARAM_START_FREQ = 
    Lc3TblTns.TNS_PARAM_START_FREQ;
const TNS_PARAM_STOP_FREQ = 
    Lc3TblTns.TNS_PARAM_STOP_FREQ;
const TNS_PARAM_SUB_START = 
    Lc3TblTns.TNS_PARAM_SUB_START;
const TNS_PARAM_SUB_STOP = 
    Lc3TblTns.TNS_PARAM_SUB_STOP;
const TNS_LPC_WEIGHTING_TH = 
    Lc3TblTns.TNS_LPC_WEIGHTING_TH;
const NF_TBL = 
    Lc3TblNF.NF_TBL;

//
//  Constants.
//

//  RC quantization constants.
const RCQ_C1 = 5.41126806512444158;  //  = 17 / PI
const RCQ_C2 = 0.18479956785822313;  //  = PI / 17

//
//  Public classes.
//

/**
 *  LC3 temporal noise shaping encoder.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3TemporalNoiseShapingEncoder(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];
    let tns_lpc_weighting_th = TNS_LPC_WEIGHTING_TH[index_Nms];

    //  Algorithm contexts.
    let R = new Array(9);
    let Es = new Array(3);
    let LPCs = new Array(9);
    let LPCs_tmp1 = new Array(9);
    let LPCs_tmp2 = new Array(9);

    let RC = [
        [0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    let RCint = [
        [0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    let RCq = [
        [0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    let RCorder = [0, 0];

    let Xf = new Array(NF);

    let nbitsTNS = 0;

    let st = new Array(8);
    
    let tns_lpc_weighting = 0;

    let num_tns_filters = 0;

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} Xs 
     *    - The shaped spectrum coefficients.
     *  @param {Number} Pbw 
     *    - The bandwidth (i.e. `Pbw`).
     *  @param {Number} nn_flag
     *    - The near Nyquist flag.
     *  @param {Number} nbits
     *    - The bit rate.
     */
    this.update = function(Xs, Pbw, nn_flag, nbits) {
        //  tns_lpc_weighting: (Eq. 71)
        tns_lpc_weighting = (nbits < tns_lpc_weighting_th ? 1 : 0);

        //  Reset st[k] and Xf[k] (see 3.3.8.4).
        for (let k = 0; k < 8; ++k) {
            st[k] = 0;
        }
        for (let k = 0; k < NF; ++k) {
            Xf[k] = Xs[k];
        }

        //  Load TNS parameter (from Table 3.15).
        num_tns_filters = TNS_PARAM_NUM_TNS_FILTERS[index_Nms][Pbw];
        let start_freqs = TNS_PARAM_START_FREQ[index_Nms][Pbw];
        let stop_freqs = TNS_PARAM_STOP_FREQ[index_Nms][Pbw];
        let sub_starts = TNS_PARAM_SUB_START[index_Nms][Pbw];
        let sub_stops = TNS_PARAM_SUB_STOP[index_Nms][Pbw];

        //  TNS analysis (3.3.8.2).
        for (let f = 0; f < num_tns_filters; ++f) {
            let RC_f = RC[f];
            let sub_start = sub_starts[f];
            let sub_stop  = sub_stops[f];

            let Es_accmul;
            {
                //  Derive e(s):

                //  Eq. 67
                Es_accmul = 1;
                for (let s = 0; s < 3; ++s) {
                    let sum = 0;
                    let n1 = sub_start[s], n2 = sub_stop[s];
                    for (let n = n1; n < n2; ++n) {
                        let tmp = Xs[n];
                        sum += tmp * tmp;
                    }
                    Es[s] = sum;
                    Es_accmul *= sum;

                    //  To avoid overflow, give `Es_accmul` a limit:
                    if (Es_accmul > 1) {
                        Es_accmul = 1;
                    }
                }

                if (Es_accmul < 1e-31) {
                    //  Eq. 66
                    R[0] = 3;
                    R[1] = 0;
                    R[2] = 0;
                    R[3] = 0;
                    R[4] = 0;
                    R[5] = 0;
                    R[6] = 0;
                    R[7] = 0;
                    R[8] = 0;
                } else {
                    //  Eq. 65
                    for (let k = 0; k < 9; ++k) {
                        let sum = 0;
                        for (let s = 0; s < 3; ++s) {
                            let tmp = 0;
                            let n1 = sub_start[s], n2 = sub_stop[s] - k;
                            for (let n = n1; n < n2; ++n) {
                                tmp += Xs[n] * Xs[n + k];
                            }
                            sum += tmp / Es[s];
                        }
                        R[k] = sum;
                    }
                }
            }
            // console.log("r[k]=" + R.toString());

            {
                //  The normalized autocorrelation function shall be 
                //  lag-windowed.
                // R[0] *= 1.0000000000000000;
                R[1] *= 0.9980280260203829;
                R[2] *= 0.9921354055113971;
                R[3] *= 0.9823915844707989;
                R[4] *= 0.9689107911912967;
                R[5] *= 0.9518498073692735;
                R[6] *= 0.9314049334023056;
                R[7] *= 0.9078082299969592;
                R[8] *= 0.8813231366694713;
            }
            // console.log("rw[k]=" + R.toString());

            let LPC_err;
            {
                let LPC_badflag = false;

                //  The Levinson-Durbin recursion shall be used to obtain LPC 
                //  coefficients a[k].
                LPC_err = R[0];
                LPCs[0] = 1;
                for (let k = 1; k < 9; ++k) {
                    let rc = 0;
                    for (let n = 0; n < k; ++n) {
                        rc += LPCs[n] * R[k - n];
                    }
                    if (LPC_err < 1e-31) {
                        //  The autocorrelation matrix have no inverse since its
                        //  rank is zero.
                        LPC_badflag = true;
                        break;
                    }
                    rc = (-rc) / LPC_err;
                    LPCs_tmp1[0] = 1;
                    for (let n = 1; n < k; ++n) {
                        LPCs_tmp1[n] = LPCs[n] + rc * LPCs[k - n];
                    }
                    LPCs_tmp1[k] = rc;
                    for (let n = 0; n <= k; ++n) {
                        LPCs[n] = LPCs_tmp1[n];
                    }
                    LPC_err *= (1 - rc * rc);
                }

                if (LPC_badflag) {
                    //  On this condition, we'd better turn off the TNS filter.
    
                    //  If the TNS filter f is turned off, then the reflection 
                    //  coefficients shall be set to 0.
                    RC_f[0] = 0;
                    RC_f[1] = 0;
                    RC_f[2] = 0;
                    RC_f[3] = 0;
                    RC_f[4] = 0;
                    RC_f[5] = 0;
                    RC_f[6] = 0;
                    RC_f[7] = 0;

                    continue;
                }
            }
            // console.log("a[k]=" + LPCs.toString());

            let pred_gain;
            {
                //  The prediction gain shall be computed:

                //  Eq. 69
                pred_gain = R[0] / LPC_err;
            }
            // console.log("pred_gain=" + pred_gain.toString());

            {
                if (pred_gain > 1.5 && nn_flag == 0) {
                    if (tns_lpc_weighting == 1 && pred_gain < 2) {
                        //  The weighting factor γ shall be computed by:
                        let gamma = 1 - 0.3 * (2 - pred_gain);      //  Eq. 70

                        //  The LPC coefficients shall be weighted using the 
                        //  factor γ.
                        let factor = gamma;                         //  Eq. 72
                        LPCs[1] *= factor;
                        factor  *= gamma;
                        LPCs[2] *= factor;
                        factor  *= gamma;
                        LPCs[3] *= factor;
                        factor  *= gamma;
                        LPCs[4] *= factor;
                        factor  *= gamma;
                        LPCs[5] *= factor;
                        factor  *= gamma;
                        LPCs[6] *= factor;
                        factor  *= gamma;
                        LPCs[7] *= factor;
                        factor  *= gamma;
                        LPCs[8] *= factor;
                    }

                    //  The weighted LPC coefficients shall be converted to 
                    //  reflection coefficients using the following algorithm.
                    LPCs_tmp1[0] = LPCs[0];
                    LPCs_tmp1[1] = LPCs[1];
                    LPCs_tmp1[2] = LPCs[2];
                    LPCs_tmp1[3] = LPCs[3];
                    LPCs_tmp1[4] = LPCs[4];
                    LPCs_tmp1[5] = LPCs[5];
                    LPCs_tmp1[6] = LPCs[6];
                    LPCs_tmp1[7] = LPCs[7];
                    LPCs_tmp1[8] = LPCs[8];
                    for (let k = 8; k >= 1; --k) {
                        let LPCs_tmp1_k = LPCs_tmp1[k];
                        RC_f[k - 1] = LPCs_tmp1_k;
                        let e = 1 - LPCs_tmp1_k * LPCs_tmp1_k;
                        for (let n = 1; n < k; ++n) {
                            LPCs_tmp2[n] = (
                                LPCs_tmp1[n] - LPCs_tmp1_k * LPCs_tmp1[k - n]
                            ) / e;
                        }
                        for (let n = 1; n < k; ++n) {
                            LPCs_tmp1[n] = LPCs_tmp2[n];
                        }
                    }
                } else {
                    //  If the TNS filter f is turned off, then the reflection 
                    //  coefficients shall be set to 0.
                    RC_f[0] = 0;
                    RC_f[1] = 0;
                    RC_f[2] = 0;
                    RC_f[3] = 0;
                    RC_f[4] = 0;
                    RC_f[5] = 0;
                    RC_f[6] = 0;
                    RC_f[7] = 0;
                }
            }
        }
        for (let f = num_tns_filters; f < 2; ++f) {
            let RC_f = RC[f];

            //  If the TNS filter f is turned off, then the reflection 
            //  coefficients shall be set to 0.
            RC_f[0] = 0;
            RC_f[1] = 0;
            RC_f[2] = 0;
            RC_f[3] = 0;
            RC_f[4] = 0;
            RC_f[5] = 0;
            RC_f[6] = 0;
            RC_f[7] = 0;
        }

        //  Quantization (3.3.8.3).
        nbitsTNS = 0;
        for (let f = 0; f < 2; ++f) {
            let RC_f = RC[f];
            let RCint_f = RCint[f];
            let RCq_f = RCq[f];

            {
                let tmp;

                //  The reflection coefficients shall be quantized using 
                //  scalar uniform quantization in the arcsine domain.

                //  Eq. 73, 74
                tmp = Math.round(Math.asin(RC_f[0]) * RCQ_C1);
                RCint_f[0] = tmp + 8;
                RCq_f[0] = Math.sin(tmp * RCQ_C2);
                tmp = Math.round(Math.asin(RC_f[1]) * RCQ_C1);
                RCint_f[1] = tmp + 8;
                RCq_f[1] = Math.sin(tmp * RCQ_C2);
                tmp = Math.round(Math.asin(RC_f[2]) * RCQ_C1);
                RCint_f[2] = tmp + 8;
                RCq_f[2] = Math.sin(tmp * RCQ_C2);
                tmp = Math.round(Math.asin(RC_f[3]) * RCQ_C1);
                RCint_f[3] = tmp + 8;
                RCq_f[3] = Math.sin(tmp * RCQ_C2);
                tmp = Math.round(Math.asin(RC_f[4]) * RCQ_C1);
                RCint_f[4] = tmp + 8;
                RCq_f[4] = Math.sin(tmp * RCQ_C2);
                tmp = Math.round(Math.asin(RC_f[5]) * RCQ_C1);
                RCint_f[5] = tmp + 8;
                RCq_f[5] = Math.sin(tmp * RCQ_C2);
                tmp = Math.round(Math.asin(RC_f[6]) * RCQ_C1);
                RCint_f[6] = tmp + 8;
                RCq_f[6] = Math.sin(tmp * RCQ_C2);
                tmp = Math.round(Math.asin(RC_f[7]) * RCQ_C1);
                RCint_f[7] = tmp + 8;
                RCq_f[7] = Math.sin(tmp * RCQ_C2);
            }

            {
                //  The order of the quantized reflection coefficients shall be 
                //  calculated using:
                let k = 7;
                while (k >= 0 && Math.abs(RCq_f[k]) < 1e-31) {
                    --k;
                }
                RCorder[f] = k + 1;
            }
        }

        for (let f = 0; f < num_tns_filters; ++f) {
            let RCint_f = RCint[f];
            let RCq_f = RCq[f];
            let RCorderS1 = RCorder[f] - 1;

            {
                //  The total number of bits consumed by TNS in the current frame 
                //  shall then be computed as follows:

                //  Eq. 76
                let nbitsTNSorder;
                if (RCorderS1 >= 0) {
                    nbitsTNSorder = 
                        AC_TNS_ORDER_BITS[tns_lpc_weighting][RCorderS1];
                } else {
                    nbitsTNSorder = 0;
                }

                //  Eq. 77
                let nbitsTNScoef = 0;
                for (let v = 0; v <= RCorderS1; ++v) {
                    nbitsTNScoef += AC_TNS_COEF_BITS[v][RCint_f[v]];
                }

                //  Eq. 75
                let tmp = 2048 + nbitsTNSorder + nbitsTNScoef;
                if ((tmp & 2047) != 0) {
                    tmp >>>= 11;
                    ++(tmp);
                } else {
                    tmp >>>= 11;
                }
                nbitsTNS += tmp;
            }

            //  Filtering (3.3.8.4).
            {
                //  The MDCT spectrum Xs[n] shall be analysis filtered using the 
                //  following algorithm.
                if (RCorderS1 >= 0) {
                    let start_freq = start_freqs[f], stop_freq = stop_freqs[f];
                    for (let n = start_freq; n < stop_freq; ++n) {
                        let t = Xs[n];
                        let st_save = t;
                        for (let k = 0; k < RCorderS1; ++k) {
                            let RCq_f_k = RCq_f[k];
                            let st_k = st[k];
                            let st_tmp = RCq_f_k * t + st_k;
                            t += RCq_f_k * st_k;
                            st[k] = st_save;
                            st_save = st_tmp;
                        }
                        t += RCq_f[RCorderS1] * st[RCorderS1];
                        st[RCorderS1] = st_save;
                        Xf[n] = t;
                    }
                }
            }
        }
        // console.log("RC(k, f)=" + JSON.stringify(RC));
        // console.log("RCint(k, f)=" + JSON.stringify(RCint));
        // console.log("RCq(k, f)=" + JSON.stringify(RCq));
        // console.log("RCorder=" + RCorder.toString());
        // console.log("Xf[n]=" + Xf.toString());
        // console.log("nbitsTNS=" + nbitsTNS.toString());
    };

    /**
     *  Get the bit consumption (i.e. nbitsTNS).
     * 
     *  @returns {Number}
     *    - The bit consumption.
     */
    this.getBitConsumption = function() {
        return nbitsTNS;
    };

    /**
     *  Get the LPC weighting.
     * 
     *  @returns {Number}
     *    - The LPC weighting.
     */
    this.getLpcWeighting = function() {
        return tns_lpc_weighting;
    };

    /**
     *  Get the filtered spectrum coefficients (i.e. Xf[n]).
     * 
     *  @returns {Number[]}
     *    - The filtered spectrum coefficients.
     */
    this.getFilteredSpectrumCoefficients = function() {
        return Xf;
    };

    /**
     *  Get the count of TNS filters (i.e. num_tns_filters).
     * 
     *  @returns {Number}
     *    - The count.
     */
    this.getRcCount = function() {
        return num_tns_filters;
    };

    /**
     *  Get the orders of the quantized reflection coefficients 
     *  (i.e. RCorder[f]).
     * 
     *  @returns {Number[]}
     *    - The orders.
     */
    this.getRcOrders = function() {
        return RCorder;
    };

    /**
     *  Get the quantizer output indices (i.e. RCq[f][k]).
     * 
     *  @returns {Number[][]}
     *    - The indices.
     */
    this.getRcCoefficients = function() {
        return RCq;
    };

    /**
     *  Get the quantized reflection coefficients (i.e. RCi[f][k]).
     * 
     *  @returns {Number[][]}
     *    - The reflection coefficients.
     */
    this.getRcIndices = function() {
        return RCint;
    };
}

//  Export public APIs.
module.exports = {
    "LC3TemporalNoiseShapingEncoder": LC3TemporalNoiseShapingEncoder
};