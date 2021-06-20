//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Error = 
    require("./../error");
const Lc3Fs = 
    require("./fs");
const Lc3Nms = 
    require("./nms");

//  Imported classes.
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;

//
//  Public functions.
//

/**
 *  Get gain parameters (i.e. gain_ltpf and gain_ind, see 3.4.9.4 for details).
 * 
 *  @throws {LC3IllegalParameterError}
 *    - R has an incorrect size (!= 2), or 
 *    - Unsupported frame duration.
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 *  @param {Number} nbits 
 *    - The bit count.
 *  @param {Number[]} [R]
 *    - The returned array buffer (used for reducing array allocation).
 *  @returns {Number[]}
 *    - An array (denotes as R[0...1]), where:
 *      - R[0] = gain_ltpf,
 *      - R[1] = gain_ind.
 */
function GetGainParameters(Nms, Fs, nbits, R = new Array(2)) {
    //  Check the size of R.
    if (R.length != 2) {
        throw new LC3IllegalParameterError(
            "R has an incorrect size (!= 2)."
        );
    }

    //  Correction table for smaller frame sizes.
    let t_nbits;
    switch (Nms) {
    case LC3FrameDuration.NMS_07500US:
        t_nbits = Math.round(nbits * 10 / 7.5);
        break;
    case LC3FrameDuration.NMS_10000US:
        t_nbits = nbits;
        break;
    default:
        throw new LC3IllegalParameterError(
            "Unsupported frame duration."
        );
    }

    //  Tuning lookup.
    let gain_ltpf, gain_ind;
    let fsi = Fs.getSampleRateIndex();
    let fsiMul80 = fsi * 80;
    if (t_nbits < 320 + fsiMul80) {
        gain_ltpf = 0.4;
        gain_ind = 0;
    } else if (t_nbits < 400 + fsiMul80) {
        gain_ltpf = 0.35;
        gain_ind = 1;
    } else if (t_nbits < 480 + fsiMul80) {
        gain_ltpf = 0.3;
        gain_ind = 2;
    } else if (t_nbits < 560 + fsiMul80) {
        gain_ltpf = 0.25;
        gain_ind = 3;
    } else {
        gain_ltpf = 0;
        gain_ind = 0;
    }

    //  Write gain_ltpf and gain_ind.
    R[0] = gain_ltpf;
    R[1] = gain_ind;

    return R;
}

//  Export public APIs.
module.exports = {
    "GetGainParameters": GetGainParameters
};