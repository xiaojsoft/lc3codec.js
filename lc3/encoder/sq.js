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
const Lc3TblNE = 
    require("./../tables/ne");
const Lc3TblSQ = 
    require("./../tables/sq");
const Lc3Fs = 
    require("./../common/fs");
const Lc3Nms = 
    require("./../common/nms");
const Lc3Error = 
    require("./../error");

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
const NE_TBL = 
    Lc3TblNE.NE_TBL;
const NBITSLASTNZ_TBL = 
    Lc3TblSQ.NBITSLASTNZ_TBL;
const GGOFF_TBL = 
    Lc3TblSQ.GGOFF_TBL;
const BITRATE_C1 = 
    Lc3TblSQ.BITRATE_C1;
const BITRATE_C2 = 
    Lc3TblSQ.BITRATE_C2;

//
//  Constants.
//

//  Global gain adjustment tables (see 3.3.10.6).
const GGADJ_T1 = [  80,  230,  380,  530,  680];
const GGADJ_T2 = [ 500, 1025, 1550, 2075, 2600];
const GGADJ_T3 = [ 850, 1700, 2550, 3400, 4250];

//  Bit budget constants (see 3.3.10.1).
const NBITS_SNS = 38;
const NBITS_GAIN = 8;
const NBITS_NF = 3;

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
 */
function LC3SpectralQuantization(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let fsind = Fs.getSampleRateIndex();
    let NE = NE_TBL[index_Nms][index_Fs];
    let NE_div_2 = (NE >>> 1);
    let NE_div_4 = (NE >>> 2);
    let nbits_ari_base = NBITSLASTNZ_TBL[index_Nms][index_Fs];
    let bitrate_c1 = BITRATE_C1[fsind];
    let bitrate_c2 = BITRATE_C2[fsind];
    let gg_t1_fsi = GGADJ_T1[fsind];
    let gg_t2_fsi = GGADJ_T2[fsind];
    let gg_t3_fsi = GGADJ_T3[fsind];

    //  Algorithm contexts.
    let gg = 0;
    let gg_ind = 0;

    let ED = new Array(NE_div_4);

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
        {
            //  Get the number of bits available for coding the spectrum.

            //  Eq. 107.
            let nbits_ari = nbits_ari_base;
            if (nbits <= 1280) {
                nbits_ari += 3;
            } else if (nbits <= 2560) {
                nbits_ari += 4;
            } else {
                nbits_ari += 5;
            }

            //  Eq. 106.
            nbits_spec = nbits - nbitsBW - nbitsTNS - nbitsLTPF - NBITS_SNS - 
                         NBITS_GAIN - NBITS_NF - nbits_ari;
        }
        // console.log("nbits_spec=" + nbits_spec.toString());

        //  First global gain estimation (3.3.10.2).
        let nbits_offset, nbits_spec_2;
        {
            //  An offset shall first be computed using:

            //  Eq. 108.
            if (reset_offset_old == 0) {
                nbits_offset = nbits_offset_old + nbits_spec_old - 
                               nbits_est_old;
                if (nbits_offset < -40) {
                    nbits_offset = -40;
                } else if (nbits_offset > 40) {
                    nbits_offset = 40;
                } else {
                    //  Nothing.
                }
                nbits_offset = 0.8 * nbits_offset_old + 0.2 * nbits_offset;
            } else {
                nbits_offset = 0;
            }

            //  This offset shall then be used to adjust the number of bits 
            //  available for coding the spectrum.

            //  Eq. 109
            nbits_spec_2 = Math.round(nbits_spec + nbits_offset);
        }
        // console.log("nbits_offset=" + nbits_offset.toString());

        let gg_off;
        {
            //  Compute the quantized gain index offset by:

            //  Eq. 110
            gg_off = GGOFF_TBL[fsind][nbits - 20];
        }
        // console.log("gg_off=" + gg_off);

        {
            //  The energy (in dB) of blocks of 4 MDCT coefficients:

            //  Eq. 111
            for (let k = 0, kMul4 = 0; k < NE_div_4; ++k, kMul4 += 4) {
                let Xf0 = Xf[kMul4];
                let Xf1 = Xf[kMul4 + 1];
                let Xf2 = Xf[kMul4 + 2];
                let Xf3 = Xf[kMul4 + 3];
                ED[k] = 10 * Math.log10(
                    4.656612873077393e-10 /*  2^(-31)  */ + 
                    Xf0 * Xf0 + 
                    Xf1 * Xf1 + 
                    Xf2 * Xf2 + 
                    Xf3 * Xf3
                );
            }
        }
        // console.log("E[]=" + ED);

        let gg_min, Xf_max;
        {
            //  Get minimum global gain (gg_min) and Xf_max.

            //  Eq. 113
            Xf_max = 0;
            for (let n = 0; n < NE; ++n) {
                let Xf_n_abs = Math.abs(Xf[n]);
                if (Xf_n_abs > Xf_max) {
                    Xf_max = Xf_n_abs;
                }
            }

            //  Eq. 112
            if (Xf_max < 1e-31) {
                gg_min = 0;
            } else {
                gg_min = Math.ceil(
                    28 * Math.log10(1e-31 + Xf_max / 32767.625)
                ) - gg_off;
            }
        }
        // console.log("gg_min=" + gg_min);

        {
            //  Get global gain index (gg_ind).
            let fac = 256;
            gg_ind = 255;
            for (let iter = 0; iter < 8; ++iter) {
                let gg_ind_old = gg_ind;
                fac >>>= 1;
                gg_ind -= fac;
                let gg_sum = gg_ind + gg_off;
                let tmp = 0;
                let iszero = true;
                for (let i = NE_div_4 - 1; i >= 0; --i) {
                    let Ei = ED[i];
                    let Ei_mul_1p4 = Ei * 1.4;
                    // if (ED[i] * 28 / 20 < (gg_ind + gg_off)) {
                    if (Ei_mul_1p4 < gg_sum) {
                        if (!iszero) {
                            //  tmp += 2.7 * 28 / 20;
                            tmp += 3.78;
                        }
                    } else {
                        // if ((gg_ind + gg_off) < ED[i] * 28 / 20 - 43 * 28 / 20) {
                        if (gg_sum < Ei_mul_1p4 - 60.2) {
                            //  tmp += 2 * ED[i] * 28 / 20 - 2 * (gg_ind + gg_off) - 36 * 28 / 20;
                            tmp += 2 * Ei_mul_1p4 - 2 * gg_sum - 50.4;
                        } else {
                            //  tmp += ED[i] * 28 / 20 - (gg_ind + gg_off) + 7 * 28 / 20;
                            tmp += Ei_mul_1p4 - gg_sum + 9.8;
                        }
                        iszero = false;
                    }
                }
                // if (tmp > nbits_spec_2 * 1.4 * 28 / 20 && !iszero) {
                if (tmp > nbits_spec_2 * 1.96 && !iszero) {
                    // gg_ind += fac;
                    gg_ind = gg_ind_old;
                }
            }
        }

        let reset_offset;
        {
            //  The quantized gain index shall be limited such that the 
            //  quantized spectrum stays within the range [-32768, 32767].
            if (gg_ind < gg_min || Xf_max < 1e-31) {
                gg_ind = gg_min;
                reset_offset = 1;
            } else {
                reset_offset = 0;
            }
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
            {
                //  The quantized global gain index shall first be unquantized:

                //  Eq. 114
                gg = Math.pow(10, (gg_ind + gg_off) / 28);
            }
            // console.log("gg=" + gg.toString());

            {
                //  The spectrum Xf(n) shall then be quantized:
                for (let n = 0; n < NE; ++n) {
                    //  Eq. 115
                    let tmp = Xf[n];
                    if (tmp >= 0) {
                        tmp = Math.trunc(tmp / gg + 0.375);
                    } else {
                        tmp = Math.ceil(tmp / gg - 0.375);
                    }

                    //  Make sure the quantized spectrum stays within the range 
                    //  [-32768, 32767].
                    if (tmp > 32767) {
                        //  Overflow truncation.
                        tmp = 32767;
                    } else if (tmp < -32768) {
                        //  Underflow truncation.
                        tmp = -32768;
                    } else {
                        //  Nothing.
                    }

                    Xq[n] = tmp;
                }
            }
            // console.log("Xq[]=" + Xq.toString());

            //  Bit consumption (3.3.10.3).
            {
                //  Two bitrate flags shall be computed:
                // if (nbits > (160 + fsind * 160)) {
                if (nbits > bitrate_c1) {
                    rateFlag = 512;
                } else {
                    rateFlag = 0;
                }
                // if (nbits >= (480 + fsind * 160)) {
                if (nbits >= bitrate_c2) {
                    modeFlag = 1;
                } else {
                    modeFlag = 0;
                }
            }

            {
                //  The index of the last non-zeroed 2-tuple shall be obtained 
                //  by:
                lastnz = NE;
                while (
                    lastnz > 2 && 
                    Xq[lastnz - 1] == 0 && 
                    Xq[lastnz - 2] == 0
                ) {
                    lastnz -= 2;
                }
            }
            // console.log("lastnz=" + lastnz.toString());

            //  The number of bits nbits_est shall then be computed as follows:
            {
                nbits_est = 0;
                nbits_trunc = 0;
                nbits_lsb = 0;
                lastnz_trunc = 2;
                let c = 0;
                for (let n = 0; n < lastnz; n += 2) {
                    let Xq_n0 = Xq[n];
                    let Xq_n1 = Xq[n + 1];
                    let t = c + rateFlag;
                    if (n > NE_div_2) {
                        t += 256;
                    }
                    // let a = Math.abs(Xq[n]);
                    let a = Math.abs(Xq_n0);
                    // let a_lsb = Math.abs(Xq[n]);
                    let a_lsb = a;
                    // let b = Math.abs(Xq[n + 1]);
                    let b = Math.abs(Xq_n1);
                    // let b_lsb = Math.abs(Xq[n + 1]);
                    let b_lsb = b;
                    let lev = 0;
                    // while (Math.max(a, b) >= 4) {
                    while (a >= 4 || b >= 4) {
                        // let pki = AC_SPEC_LOOKUP[t + lev * 1024];
                        let pki = AC_SPEC_LOOKUP[t + ((lev << 10) >>> 0)];
                        nbits_est += AC_SPEC_BITS[pki][16];
                        if (lev == 0 && modeFlag == 1) {
                            nbits_lsb += 2;
                        } else {
                            // nbits_est += 2 * 2048;
                            nbits_est += 4096;
                        }
                        a >>>= 1;
                        b >>>= 1;
                        // lev = Math.min(lev + 1, 3);
                        if (lev < 3) {
                            ++(lev);
                        }
                    }
                    // let pki = AC_SPEC_LOOKUP[t + lev * 1024];
                    let pki = AC_SPEC_LOOKUP[t + ((lev << 10) >>> 0)];
                    // let sym = a + 4 * b;
                    let sym = a + ((b << 2) >>> 0);
                    nbits_est += AC_SPEC_BITS[pki][sym];
                    // nbits_est += (Math.min(a_lsb, 1) + Math.min(b_lsb, 1)) * 2048;
                    if (a_lsb != 0) {
                        nbits_est += 2048;
                    }
                    if (b_lsb != 0) {
                        nbits_est += 2048;
                    }
                    if (lev > 0 && modeFlag == 1) {
                        a_lsb >>>= 1;
                        b_lsb >>>= 1;
                        // if (a_lsb == 0 && Xq[n] != 0) {
                        if (a_lsb == 0 && Xq_n0 != 0) {
                            ++(nbits_lsb);
                        }
                        // if (b_lsb == 0 && Xq[n + 1] != 0) {
                        if (b_lsb == 0 && Xq_n1 != 0) {
                            ++(nbits_lsb);
                        }
                    }
                    // if (
                    //     (Xq[n] != 0 || Xq[n + 1] != 0) && 
                    //     (nbits_est <= nbits_spec * 2048)
                    // ) {
                    if (
                        (Xq_n0 != 0 || Xq_n1 != 0) && 
                        (nbits_est <= ((nbits_spec << 11) >>> 0))
                    ) {
                        lastnz_trunc = n + 2;
                        nbits_trunc = nbits_est;
                    }
                    if (lev <= 1) {
                        t = 1 + (a + b) * (lev + 1);
                    } else {
                        t = 12 + lev;
                    }
                    // c = (((c & 15) * 16) >>> 0) + t;
                    c = (((c & 15) << 4) >>> 0) + t;
                }
                // nbits_est = Math.ceil(nbits_est / 2048) + nbits_lsb;
                if ((nbits_est & 2047) != 0) {
                    nbits_est >>>= 11;
                    ++(nbits_est);
                } else {
                    nbits_est >>>= 11;
                }
                nbits_est += nbits_lsb;
                // nbits_trunc = Math.ceil(nbits_trunc / 2048);
                if ((nbits_trunc & 2047) != 0) {
                    nbits_trunc >>>= 11;
                    ++(nbits_trunc);
                } else {
                    nbits_trunc >>>= 11;
                }
            }
            // console.log("nbits_est=" + nbits_est.toString());
            // console.log("nbits_trunc=" + nbits_trunc.toString());
            // console.log("lastnz_trunc=" + lastnz_trunc.toString());

            //  Truncation (3.3.10.5).
            {
                //  The quantized spectrum Xq[k] shall be truncated such that 
                //  the number of bits needed to encode it is within the 
                //  available bit budget.
                for (let k = lastnz_trunc; k < lastnz; ++k) {
                    Xq[k] = 0;
                }
            }

            {
                //  A flag that allows the truncation of the LSBs in the 
                //  arithmetic encoding/decoding shall be obtained:
                if (modeFlag == 1 && nbits_est > nbits_spec) {
                    lsbMode = 1;
                } else {
                    lsbMode = 0;
                }
            }
            // console.log("lsbMode=" + lsbMode);

            if (first_quantize) {
                //  The value of nbits_est_old shall not be updated if 
                //  requantization is carried out.
                nbits_est_prior_requantize = nbits_est;

                //  Global gain adjustment (3.3.10.6).
                {
                    //  The number of bits nbits_est shall be compared with the 
                    //  available bit budget nbits_spec. If they are far from 
                    //  each other, then the quantized global gain index gg_ind
                    //  shall be adjusted and the spectrum shall be requantized.

                    //  The delta values shall be obtained:
                    let delta;
                    if (nbits_est < gg_t1_fsi) {
                        delta = (nbits_est + 48) / 16;
                    } else if (nbits_est < gg_t2_fsi) {
                        let tmp1 = gg_t1_fsi / 16 + 3;
                        let tmp2 = gg_t2_fsi / 48;
                        delta  = (nbits_est - gg_t1_fsi) * (tmp2 - tmp1);
                        delta /= (gg_t2_fsi - gg_t1_fsi);
                        delta += tmp1;
                    } else if (nbits_est < gg_t3_fsi) {
                        delta = nbits_est / 48;
                    } else {
                        delta = gg_t3_fsi / 48;
                    }
                    delta = Math.round(delta);
                    let delta2 = delta + 2;
                    // console.log("delta=" + delta.toString());
                    // console.log("delta2=" + delta2.toString());

                    //  Compare and adjust.
                    if (
                        (gg_ind < 255 && nbits_est > nbits_spec) || 
                        (gg_ind > 0 && nbits_est < nbits_spec - delta2)
                    ) {
                        if (
                            nbits_est < nbits_spec - delta2
                        ) {
                            --(gg_ind);
                        } else if (
                            gg_ind == 254 || 
                            nbits_est < nbits_spec + delta
                        ) {
                            ++(gg_ind);
                        } else {
                            gg_ind += 2;
                        }
                        // gg_ind = Math.max(gg_ind, gg_min);
                        if (gg_ind < gg_min) {
                            gg_ind = gg_min;
                        }
                        // console.log("gg_ind_adj=" + gg_ind.toString());

                        requantize = true;
                    }
                }
            } else {
                //  The global gain adjustment process should not be run more 
                //  than one time for each processed frame.
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
     *  modeFlag, nbits_spec, nbits_trunc, nbits_lastnz, lsbMode).
     * 
     *  @throws {LC3IllegalParameterError}
     *    - R has an incorrect size (!= 9).
     *  @param {Number[]} [R]
     *    - The returned array buffer (used for reducing array allocation).
     *  @returns {Number[]}
     *    - An array (denotes as R[0...8]), where:
     *      - R[0] = gg,
     *      - R[1] = gg_ind,
     *      - R[2] = lastnz_trunc,
     *      - R[3] = rateFlag,
     *      - R[4] = modeFlag,
     *      - R[5] = nbits_spec,
     *      - R[6] = nbits_trunc,
     *      - R[7] = nbits_lastnz,
     *      - R[8] = lsbMode
     */
     this.getQuantizedParameters = function(R = new Array(9)) {
        //  Check the size of R.
        if (R.length != 9) {
            throw new LC3IllegalParameterError(
                "R has an incorrect size (!= 9)."
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
        R[7] = nbits_ari_base;
        R[8] = lsbMode;

        return R;
    };
}

//  Export public APIs.
module.exports = {
    "LC3SpectralQuantization": LC3SpectralQuantization
};