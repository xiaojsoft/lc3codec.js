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

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;

//  Imported constants.
const NF_TBL = 
    Lc3TblNF.NF_TBL;

//
//  Public classes.
//

/**
 *  LC3 packet loss concealment (see Appendix B).
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3PacketLossConcealment(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Fs and Nms.
    let index_Fs = Fs.getInternalIndex();
    let index_Nms = Nms.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];

    //  Algorithm contexts.
    let plc_seed = 24607;

    let alpha = 1;

    let nbLostCmpt = 0;

    let X_lastgood = new Array(NF);
    let X_plc = new Array(NF);
    for (let k = 0; k < NF; ++k) {
        X_lastgood[k] = 0;
        X_plc[k] = 0;
    }

    //
    //  Public methods.
    //

    /**
     *  Update with a good frame.
     * 
     *  @param {Number[]} X_hat 
     *    - The spectrum coefficients.
     */
    this.good = function(X_hat) {
        nbLostCmpt = 0;
        for (let k = 0; k < NF; ++k) {
            X_lastgood[k] = X_hat[k];
        }
        alpha = 1;
    };

    /**
     *  Lost one frame, conceal it.
     * 
     *  @returns {Number[]}
     *    - The concealed spectrum coefficients.
     */
    this.conceal = function() {
        //  Increase lost frame count.
        if (nbLostCmpt < 16) {
            ++(nbLostCmpt);
        }

        //  The following algorithm shall be used to compute the attenuation 
        //  factor:
        if (nbLostCmpt >= 8) {
            alpha *= 0.85;
        } else if (nbLostCmpt >= 4) {
            alpha *= 0.9;
        } else {
            //  `alpha` is not changed according to the specification.
        }

        //  The shaped spectrum of the concealed frame shall be derived by sign
        //  scrambling of the last received shaped spectrum.
        for (let k = 0; k < NF; ++k) {
            plc_seed = (((16831 + plc_seed * 12821) & 0xFFFF) >>> 0);
            if (plc_seed < 0x8000) {
                X_plc[k] = X_lastgood[k] * alpha;
            } else {
                X_plc[k] = -X_lastgood[k] * alpha;
            }
        }

        return X_plc;
    };
}

//  Export public APIs.
module.exports = {
    "LC3PacketLossConcealment": LC3PacketLossConcealment
};