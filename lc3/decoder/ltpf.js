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
    require("../common/fs");
const Lc3LtpfCommon = 
    require("./../common/ltpf-common");
const Lc3Nms = 
    require("./../common/nms");
const Lc3SlideWin = 
    require("./../common/slide_window");
const Lc3TblNF = 
    require("./../tables/nf");
const Lc3TblLtpf = 
    require("./../tables/ltpf");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3SlideWindow = 
    Lc3SlideWin.LC3SlideWindow;

//  Imported functions.
const GetGainParameters = 
    Lc3LtpfCommon.GetGainParameters;

//  Imported constants.
const TAB_LTPF_NUM_8000 = 
    Lc3TblLtpf.TAB_LTPF_NUM_8000;
const TAB_LTPF_NUM_16000 = 
    Lc3TblLtpf.TAB_LTPF_NUM_16000;
const TAB_LTPF_NUM_24000 = 
    Lc3TblLtpf.TAB_LTPF_NUM_24000;
const TAB_LTPF_NUM_32000 = 
    Lc3TblLtpf.TAB_LTPF_NUM_32000;
const TAB_LTPF_NUM_48000 = 
    Lc3TblLtpf.TAB_LTPF_NUM_48000;
const TAB_LTPF_DEN_8000 = 
    Lc3TblLtpf.TAB_LTPF_DEN_8000;
const TAB_LTPF_DEN_16000 = 
    Lc3TblLtpf.TAB_LTPF_DEN_16000;
const TAB_LTPF_DEN_24000 = 
    Lc3TblLtpf.TAB_LTPF_DEN_24000;
const TAB_LTPF_DEN_32000 = 
    Lc3TblLtpf.TAB_LTPF_DEN_32000;
const TAB_LTPF_DEN_48000 = 
    Lc3TblLtpf.TAB_LTPF_DEN_48000;
const NF_TBL = 
    Lc3TblNF.NF_TBL;

//
//  Constants.
//

//  Fs to `norm` table. (where norm = (NF / 4) * (10 / Nms) = fs * fscal / 400).
const NORM_TBL = [
    20, 40, 60, 80, 120, 120
];

//  PITCHFS_FACTOR[fs] = 8000 * ceil(fs / 8000) / 12800
const PITCHFS_FACTOR = [
    0.625, 1.25, 1.875, 2.5, 3.75, 3.75
];

//  L_den table.
const LDEN_TBL = [
    4, 4, 6, 8, 12, 12
];

//  Fs to TAB_LTPF_NUM_* table:
const TAB_LTPF_NUM_TBL = [
    TAB_LTPF_NUM_8000,
    TAB_LTPF_NUM_16000,
    TAB_LTPF_NUM_24000,
    TAB_LTPF_NUM_32000,
    TAB_LTPF_NUM_48000,
    TAB_LTPF_NUM_48000
];

//  Fs to TAB_LTPF_DEN_* table:
const TAB_LTPF_DEN_TBL = [
    TAB_LTPF_DEN_8000,
    TAB_LTPF_DEN_16000,
    TAB_LTPF_DEN_24000,
    TAB_LTPF_DEN_32000,
    TAB_LTPF_DEN_48000,
    TAB_LTPF_DEN_48000
];

//  History size of x_ltpf_hat[] window.
const X_LTPF_HAT_WIN_HISTORY_SIZE = [
    [
        300, 300, 300, 320, 480, 480
    ],
    [
        300, 300, 360, 480, 720, 720
    ]
];

//
//  Public classes.
//

/**
 *  LC3 Long Term Postfilter (LTPF) decoder-side implementation.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3LongTermPostfilterDecoder(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];
    let norm = NORM_TBL[index_Fs];
    let pitch_fs_factor = PITCHFS_FACTOR[index_Fs];
    let L_den = LDEN_TBL[index_Fs];                                //  Eq. 148
    let L_den_div2 = (L_den >>> 1);
    let L_num = L_den - 2;                                         //  Eq. 149
    let tab_ltpf_num_fs = TAB_LTPF_NUM_TBL[index_Fs];
    let tab_ltpf_den_fs = TAB_LTPF_DEN_TBL[index_Fs];

    //  Algorithm contexts.
    let gain_params = new Array(2);

    let x_ltpf_hat = new Array(NF);

    let C_den_mem = new Array(L_den + 1);
    let C_den = new Array(L_den + 1);
    for (let k = 0; k <= L_den; ++k) {
        C_den_mem[k] = C_den[k] = 0;
    }
    let C_num_mem = new Array(L_num + 1);
    let C_num = new Array(L_num + 1);
    for (let k = 0; k <= L_num; ++k) {
        C_num_mem[k] = C_num[k] = 0;
    }

    let x_hat_win = new LC3SlideWindow(NF, L_num, 0);
    let x_ltpf_hat_win = new LC3SlideWindow(
        NF, 
        X_LTPF_HAT_WIN_HISTORY_SIZE[index_Nms][index_Fs], 
        0
    );
    let x_ltpf_hat_emptyframe = new Array(NF);
    for (let k = 0; k < NF; ++k) {
        x_ltpf_hat_emptyframe[k] = 0;
    }

    let x_ltpf_hat_tmpbuf = new Array(L_num + norm);

    let mem_ltpf_active = 0;

    let p_int_mem = 0, p_fr_mem = 0;

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} x_hat 
     *    - The reconstructed time samples.
     *  @param {Number} ltpf_active
     *    - The `ltpf_active` parameter.
     *  @param {Number} pitch_index
     *    - The `pitch_index` parameter.
     *  @param {Number} nbits
     *    - The bit count.
     */
    this.update = function(x_hat, ltpf_active, pitch_index, nbits) {
        x_hat_win.append(x_hat);
        x_ltpf_hat_win.append(x_ltpf_hat_emptyframe);

        //  Filter parameters (3.4.9.4).
        let p_int = 0, p_fr = 0;
        if (ltpf_active == 1) {
            GetGainParameters(Nms, Fs, nbits, gain_params);
            let gain_ltpf = gain_params[0];
            let gain_ind = gain_params[1];

            //  Eq. 139
            let pitch_int;
            if (pitch_index < 380) {
                pitch_int = (pitch_index >>> 2) + 32;
            } else if (pitch_index < 440) {
                pitch_int = (pitch_index >>> 1) - 63;
            } else {
                pitch_int = pitch_index - 283;
            }

            //  Eq. 140
            let pitch_fr;
            if (pitch_index < 380) {
                pitch_fr = pitch_index - ((pitch_int << 2) >>> 0) + 128;
            } else if (pitch_index < 440) {
                pitch_fr = ((pitch_index << 1) >>> 0) - 
                           ((pitch_int << 2) >>> 0) - 
                           252;
            } else {
                pitch_fr = 0;
            }

            //  Eq. 141
            let pitch = pitch_int + pitch_fr * 0.25;

            //  Eq. 142
            let pitch_fs = pitch * pitch_fs_factor;

            //  Eq. 143
            let p_up = Math.round(pitch_fs * 4);

            //  Eq. 144
            p_int = (p_up >>> 2)  /*  = floor(p_up / 4)  */;

            //  Eq. 145
            p_fr = ((p_up & 3) >>> 0)  /*  = p_up - 4 * p_int  */;

            //  Eq. 146
            for (let k = 0; k <= L_num; ++k) {
                C_num[k] = 0.85 * gain_ltpf * tab_ltpf_num_fs[gain_ind][k];
            }
            for (let k = 0; k <= L_den; ++k) {
                C_den[k] = gain_ltpf * tab_ltpf_den_fs[p_fr][k];
            }
        } else {
            for (let k = 0; k <= L_den; ++k) {
                C_den[k] = 0;
            }
            for (let k = 0; k <= L_num; ++k) {
                C_num[k] = 0;
            }
        }

        //  Transition handling (3.4.9.2).

        //  First 2.5ms samples:
        if (ltpf_active == 0 && mem_ltpf_active == 0) {
            for (let n = 0; n < norm; ++n) {                       //  Eq. 130
                x_ltpf_hat_win.set(n, x_hat[n]);
            }
        } else if (ltpf_active == 1 && mem_ltpf_active == 0) {
            x_ltpf_hat_win.set(0, x_hat[0]);                       //  Eq. 131
            for (let n = 1; n < norm; ++n) {
                let tmp = 0;
                for (
                    let k1 = 0, k2 = n; 
                    k1 <= L_num; 
                    ++k1, --k2
                ) {
                    tmp += C_num[k1] * x_hat_win.get(k2);
                }
                for (
                    let k1 = 0, k2 = n - p_int + L_den_div2; 
                    k1 <= L_den; 
                    ++k1, --k2
                ) {
                    tmp -= C_den[k1] * x_ltpf_hat_win.get(k2);
                }
                tmp = x_hat[n] - tmp * n / norm;
                x_ltpf_hat_win.set(n, tmp);
            }
        } else if (ltpf_active == 0 && mem_ltpf_active == 1) {
            //  Third case.
            for (let n = 0; n < norm; ++n) {                       //  Eq. 132
                let tmp = 0;
                for (
                    let k1 = 0, k2 = n; 
                    k1 <= L_num; 
                    ++k1, --k2
                ) {
                    tmp += C_num_mem[k1] * x_hat_win.get(k2);
                }
                for (
                    let k1 = 0, k2 = n - p_int_mem + L_den_div2; 
                    k1 <= L_den; 
                    ++k1, --k2
                ) {
                    tmp -= C_den_mem[k1] * x_ltpf_hat_win.get(k2);
                }
                tmp = x_hat[n] - tmp * (1 - n / norm);
                x_ltpf_hat_win.set(n, tmp);
            }
        } else {
            if (p_int == p_int_mem && p_fr == p_fr_mem) {
                //  Fourth case.
                for (let n = 0; n < norm; ++n) {                   //  Eq. 133
                    let tmp = x_hat[n];
                    for (
                        let k1 = 0, k2 = n; 
                        k1 <= L_num; 
                        ++k1, --k2
                    ) {
                        tmp -= C_num[k1] * x_hat_win.get(k2);
                    }
                    for (
                        let k1 = 0, k2 = n - p_int + L_den_div2; 
                        k1 <= L_den; 
                        ++k1, --k2
                    ) {
                        tmp += C_den[k1] * x_ltpf_hat_win.get(k2);
                    }
                    x_ltpf_hat_win.set(n, tmp);
                }
            } else {
                //  Fifth case.
                for (let n = 0; n < norm; ++n) {                   //  Eq. 134
                    let tmp = 0;
                    for (
                        let k1 = 0, k2 = n; 
                        k1 <= L_num; 
                        ++k1, --k2
                    ) {
                        tmp += C_num_mem[k1] * x_hat_win.get(k2);
                    }
                    for (
                        let k1 = 0, k2 = n - p_int_mem + L_den_div2; 
                        k1 <= L_den; 
                        ++k1, --k2
                    ) {
                        tmp -= C_den_mem[k1] * x_ltpf_hat_win.get(k2);
                    }
                    tmp = x_hat[n] - tmp * (1 - n / norm);
                    x_ltpf_hat_win.set(n, tmp);
                }

                for (let m = -L_num, k = 0; m < norm; ++m, ++k) {  //  Eq. 135
                    x_ltpf_hat_tmpbuf[k] = x_ltpf_hat_win.get(m);
                }

                x_ltpf_hat_win.set(0, x_ltpf_hat_tmpbuf[L_num]);   //  Eq. 136
                for (let n = 1; n < norm; ++n) {
                    let tmp = 0;
                    for (
                        let k1 = 0, k2 = n + L_num; 
                        k1 <= L_num; 
                        ++k1, --k2
                    ) {
                        tmp += C_num[k1] * x_ltpf_hat_tmpbuf[k2];
                    }
                    for (
                        let k1 = 0, k2 = n - p_int + L_den_div2; 
                        k1 <= L_den; 
                        ++k1, --k2
                    ) {
                        tmp -= C_den[k1] * x_ltpf_hat_win.get(k2);
                    }
                    tmp = x_ltpf_hat_tmpbuf[n + L_num] - tmp * n / norm;
                    x_ltpf_hat_win.set(n, tmp);
                }
            }
        }

        //  Remainder of the frame (3.4.9.3).
        if (ltpf_active == 0) {
            //  First case.
            for (let n = norm; n < NF; ++n) {                      //  Eq. 137
                x_ltpf_hat_win.set(n, x_hat[n]);
            }
        } else {
            //  Second case.
            for (let n = norm; n < NF; ++n) {                      //  Eq. 138
                let tmp = x_hat[n];
                for (
                    let k1 = 0, k2 = n; 
                    k1 <= L_num; 
                    ++k1, --k2
                ) {
                    tmp -= C_num[k1] * x_hat_win.get(k2);
                }
                for (
                    let k1 = 0, k2 = n - p_int + L_den_div2; 
                    k1 <= L_den; 
                    ++k1, --k2
                ) {
                    tmp += C_den[k1] * x_ltpf_hat_win.get(k2);
                }
                x_ltpf_hat_win.set(n, tmp);
            }
        }

        //  Dump data.
        x_ltpf_hat_win.bulkGet(x_ltpf_hat, 0, 0, NF);

        //  Memorize old contexts.
        mem_ltpf_active = ltpf_active;
        p_int_mem = p_int;
        p_fr_mem = p_fr;
        {
            let tmp = C_den;
            C_den = C_den_mem;
            C_den_mem = tmp;
        }
        {
            let tmp = C_num;
            C_num = C_num_mem;
            C_num_mem = tmp;
        }

        return x_ltpf_hat;
    };
}

//  Export public APIs.
module.exports = {
    "LC3LongTermPostfilterDecoder": LC3LongTermPostfilterDecoder
};