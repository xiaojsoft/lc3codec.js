//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3FftTfmCore = 
    require("./fft-tfm-core");
const Lc3Brp = 
    require("./brp");
const Lc3ObjUtil = 
    require("./../common/object_util");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const IFFTTransformer = 
    Lc3FftTfmCore.IFFTTransformer;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;

//  Imported functions.
const NewBitReversalPermutate = 
    Lc3Brp.NewBitReversalPermutate;
const Inherits = 
    Lc3ObjUtil.Inherits;

//
//  Constants.
//

//  Twiddle factor WN[i] = e ^ (-1j * 2pi / (2 ^ i))
//  (for 0 <= i < 32).
const WN_RE = [
    1.0, -1.0, 6.123233995736766e-17, 0.7071067811865476, 0.9238795325112867, 0.9807852804032304, 0.9951847266721969, 0.9987954562051724, 0.9996988186962042, 0.9999247018391445, 0.9999811752826011, 0.9999952938095762, 0.9999988234517019, 0.9999997058628822, 0.9999999264657179, 0.9999999816164293, 0.9999999954041073, 0.9999999988510269, 0.9999999997127567, 0.9999999999281892, 0.9999999999820472, 0.9999999999955118, 0.999999999998878, 0.9999999999997194, 0.9999999999999298, 0.9999999999999825, 0.9999999999999957, 0.9999999999999989, 0.9999999999999998, 0.9999999999999999, 1.0, 1.0
];
const WN_IM = [
    2.4492935982947064e-16, -1.2246467991473532e-16, -1.0, -0.7071067811865475, -0.3826834323650898, -0.19509032201612825, -0.0980171403295606, -0.049067674327418015, -0.024541228522912288, -0.012271538285719925, -0.006135884649154475, -0.003067956762965976, -0.0015339801862847655, -0.0007669903187427045, -0.00038349518757139556, -0.0001917475973107033, -9.587379909597734e-05, -4.793689960306688e-05, -2.396844980841822e-05, -1.1984224905069705e-05, -5.9921124526424275e-06, -2.996056226334661e-06, -1.4980281131690111e-06, -7.490140565847157e-07, -3.7450702829238413e-07, -1.8725351414619535e-07, -9.362675707309808e-08, -4.681337853654909e-08, -2.340668926827455e-08, -1.1703344634137277e-08, -5.8516723170686385e-09, -2.9258361585343192e-09
];

//
//  Public classes.
//

/**
 *  FFT Cooley-Tukey transformer.
 * 
 *  @constructor
 *  @throws {LC3IllegalParameterError}
 *    - Incorrect stage count.
 *  @param {Number} stageCnt
 *    - The stage count (min: 1, max: 31).
 */
function FFTCooleyTukeyTransformer(stageCnt) {
    //  Let parent class initialize.
    IFFTTransformer.call(this);

    //  Check the stage count.
    if (!(Number.isInteger(stageCnt) && stageCnt > 0 && stageCnt < 32)) {
        throw new LC3IllegalParameterError(
            "Incorrect stage count."
        );
    }

    //
    //  Members.
    //

    //  Get the bit reversal permutation used by FFTArrayBitReversalSwap2().
    let brvtable = NewBitReversalPermutate(stageCnt >>> 1);

    //  Get the block size.
    let blksize = ((1 << stageCnt) >>> 0);

    //
    //  Public methods.
    //

    /**
     *  Apply transform.
     *  
     *  @throws {LC3IllegalParameterError}
     *    - Incorrect block size.
     *  @param {Number[]} x_re 
     *    - The real part of each point.
     *  @param {Number[]} x_im 
     *    - The imaginary part of each point.
     */
    this.transform = function(x_re, x_im) {
        //  Check the block size.
        if (x_re.length != blksize || x_im.length != blksize) {
            throw new LC3IllegalParameterError("Incorrect block size.");
        }

        //  Do bit reversal shuffle.
        FFTArrayBitReversalShuffle2(x_re, x_im, stageCnt, brvtable);

        //  Do FFT transform.
        for (let s = 1; s <= stageCnt; ++s) {
            let wNs_r = WN_RE[s], wNs_i = WN_IM[s];
            let pow_2_s = ((1 << s) >>> 0);
            let pow_2_ss1 = (pow_2_s >>> 1);
            for (let off = 0; off < blksize; off += pow_2_s) {
                let wNr_r = 1.0, wNr_i = 0.0;
                for (
                    let p = off, pend = off + pow_2_ss1, q = pend; 
                    p < pend; 
                    ++p, ++q
                ) {
                    //  Do 2-points Cooley-Tukey transform.
                    FFTCooleyTukeyTransform2P(x_re, x_im, p, q, wNr_r, wNr_i);

                    //  Roll the subsup{w, N, r} coefficient.
                    let wNr_r_next = (wNr_r * wNs_r - wNr_i * wNs_i);
                    let wNr_i_next = (wNr_r * wNs_i + wNr_i * wNs_r);
                    wNr_r = wNr_r_next;
                    wNr_i = wNr_i_next;
                }
            }
        }
    };
}

//
//  Private functions.
//

/**
 *  Do 2-points Cooley-Tukey transform.
 * 
 *  @param {Number[]} re 
 *    - The real part of each point.
 *  @param {Number[]} im 
 *    - The imaginary part of each point.
 *  @param {Number} p
 *    - The index of the even point.
 *  @param {Number} q
 *    - The index of the odd point.
 *  @param {Number} wNr_r 
 *    - The real part of `subsup{w, N, r}`.
 *  @param {Number} wNr_i 
 *    - The imaginary part of `subsup{w, N, r}`.
 */
function FFTCooleyTukeyTransform2P(re, im, p, q, wNr_r, wNr_i) {
    let p_r = re[p], p_i = im[p];
    let q_r = re[q], q_i = im[q];

    let t_r = q_r * wNr_r - q_i * wNr_i, 
        t_i = q_r * wNr_i + q_i * wNr_r;

    re[p] = p_r + t_r;
    im[p] = p_i + t_i;

    re[q] = p_r - t_r;
    im[q] = p_i - t_i;
}

/**
 *  Swap two items at specific indexes on both arrays.
 * 
 *  @param {Number[]} arr1 
 *    - The first array.
 *  @param {Number[]} arr2 
 *    - The second array.
 *  @param {Number} i1 
 *    - The first index.
 *  @param {Number} i2 
 *    - The second index.
 */
function FFTArraySwap2(arr1, arr2, i1, i2) {
    //  Swap the 1st array.
    let tmp = arr1[i1];
    arr1[i1] = arr1[i2];
    arr1[i2] = tmp;

    //  Swap the 2nd array.
    tmp = arr2[i1];
    arr2[i1] = arr2[i2];
    arr2[i2] = tmp;
}

/**
 *  Do bit reversal shuffle on both arrays.
 * 
 *  Note(s):
 *    [1] The description algorithm used here can be downloaded from:
 *        https://drive.google.com/file/d/1ud9FRlrhxiSA0QxsL4JBgU0iBpifMm_6/
 * 
 *  @param {Number[]} arr1 
 *    - The first array.
 *  @param {Number[]} arr2 
 *    - The second array.
 *  @param {Number} nbits 
 *    - The bit count.
 *  @param {Number[]} brv_m 
 *    - The bit reversal table (must contains 2 ^ (nbits >> 1) items).
 */
function FFTArrayBitReversalShuffle2(arr1, arr2, nbits, brv_m) {
    if (nbits <= 1) {
        return;
    }
    let m = (nbits >> 1);
    let mp1 = m + 1;
    // let brv_m = NewBitReversalPermutate(m);
    let inv = ((1 << nbits) >>> 0) - 1;
    let pow_2_m = ((1 << m) >>> 0);
    let pow_2_ms1 = (pow_2_m >> 1);
    if (((nbits & 1) >>> 0) == 0) {
        for (let a = 0; a < pow_2_ms1; ++a) {
            for (let b = 0; b < a; ++b) {
                let i = ((b << m) >>> 0) + brv_m[a];
                let ri = ((a << m) >>> 0) + brv_m[b];
                FFTArraySwap2(arr1, arr2, i, ri);
                FFTArraySwap2(arr1, arr2, inv ^ ri, inv ^ i);
            }
        }
        for (let a = pow_2_ms1; a < pow_2_m; ++a) {
            for (let b = 0; b < pow_2_ms1; ++b) {
                let i = ((b << m) >>> 0) + brv_m[a];
                let ri = ((a << m) >>> 0) + brv_m[b];
                FFTArraySwap2(arr1, arr2, i, ri);
            }
        }
    } else {
        for (let a = 0; a < pow_2_ms1; ++a) {
            for (let b = 0; b < a; ++b) {
                let i = ((b << mp1) >>> 0) + brv_m[a];
                let ri = ((a << mp1) >>> 0) + brv_m[b];
                FFTArraySwap2(arr1, arr2, i, ri);
                FFTArraySwap2(arr1, arr2, inv ^ ri, inv ^ i);
                i += pow_2_m;
                ri += pow_2_m;
                FFTArraySwap2(arr1, arr2, i, ri);
                FFTArraySwap2(arr1, arr2, inv ^ ri, inv ^ i);
            }
        }
        for (let a = pow_2_ms1; a < pow_2_m; ++a) {
            for (let b = 0; b < pow_2_ms1; ++b) {
                let i = ((b << mp1) >>> 0) + brv_m[a];
                let ri = ((a << mp1) >>> 0) + brv_m[b];
                FFTArraySwap2(arr1, arr2, i, ri);
                FFTArraySwap2(arr1, arr2, i + pow_2_m, ri + pow_2_m);
            }
        }
    }
}

//
//  Inheritances.
//
Inherits(FFTCooleyTukeyTransformer, IFFTTransformer);

//  Export public APIs.
module.exports = {
    "FFTCooleyTukeyTransformer": FFTCooleyTukeyTransformer
};
