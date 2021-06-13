//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Mdct = 
    require("./../math/mdct");

//  Imported classes.
const MDCT = 
    Lc3Mdct.MDCT;

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
 *  @param {Number} Nf 
 *    - The frame size.
 *  @param {Number} NB
 *    - The number of bands.
 *  @param {Number} Z 
 *    - The number of leading zeros in MDCT window.
 *  @param {Number[]} W
 *    - The MDCT window.
 *  @param {Number[]} Ifs
 *    - The band indices.
 *  @param {Number} nn_idx
 *    - The near Nyquist index.
 */
function LC3MDCTAnalyzer(Nf, NB, Z, W, Ifs, nn_idx) {
    //  Derive Nf * 2.
    let NfMul2 = ((Nf << 1) >>> 0);

    //
    //  Members.
    //

    //  Derive Nf - Z.
    let NfSubZ = Nf - Z;

    //  Derive 2Nf - Z.
    let NfMul2_SubZ = ((Nf << 1) >>> 0) - Z;

    //  Derive sqrt(2 / Nf).
    let SqrTwoDivNf = Math.sqrt(2 / Nf);

    //  MDCT.
    let mdct = new MDCT(Nf);

    //  Time buffer.
    let Tbuf = new Array(NfMul2);

    //  Windowed time buffer.
    let Twinbuf = new Array(NfMul2);
    for (let k = 0; k < NfMul2; ++k) {
        Tbuf[k] = 0;
        Twinbuf[k] = 0;
    }

    //  Spectral coefficients.
    let Xs = new Array(Nf);
    for (let k = 0; k < Nf; ++k) {
        Xs[k] = 0;
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
        for (let i = 0, j = Nf; i < NfSubZ; ++i, ++j) {
            Tbuf[i] = Tbuf[j];
        }
        for (let i = NfSubZ, j = 0; i < NfMul2_SubZ; ++i, ++j) {
            Tbuf[i] = xs[j];
        }

        //  Get the windowed time buffer.
        for (let n = 0; n < NfMul2; ++n) {
            Twinbuf[n] = Tbuf[n] * W[n];
        }

        //  Get spectral coefficients.
        let XsOrig = mdct.transform(Twinbuf);
        for (let k = 0; k < Nf; ++k) {
            Xs[k] = XsOrig[k] * SqrTwoDivNf;
        }

        //  Do energy estimation.
        for (let b = 0; b < NB; ++b) {
            let i1 = Ifs[b];
            let i2 = Ifs[b + 1];
            let EB_b = 0;
            for (let k = i1; k < i2; ++k) {
                let Xs_k = Xs[k];
                EB_b += (Xs_k * Xs_k);
            }
            EB_b /= (i2 - i1);
            EB[b] = EB_b;
        }

        //  Do near Nyquist detection.
        let nn_high = 0, nn_low = 0;
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
        return Xs;
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