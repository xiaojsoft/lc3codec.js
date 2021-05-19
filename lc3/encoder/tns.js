//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Nms = require("./../common/nms");
const Lc3TblTns = require("./../tables/tns");

//  Imported classes.
const LC3FrameDuration = Lc3Nms.LC3FrameDuration;

//  Imported constants.
const AC_TNS_ORDER_BITS = Lc3TblTns.AC_TNS_ORDER_BITS;
const AC_TNS_COEF_BITS = Lc3TblTns.AC_TNS_COEF_BITS;

//
//  Constants.
//

//  TNS parameters table (Table 3.15).
const TNS_10_NB_NUM         = 1;
const TNS_10_NB_STARTFREQ   = [12];
const TNS_10_NB_STOPFREQ    = [80];
const TNS_10_NB_SUBSTART    = [[12, 34, 57]];
const TNS_10_NB_SUBSTOP     = [[34, 57, 80]];

const TNS_10_WB_NUM         = 1;
const TNS_10_WB_STARTFREQ   = [12];
const TNS_10_WB_STOPFREQ    = [160];
const TNS_10_WB_SUBSTART    = [[12, 61, 110]];
const TNS_10_WB_SUBSTOP     = [[61, 110, 160]];

const TNS_10_SSWB_NUM       = 1;
const TNS_10_SSWB_STARTFREQ = [12];
const TNS_10_SSWB_STOPFREQ  = [240];
const TNS_10_SSWB_SUBSTART  = [[12, 88, 164]];
const TNS_10_SSWB_SUBSTOP   = [[88, 164, 240]];

const TNS_10_SWB_NUM        = 2;
const TNS_10_SWB_STARTFREQ  = [120, 160];
const TNS_10_SWB_STOPFREQ   = [160, 320];
const TNS_10_SWB_SUBSTART   = [[12, 61, 110], [160, 213, 266]];
const TNS_10_SWB_SUBSTOP    = [[61, 110, 160], [213, 266, 320]];

const TNS_10_FB_NUM         = 2;
const TNS_10_FB_STARTFREQ   = [12, 200];
const TNS_10_FB_STOPFREQ    = [200, 400];
const TNS_10_FB_SUBSTART    = [[12, 74, 137], [200, 266, 333]];
const TNS_10_FB_SUBSTOP     = [[74, 137, 200], [266, 333, 400]];

const TNS_75_NB_NUM         = 1;
const TNS_75_NB_STARTFREQ   = [9];
const TNS_75_NB_STOPFREQ    = [60];
const TNS_75_NB_SUBSTART    = [[9, 26, 43]];
const TNS_75_NB_SUBSTOP     = [[26, 43, 60]];

const TNS_75_WB_NUM         = 1;
const TNS_75_WB_STARTFREQ   = [9];
const TNS_75_WB_STOPFREQ    = [120];
const TNS_75_WB_SUBSTART    = [[9, 46, 83]];
const TNS_75_WB_SUBSTOP     = [[46, 83, 120]];

const TNS_75_SSWB_NUM       = 1;
const TNS_75_SSWB_STARTFREQ = [9];
const TNS_75_SSWB_STOPFREQ  = [180];
const TNS_75_SSWB_SUBSTART  = [[9, 66, 123]];
const TNS_75_SSWB_SUBSTOP   = [[66, 123, 180]];

const TNS_75_SWB_NUM         = 2;
const TNS_75_SWB_STARTFREQ   = [9, 120];
const TNS_75_SWB_STOPFREQ    = [120, 240];
const TNS_75_SWB_SUBSTART    = [[9, 46, 82], [120, 159, 200]];
const TNS_75_SWB_SUBSTOP     = [[46, 82, 120], [159, 200, 240]];

const TNS_75_FB_NUM          = 2;
const TNS_75_FB_STARTFREQ    = [9, 150];
const TNS_75_FB_STOPFREQ     = [150, 300];
const TNS_75_FB_SUBSTART     = [[9, 56, 103], [150, 200, 250]];
const TNS_75_FB_SUBSTOP      = [[56, 103, 150], [200, 250, 300]];

const TNS_PARAMETERS = [
    [  //  Nms = 10ms.
        [  TNS_10_NB_NUM,   TNS_10_NB_STARTFREQ,   TNS_10_NB_STOPFREQ,   TNS_10_NB_SUBSTART,   TNS_10_NB_SUBSTOP],
        [  TNS_10_WB_NUM,   TNS_10_WB_STARTFREQ,   TNS_10_WB_STOPFREQ,   TNS_10_WB_SUBSTART,   TNS_10_WB_SUBSTOP],
        [TNS_10_SSWB_NUM, TNS_10_SSWB_STARTFREQ, TNS_10_SSWB_STOPFREQ, TNS_10_SSWB_SUBSTART, TNS_10_SSWB_SUBSTOP],
        [ TNS_10_SWB_NUM,  TNS_10_SWB_STARTFREQ,  TNS_10_SWB_STOPFREQ,  TNS_10_SWB_SUBSTART,  TNS_10_SWB_SUBSTOP],
        [  TNS_10_FB_NUM,   TNS_10_FB_STARTFREQ,   TNS_10_FB_STOPFREQ,   TNS_10_FB_SUBSTART,   TNS_10_FB_SUBSTOP]
    ],
    [  //  Nms = 7.5ms.
        [  TNS_75_NB_NUM,   TNS_75_NB_STARTFREQ,   TNS_75_NB_STOPFREQ,   TNS_75_NB_SUBSTART,   TNS_75_NB_SUBSTOP],
        [  TNS_75_WB_NUM,   TNS_75_WB_STARTFREQ,   TNS_75_WB_STOPFREQ,   TNS_75_WB_SUBSTART,   TNS_75_WB_SUBSTOP],
        [TNS_75_SSWB_NUM, TNS_75_SSWB_STARTFREQ, TNS_75_SSWB_STOPFREQ, TNS_75_SSWB_SUBSTART, TNS_75_SSWB_SUBSTOP],
        [ TNS_75_SWB_NUM,  TNS_75_SWB_STARTFREQ,  TNS_75_SWB_STOPFREQ,  TNS_75_SWB_SUBSTART,  TNS_75_SWB_SUBSTOP],
        [  TNS_75_FB_NUM,   TNS_75_FB_STARTFREQ,   TNS_75_FB_STOPFREQ,   TNS_75_FB_SUBSTART,   TNS_75_FB_SUBSTOP]
    ]
];

//  Lag-window coefficients (see Eq. 68).
const WLAG = [
    1.0, 0.9980280260203829, 0.9921354055113971, 0.9823915844707989, 
    0.9689107911912967, 0.9518498073692735, 0.9314049334023056, 
    0.9078082299969592, 0.8813231366694713
];

//  TNS_LPC_WEIGHTING_TH[Nms] = 48 * Nms.
const TNS_LPC_WEIGHTING_TH = [
    480, //  [0] = 48 * Nms(= 10ms).
    360  //  [1] = 48 * Nms(= 7.5ms).
];

//
//  Public classes.
//

/**
 *  LC3 temporal noise shaping encoder.
 * 
 *  @constructor
 *  @param {Number} Nf 
 *    - The frame size.
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 */
function LC3TemporalNoiseShapingEncoder(Nf, Nms) {
    //
    //  Members.
    //

    //  Internal index of Nms.
    let index_Nms = Nms.getInternalIndex();

    //  Algorithm contexts.
    let tns_lpc_weighting_th = TNS_LPC_WEIGHTING_TH[index_Nms];

    let Tparam_Nms = TNS_PARAMETERS[index_Nms];
    // let tns_nfilters = tns_params

    let Rk = new Array(9);
    let Es = new Array(3);
    let LPCs = new Array(9);
    let LPCs_tmp1 = new Array(9);
    let LPCs_tmp2 = new Array(9);

    let RC = new Array(2);
    let RCint = new Array(2);
    let RCq = new Array(2);
    let RCorder = new Array(2);
    for (let f = 0; f < 2; ++f) {
        let RC_f = new Array(8);
        let RCint_f = new Array(8);
        let RCq_f = new Array(8);
        for (let k = 0; k < 8; ++k) {
            RC_f[k] = null;
            RCint_f[k] = null;
            RCq_f[k] = null;
        }
        RC[f] = RC_f;
        RCint[f] = RCint_f;
        RCq[f] = RCq_f;
    }

    let Xf = new Array(Nf);
    for (let k = 0; k < Nf; ++k) {
        Xf[k] = 0;
    }

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
     *    - The bandwidth (one of BW_*).
     *  @param {Number} nn_flag
     *    - The near Nyquist flag.
     *  @param {Number} nbits
     *    - The bit rate.
     */
    this.update = function(Xs, Pbw, nn_flag, nbits) {
        //  tns_lpc_weighting: (Eq. 71)
        tns_lpc_weighting = (nbits < tns_lpc_weighting_th ? 1 : 0);

        //  Load ac_tns_order_bits[tns_lpc_weighting].
        let AC_TNS_ORDER_BITS_tlw = AC_TNS_ORDER_BITS[tns_lpc_weighting];

        //  Reset RC[f][k].
        for (let f = 0; f < 2; ++f) {
            let RC_f = RC[f];
            // let RCint_f = RCint[f];
            // let RCq_f = RCq[f];
            for (let k = 0; k < 8; ++k) {
                RC_f[k] = 0;
                // RCint_f[k] = null;
                // RCq_f[k] = null;
            }
        }

        //  Reset st[k] and Xf[k] (see 3.3.8.4).
        for (let k = 0; k < 8; ++k) {
            st[k] = 0;
        }
        for (let k = 0; k < Nf; ++k) {
            Xf[k] = Xs[k];
        }

        //  Load TNS parameter (from Table 3.15).
        let Tparam_Nms_Pbw         = Tparam_Nms[Pbw];
        let Tparam_num_tns_filters = Tparam_Nms_Pbw[0];
        let Tparam_start_freq      = Tparam_Nms_Pbw[1];
        let Tparam_stop_freq       = Tparam_Nms_Pbw[2];
        let Tparam_sub_start       = Tparam_Nms_Pbw[3];
        let Tparam_sub_stop        = Tparam_Nms_Pbw[4];

        num_tns_filters = Tparam_num_tns_filters;

        //  TNS analysis (3.3.8.2).
        for (let f = 0; f < Tparam_num_tns_filters; ++f) {
            //  Get e[s] (Eq. 67).
            let Es_zero = false;
            let sub_start = Tparam_sub_start[f];
            let sub_stop  = Tparam_sub_stop[f];
            for (let s = 0; s < 3; ++s) {
                let Es_s = 0;
                for (let n = sub_start[s], nEnd = sub_stop[s]; n < nEnd; ++n) {
                    let Xs_n = Xs[n];
                    Es_s += Xs_n * Xs_n;
                }
                Es[s] = Es_s;
                if (Es_s < 1E-6) {
                    Es_zero = true;
                }
            }

            if (Es_zero) {
                Rk[0] = 3;                                          //  Eq. 66
                for (let k = 1; k < 9; ++k) {
                    Rk[k] = 0;
                }
            } else {
                for (let k = 0; k < 9; ++k) {                       //  Eq. 65
                    let Rk_k = 0;
                    for (let s = 0; s < 3; ++s) {
                        let tmp = 0;
                        for (
                            let n = sub_start[s], nEnd = sub_stop[s] - k; 
                            n < nEnd; 
                            ++n
                        ) {
                            tmp += Xs[n] * Xs[n + k];
                        }
                        Rk_k += tmp / Es[s];
                    }
                    Rk[k] = Rk_k;
                }
            }
            // console.log("r[k]=" + Rk.toString());

            //  The normalized autocorrelation function shall be lag-windowed.
            for (let k = 0; k < 9; ++k) {
                Rk[k] *= WLAG[k];                                   //  Eq. 68
            }
            // console.log("rw[k]=" + Rk.toString());

            //  The Levinson-Durbin recursion shall be used to obtain LPC 
            //  coefficients a[k].
            let err = Rk[0];
            LPCs[0] = 1;
            for (let k = 1; k < 9; ++k) {
                let rc = 0;
                for (let n = 0; n < k; ++n) {
                    rc += LPCs[n] * Rk[k - n];
                }
                if (err < 1E-6) {
                    //  TODO(akita): A suspicious possible division-by-zero.
                    //               Is this OK...?
                    err = 1;
                }
                rc = (-rc) / err;
                LPCs_tmp1[0] = 1;
                for (let n = 1; n < k; ++n) {
                    LPCs_tmp1[n] = LPCs[n] + rc * LPCs[k - n];
                }
                LPCs_tmp1[k] = rc;
                for (let n = 0; n <= k; ++n) {
                    LPCs[n] = LPCs_tmp1[n];
                }
                err *= (1 - rc * rc);
            }
            // console.log("a[k]=" + LPCs.toString());

            let predGain = Rk[0] / err;                             //  Eq. 69
            // console.log("predGain=" + predGain.toString());

            let RC_f = RC[f];
            if (predGain > 1.5 && nn_flag == 0) {
                if (tns_lpc_weighting == 1 && predGain < 2) {
                    //  The weighting factor γ shall be computed by:
                    let gamma = 1 - 0.3 * (2 - predGain);           //  Eq. 70

                    //  The LPC coefficients shall be weighted using the 
                    //  factor γ.
                    let factor = 1;                                 //  Eq. 72
                    for (let k = 0; k < 9; ++k) {
                        LPCs[k] *= factor;
                        factor *= gamma;
                    }
                }

                //  The weighted LPC coefficients shall be converted to 
                //  reflection coefficients using the following algorithm.
                for (let k = 0; k < 9; ++k) {
                    LPCs_tmp1[k] = LPCs[k];
                }
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
                for (let k = 0; k < 8; ++k) {
                    RC_f[k] = 0;
                }
            }

        }

        //  Quantization (3.3.8.3).
        nbitsTNS = 0;
        for (let f = 0; f < 2; ++f) {
            let RC_f = RC[f];
            let RCint_f = RCint[f];
            let RCq_f = RCq[f];
            for (let k = 0; k < 8; ++k) {
                let t1 = Math.round(Math.asin(RC_f[k]) * 17 / Math.PI);
                let t2 = t1 + 8;
                RCint_f[k] = t2;                                    //  Eq. 73
                RCq_f[k] = Math.sin(t1 * Math.PI / 17);             //  Eq. 74
            }

            //  The order of the quantized reflection coefficients shall be 
            //  calculated using:
            let RCorderS1 = 7;
            for (; RCorderS1 >= 0 && RCq_f[RCorderS1] == 0; --RCorderS1) {
                //  Dummy.
            }
            RCorder[f] = RCorderS1 + 1;
        }

        for (let f = 0; f < num_tns_filters; ++f) {
            let RCint_f = RCint[f];
            let RCq_f = RCq[f];
            let RCorderS1 = RCorder[f] - 1;

            //  The total number of bits consumed by TNS in the current frame 
            //  shall then be computed as follows:
            let nbitsTNSorder;                                      //  Eq. 76
            if (RCorderS1 >= 0) {
                nbitsTNSorder = AC_TNS_ORDER_BITS_tlw[RCorderS1];
            } else {
                nbitsTNSorder = 0;
            }

            let nbitsTNScoef = 0;                                   //  Eq. 77
            for (let v = 0; v <= RCorderS1; ++v) {
                nbitsTNScoef += AC_TNS_COEF_BITS[v][RCint_f[v]];
            }

            nbitsTNS += Math.ceil(                                  //  Eq. 75
                (2048 + nbitsTNSorder + nbitsTNScoef) / 2048
            );

            //  Filtering (3.3.8.4).
            //  The MDCT spectrum Xs[n] shall be analysis filtered using the 
            //  following algorithm.
            let start_freq_f = Tparam_start_freq[f], 
                 stop_freq_f = Tparam_stop_freq[f];
            if (RCorderS1 >= 0) {
                for (let n = start_freq_f; n < stop_freq_f; ++n) {
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