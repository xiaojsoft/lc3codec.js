//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
// const Lc3UInt = require("./../common/uint");
const Lc3Error = require("./../error");

//  Imported classes.
const LC3IllegalParameterError = Lc3Error.LC3IllegalParameterError;

//  Imported functions.
// const IsUInt32 = Lc3UInt.IsUInt32;

//
//  Public functions.
//

/**
 *  Generate bit reversal permutate.
 * 
 *  Note(s):
 *    [1] The description algorithm used here can be downloaded from:
 *        https://drive.google.com/file/d/1ud9FRlrhxiSA0QxsL4JBgU0iBpifMm_6/
 * 
 *  @param {Number} nbits
 *    - The bit count (0 <= `nbits` < 32).
 *  @returns {Number[]}
 *    - The bit reversal permutate.
 */
function NewBitReversalPermutate(nbits) {
    if (!(Number.isInteger(nbits) && nbits >= 0 && nbits < 32)) {
        throw new LC3IllegalParameterError("Invalid bit count.");
    }
    if (nbits == 0) {
        return [];
    }
    let t = new Array((1 << nbits) >>> 0);
    t[0] = 0;
    if (nbits > 0) {
        let msb = ((1 << (nbits - 1)) >>> 0);
        let l = 1;
        let k = 1;
        for (let q = 1; q <= nbits; ++q) {
            for (let i = 0; i < l; ++i) {
                if (((k & 1) >>> 0) == 1) {
                    t[k] = t[k - 1] + msb;
                } else {
                    t[k] = (t[k >>> 1] >>> 1);
                }
                ++k;
            }
            l = ((l << 1) >>> 0);
        }
    }
    return t;
}

//  Export public APIs.
module.exports = {
    "NewBitReversalPermutate": NewBitReversalPermutate
};