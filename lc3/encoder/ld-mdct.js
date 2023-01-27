//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
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
const Lc3SlideWin = 
    require("./../common/slide_window");
const Lc3Mdct = 
    require("./../math/mdct");
const Lc3TblI = 
    require("./../tables/i");
const Lc3TblNB = 
    require("./../tables/nb");
const Lc3TblNF = 
    require("./../tables/nf");
const Lc3TblNnIdx = 
    require("./../tables/nnidx");
const Lc3TblW = 
    require("./../tables/w");
const Lc3TblZ = 
    require("./../tables/z");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3SlideWindow = 
    Lc3SlideWin.LC3SlideWindow;
const MDCT = 
    Lc3Mdct.MDCT;

//  Imported constants.
const I_TBL = 
    Lc3TblI.I_TBL;
const NB_TBL = 
    Lc3TblNB.NB_TBL;
const NF_TBL = 
    Lc3TblNF.NF_TBL;
const NNIDX_TBL = 
    Lc3TblNnIdx.NNIDX_TBL;
const W_TBL = 
    Lc3TblW.W_TBL;
const Z_TBL = 
    Lc3TblZ.Z_TBL;

//
//  Constants.
//

//  Near Nyquist detection threshold.
const NN_thresh = 30;

//
//  Public classes.
//

/**
 *  LC3 LD-MDCT analyzer.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3MDCTAnalyzer(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Fs and Nms.
    let index_Fs = Fs.getInternalIndex();
    let index_Nms = Nms.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];
    let NF_mul_2 = ((NF << 1) >>> 0);
    let NB = NB_TBL[index_Nms][index_Fs];
    let Z = Z_TBL[index_Nms][index_Fs];
    let W = W_TBL[index_Nms][index_Fs];
    let Ifs = I_TBL[index_Nms][index_Fs];
    let nn_idx = NNIDX_TBL[index_Nms][index_Fs];

    //  MDCT.
    let mdct = new MDCT(NF, Math.sqrt(2 / NF), W);

    //  Time buffer.
    let TbufLen = NF_mul_2 - Z;
    let Tbuf = new LC3SlideWindow(TbufLen, 0, 0);

    //  Windowed time buffer.
    let Twinbuf = new Array(NF_mul_2);
    for (let k = 1; k <= Z; ++k) {
        Twinbuf[NF_mul_2 - k] = 0;
    }

    //  Spectral coefficients.
    let X = new Array(NF);
    for (let k = 0; k < NF; ++k) {
        X[k] = 0;
    }

    //  Spectral energy band estimation.
    let EB = new Array(NB);
    for (let b = 0; b < NB; ++b) {
        EB[b] = 0;
    }

    //  Near Nyquist flag.
    let nn_flag = 0;

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} xs 
     *    - The frame samples.
     */
    this.update = function(xs) {
        //  Update time buffer.
        Tbuf.append(xs);                                          //  Eq. 6, 7

        //  Get the windowed time buffer.
        Tbuf.bulkGet(Twinbuf, 0, 0, TbufLen);

        //  Get spectral coefficients.
        mdct.transform(Twinbuf, X);                                  //  Eq. 8

        //  Do energy estimation.
        for (let b = 0; b < NB; ++b) {                              //  Eq. 10
            let i1 = Ifs[b];
            let i2 = Ifs[b + 1];
            let EB_b = 0;
            for (let k = i1; k < i2; ++k) {
                let Xs_k = X[k];
                EB_b += (Xs_k * Xs_k);
            }
            EB_b /= (i2 - i1);
            EB[b] = EB_b;
        }

        //  Do near Nyquist detection.
        let nn_high = 0, nn_low = 0;                                //  Eq. 11
        for (let n = nn_idx; n < NB; ++n) {
            nn_high += EB[n];
        }
        for (let n = 0; n < nn_idx; ++n) {
            nn_low += EB[n];
        }
        if (nn_high > NN_thresh * nn_low) {
            nn_flag = 1;
        } else {
            nn_flag = 0;
        }
    };

    /**
     *  Get the spectral coefficients.
     * 
     *  @returns {Number[]}
     *    - The spectral coefficients.
     */
    this.getSpectralCoefficients = function() {
        return X;
    };

    /**
     *  Get the spectral energy band estimation.
     * 
     *  @returns {Number[]}
     *    - The spectral energy band estimation.
     */
    this.getSpectralEnergyBandEstimation = function() {
        return EB;
    };

    /**
     *  Get the near Nyquist flag.
     * 
     *  @returns {Number}
     *    - The near Nyquist flag.
     */
    this.getNearNyquistFlag = function() {
        return nn_flag;
    };
}

//  Export public APIs.
module.exports = {
    "LC3MDCTAnalyzer": LC3MDCTAnalyzer
};