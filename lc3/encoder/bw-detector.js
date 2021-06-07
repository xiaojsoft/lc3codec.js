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
const Lc3Nms = 
    require("../common/nms");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;

//
//  Constants.
//

//  Bandwidth indices.
const BW_NB = 0;
const BW_WB = 1;
const BW_SSWB = 2;
const BW_SWB = 3;
const BW_FB = 4;

//  Table 3.6.
const IBWSTART_TBL = [
    [
        [], 
        [53],
        [47, 59],
        [44, 54, 60],
        [41, 51, 57, 61],
        [41, 51, 57, 61]
    ],
    [
        [],
        [51],
        [45, 58],
        [42, 53, 60],
        [40, 51, 57, 61],
        [40, 51, 57, 61]
    ]
];
const IBWSTOP_TBL = [
    [
        [],
        [63],
        [56, 63],
        [52, 59, 63],
        [49, 55, 60, 63],
        [49, 55, 60, 63]
    ],
    [
        [],
        [63],
        [55, 63],
        [51, 58, 63],
        [48, 55, 60, 63],
        [48, 55, 60, 63]
    ]
];
const NBITSBW_TBL = [
    [0, 1, 2, 2, 3, 3],
    [0, 1, 2, 2, 3, 3]
];
const NBW_TBL = [
    [0, 1, 2, 3, 4, 4],
    [0, 1, 2, 3, 4, 4]
];

//  Quietness thresholds.
const TQ = [20, 10, 10, 10];

//  TC table (see 3.3.5.1).
const TC = [15, 23, 20, 20];

//  L table (see 3.3.5.1).
const L_TBL = [
    [4, 4, 3, 1],
    [4, 4, 3, 2]
];

//
//  Public classes.
//

/**
 *  LC3 bandwidth detector.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 */
function LC3BandwidthDetector(Fs, Nms) {
    //
    //  Members.
    //

    //  Internal index of Fs and Nms.
    let index_Fs = Fs.getInternalIndex();
    let index_Nms = Nms.getInternalIndex();

    //  Detector parameters (see table 3.6).
    let Nbw = null;
    let Ibwstart = null;
    let Ibwstop = null;
    let L = null;
    let nbitsbw = null;

    Nbw = NBW_TBL[index_Nms][index_Fs];
    Ibwstart = IBWSTART_TBL[index_Nms][index_Fs];
    Ibwstop = IBWSTOP_TBL[index_Nms][index_Fs];
    nbitsbw = NBITSBW_TBL[index_Nms][index_Fs];
    L = L_TBL[index_Nms];

    //
    //  Public methods.
    //

    /**
     *  Get the bit consumption (i.e. nbitsbw).
     * 
     *  @returns {Number}
     *    - The bit consumption.
     */
    this.getBitConsumption = function() {
        return nbitsbw;
    };

    /**
     *  Detect bandwidth.
     * 
     *  @param {Number[]} EB 
     *    - The spectrum energy band estimation.
     *  @returns {Number}
     *    - The bandwidth (one of BW_*).
     */
    this.detect = function(EB) {
        //  Do first stage classification.
        let bw0 = 0;
        for (let k = Nbw - 1; k >= 0; --k) {
            let bwstart = Ibwstart[k];
            let bwstop = Ibwstop[k];
            let Esum = 0;
            for (let n = bwstart; n <= bwstop; ++n) {
                Esum += EB[n];
            }
            Esum /= (bwstop - bwstart + 1);
            if (Esum >= TQ[k]) {
                bw0 = k + 1;
                break;
            }
        }

        //  Do second stage classification.
        let bw = bw0;
        if (bw != Nbw) {
            let Cmax = -Infinity;
            let Lbw0 = L[bw0];
            for (
                let n = Ibwstart[bw0] - Lbw0 + 1; 
                n <= Ibwstart[bw0] + 1; 
                ++n
            ) {
                let EB_n = EB[n];
                if (EB_n < 1e-31) {
                    EB_n = 1e-31;
                }
                let C = Math.log10((1e-31) + EB[n - Lbw0] / EB_n);
                if (C > Cmax) {
                    Cmax = C;
                }
            }
            if (10 * Cmax <= TC[bw0]) {
                bw = Nbw;
            }
        }

        return bw;
    };
}

//  Export public APIs.
module.exports = {
    "BW_NB": BW_NB,
    "BW_WB": BW_WB,
    "BW_SSWB": BW_SSWB,
    "BW_SWB": BW_SWB,
    "BW_FB": BW_FB,
    "LC3BandwidthDetector": LC3BandwidthDetector
};