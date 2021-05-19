//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3TblW10_80 = 
    require("./../tables/w10_80");
const Lc3TblW10_160 = 
    require("./../tables/w10_160");
const Lc3TblW10_240 = 
    require("./../tables/w10_240");
const Lc3TblW10_320 = 
    require("./../tables/w10_320");
const Lc3TblW10_480 = 
    require("./../tables/w10_480");
const Lc3TblW75_60 = 
    require("./../tables/w75_60");
const Lc3TblW75_120 = 
    require("./../tables/w75_120");
const Lc3TblW75_180 = 
    require("./../tables/w75_180");
const Lc3TblW75_240 = 
    require("./../tables/w75_240");
const Lc3TblW75_360 = 
    require("./../tables/w75_360");
const Lc3Fs = 
    require("../common/fs");
const Lc3Nms = 
    require("../common/nms");
const Lc3Mdct = 
    require("./../math/mdct");

//  Imported classes.
const IMDCT = 
    Lc3Mdct.IMDCT;
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;

//  Imported constants.
const W10_80 = 
    Lc3TblW10_80.W10_80;
const W10_160 = 
    Lc3TblW10_160.W10_160;
const W10_240 = 
    Lc3TblW10_240.W10_240;
const W10_320 = 
    Lc3TblW10_320.W10_320;
const W10_480 = 
    Lc3TblW10_480.W10_480;
const W75_60 = 
    Lc3TblW75_60.W75_60;
const W75_120 = 
    Lc3TblW75_120.W75_120;
const W75_180 = 
    Lc3TblW75_180.W75_180;
const W75_240 = 
    Lc3TblW75_240.W75_240;
const W75_360 = 
    Lc3TblW75_360.W75_360;

//
//  Constants.
//


//  NF (Nms, Fs) to Z table (see Eq. 3).
const Z_TBL = [
    [
        30, 60, 90, 120, 180, 180
    ],
    [
        14, 28, 42,  56,  84,  84
    ]
];

//  Nms, Fs to W table.
const W_TBL = [
    [
        W10_80, W10_160, W10_240, W10_320, W10_480, W10_480
    ],
    [
        W75_60, W75_120, W75_180, W75_240, W75_360, W75_360
    ]
];

//
//  Public classes.
//

/**
 *  LC3 LD-MDCT synthesizer.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 *  @param {Number} NF
 *    - The frame size.
 */
function LC3MDCTSynthesizer(Nms, Fs, NF) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Algorithm contexts.
    let W_N = W_TBL[index_Nms][index_Fs];
    let Z = Z_TBL[index_Nms][index_Fs];

    let NFaddZ = NF + Z;
    let NFsubZ = NF - Z;
    let NFmul2 = ((NF << 1) >>> 0);

    let mem_ola_add = new Array(NFsubZ);
    for (let n = 0; n < NFsubZ; ++n) {
        mem_ola_add[n] = 0;
    }

    let x_hat = new Array(NF);

    let imdct = new IMDCT(NF);

    let SqrNFmul2 = Math.sqrt(NFmul2);

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} X_hat 
     *    - The spectrum coefficients.
     *  @returns {Number[]}
     *    - The reconstructed time samples.
     */
    this.update = function(X_hat) {
        //  Low delay MDCT synthesis (3.4.8).

        //  1. Generation of time domain aliasing buffer t_hat[n].
        //  2. Windowing of time-aliased buffer.
        let t_hat = imdct.transform(X_hat);
        for (let i = 0, j = NFmul2 - 1; i < NFmul2; ++i, --j) {
            t_hat[i] *= SqrNFmul2 *                                //  Eq. 125
                        W_N[j];                                    //  Eq. 126
        }
        // console.log("t_hat[]=" + t_hat.toString());

        //  3. Conduct overlap-add operation to get reconstructed time samples 
        //  x_hat[n].
        for (let n = 0, k = Z; n < NFsubZ; ++n, ++k) {             //  Eq. 127
            x_hat[n] = mem_ola_add[n] + t_hat[k];
        }
        for (let n = NFsubZ, k = NF; n < NF; ++n, ++k) {           //  Eq. 128
            x_hat[n] = t_hat[k];
        }
        for (let n = 0, k = NFaddZ; n < NFsubZ; ++n, ++k) {        //  Eq. 129
            mem_ola_add[n] = t_hat[k];
        }
        // console.log("x_hat[]=" + x_hat.toString());
        // console.log("mem_ola_add[]=" + mem_ola_add.toString());

        return x_hat;
    };
}

//  Export public APIs.
module.exports = {
    "LC3MDCTSynthesizer": LC3MDCTSynthesizer
};