//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Note(s):
//    [1] The algorithm for MXTr2(), MXTr3(), MXTr4() and MXTr5() is derived 
//        from the paper authored by S. Winograd:
//
//        - Winograd, S. (1978).
//          On Computing the Discrete Fourier Transform. 
//          Mathematics of Computation, 32(141), 175–199. 
//          https://doi.org/10.2307/2006266
//
//    [2] Mixed-radix Cooley-Tukey algorithm is used in the implementation of 
//        `fft-mx-*.js` (except this file).
//
//    [3] For understanding mixed-radix Cooley-Tukey algorithm, see following 
//        reference materials:
//
//        - Cooley, J. W., & Tukey, J. W. (1965). 
//          An Algorithm for the Machine Calculation of Complex Fourier Series. 
//          Mathematics of Computation, 19(90), 297–301. 
//          https://doi.org/10.2307/2003354
//
//        - Wikipedia
//          https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm
//

//
//  Public functions.
//

/**
 *  Apply in-place 2-point FFT transform.
 * 
 *  Note(s):
 *    [1] The size of `re` and `im` will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part array.
 *  @param {Number[]} im 
 *    - The imaginary part array.
 *  @param {Number} i0
 *    - The index of the 1st point.
 *  @param {Number} i1
 *    - The index of the 2nd point.
 */
function MXTr2(re, im, i0, i1){
    let t1_r = re[i0];
    let t1_i = im[i0];
    let t2_r = re[i1];
    let t2_i = im[i1];
    re[i0] = t1_r + t2_r;
    im[i0] = t1_i + t2_i;
    re[i1] = t1_r - t2_r;
    im[i1] = t1_i - t2_i;
}

/**
 *  Apply in-place 3-point FFT transform.
 * 
 *  Note(s):
 *    [1] The size of `re` and `im` will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part array.
 *  @param {Number[]} im 
 *    - The imaginary part array.
 *  @param {Number} i0
 *    - The index of the 1st point.
 *  @param {Number} i1
 *    - The index of the 2nd point.
 *  @param {Number} i2
 *    - The index of the 3rd point.
 */
function MXTr3(re, im, i0, i1, i2) {
    let i0_r = re[i0];
    let i0_i = im[i0];
    let i1_r = re[i1];
    let i1_i = im[i1];
    let i2_r = re[i2];
    let i2_i = im[i2];
    let t1_r = i1_r + i2_r;
    let t1_i = i1_i + i2_i;
    let t2_r = i0_r - 0.5 * t1_r;
    let t2_i = i0_i - 0.5 * t1_i;
    let t3_r = 0.8660254037844386 * (i1_r - i2_r);
    let t3_i = 0.8660254037844386 * (i1_i - i2_i);
    re[i0] = i0_r + t1_r;
    im[i0] = i0_i + t1_i;
    re[i1] = t2_r + t3_i;
    im[i1] = t2_i - t3_r;
    re[i2] = t2_r - t3_i;
    im[i2] = t2_i + t3_r;
}

/**
 *  Apply in-place 4-point FFT transform.
 * 
 *  Note(s):
 *    [1] The size of `re` and `im` will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part array.
 *  @param {Number[]} im 
 *    - The imaginary part array.
 *  @param {Number} i0
 *    - The index of the 1st point.
 *  @param {Number} i1
 *    - The index of the 2nd point.
 *  @param {Number} i2
 *    - The index of the 3rd point.
 *  @param {Number} i3
 *    - The index of the 4th point.
 */
function MXTr4(re, im, i0, i1, i2, i3) {
    let i0_r = re[i0];
    let i0_i = im[i0];
    let i1_r = re[i1];
    let i1_i = im[i1];
    let i2_r = re[i2];
    let i2_i = im[i2];
    let i3_r = re[i3];
    let i3_i = im[i3];
    let t1_r = i0_r + i2_r;
    let t1_i = i0_i + i2_i;
    let t2_r = i1_r + i3_r;
    let t2_i = i1_i + i3_i;
    let t3_r = i0_r - i2_r;
    let t3_i = i0_i - i2_i;
    let t4_r = i1_r - i3_r;
    let t4_i = i1_i - i3_i;
    re[i0] = t1_r + t2_r;
    im[i0] = t1_i + t2_i;
    re[i1] = t3_r + t4_i;
    im[i1] = t3_i - t4_r;
    re[i2] = t1_r - t2_r;
    im[i2] = t1_i - t2_i;
    re[i3] = t3_r - t4_i;
    im[i3] = t3_i + t4_r;
}

/**
 *  Apply in-place 5-point FFT transform.
 * 
 *  Note(s):
 *    [1] The size of `re` and `im` will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part array.
 *  @param {Number[]} im 
 *    - The imaginary part array.
 *  @param {Number} i0
 *    - The index of the 1st point.
 *  @param {Number} i1
 *    - The index of the 2nd point.
 *  @param {Number} i2
 *    - The index of the 3rd point.
 *  @param {Number} i3
 *    - The index of the 4th point.
 *  @param {Number} i4
 *    - The index of the 5th point.
 */
function MXTr5(re, im, i0, i1, i2, i3, i4) {
    let i0_r = re[i0];
    let i0_i = im[i0];
    let i1_r = re[i1];
    let i1_i = im[i1];
    let i2_r = re[i2];
    let i2_i = im[i2];
    let i3_r = re[i3];
    let i3_i = im[i3];
    let i4_r = re[i4];
    let i4_i = im[i4];
    let t1_r = i1_r + i4_r;
    let t1_i = i1_i + i4_i;
    let t2_r = i2_r + i3_r;
    let t2_i = i2_i + i3_i;
    let t3_r = i1_r - i4_r;
    let t3_i = i1_i - i4_i;
    let t4_r = i2_r - i3_r;
    let t4_i = i2_i - i3_i;
    let t5_r = t1_r + t2_r;
    let t5_i = t1_i + t2_i;
    let t6_r = 0.5590169943749475 * (t1_r - t2_r);
    let t6_i = 0.5590169943749475 * (t1_i - t2_i);
    let t7_r = i0_r - 0.25 * t5_r;
    let t7_i = i0_i - 0.25 * t5_i;
    let t8_r = t7_r + t6_r;
    let t8_i = t7_i + t6_i;
    let t9_r = t7_r - t6_r;
    let t9_i = t7_i - t6_i;
    let t10_r = 0.9510565162951535 * t3_r + 0.5877852522924731 * t4_r;
    let t10_i = 0.9510565162951535 * t3_i + 0.5877852522924731 * t4_i;
    let t11_r = 0.5877852522924731 * t3_r - 0.9510565162951535 * t4_r;
    let t11_i = 0.5877852522924731 * t3_i - 0.9510565162951535 * t4_i;
    re[i0] = i0_r + t5_r;
    im[i0] = i0_i + t5_i;
    re[i1] = t8_r + t10_i;
    im[i1] = t8_i - t10_r;
    re[i2] = t9_r + t11_i;
    im[i2] = t9_i - t11_r;
    re[i3] = t9_r - t11_i;
    im[i3] = t9_i + t11_r;
    re[i4] = t8_r - t10_i;
    im[i4] = t8_i + t10_r;
}

/**
 *  Apply in-place complex rotation (i.e. multiply with one point on the unit 
 *  circle).
 * 
 *  Note(s):
 *    [1] The index will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part array.
 *  @param {Number[]} im 
 *    - The imaginary part array.
 *  @param {Number} c_r
 *    - The real part of the point on the unit circle.
 *  @param {Number} c_i
 *    - The imaginary part of the point on the unit circle.
 */
function MXRot(re, im, idx, c_r, c_i) {
    let i0_r = re[idx];
    let i0_i = im[idx];
    re[idx] = i0_r * c_r - i0_i * c_i;
    im[idx] = i0_r * c_i + i0_i * c_r;
}

/**
 *  Apply in-place complex swap.
 * 
 *  Note(s):
 *    [1] The index will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part array.
 *  @param {Number[]} im 
 *    - The imaginary part array.
 *  @param {Number} i0
 *    - The index of the 1st point.
 *  @param {Number} i1
 *    - The index of the 2nd point.
 */
function MXSwap(re, im, i0, i1) {
    let t = re[i0];
    re[i0] = re[i1];
    re[i1] = t;
    t = im[i0];
    im[i0] = im[i1];
    im[i1] = t;
}

/**
 *  Apply cyclic shift on complex array.
 * 
 *  Note(s):
 *    [1] The indexes will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part array.
 *  @param {Number[]} im 
 *    - The imaginary part array.
 *  @param {Number[]} idxes
 *    - The indexes of items to be shifted.
 */
function MXCshft(re, im, idxes) {
    let i_first = idxes[0];
    let r0 = re[i_first];
    let i0 = im[i_first];
    let last = idxes.length - 1;
    for (let i = 0; i < last; ++i) {
        let i_cur = idxes[i];
        let i_next = idxes[i + 1];
        re[i_cur] = re[i_next];
        im[i_cur] = im[i_next];
    }
    let i_last = idxes[last];
    re[i_last] = r0;
    im[i_last] = i0;
}

//  Exported public APIs.
module.exports = {
    "MXTr2": MXTr2,
    "MXTr3": MXTr3,
    "MXTr4": MXTr4,
    "MXTr5": MXTr5,
    "MXRot": MXRot,
    "MXSwap": MXSwap,
    "MXCshft": MXCshft
};