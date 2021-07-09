//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Nms = 
    require("./../common/nms");
const Lc3Fs = 
    require("./../common/fs");
const Lc3IntUtil = 
    require("./../common/int_util");
const Lc3SlideWin = 
    require("./../common/slide_window");
const Lc3LtpfCommon = 
    require("./../common/ltpf-common");
const Lc3FftTfmCooleyTukey = 
    require("./../math/fft-tfm-cooleytukey");
const Lc3TblLtpf = 
    require("./../tables/ltpf");
const Lc3TblNF = 
    require("./../tables/nf");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3SlideWindow = 
    Lc3SlideWin.LC3SlideWindow;
const FFTCooleyTukeyTransformer = 
    Lc3FftTfmCooleyTukey.FFTCooleyTukeyTransformer;

//  Imported functions.
const GetGainParameters = 
    Lc3LtpfCommon.GetGainParameters;
const IntDiv = 
    Lc3IntUtil.IntDiv;

//  Imported constants.
const TAB_RESAMP_FILTER = 
    Lc3TblLtpf.TAB_RESAMP_FILTER;
const TAB_LTPF_INTERP_R = 
    Lc3TblLtpf.TAB_LTPF_INTERP_R;
const TAB_LTPF_INTERP_X12K8 = 
    Lc3TblLtpf.TAB_LTPF_INTERP_X12K8;
const NF_TBL = 
    Lc3TblNF.NF_TBL;

//
//  Constants.
//

//  Fs to P conversion table.
const FS_TO_P = [
    24, 12, 8, 6, 4, 4
];

//  Fs to 120/P conversion table.
const FS_TO_120DIVP = [
    5, 10, 15, 20, 30, 30
];

//  Nms to len12.8 conversion table.
const NMS_TO_LEN12P8 = [
    128, 96
];

//  Nms to D_LTPF conversion table.
const NMS_TO_DLTPF = [
    24, 44
];

//  Nms to corrlen conversion table.
const NMS_TO_CORRLEN = [                                            //  Eq. 93
    64, 48
];

//  H50(z) parameters.
const H50_A1 = +1.9652933726226904;
const H50_A2 = -0.9658854605688177;
const H50_B0 = +0.9827947082978771;
const H50_B1 = -1.965589416595754;
const H50_B2 = +0.9827947082978771;

//  Kmin, Kmax.
const KMIN = 17;
const KMAX = 114;
const KWIDTH = (KMAX - KMIN + 1);
const KCOEF = [                                                     //  Eq. 88
    +1.000000000000000, +0.994845360824742, +0.989690721649485, +0.984536082474227,
    +0.979381443298969, +0.974226804123711, +0.969072164948454, +0.963917525773196,
    +0.958762886597938, +0.953608247422680, +0.948453608247423, +0.943298969072165,
    +0.938144329896907, +0.932989690721650, +0.927835051546392, +0.922680412371134,
    +0.917525773195876, +0.912371134020619, +0.907216494845361, +0.902061855670103,
    +0.896907216494845, +0.891752577319588, +0.886597938144330, +0.881443298969072,
    +0.876288659793814, +0.871134020618557, +0.865979381443299, +0.860824742268041,
    +0.855670103092784, +0.850515463917526, +0.845360824742268, +0.840206185567010,
    +0.835051546391753, +0.829896907216495, +0.824742268041237, +0.819587628865979,
    +0.814432989690722, +0.809278350515464, +0.804123711340206, +0.798969072164949,
    +0.793814432989691, +0.788659793814433, +0.783505154639175, +0.778350515463918,
    +0.773195876288660, +0.768041237113402, +0.762886597938144, +0.757731958762887,
    +0.752577319587629, +0.747422680412371, +0.742268041237113, +0.737113402061856,
    +0.731958762886598, +0.726804123711340, +0.721649484536082, +0.716494845360825,
    +0.711340206185567, +0.706185567010309, +0.701030927835051, +0.695876288659794,
    +0.690721649484536, +0.685567010309278, +0.680412371134021, +0.675257731958763,
    +0.670103092783505, +0.664948453608248, +0.659793814432990, +0.654639175257732,
    +0.649484536082474, +0.644329896907216, +0.639175257731959, +0.634020618556701,
    +0.628865979381443, +0.623711340206186, +0.618556701030928, +0.613402061855670,
    +0.608247422680412, +0.603092783505155, +0.597938144329897, +0.592783505154639,
    +0.587628865979381, +0.582474226804124, +0.577319587628866, +0.572164948453608,
    +0.567010309278350, +0.561855670103093, +0.556701030927835, +0.551546391752577,
    +0.546391752577320, +0.541237113402062, +0.536082474226804, +0.530927835051546,
    +0.525773195876289, +0.520618556701031, +0.515463917525773, +0.510309278350515,
    +0.505154639175258, +0.500000000000000
];

//  resfac[Fs] (see Eq. 82):
const RESFACS = [
    0.5, 1, 1, 1, 1, 1
];

//
//  Public classes.
//

/**
 *  LC3 long term postfilter.
 * 
 *  @constructor
 *  @param {Number} Nf
 *    - The frame size.
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3LongTermPostfilter(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];
    let len12p8 = NMS_TO_LEN12P8[index_Nms];                        //  Eq. 80
    let len6p4  = (len12p8 >>> 1);                                  //  Eq. 81
    let D_LTPF = NMS_TO_DLTPF[index_Nms];
    let P = FS_TO_P[index_Fs];
    let P_120Div = FS_TO_120DIVP[index_Fs];
    let resfac = RESFACS[index_Fs];
    let reslen = ((P_120Div << 1) >>> 0) + 1;

    //  Algorithm contexts.
    let gain_params = new Array(2);

    let xs_win = new LC3SlideWindow(NF, NF, 0);
    let x12p8D_win = new LC3SlideWindow(D_LTPF + len12p8, 300, 0);
    let x6p4_win = new LC3SlideWindow(len6p4, 150, 0);

    let h50_z1 = 0;
    let h50_z2 = 0;

    let buf_12p8 = new Array(len12p8);
    let buf_6p4 = new Array(len6p4);
    let buf_downsamp = new Array(5);
    let buf_resamp = new Array(reslen);

    let R6p4_corrfft_nstage;
    let R6p4_corrfft_size;
    {
        let R6p4_corrfft_size_min = KWIDTH + len6p4 - 1;
        R6p4_corrfft_nstage = 1;
        R6p4_corrfft_size = 2;
        while (R6p4_corrfft_size < R6p4_corrfft_size_min) {
            R6p4_corrfft_size = ((R6p4_corrfft_size << 1) >>> 0);
            ++(R6p4_corrfft_nstage);
        }
    }
    let R6p4_corrfft = new FFTCooleyTukeyTransformer(R6p4_corrfft_nstage);
    let R6p4_corrfft_c0 = KWIDTH - 1;
    let R6p4_corrfft_c1 = R6p4_corrfft_size - R6p4_corrfft_c0;
    let R6p4_corrfft_c2 = -KMIN;
    let R6p4_corrfft_c3 = 1 - KWIDTH  - KMIN;
    let R6p4_corrwin1_re = new Array(R6p4_corrfft_size);
    let R6p4_corrwin1_im = new Array(R6p4_corrfft_size);
    let R6p4_corrwin2_re = new Array(R6p4_corrfft_size);
    let R6p4_corrwin2_im = new Array(R6p4_corrfft_size);

    let R12p8 = new Array(17 /*  = 2 * 8 + 1  */);
    let R12p8_buf1 = new Array(len12p8);
    let R12p8_buf2 = new Array(len12p8 + 17);

    let Tprev = KMIN;
    let Tcurr = KMIN;

    let corrlen = NMS_TO_CORRLEN[index_Nms];
    let corrbuf1 = new Array(corrlen);
    let corrbuf2 = new Array(corrlen);
    let corrbuf3 = new Array(corrlen);

    let xi_bufsz = len12p8 + 5;
    let xi_buf1 = new Array(xi_bufsz);
    let xi_buf2 = new Array(xi_bufsz);

    let pitch_present = 0;
    let pitch_int = 0;
    let pitch_fr = 0;

    let nbitsLTPF = 0;

    let pitch_index = 0;

    let nc_ltpf = 0;
    let mem_nc_ltpf = 0;
    let mem_mem_nc_ltpf = 0;

    let ltpf_active = 0;
    let mem_ltpf_active = 0;

    let pitch = 0;
    let mem_pitch = 0;

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} xs 
     *    - The input samples.
     *  @param {Number} nbits 
     *    - The bit count.
     *  @param {Number} nn_flag 
     *    - The near Nyquist flag (i.e. near_nyquist_flag).
     */
    this.update = function(xs, nbits, nn_flag) {
        //  Append xs[n] to its window.
        xs_win.append(xs);

        //  Resampling (3.3.9.3).
        {
            //  The resampling shall be performed using an 
            //  upsampling+low-pass-filtering+downsampling approach.

            //  Eq. 78
            let t0 = resfac * P;
            for (let n = 0, n_mul_15 = 0; n < len12p8; ++n, n_mul_15 += 15) {                 
                let t1 = (n_mul_15 % P);
                let t2 = IntDiv(n_mul_15, P);
                let t3 = 0;

                xs_win.bulkGet(buf_resamp, 0, t2 - 2 * P_120Div, reslen);

                for (
                    let k = 0, tab_off = -120 - t1; 
                    k < reslen; 
                    ++k, tab_off += P
                ) {
                    //  Eq. 79
                    let tab_coeff;
                    if (tab_off > -120 && tab_off < 120) {
                        tab_coeff = TAB_RESAMP_FILTER[tab_off + 119];
                    } else {
                        tab_coeff = 0;
                    }
    
                    t3 += buf_resamp[k] * tab_coeff;
                }
                buf_12p8[n] = t3 * t0;
            }
        }
        // console.log("x12.8[n]=" + buf_12p8.toString());

        //  High-pass filtering (3.3.9.4).
        {
            //  The resampled signal shall be high-pass filtered using a 
            //  2-order IIR filter with a cut-off frequency of 50Hz.

            //  Eq. 83
            for (let n = 0; n < len12p8; ++n) {
                let w =   buf_12p8[n] + h50_z1 * H50_A1 + h50_z2 * H50_A2;
                let y = w * H50_B0 + h50_z1 * H50_B1 + h50_z2 * H50_B2;
                h50_z2 = h50_z1;
                h50_z1 = w;
                buf_12p8[n] = y;
            }
        }
        
        {
            //  The high-pass filtered signal shall be further delayed by
            //  D_LTPF samples:

            //  Eq. 84
            x12p8D_win.append(buf_12p8);
        }

        //  Pitch detection algorithm (3.3.9.5).
        {
            //  The delayed 12.8kHz signal shall be downsampled by a factor
            //  of 2 to 6.4kHz:

            //  Eq. 85
            for (let n = 0, off = -3; n < len6p4; ++n, off += 2) {
                x12p8D_win.bulkGet(buf_downsamp, 0, off, 5);
                buf_6p4[n] = 0.1236796411180537 * buf_downsamp[0] + 
                             0.2353512128364889 * buf_downsamp[1] + 
                             0.2819382920909148 * buf_downsamp[2] + 
                             0.2353512128364889 * buf_downsamp[3] + 
                             0.1236796411180537 * buf_downsamp[4];
            }
            x6p4_win.append(buf_6p4);
        }

        let R6p4;
        {
            //  The autocorrelation of x6.4[n] shall be computed:

            // R6p4 = new Array(KWIDTH);
            // for (let k = KMIN; k <= KMAX; ++k) {
            //     let tmp = 0;
            //     for (let n = 0; n < len6p4; ++n) {
            //         tmp += x6p4_win.get(n) * x6p4_win.get(n - k);
            //     }
            //     R6p4[k - KMIN] = tmp;
            // }
            // console.log("R6.4[n]=" + R6p4.toString());

            //  Eq. 86
            //
            //  The description of the algorithm below can be found at:
            //    [1] https://drive.google.com/file/d/1hF1z5vzoi8aLao8--JGAraRYBwuugFIv/
            x6p4_win.bulkGet(
                R6p4_corrwin1_re, 
                0, 
                0, 
                len6p4
            );
            x6p4_win.bulkGet(
                R6p4_corrwin2_re, 
                0, 
                R6p4_corrfft_c2, 
                len6p4
            );
            x6p4_win.bulkGet(
                R6p4_corrwin2_re, 
                R6p4_corrfft_c1, 
                R6p4_corrfft_c3, 
                R6p4_corrfft_c0
            );
            for (let n = 0; n < len6p4; ++n) {
                R6p4_corrwin1_im[n] = 0;
                R6p4_corrwin2_im[n] = 0;
            }
            for (let n = len6p4; n < R6p4_corrfft_c1; ++n) {
                R6p4_corrwin1_re[n] = 0;
                R6p4_corrwin1_im[n] = 0;
                R6p4_corrwin2_re[n] = 0;
                R6p4_corrwin2_im[n] = 0;
            }
            for (let n = R6p4_corrfft_c1; n < R6p4_corrfft_size; ++n) {
                R6p4_corrwin1_re[n] = 0;
                R6p4_corrwin1_im[n] = 0;
                R6p4_corrwin2_im[n] = 0;
            }
            R6p4_corrfft.transform(R6p4_corrwin1_re, R6p4_corrwin1_im);
            R6p4_corrfft.transform(R6p4_corrwin2_re, R6p4_corrwin2_im);
            for (let k = 0; k < R6p4_corrfft_size; ++k) {
                let a_re = R6p4_corrwin1_re[k], a_im = -R6p4_corrwin1_im[k];
                let b_re = R6p4_corrwin2_re[k], b_im = R6p4_corrwin2_im[k];
                R6p4_corrwin1_re[k] = (a_re * b_re - a_im * b_im) / R6p4_corrfft_size;
                R6p4_corrwin1_im[k] = (a_re * b_im + a_im * b_re) / R6p4_corrfft_size;
            }
            R6p4_corrfft.transform(R6p4_corrwin1_re, R6p4_corrwin1_im);

            R6p4 = R6p4_corrwin1_re;
            // console.log("R6p4[]=" + R6p4.slice(0, KWIDTH).toString());
        }

        {
            //  The autocorrelation shall be weighted:

            //  Eq. 87
            for (let k = 0; k < KWIDTH; ++k) {
                R6p4[k] *= KCOEF[k];
            }
        }

        let T1 = 0;
        {
            //  The first estimate of the pitch-lag T1 shall be the lag that 
            //  maximizes the weighted autocorrelation.

            //  Eq. 89
            let T1max = -Infinity;
            for (let k = 0; k < KWIDTH; ++k) {
                let tmp = R6p4[k];
                if (tmp > T1max) {
                    T1max = tmp;
                    T1 = KMIN + k;
                }
            }
        }
        // console.log("T1=" + T1.toString());

        let T2 = 0;
        {
            //  The second estimate of the pitch-lag T2 shall be the lag that 
            //  maximizes the non-weighted autocorrelation in the neighborhood of 
            //  the pitch-lag estimated in the previous frame.

            //  Eq. 90
            let T2kmin = Math.max(KMIN, Tprev - 4),
                T2kmax = Math.min(KMAX, Tprev + 4),
                T2max  = -Infinity;
            for (let k = T2kmin; k <= T2kmax; ++k) {
                let tmp = R6p4[k - KMIN];
                if (tmp > T2max) {
                    T2max = tmp;
                    T2 = k;
                }
            }
        }
        // console.log("T2=" + T2.toString());

        let normcorr = 0;
        {
            //  Final estimate of the pitch-lag in the current frame.

            //  Eq. 91, 92
            //
            //  Note(s):
            //    [1] normcorr(x6.4, corrlen, T1) = T1norm_numer / T1norm_denom
            //    [2] normcorr(x6.4, corrlen, T2) = T2norm_numer / T2norm_denom
            let T1norm_numer = 0, T1norm_denom = 0;
            let T2norm_numer = 0, T2norm_denom = 0;
            let T1norm_denom1 = 0, T1norm_denom2 = 0;
            let T2norm_denom1 = 0, T2norm_denom2 = 0;

            x6p4_win.bulkGet(corrbuf1, 0, 0, corrlen);
            x6p4_win.bulkGet(corrbuf2, 0, -T1, corrlen);
            x6p4_win.bulkGet(corrbuf3, 0, -T2, corrlen);

            for (let n = 0; n < corrlen; ++n) {
                let c1 = corrbuf1[n];
                let c2 = corrbuf2[n];
                T1norm_numer += c1 * c2;
                T1norm_denom1 += c1 * c1;
                T1norm_denom2 += c2 * c2;

                c2 = corrbuf3[n];
                T2norm_numer += c1 * c2;
                T2norm_denom1 += c1 * c1;
                T2norm_denom2 += c2 * c2;
            }

            if (T1norm_numer < 0) {
                //  normcorr(x6.4, corrlen, T1) = max(
                //      0, T1norm_numer / T1norm_denom
                //  ):
                T1norm_numer = 0;
                T1norm_denom = 1;
            } else {
                T1norm_denom = Math.sqrt(T1norm_denom1 * T1norm_denom2);

                //  To avoid divide-by-zero problem, ensure the denominator 
                //  non-zero.
                if (T1norm_denom < 1e-31) {
                    T1norm_denom = 1e-31;
                }
            }

            if (T2norm_numer < 0) {
                //  normcorr(x6.4, corrlen, T2) = max(
                //      0, T2norm_numer / T2norm_denom
                //  ):
                T2norm_numer = 0;
                T2norm_denom = 1;
            } else {
                T2norm_denom = Math.sqrt(T2norm_denom1 * T2norm_denom2);

                //  To avoid divide-by-zero problem, ensure the denominator 
                //  non-zero.
                if (T2norm_denom < 1e-31) {
                    T2norm_denom = 1e-31;
                }
            }
            // console.log("normcorr1=" + (T1norm_numer / T1norm_denom).toString());
            // console.log("normcorr2=" + (T2norm_numer / T2norm_denom).toString());

            //  The final estimate of the pitch-lag in the current frame is then 
            //  given by:

            //  Eq. 91
            if (
                T2norm_numer * T1norm_denom <= 
                0.85 * T1norm_numer * T2norm_denom
            ) {
                Tcurr = T1;
                normcorr = T1norm_numer / T1norm_denom;
            } else {
                Tcurr = T2;
                normcorr = T2norm_numer / T2norm_denom;
            }
        }
        // console.log("Tcurr=" + Tcurr.toString());
        // console.log("normcorr=" + normcorr.toString());

        //  LTPF Bitstream (3.3.9.6).
        {
            if (normcorr > 0.6) {
                //  Eq. 94
                pitch_present = 1;

                //  Eq. 95
                nbitsLTPF = 11;

                //  LTPF pitch-lag parameter (3.3.9.7).
                let kminII = Math.max(32, 2 * Tcurr - 4);
                let kmaxII = Math.min(228, 2 * Tcurr + 4);
                {
                    //  Get the integer part of the LTPF pitch-lag parameter.

                    //  Eq. 97
                    let koff = kmaxII + 4;
                    x12p8D_win.bulkGet(R12p8_buf1, 0, 0, len12p8);
                    x12p8D_win.bulkGet(R12p8_buf2, 0, -koff, len12p8 + 17);
                    for (let k = kminII - 4, p = 0; k <= koff; ++k, ++p) {
                        let tmp = 0; 
                        for (let n = 0; n < len12p8; ++n) {
                            tmp += R12p8_buf1[n] * R12p8_buf2[koff + n - k];
                        }
                        R12p8[p] = tmp;
                    }

                    //  Eq. 96
                    let R12p8_max = -Infinity;
                    for (let k = kminII, p = 4; k <= kmaxII; ++k, ++p) {
                        let R12p8_p = R12p8[p];
                        if (R12p8_p > R12p8_max) {
                            pitch_int = k;
                            R12p8_max = R12p8_p;
                        }
                    }
                }
                // console.log("R12.8[k]=" + R12p8.toString());

                {
                    //  Get the fractional part of the LTPF pitch-lag.

                    //  Eq. 98
                    if (pitch_int >= 157) {
                        pitch_fr = 0;
                    } else {
                        let dlow, dhigh, dstep;
                        if (pitch_int >= 127 && pitch_int < 157) {
                            //  d = -2, 0, 2
                            dlow = -2;
                            dhigh = 2;
                            dstep = 2;
                        } else if (pitch_int > 32) {
                            //  d = -3...3
                            dlow = -3;
                            dhigh = 3;
                            dstep = 1;
                        } else {
                            //  d = 0...3
                            dlow = 0;
                            dhigh = 3;
                            dstep = 1;
                        }

                        let interp_max = -Infinity;
                        for (let d = dlow; d <= dhigh; d += dstep) {
                            //  Eq. 99
                            let interp_d = 0;
                            for (
                                let m = -4, 
                                    i1 = pitch_int - kminII, 
                                    i2 = -16 - d; 
                                m <= 4; 
                                ++m, ++i1, i2 += 4
                            ) {
                                //  Eq. 100
                                let h4_coeff;
                                if (i2 > -16 && i2 < 16) {
                                    h4_coeff = TAB_LTPF_INTERP_R[i2 + 15];
                                } else {
                                    h4_coeff = 0;
                                }

                                //  Eq. 99, R12.8[pitch_int + m] * h4[4m - d].
                                interp_d += R12p8[i1] * h4_coeff;
                            }

                            //  Eq. 98, argmax(interp(d)).
                            if (interp_d > interp_max) {
                                interp_max = interp_d;
                                pitch_fr = d;
                            }
                        }

                        //  If pitch_fr < 0 then both pitch_int and pitch_fr 
                        //  shall be modified.

                        //  Eq. 101
                        if (pitch_fr < 0) {
                            --(pitch_int);
                            pitch_fr += 4;
                        }             
                    }
                }

                {
                    //  Finally, the pitch-lag parameter index that is later 
                    //  written to the output bitstream shall be:

                    //  Eq. 102
                    if (pitch_int >= 157) {
                        pitch_index = pitch_int + 283;
                    } else if (pitch_int >= 127) {
                        //  pitch_index = 2 * pitch_int + floor(pitch_fr / 2) + 
                        //                126
                        pitch_index = 2 * pitch_int + (pitch_fr >>> 1) + 126;
                    } else {
                        pitch_index = 4 * pitch_int + pitch_fr - 128;
                    }
                }
                // console.log("pitch_int=" + pitch_int.toString());
                // console.log("pitch_fr=" + pitch_fr.toString());
                // console.log("pitch_index=" + pitch_index.toString());

                {
                    //  LTPF activation bit (3.3.9.8).

                    //  A normalized correlation shall first be computed:
                    let nc_numer = 0, nc_denom1 = 0, nc_denom2 = 0;
                    x12p8D_win.bulkGet(xi_buf1, 0, -2, xi_bufsz);
                    x12p8D_win.bulkGet(xi_buf2, 0, -2 - pitch_int, xi_bufsz);
                    for (let n = 0; n < len12p8; ++n) {
                        //  Eq. 104
                        //
                        //  Note(s):
                        //    [1] t1 = xi(n, 0),
                        //    [2] t2 = xi(n - pitch_int, pitch_fr).
                        let t1 = 0;
                        let t2 = 0;
                        for (let k = 0, p = -8; k <= 4; ++k, p += 4) {
                            let hi_coeff;

                            //  Eq. 105, hi(4(k - 2)).
                            if (p > -8 && p < 8) {
                                hi_coeff = TAB_LTPF_INTERP_X12K8[p + 7];
                            } else {
                                hi_coeff = 0;
                            }

                            //  Eq. 104, x12.8_D(n - (k - 2)) * hi(4(k - 2)).
                            let xi_off = n - k + 4;
                            t1 += hi_coeff * xi_buf1[xi_off];

                            //  Eq. 105, hi(4(k - 2) - pitch_fr).
                            let p2 = p - pitch_fr;
                            if (p > -8 && p < 8) {
                                hi_coeff = TAB_LTPF_INTERP_X12K8[p2 + 7];
                            } else {
                                hi_coeff = 0;
                            }

                            //  Eq. 105, x12.8_D(n - pitch_int - (k - 2)) * 
                            //  hi(4(k - 2) - pitch_int).
                            t2 += hi_coeff * xi_buf2[xi_off];
                        }

                        //  Eq. 103, xi(n, 0) * xi(n - pitch_int, pitch_fr)
                        nc_numer += t1 * t2;

                        //  Eq. 103, xi(n, 0) ^ 2
                        nc_denom1 += t1 * t1;

                        //  Eq. 103, xi(n - pitch_int, pitch_fr) ^ 2
                        nc_denom2 += t2 * t2;
                    }

                    //  Eq. 103
                    nc_denom1 = Math.sqrt(nc_denom1 * nc_denom2);
                    if (nc_denom1 < 1e-31) {
                        nc_denom1 = 1e-31;
                    }
                    nc_ltpf = nc_numer / nc_denom1;
                }
                // console.log("nc_ltpf=" + nc_ltpf.toString());

                //  Calculate pitch.
                pitch = pitch_int + pitch_fr / 4;
                // console.log("pitch=" + pitch.toString());

                //  Get gain_ltpf.
                GetGainParameters(Nms, Fs, nbits, gain_params);
                let gain_ltpf = gain_params[0];
                // console.log("gain_ltpf=" + gain_ltpf.toString());
                // console.log("gain_ind=" + gain_params[1].toString());

                {
                    //  The LTPF activation bit shall then be set according to:
                    if (
                        nn_flag == 0 &&     /*  The value of ltpf_active is  */
                                            /*  set to 0 if the              */
                                            /*  near_nyquist_flag is 1.      */
                        gain_ltpf >= 1e-31
                    ) {
                        let us = Nms.toMicroseconds();
                        if (
                            (
                                mem_ltpf_active == 0 && 
                                (us == 10000 || mem_mem_nc_ltpf > 0.94) && 
                                mem_nc_ltpf > 0.94 && 
                                nc_ltpf > 0.94
                            ) || 
                            (
                                mem_ltpf_active == 1 && 
                                nc_ltpf > 0.9
                            ) || 
                            (
                                mem_ltpf_active == 1 && 
                                Math.abs(pitch - mem_pitch) < 2 && 
                                (nc_ltpf - mem_nc_ltpf) > -0.1 && 
                                nc_ltpf > 0.84
                            )
                        ) {
                            ltpf_active = 1;
                        } else {
                            ltpf_active = 0;
                        }
                    } else {
                        ltpf_active = 0;
                    }
                }
            } else {
                //  Eq. 94
                pitch_present = 0;

                //  Eq. 95
                nbitsLTPF = 1;

                //  Reset pitch variables.
                pitch_int = 0;
                pitch_fr = 0;
                pitch_index = 0;
                pitch = 0;

                //  Reset LTPF variables.
                nc_ltpf = 0;
                ltpf_active = 0;
            }
        }
        // console.log("pitch_present=" + pitch_present.toString());
        // console.log("ltpf_active=" + ltpf_active.toString());

        //  Memorize Tcurr, nc_ltpf (and mem_nc_ltpf), ltpf_active and pitch.
        Tprev = Tcurr;
        mem_mem_nc_ltpf = mem_nc_ltpf;
        mem_nc_ltpf = nc_ltpf;
        mem_ltpf_active = ltpf_active;
        mem_pitch = pitch;
    };

    /**
     *  Get encoder parameters (i.e. nbitsLTPF, pitch_present, ltpf_active and 
     *  pitch_index).
     * 
     *  @throws {LC3IllegalParameterError}
     *    - R has an incorrect size (!= 4).
     *  @param {Number[]} [R]
     *    - The returned array buffer (used for reducing array allocation).
     *  @returns {Number[]}
     *    - An array (denotes as R[0...3]), where:
     *      - R[0] = nbitsLTPF,
     *      - R[1] = pitch_present,
     *      - R[2] = ltpf_active,
     *      - R[3] = pitch_index.
     */
    this.getEncoderParameters = function(R = new Array(4)) {
        //  Check the size of R.
        if (R.length != 4) {
            throw new LC3IllegalParameterError(
                "R has an incorrect size (!= 4)."
            );
        }

        //  Write encoder parameters.
        R[0] = nbitsLTPF;
        R[1] = pitch_present;
        R[2] = ltpf_active;
        R[3] = pitch_index;

        return R;
    };
}

//  Export public APIs.
module.exports = {
    "LC3LongTermPostfilter": LC3LongTermPostfilter
};