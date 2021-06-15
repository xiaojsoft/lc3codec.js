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

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;

//
//  Constants.
//

//  Nms, Fs to attack detection test condition (lowest limit).
const ATK_TESTCOND_LOW = [
    [0, 0, 0, 81, 100, 100],
    [0, 0, 0, 61, 75, 75]
];
const ATK_TESTCOND_HIGH = [
    [0, 0, 0, 401, 401, 401],
    [0, 0, 0, 150, 150, 150]
];

//  MF = 16 * Nms (see Eq. 14).
const MF_TBL = [
    160, 120
];

//  Nblocks = Nms / 2.5 (see Eq. 16).
const NBLOCKS_TBL = [
    4, 3
];

//  NF/MF = fs * fscal / 16000:
const NFDIVMF_TBL = [
    0, 1, 1, 2, 3, 3
];

//
//  Classes.
//

/**
 *  LC3 attack detector.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3AttackDetector(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Fs, Nms.
    let index_Fs = Fs.getInternalIndex();
    let index_Nms = Nms.getInternalIndex();

    //  Table lookup.
    let Mf = MF_TBL[index_Nms];
    let NfDivMf = NFDIVMF_TBL[index_Fs];
    let Nblocks = NBLOCKS_TBL[index_Nms];
    let Tatt = (Nblocks >>> 1);
    // let Nf = NfDivMf * Mf;
    let tclow = ATK_TESTCOND_LOW[index_Nms][index_Fs];
    let tchigh = ATK_TESTCOND_HIGH[index_Nms][index_Fs];

    //  Attack flag.
    let Fatt = 0;

    //  FIR filter.
    let Xatt_n1 = 0, Xatt_n2 = 0;

    //  Aatt[] context.
    let Aatt_blkN1 = 0;

    //  Eatt[] context.
    let Eatt_blkN1 = 0;

    //  Patt[] context.
    let Patt_N1 = -1;

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} xs 
     *    - The frame samples.
     *  @param {Number} nbytes
     *    - The number of bytes per frame.
     */
    this.update = function(xs, nbytes) {
        //  Skip if inactive.
        if (nbytes < tclow || nbytes >= tchigh) {
            Fatt = 0;
            return;
        }

        //  Scan the input signal.
        let blk = 0;
        let Eatt_blk = 0;
        let Eatt_cnt = 0;
        let Patt = -1;
        for (let n = 0; n < Mf; ++n) {
            //  Downsample (Eq.14).
            let offset = NfDivMf * n;
            let Xatt_n = 0;
            for (let m = 0; m < NfDivMf; ++m) {
                Xatt_n += xs[offset + m];
            }

            //  Apply high pass FIR filter (Eq.15).
            let Xhp_n = 0.375 * Xatt_n - 0.5 * Xatt_n1 + 0.125 * Xatt_n2;
            Xatt_n2 = Xatt_n1;
            Xatt_n1 = Xatt_n;

            //  Accumulate the energy of 40 samples.
            Eatt_blk += Xhp_n * Xhp_n;
            if (++(Eatt_cnt) >= 40) {
                //  Derive the delayed long time temporal envelope (see Eq.17).
                let Aatt_blk = Math.max(0.25 * Aatt_blkN1, Eatt_blkN1);

                //  Detect attack (Eq.18).
                if (Eatt_blk > 8.5 * Aatt_blk) {
                    Patt = blk;
                }

                //  Move to the next block.
                ++(blk);
                Aatt_blkN1 = Aatt_blk;
                Eatt_blkN1 = Eatt_blk;
                Eatt_blk = 0;
                Eatt_cnt = 0;
            }
        }

        //  Update the attack flag.
        if (Patt >= 0 || Patt_N1 >= Tatt) {
            Fatt = 1;
        } else {
            Fatt = 0;
        }

        //  Roll Patt[] sequence.
        Patt_N1 = Patt;
    };

    /**
     *  Get the attack flag.
     * 
     *  @returns {Number}
     *    - The attack flag.
     */
    this.getAttackFlag = function() {
        return Fatt;
    };
}

//  Export public APIs.
module.exports = {
    "LC3AttackDetector": LC3AttackDetector
};