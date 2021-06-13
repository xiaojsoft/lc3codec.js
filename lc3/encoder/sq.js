//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3TblAcSpec = 
    require("./../tables/ac_spec");
const Lc3Fs = 
    require("../common/fs");
const Lc3Nms = 
    require("../common/nms");
const Lc3Error = 
    require("../error");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;

//  Imported constants.
const AC_SPEC_LOOKUP = 
    Lc3TblAcSpec.AC_SPEC_LOOKUP;
const AC_SPEC_BITS = 
    Lc3TblAcSpec.AC_SPEC_BITS;

//
//  Constants.
//

//  NE (Nms, Fs) to ceil(log2(NE / 2)) table.
const NBITSARI_TBL = [
    [
        6, 7, 7, 8, 8, 8
    ],
    [
        5, 6, 7, 7, 8, 8
    ]
];

//  Global gain adjustment tables (see 3.3.10.6).
const GGADJ_T1 = [80, 230, 380, 530, 680];
const GGADJ_T2 = [500, 1025, 1550, 2075, 2600];
const GGADJ_T3 = [850, 1700, 2550, 3400, 4250];

//
//  Public classes.
//

/**
 *  LC3 spectral quantization.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 *  @param {Number} NE
 *    - The number of encoded spectral lines.
 */
function LC3SpectralQuantization(Nms, Fs, NE) {
    //
    //  Members.
    //

    //  Get the index of Nms.
    let index_Nms = Nms.getInternalIndex();

    //  Get the index of Fs (not Fs_ind).
    let index_Fs = Fs.getInternalIndex();

    //  Algorithm contexts.
    let fsInd = Fs.getSampleRateIndex();
    let fsIndP1 = fsInd + 1;

    let gg_t1_fsi = GGADJ_T1[fsInd];
    let gg_t2_fsi = GGADJ_T2[fsInd];
    let gg_t3_fsi = GGADJ_T3[fsInd];

    let gg_rq_tmp1 = gg_t1_fsi / 16 + 3;
    let gg_rq_tmp2 = gg_t2_fsi / 48;
    let gg_rq_tmp3 = gg_t3_fsi / 48;
    let gg_rq_tmp4 = gg_rq_tmp2 - gg_rq_tmp1;
    let gg_rq_tmp5 = gg_t2_fsi - gg_t1_fsi;

    let gg = 0;
    let gg_ind = 0;

    let nbitsAri_base = NBITSARI_TBL[index_Nms][index_Fs];

    let NEDiv2 = (NE >>> 1);
    let NEDiv4 = (NE >>> 2);

    let Edb = new Array(NEDiv4);

    let nbits_trunc = 0;
    let nbits_spec = 0;

    let reset_offset_old = 0;
    let nbits_offset_old = 0;
    let nbits_spec_old = 0;
    let nbits_est_old = 0;

    let Xq = new Array(NE);

    let lsbMode = 0;

    let lastnz_trunc = 0;

    let rateFlag = 0, modeFlag = 0;

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} Xf
     *    - The TNS filtered spectrum coefficients.
     *  @param {Number} nbits
     *    - The bit count.
     *  @param {Number} nbitsBW
     *    - The count of bits for bandwidth (i.e. nbitsBW).
     *  @param {Number} nbitsTNS
     *    - The count of bits for TNS (i.e. nbitsTNS).
     *  @param {Number} nbitsLTPF
     *    - The count of bits for LTPF (i.e. nbitsLTPF).
     */
    this.update = function(Xf, nbits, nbitsBW, nbitsTNS, nbitsLTPF) {
        //  Spectral quantization (3.3.10).

        //  Bit budget (3.3.10.1).
        let nbitsSNS = 38;
        let nbitsGain = 8;
        let nbitsNF = 3;
        let nbitsAri = nbitsAri_base;
        if (nbits <= 1280) {
            nbitsAri += 3;
        } else if (nbits <= 2560) {
            nbitsAri += 4;
        } else {
            nbitsAri += 5;
        }
        nbits_spec = nbits - nbitsBW - nbitsTNS - nbitsLTPF - nbitsSNS - 
                     nbitsGain - nbitsNF - nbitsAri;
        // console.log("nbits_spec=" + nbits_spec.toString());

        let nbits_offset;
        if (reset_offset_old == 0) {                               //  Eq. 108
            nbits_offset = 0.8 * nbits_offset_old + 0.2 * Math.min(
                40, 
                Math.max(
                    -40, 
                    nbits_offset_old + nbits_spec_old - nbits_est_old
                )
            );
        } else {
            nbits_offset = 0;
        }
        let nbits_spec_I = Math.round(nbits_spec + nbits_offset);
        // console.log("nbits_offset=" + nbits_offset.toString());

        //  Compute the quantized gain index offset by:
        let gg_off = -Math.min(                                    //  Eq. 110
            115, 
            Math.trunc(nbits / (10 * fsIndP1))
        ) - 105 - 5 * fsIndP1;
        // console.log("gg_off=" + gg_off);

        //  The energy (in dB) of blocks of 4 MDCT coefficients:
        for (let k = 0, kMul4 = 0; k < NEDiv4; ++k, kMul4 += 4) {  //  Eq. 111
            let Xf0 = Xf[kMul4];
            let Xf1 = Xf[kMul4 + 1];
            let Xf2 = Xf[kMul4 + 2];
            let Xf3 = Xf[kMul4 + 3];
            Edb[k] = 10 * Math.log10(4.656612873077393e-10 /*  2^(-31)  */ + (
                Xf0 * Xf0 + 
                Xf1 * Xf1 + 
                Xf2 * Xf2 + 
                Xf3 * Xf3
            ));
        }
        // console.log("E[]=" + Edb);

        //  Get minimum global gain (gg_min).
        let Xf_max = 0;                                            //  Eq. 113
        for (let n = 0; n < NE; ++n) {
            let Xf_n_abs = Math.abs(Xf[n]);
            if (Xf_n_abs > Xf_max) {
                Xf_max = Xf_n_abs;
            }
        }
        let gg_min;                                                //  Eq. 112
        if (Xf_max < 1e-31) {
            gg_min = 0;
        } else {
            gg_min = Math.ceil(
                28 * Math.log10(1e-31 + Xf_max / 32767.625)
            ) - gg_off;
        }
        // console.log("gg_min=" + gg_min);

        //  Get global gain index (gg_ind).
        gg_ind = 255;
        {
            let fac = 256;
            for (let iter = 0; iter < 8; ++iter) {
                fac >>>= 1;
                gg_ind -= fac;
                let gg_sum = gg_ind + gg_off;
                let tmp = 0;
                let iszero = true;
                for (let i = NEDiv4 - 1; i >= 0; --i) {
                    let Ei = Edb[i];
                    if (Ei * 1.4 < gg_sum) {
                        if (!iszero) {
                            tmp += 3.78;
                        }
                    } else {
                        if (gg_sum < Ei * 1.4 - 60.2) {
                            tmp += 2.8 * Ei - 2 * gg_sum - 50.4;
                        } else {
                            tmp += 1.4 * Ei - gg_sum + 9.8;
                        }
                        iszero = false;
                    }
                }
                if (tmp > nbits_spec_I * 1.96 && !iszero) {
                    gg_ind += fac;
                }
            }
        }

        //  The quantized gain index shall be limited such that the quantized 
        //  spectrum stays within the range [-32768, 32767].
        let reset_offset;
        if (gg_ind < gg_min || Xf_max < 1e-31) {
            gg_ind = gg_min;
            reset_offset = 1;
        } else {
            reset_offset = 0;
        }

        // console.log("gg_ind=" + gg_ind.toString());
        // console.log("reset_offset=" + reset_offset.toString());

        let nbits_est_prior_requantize = -1;
        let nbits_est = -1;

        let nbits_lsb = -1;
        let lastnz = -1;

        let first_quantize = true, requantize = false;
        
        while (first_quantize || requantize) {
            //  Quantization (3.3.10.3).
            gg = Math.pow(10, (gg_ind + gg_off) / 28);         //  Eq. 114
            // console.log("gg=" + gg.toString());
            for (let n = 0; n < NE; ++n) {
                let Xf_n = Xf[n];
                if (Xf_n >= 0) {
                    Xq[n] = Math.trunc(Xf_n / gg + 0.375);
                } else {
                    Xq[n] = Math.ceil(Xf_n / gg - 0.375);
                }
            }
            // console.log("Xq[]=" + Xq.toString());

            //  Two bitrate flags shall be computed using:
            if (nbits > 160 + fsInd * 160) {
                rateFlag = 512;
            } else {
                rateFlag = 0;
            }
            if (nbits >= 480 + fsInd * 160) {
                modeFlag = 1;
            } else {
                modeFlag = 0;
            }

            //  The index of the last non-zeroed 2-tuple shall be obtained by:
            lastnz = NE;
            while (lastnz > 2 && Xq[lastnz - 1] == 0 && Xq[lastnz - 2] == 0) {
                lastnz -= 2;
            }
            // console.log("lastnz=" + lastnz.toString());

            //  The number of bits nbits_est shall then be computed as follows:
            nbits_est = 0;
            nbits_trunc = 0;
            nbits_lsb = 0;

            lastnz_trunc = 2;

            let c = 0;
            for (let n = 0; n < lastnz; n += 2) {
                let Xq_n0 = Xq[n];
                let Xq_n1 = Xq[n + 1];
                let t = c + rateFlag;
                if (n > NEDiv2) {
                    t += 256;
                }
                let a = Math.abs(Xq_n0);
                let a_lsb = a;
                let b = Math.abs(Xq_n1);
                let b_lsb = b;
                let lev = 0;
                while (Math.max(a, b) >= 4) {
                    let pki = AC_SPEC_LOOKUP[t + ((lev << 10) >>> 0)];
                    nbits_est += AC_SPEC_BITS[pki][16];
                    if (lev == 0 && modeFlag == 1) {
                        nbits_lsb += 2;
                    } else {
                        nbits_est += 4096;
                    }
                    a >>>= 1;
                    b >>>= 1;
                    lev = Math.min(lev + 1, 3);
                }
                let pki = AC_SPEC_LOOKUP[t + ((lev << 10) >>> 0)];
                let sym = a + ((b << 2) >>> 0);
                nbits_est += AC_SPEC_BITS[pki][sym];
                nbits_est += (
                    ((Math.min(a_lsb, 1) + Math.min(b_lsb, 1)) << 11) >>> 0
                );
                if (lev > 0 && modeFlag == 1) {
                    a_lsb >>>= 1;
                    b_lsb >>>= 1;
                    if (a_lsb == 0 && Xq_n0 != 0) {
                        ++(nbits_lsb);
                    }
                    if (b_lsb == 0 && Xq_n1 != 0) {
                        ++(nbits_lsb);
                    }
                }
                if ((Xq_n0 != 0 || Xq_n1 != 0) && (nbits_est <= ((nbits_spec << 11) >>> 0))) {
                    lastnz_trunc = n + 2;
                    nbits_trunc = nbits_est;
                }
                if (lev <= 1) {
                    t = 1 + (a + b) * (lev + 1);
                } else {
                    t = 12 + lev;
                }
                c = (((c & 15) << 4) >>> 0) + t;
            }
            nbits_est = Math.ceil(nbits_est / 2048) + nbits_lsb;
            nbits_trunc = Math.ceil(nbits_trunc / 2048);
            // console.log("nbits_est=" + nbits_est.toString());
            // console.log("nbits_trunc=" + nbits_trunc.toString());
            // console.log("lastnz_trunc=" + lastnz_trunc.toString());

            //  Truncation (3.3.10.5).
            for (let k = lastnz_trunc; k < lastnz; ++k) {
                Xq[k] = 0;
            }
            if (modeFlag == 1 && nbits_est > nbits_spec) {
                lsbMode = 1;
            } else {
                lsbMode = 0;
            }
            // console.log("lsbMode=" + lsbMode);

            if (first_quantize) {
                nbits_est_prior_requantize = nbits_est;

                //  Global gain adjustment (3.3.10.6).
                let delta;

                if (nbits_est < gg_t1_fsi) {
                    delta = (nbits_est + 48) / 16;
                } else if (nbits_est < gg_t2_fsi) {
                    delta = (nbits_est - gg_t1_fsi) * gg_rq_tmp4 / gg_rq_tmp5 + gg_rq_tmp1;
                } else if (nbits_est < gg_t3_fsi) {
                    delta = nbits_est / 48;
                } else {
                    delta = gg_rq_tmp3;
                }
                delta = Math.round(delta);
                let delta2 = delta + 2;
                // console.log("delta=" + delta.toString());
                // console.log("delta2=" + delta2.toString());

                let rq_cond1 = (nbits_est > nbits_spec);
                let rq_cond2 = (nbits_est < nbits_spec - delta2);
                if (
                    (gg_ind < 255 && rq_cond1) || 
                    (gg_ind > 0 && rq_cond2)
                ) {
                    if (rq_cond2) {
                        --(gg_ind);
                    } else if (gg_ind == 254 || nbits_est < (nbits_spec + delta)) {
                        ++(gg_ind);
                    } else {
                        gg_ind += 2;
                    }
                    gg_ind = Math.max(gg_ind, gg_min);
                    // console.log("gg_ind_adj=" + gg_ind.toString());
                    requantize = true;
                }
            } else {
                requantize = false;
            }

            first_quantize = false;
        }

        //  Save contexts.
        reset_offset_old = reset_offset;
        nbits_offset_old = nbits_offset;
        nbits_spec_old = nbits_spec;
        nbits_est_old = nbits_est_prior_requantize;
    };

    /**
     *  Get the quantized spectrum coefficients.
     * 
     *  @returns {Number[]}
     *    - The quantized spectrum coefficients.
     */
    this.getQuantizedSpectrumCoefficients = function() {
        return Xq;
    };

    /**
     *  Get quantized parameters (i.e. gg, gg_ind, lastnz_trunc, rateFlag, 
     *  modeFlag, nbits_spec, nbits_trunc, lsbMode).
     * 
     *  @throws {LC3IllegalParameterError}
     *    - R has an incorrect size (!= 8).
     *  @param {Number[]} [R]
     *    - The returned array buffer (used for reducing array allocation).
     *  @returns {Number[]}
     *    - An array (denotes as R[0...7]), where:
     *      - R[0] = gg,
     *      - R[1] = gg_ind,
     *      - R[2] = lastnz_trunc,
     *      - R[3] = rateFlag,
     *      - R[4] = modeFlag,
     *      - R[5] = nbits_spec.
     *      - R[6] = nbits_trunc
     *      - R[7] = lsbMode
     */
     this.getQuantizedParameters = function(R = new Array(8)) {
        //  Check the size of R.
        if (R.length != 8) {
            throw new LC3IllegalParameterError(
                "R has an incorrect size (!= 8)."
            );
        }

        //  Write encoder parameters.
        R[0] = gg;
        R[1] = gg_ind;
        R[2] = lastnz_trunc;
        R[3] = rateFlag;
        R[4] = modeFlag;
        R[5] = nbits_spec;
        R[6] = nbits_trunc;
        R[7] = lsbMode;

        return R;
    }
}

//  Export public APIs.
module.exports = {
    "LC3SpectralQuantization": LC3SpectralQuantization
};