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
const Lc3SlideWin = 
    require("./../common/slide_window");
const Lc3ArrayUtil = 
    require("./../common/array_util");
const Lc3LtpfCommon = 
    require("./../common/ltpf-common");
const Lc3Fft = 
    require("./../math/fft");
const Lc3TblLtpf = 
    require("./../tables/ltpf");
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
const FFT = 
    Lc3Fft.FFT;

//  Imported functions.
const GetGainParameters = 
    Lc3LtpfCommon.GetGainParameters;
const ArrayFlip = 
    Lc3ArrayUtil.ArrayFlip;

//  Imported constants.
const TAB_RESAMP_FILTER = 
    Lc3TblLtpf.TAB_RESAMP_FILTER;
const TAB_LTPF_INTERP_R = 
    Lc3TblLtpf.TAB_LTPF_INTERP_R;
const TAB_LTPF_INTERP_X12K8 = 
    Lc3TblLtpf.TAB_LTPF_INTERP_X12K8;

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
const H50_A1 = 1.9652933726226904;
const H50_A2 = -0.9658854605688177;
const H50_B0 = 0.9827947082978771;
const H50_B1 = -1.965589416595754;
const H50_B2 = 0.9827947082978771;

//  Kmin, Kmax.
const KMIN = 17;
const KMAX = 114;
const KWIDTH = (KMAX - KMIN + 1);
const KCOEF = [                                                     //  Eq. 88
    1.0, 0.9948453608247423, 0.9896907216494846, 
    0.9845360824742269, 0.979381443298969, 0.9742268041237113, 
    0.9690721649484536, 0.9639175257731959, 0.9587628865979382, 
    0.9536082474226804, 0.9484536082474226, 0.9432989690721649, 
    0.9381443298969072, 0.9329896907216495, 0.9278350515463918, 
    0.9226804123711341, 0.9175257731958762, 0.9123711340206185, 
    0.9072164948453608, 0.9020618556701031, 0.8969072164948454, 
    0.8917525773195876, 0.8865979381443299, 0.8814432989690721, 
    0.8762886597938144, 0.8711340206185567, 0.865979381443299, 
    0.8608247422680413, 0.8556701030927836, 0.8505154639175257, 
    0.845360824742268, 0.8402061855670103, 0.8350515463917526, 
    0.8298969072164948, 0.8247422680412371, 0.8195876288659794, 
    0.8144329896907216, 0.8092783505154639, 0.8041237113402062, 
    0.7989690721649485, 0.7938144329896908, 0.788659793814433, 
    0.7835051546391752, 0.7783505154639175, 0.7731958762886598, 
    0.768041237113402, 0.7628865979381443, 0.7577319587628866, 
    0.7525773195876289, 0.7474226804123711, 0.7422680412371134, 
    0.7371134020618557, 0.731958762886598, 0.7268041237113403, 
    0.7216494845360825, 0.7164948453608248, 0.711340206185567, 
    0.7061855670103092, 0.7010309278350515, 0.6958762886597938, 
    0.6907216494845361, 0.6855670103092784, 0.6804123711340206, 
    0.6752577319587629, 0.6701030927835052, 0.6649484536082475, 
    0.6597938144329897, 0.654639175257732, 0.6494845360824743, 
    0.6443298969072164, 0.6391752577319587, 0.634020618556701, 
    0.6288659793814433, 0.6237113402061856, 0.6185567010309279, 
    0.6134020618556701, 0.6082474226804124, 0.6030927835051547, 
    0.5979381443298969, 0.5927835051546392, 0.5876288659793815, 
    0.5824742268041236, 0.5773195876288659, 0.5721649484536082, 
    0.5670103092783505, 0.5618556701030928, 0.5567010309278351, 
    0.5515463917525774, 0.5463917525773196, 0.5412371134020619, 
    0.5360824742268041, 0.5309278350515464, 0.5257731958762887, 
    0.5206185567010309, 0.5154639175257731, 0.5103092783505154, 
    0.5051546391752577, 0.5
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
function LC3LongTermPostfilter(Nf, Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Algorithm contexts.
    let gain_params = new Array(2);

    let len12p8 = NMS_TO_LEN12P8[index_Nms];                        //  Eq. 80
    let len6p4  = (len12p8 >>> 1);                                  //  Eq. 81

    let D_LTPF = NMS_TO_DLTPF[index_Nms];

    let P = FS_TO_P[index_Fs];
    let P_120Div = FS_TO_120DIVP[index_Fs];

    let resfac = (Fs === LC3SampleRate.FS_08000 ? 0.5 : 1);         //  Eq. 82

    let xs_win = new LC3SlideWindow(Nf, Nf, 0);
    let x12p8D_win = new LC3SlideWindow(D_LTPF + len12p8, 300, 0);
    let x6p4_win = new LC3SlideWindow(len6p4, 150, 0);

    let h50_z1 = 0;
    let h50_z2 = 0;

    let buf_12p8 = new Array(len12p8);
    let buf_6p4 = new Array(len6p4);
    
    let R6p4_corrfft_size = KWIDTH + len6p4;
    let R6p4_corrfft = new FFT(R6p4_corrfft_size);
    let R6p4_corrwin1_re = new Array(R6p4_corrfft_size);
    let R6p4_corrwin1_im = new Array(R6p4_corrfft_size);
    let R6p4_corrwin2_re = new Array(R6p4_corrfft_size);
    let R6p4_corrwin2_im = new Array(R6p4_corrfft_size);

    let R12p8 = new Array(17 /*  = 2 * 8 + 1  */);

    let Tprev = KMIN;
    let Tcurr = KMIN;

    let corrlen = NMS_TO_CORRLEN[index_Nms];

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
        let resfacMulP = resfac * P;                                //  Eq. 78
        for (let n = 0; n < len12p8; ++n) {                 
            let t0 = 15 * n;
            let t1 = (t0 % P);
            let t2 = Math.trunc(t0 / P);
            let t3 = 0;
            for (
                let k = -P_120Div, 
                    h12p8_off = -120 - t1, 
                    xs_off = t2 - 2 * P_120Div; 
                k <= P_120Div; 
                ++k, h12p8_off += P, ++xs_off
            ) {
                let h12p8_coeff;                                    //  Eq. 79
                if (h12p8_off > -120 && h12p8_off < 120) {
                    h12p8_coeff = TAB_RESAMP_FILTER[h12p8_off + 119];
                } else {
                    h12p8_coeff = 0;
                }

                t3 += xs_win.get(xs_off) * h12p8_coeff;
            }
            buf_12p8[n] = t3 * resfacMulP;
        }
        // console.log("x12.8[n]=" + buf_12p8.toString());

        //  High-pass filtering (3.3.9.4).
        for (let n = 0; n < len12p8; ++n) {                         //  Eq. 83
            let w =   buf_12p8[n] + h50_z1 * H50_A1 + h50_z2 * H50_A2;
            let y = w * H50_B0 + h50_z1 * H50_B1 + h50_z2 * H50_B2;
            h50_z2 = h50_z1;
            h50_z1 = w;
            buf_12p8[n] = y;
        }
        x12p8D_win.append(buf_12p8);                                //  Eq. 84

        //  Pitch detection algorithm (3.3.9.5).
        for (let n = 0, nMul2 = 0; n < len6p4; ++n, nMul2 += 2) {   //  Eq. 85
            buf_6p4[n] = 0.1236796411180537 * x12p8D_win.get(nMul2 - 3) + 
                         0.2353512128364889 * x12p8D_win.get(nMul2 - 2) + 
                         0.2819382920909148 * x12p8D_win.get(nMul2 - 1) + 
                         0.2353512128364889 * x12p8D_win.get(nMul2) + 
                         0.1236796411180537 * x12p8D_win.get(nMul2 + 1);
        }
        x6p4_win.append(buf_6p4);

        // let R6p4 = new Array(KWIDTH);
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
        //  https://drive.google.com/file/d/1dZAhud_iM8QmI2uDRyuNd2-XERDJ2ViX/
        x6p4_win.bulkGet(R6p4_corrwin1_re, 0, 0, len6p4);
        x6p4_win.bulkGet(R6p4_corrwin2_re, 0, 1 - KWIDTH - KMIN, KWIDTH);
        x6p4_win.bulkGet(R6p4_corrwin2_re, KWIDTH, 1 - KMIN, len6p4);
        ArrayFlip(R6p4_corrwin2_re, 0, KWIDTH);
        ArrayFlip(R6p4_corrwin2_re, KWIDTH, R6p4_corrfft_size);
        for (let k = 0; k < len6p4; ++k) {
            R6p4_corrwin1_im[k] = 0;
            R6p4_corrwin2_im[k] = 0;
        }
        for (let k = len6p4; k < R6p4_corrfft_size; ++k) {
            R6p4_corrwin1_re[k] = 0;
            R6p4_corrwin1_im[k] = 0;
            R6p4_corrwin2_im[k] = 0;
        }
        R6p4_corrfft.transform(R6p4_corrwin1_re, R6p4_corrwin1_im);
        R6p4_corrfft.transform(R6p4_corrwin2_re, R6p4_corrwin2_im);
        for (let k = 0; k < R6p4_corrfft_size; ++k) {
            let a_re = R6p4_corrwin1_re[k], a_im = R6p4_corrwin1_im[k];
            let b_re = R6p4_corrwin2_re[k], b_im = R6p4_corrwin2_im[k];
            R6p4_corrwin1_re[k] = a_re * b_re - a_im * b_im;
            R6p4_corrwin1_im[k] = a_re * b_im + a_im * b_re;
        }
        R6p4_corrfft.transformInverse(R6p4_corrwin1_re, R6p4_corrwin1_im);

        //  The first estimate of the pitch-lag T1 shall be the lag that 
        //  maximizes the weighted autocorrelation.
        let T1max = -Infinity, 
            T1    = -1;
        for (let k = 0; k < KWIDTH; ++k) {                          //  Eq. 89
            let tmp = R6p4_corrwin1_re[k] * KCOEF[k];               //  Eq. 87
            if (tmp > T1max) {
                T1max = tmp;
                T1 = KMIN + k;
            }
        }
        // console.log("T1=" + T1.toString());

        //  The second estimate of the pitch-lag T2 shall be the lag that 
        //  maximizes the non-weighted autocorrelation in the neighborhood of 
        //  the pitch-lag estimated in the previous frame.
        let T2kmin = Math.max(KMIN, Tprev - 4),
            T2kmax = Math.min(KMAX, Tprev + 4),
            T2max  = -Infinity,
            T2     = -1;
        for (let k = T2kmin; k <= T2kmax; ++k) {                    //  Eq. 90
            let tmp = R6p4_corrwin1_re[k - KMIN];
            if (tmp > T2max) {
                T2max = tmp;
                T2 = k;
            }
        }
        // console.log("T2=" + T2.toString());

        //  Final estimate of the pitch-lag in the current frame. 
        let T1norm_numer = 0, T1norm_denom = 0;
        let T2norm_numer = 0, T2norm_denom = 0;
        {                                                       //  Eq. 91, 92
            let T1norm_denom1 = 0, T1norm_denom2 = 0;
            let T2norm_denom1 = 0, T2norm_denom2 = 0;

            for (let n = 0, i1 = -T1, i2 = -T2; n < corrlen; ++n, ++i1, ++i2) {
                let c1 = x6p4_win.get(n);
                let c2 = x6p4_win.get(i1);
                T1norm_numer += c1 * c2;
                T1norm_denom1 += c1 * c1;
                T1norm_denom2 += c2 * c2;

                c1 = x6p4_win.get(n);
                c2 = x6p4_win.get(i2);
                T2norm_numer += c1 * c2;
                T2norm_denom1 += c1 * c1;
                T2norm_denom2 += c2 * c2;
            }

            if (T1norm_numer < 0) {
                T1norm_numer = 0;
                T1norm_denom = 1;
            } else {
                T1norm_denom = Math.sqrt(T1norm_denom1 * T1norm_denom2);
                if (T1norm_denom < 1e-31) {
                    T1norm_denom = 1e-31;
                }
            }

            if (T2norm_numer < 0) {
                T2norm_numer = 0;
                T2norm_denom = 1;
            } else {
                T2norm_denom = Math.sqrt(T2norm_denom1 * T2norm_denom2);
                if (T2norm_denom < 1e-31) {
                    T2norm_denom = 1e-31;
                }
            }
        }
        // console.log("normcorr1=" + (T1norm_numer / T1norm_denom).toString());
        // console.log("normcorr2=" + (T2norm_numer / T2norm_denom).toString());

        //  The final estimate of the pitch-lag in the current frame is then 
        //  given by:
        let normcorr;
        if (                                                        //  Eq. 91
            T2norm_numer * T1norm_denom <= 
            0.85 * T1norm_numer * T2norm_denom
        ) {
            Tcurr = T1;
            normcorr = T1norm_numer / T1norm_denom;
        } else {
            Tcurr = T2;
            normcorr = T2norm_numer / T2norm_denom;
        }
        // console.log("Tcurr=" + Tcurr.toString());
        // console.log("normcorr=" + normcorr.toString());

        if (normcorr > 0.6) {                                       //  Eq. 94
            pitch_present = 1;                                      //  Eq. 95
            nbitsLTPF = 11;

            //  LTPF pitch-lag parameter (3.3.9.7).

            //  Get the integer part of the LTPF pitch-lag parameter.
            let kminII = Math.max(32, 2 * Tcurr - 4);               //  Eq. 97
            let kmaxII = Math.min(228, 2 * Tcurr + 4);
            for (let k = kminII - 4, p = 0; k <= kmaxII + 4; ++k, ++p) {
                let tmp = 0;
                for (let n = 0; n < len12p8; ++n) {
                    tmp += x12p8D_win.get(n) * x12p8D_win.get(n - k);
                }
                R12p8[p] = tmp;
            }
            // console.log("R12.8[k]=" + R12p8.toString());

            let R12p8_max = -Infinity;                              //  Eq. 96
            for (let k = kminII, p = 4; k <= kmaxII; ++k, ++p) {
                let R12p8_p = R12p8[p];
                if (R12p8_p > R12p8_max) {
                    pitch_int = k;
                    R12p8_max = R12p8_p;
                }
            }

            //  Get the fractional part of the LTPF pitch-lag.
            if (pitch_int >= 157) {                                 //  Eq. 98
                pitch_fr = 0;
            } else {
                let dlow, dhigh, dstep;
                if (pitch_int >= 127 && pitch_int < 157) {
                    dlow = -2;
                    dhigh = 2;
                    dstep = 2;
                } else if (pitch_int > 32) {
                    dlow = -3;
                    dhigh = 3;
                    dstep = 1;
                } else {
                    dlow = 0;
                    dhigh = 3;
                    dstep = 1;
                }

                let interp_max = -Infinity;
                for (let d = dlow; d <= dhigh; d += dstep) {
                    let interp_d = 0;                               //  Eq. 99
                    for (
                        let m = -4, i1 = pitch_int - kminII, i2 = -16 - d; 
                        m <= 4; 
                        ++m, ++i1, i2 += 4
                    ) {
                        interp_d += R12p8[i1] * (                  //  Eq. 100
                            (i2 > -16 && i2 < 16) ? 
                            TAB_LTPF_INTERP_R[i2 + 15] : 
                            0
                        );
                    }
                    if (interp_d > interp_max) {
                        interp_max = interp_d;
                        pitch_fr = d;
                    }
                }

                //  If pitch_fr < 0 then both pitch_int and pitch_fr shall be 
                //  modified.
                if (pitch_fr < 0) {                                //  Eq. 101
                    --(pitch_int);
                    pitch_fr += 4;
                }             
            }

            //  Finally, the pitch-lag parameter index that is later written to 
            //  the output bitstream shall be:
            if (pitch_int >= 157) {                                //  Eq. 102
                pitch_index = pitch_int + 283;
            } else if (pitch_int >= 127) {
                pitch_index = 2 * pitch_int + (pitch_fr >>> 1) + 126;
            } else {
                pitch_index = 4 * pitch_int + pitch_fr - 128;
            }
            // console.log("pitch_int=" + pitch_int.toString());
            // console.log("pitch_fr=" + pitch_fr.toString());
            // console.log("pitch_index=" + pitch_index.toString());

            //  LTPF activation bit (3.3.9.8).
            let xi_0 = new Array(len12p8);                         //  Eq. 104
            let xi_fr = new Array(len12p8);
            for (let n = 0; n < len12p8; ++n) {
                let t1 = 0;
                let t2 = 0;
                for (
                    let k = -2, p1 = -8, p2 = -8 - pitch_fr; 
                    k <= 2; 
                    ++k, p1 += 4, p2 += 4
                ) {
                    t1 += x12p8D_win.get(n - k) * (                //  Eq. 105
                        (p1 > -8 && p1 < 8) ? TAB_LTPF_INTERP_X12K8[p1 + 7] : 0
                    );
                    t2 += x12p8D_win.get(n - pitch_int - k) * (    //  Eq. 105
                        (p2 > -8 && p2 < 8) ? TAB_LTPF_INTERP_X12K8[p2 + 7] : 0
                    )
                }
                xi_0[n] = t1;
                xi_fr[n] = t2;
            }

            //  A normalized correlation shall first be computed as Eq. 103:
            let nc_numer = 0, nc_denom1 = 0, nc_denom2 = 0;
            for (let n = 0; n < len12p8; ++n) {                    //  Eq. 103
                let t1 = xi_0[n], t2 = xi_fr[n];
                nc_numer += t1 * t2;
                nc_denom1 += t1 * t1;
                nc_denom2 += t2 * t2;
            }
            nc_denom1 = Math.sqrt(nc_denom1 * nc_denom2);
            if (nc_denom1 < 1e-31) {
                nc_denom1 = 1e-31;
            }
            nc_ltpf = nc_numer / nc_denom1;
            // console.log("nc_ltpf=" + nc_ltpf.toString());

            //  Calculate pitch.
            pitch = pitch_int + pitch_fr / 4;
            // console.log("pitch=" + pitch.toString());

            //  Get gain_ltpf.
            GetGainParameters(Nms, Fs, nbits, gain_params);
            let gain_ltpf = gain_params[0];
            // console.log("gain_ltpf=" + gain_ltpf.toString());
            // console.log("gain_ind=" + gain_params[1].toString());

            //  The LTPF activation bit shall then be set according to:
            if (
                nn_flag == 0 &&     /*  The value of ltpf_active is set to 0  */
                                    /*  if the near_nyquist_flag in Section   */
                                    /*  3.3.4.5 is 1.                         */
                gain_ltpf >= 1e-31
            ) {
                if (
                    (
                        mem_ltpf_active == 0 && 
                        (
                            Nms === LC3FrameDuration.NMS_10000US || 
                            mem_mem_nc_ltpf > 0.94
                        ) && 
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
        } else {
            pitch_present = 0;                                      //  Eq. 95
            nbitsLTPF = 1;

            pitch_int = 0;
            pitch_fr = 0;
            pitch_index = 0;
            pitch = 0;

            nc_ltpf = 0;
            ltpf_active = 0;
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
    }
}

//  Export public APIs.
module.exports = {
    "LC3LongTermPostfilter": LC3LongTermPostfilter
};