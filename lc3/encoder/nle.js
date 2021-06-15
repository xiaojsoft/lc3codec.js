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
const Lc3TblNE = 
    require("./../tables/ne");

//  Imported classes.
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;

//  Imported constants.
const NE_TBL = 
    Lc3TblNE.NE_TBL;

//
//  Constants.
//

//  Nms to NFstart, NFwidth table (see Table 3.17).
const NFSTART_TBL = [24, 18];
const NFWIDTH_TBL = [3, 2];

//  Nms, Pbw to bw_stop table (see Table 3.16).
const BW_STOP_TBL = [
    [
        80, 160, 240, 320, 400
    ],
    [
        60, 120, 180, 240, 300
    ]
];

//
//  Public classes.
//

/**
 *  LC3 noise level estimation.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3NoiseLevelEstimation(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let NE = NE_TBL[index_Nms][index_Fs];
    let bw_stop_Nms = BW_STOP_TBL[index_Nms];
    let NFstart = NFSTART_TBL[index_Nms];
    let NFwidth = NFWIDTH_TBL[index_Nms];

    //  Algorithm contexts.
    let F_NF = 0;

    //
    //  Public methods.
    //
    
    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} Xf 
     *    - The filtered spectral coefficients.
     *  @param {Number[]} Xq 
     *    - The quantized spectral coefficients.
     *  @param {Number} Pbw 
     *    - The bandwidth index.
     *  @param {Number} gg 
     *    - The global gain.
     */
    this.update = function(Xf, Xq, Pbw, gg) {
        //  Noise level estimation (3.3.12).
        let bw_stop = bw_stop_Nms[Pbw];

        let LNF_numer = 0, LNF_denom = 0;                          //  Eq. 117
        for (let k = 0; k < NE; ++k) {
            if (k >= NFstart && k < bw_stop) {
                let INF_flag = true;                               //  Eq. 116
                for (
                    let i = k - NFwidth, 
                        iEnd = Math.min(bw_stop - 1, k + NFwidth); 
                    i <= iEnd; 
                    ++i
                ) {
                    if (Xq[i] != 0) {
                        INF_flag = false;
                        break;
                    }
                }
                if (INF_flag) {
                    LNF_numer += Math.abs(Xf[k]) / gg;             //  Eq. 117
                    ++(LNF_denom);
                }
            }
        }
        if (LNF_denom == 0) {
            LNF_numer = 0;
            LNF_denom = 1;
        }

        F_NF = Math.round(8 - 16 * (LNF_numer / LNF_denom));        //  Eq. 118
        if (F_NF < 0) {
            F_NF = 0;
        } else if (F_NF > 7) {
            F_NF = 7;
        }
    };

    /**
     *  Get the noise level (i.e. F_NF).
     * 
     *  @returns {Number}
     *    - The noise level.
     */
    this.getNoiseLevel = function() {
        return F_NF;
    };
}

//  Export public APIs.
module.exports = {
    "LC3NoiseLevelEstimation": LC3NoiseLevelEstimation
};