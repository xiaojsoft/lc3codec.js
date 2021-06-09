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

//  Imported classes.
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;

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
 *  @param {Number} NE
 *    - The number of encoded spectral lines.
 */
function LC3NoiseLevelEstimation(Nms, NE) {
    //
    //  Members.
    //

    //  Internal index of Nms.
    let index_Nms = Nms.getInternalIndex();

    //  Algorithm contexts.
    let bw_stop_Nms = BW_STOP_TBL[index_Nms];

    let NFstart = NFSTART_TBL[index_Nms];
    let NFwidth = NFWIDTH_TBL[index_Nms];

    let FNF = 0;

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

        FNF = Math.round(8 - 16 * (LNF_numer / LNF_denom));        //  Eq. 118
        if (FNF < 0) {
            FNF = 0;
        } else if (FNF > 7) {
            FNF = 7;
        }
    };

    /**
     *  Get the noise level (i.e. F_NF).
     * 
     *  @returns {Number}
     *    - The noise level.
     */
    this.getNoiseLevel = function() {
        return FNF;
    };
}

//  Export public APIs.
module.exports = {
    "LC3NoiseLevelEstimation": LC3NoiseLevelEstimation
};