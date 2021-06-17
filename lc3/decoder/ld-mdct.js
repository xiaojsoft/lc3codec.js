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
    require("./../common/fs");
const Lc3Nms = 
    require("./../common/nms");
const Lc3TblNF = 
    require("./../tables/nf");
const Lc3TblW = 
    require("./../tables/w");
const Lc3TblZ = 
    require("./../tables/z");
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
const NF_TBL = 
    Lc3TblNF.NF_TBL;
const W_TBL = 
    Lc3TblW.W_TBL;
const Z_TBL = 
    Lc3TblZ.Z_TBL;

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
 */
function LC3MDCTSynthesizer(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];
    let W_N = W_TBL[index_Nms][index_Fs];
    let Z = Z_TBL[index_Nms][index_Fs];

    //  Algorithm contexts.
    let NFaddZ = NF + Z;
    let NFsubZ = NF - Z;
    let NFmul2 = ((NF << 1) >>> 0);

    let mem_ola_add = new Array(NFsubZ);
    for (let n = 0; n < NFsubZ; ++n) {
        mem_ola_add[n] = 0;
    }

    let x_hat = new Array(NF);

    let t_hat = new Array(NFmul2);

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
        imdct.transform(X_hat, t_hat);
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