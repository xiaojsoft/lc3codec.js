//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Note(s):
//    [1] This file is generated automatically by a FFT compiler, which locates 
//        at "./../../dev/fft-mx-generator/" directory.
//        Do NOT modify this file manually.
//

//
//  Imports.
//

//  Imported modules.
const Lc3FftMxBaseOp = 
    require("./fft-mx-baseop");

//  Imported functions.
// const MXTr2 = 
//     Lc3FftMxBaseOp.MXTr2;
const MXTr3 = 
    Lc3FftMxBaseOp.MXTr3;
const MXTr4 = 
    Lc3FftMxBaseOp.MXTr4;
const MXTr5 = 
    Lc3FftMxBaseOp.MXTr5;
const MXRot = 
    Lc3FftMxBaseOp.MXRot;
// const MXSwap = 
//     Lc3FftMxBaseOp.MXSwap;
const MXCshft = 
    Lc3FftMxBaseOp.MXCshft;

//
//  Constants.
//

//  Cyclic shift indexes.
const CSHFT_INDEXES_0 = [1, 12, 30, 7, 27, 28, 40, 2, 24, 49, 53, 44, 50, 8, 39, 58, 47, 29, 52, 32, 31, 19, 57, 35, 10, 6, 15, 9, 51, 20];
const CSHFT_INDEXES_1 = [3, 36, 22, 25, 4, 48, 41, 14, 54, 56, 23, 37, 34, 55, 11, 18, 45, 5];
const CSHFT_INDEXES_2 = [13, 42, 26, 16, 21];
const CSHFT_INDEXES_3 = [17, 33, 43, 38, 46];

//
//  Public functions.
//

/**
 *  Apply in-place mixed-radix FFT transform (prebuilt for block size 60).
 * 
 *  Note(s):
 *    [1] The size of `re` and `im` will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part of each point.
 *  @param {Number[]} im 
 *    - The imaginary part of each point.
 */
function ApplyMixedRadixFFT_60(re, im) {
    MXTr5(re, im, 0, 12, 24, 36, 48);
    MXTr5(re, im, 1, 13, 25, 37, 49);
    MXTr5(re, im, 2, 14, 26, 38, 50);
    MXTr5(re, im, 3, 15, 27, 39, 51);
    MXTr5(re, im, 4, 16, 28, 40, 52);
    MXTr5(re, im, 5, 17, 29, 41, 53);
    MXTr5(re, im, 6, 18, 30, 42, 54);
    MXTr5(re, im, 7, 19, 31, 43, 55);
    MXTr5(re, im, 8, 20, 32, 44, 56);
    MXTr5(re, im, 9, 21, 33, 45, 57);
    MXTr5(re, im, 10, 22, 34, 46, 58);
    MXTr5(re, im, 11, 23, 35, 47, 59);
    MXRot(re, im, 13, 0.9945218953682733, -0.10452846326765346);
    MXRot(re, im, 14, 0.9781476007338057, -0.20791169081775931);
    MXRot(re, im, 15, 0.9510565162951535, -0.3090169943749474);
    MXRot(re, im, 16, 0.9135454576426009, -0.40673664307580015);
    MXRot(re, im, 17, 0.8660254037844387, -0.49999999999999994);
    MXRot(re, im, 18, 0.8090169943749475, -0.5877852522924731);
    MXRot(re, im, 19, 0.7431448254773944, -0.6691306063588581);
    MXRot(re, im, 20, 0.6691306063588582, -0.7431448254773941);
    MXRot(re, im, 21, 0.5877852522924731, -0.8090169943749475);
    MXRot(re, im, 22, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 23, 0.4067366430758004, -0.9135454576426009);
    MXRot(re, im, 25, 0.9781476007338057, -0.20791169081775931);
    MXRot(re, im, 26, 0.9135454576426009, -0.40673664307580015);
    MXRot(re, im, 27, 0.8090169943749475, -0.5877852522924731);
    MXRot(re, im, 28, 0.6691306063588582, -0.7431448254773941);
    MXRot(re, im, 29, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 30, 0.30901699437494745, -0.9510565162951535);
    MXRot(re, im, 31, 0.10452846326765368, -0.9945218953682733);
    MXRot(re, im, 32, -0.10452846326765333, -0.9945218953682734);
    MXRot(re, im, 33, -0.30901699437494734, -0.9510565162951536);
    MXRot(re, im, 34, -0.4999999999999998, -0.8660254037844387);
    MXRot(re, im, 35, -0.6691306063588579, -0.7431448254773945);
    MXRot(re, im, 37, 0.9510565162951535, -0.3090169943749474);
    MXRot(re, im, 38, 0.8090169943749475, -0.5877852522924731);
    MXRot(re, im, 39, 0.5877852522924731, -0.8090169943749475);
    MXRot(re, im, 40, 0.30901699437494745, -0.9510565162951535);
    MXRot(re, im, 41, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 42, -0.30901699437494734, -0.9510565162951536);
    MXRot(re, im, 43, -0.587785252292473, -0.8090169943749475);
    MXRot(re, im, 44, -0.8090169943749473, -0.5877852522924732);
    MXRot(re, im, 45, -0.9510565162951535, -0.3090169943749475);
    MXRot(re, im, 46, -1.0, -1.2246467991473532e-16);
    MXRot(re, im, 47, -0.9510565162951536, 0.3090169943749473);
    MXRot(re, im, 49, 0.9135454576426009, -0.40673664307580015);
    MXRot(re, im, 50, 0.6691306063588582, -0.7431448254773941);
    MXRot(re, im, 51, 0.30901699437494745, -0.9510565162951535);
    MXRot(re, im, 52, -0.10452846326765333, -0.9945218953682734);
    MXRot(re, im, 53, -0.4999999999999998, -0.8660254037844387);
    MXRot(re, im, 54, -0.8090169943749473, -0.5877852522924732);
    MXRot(re, im, 55, -0.9781476007338056, -0.20791169081775973);
    MXRot(re, im, 56, -0.9781476007338057, 0.20791169081775907);
    MXRot(re, im, 57, -0.8090169943749476, 0.587785252292473);
    MXRot(re, im, 58, -0.5000000000000004, 0.8660254037844384);
    MXRot(re, im, 59, -0.10452846326765423, 0.9945218953682733);
    MXTr4(re, im, 0, 3, 6, 9);
    MXTr4(re, im, 1, 4, 7, 10);
    MXTr4(re, im, 2, 5, 8, 11);
    MXRot(re, im, 4, 0.8660254037844387, -0.49999999999999994);
    MXRot(re, im, 5, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 7, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 8, -0.4999999999999998, -0.8660254037844387);
    MXRot(re, im, 10, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 11, -1.0, -1.2246467991473532e-16);
    MXTr3(re, im, 0, 1, 2);
    MXTr3(re, im, 3, 4, 5);
    MXTr3(re, im, 6, 7, 8);
    MXTr3(re, im, 9, 10, 11);
    MXTr4(re, im, 12, 15, 18, 21);
    MXTr4(re, im, 13, 16, 19, 22);
    MXTr4(re, im, 14, 17, 20, 23);
    MXRot(re, im, 16, 0.8660254037844387, -0.49999999999999994);
    MXRot(re, im, 17, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 19, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 20, -0.4999999999999998, -0.8660254037844387);
    MXRot(re, im, 22, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 23, -1.0, -1.2246467991473532e-16);
    MXTr3(re, im, 12, 13, 14);
    MXTr3(re, im, 15, 16, 17);
    MXTr3(re, im, 18, 19, 20);
    MXTr3(re, im, 21, 22, 23);
    MXTr4(re, im, 24, 27, 30, 33);
    MXTr4(re, im, 25, 28, 31, 34);
    MXTr4(re, im, 26, 29, 32, 35);
    MXRot(re, im, 28, 0.8660254037844387, -0.49999999999999994);
    MXRot(re, im, 29, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 31, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 32, -0.4999999999999998, -0.8660254037844387);
    MXRot(re, im, 34, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 35, -1.0, -1.2246467991473532e-16);
    MXTr3(re, im, 24, 25, 26);
    MXTr3(re, im, 27, 28, 29);
    MXTr3(re, im, 30, 31, 32);
    MXTr3(re, im, 33, 34, 35);
    MXTr4(re, im, 36, 39, 42, 45);
    MXTr4(re, im, 37, 40, 43, 46);
    MXTr4(re, im, 38, 41, 44, 47);
    MXRot(re, im, 40, 0.8660254037844387, -0.49999999999999994);
    MXRot(re, im, 41, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 43, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 44, -0.4999999999999998, -0.8660254037844387);
    MXRot(re, im, 46, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 47, -1.0, -1.2246467991473532e-16);
    MXTr3(re, im, 36, 37, 38);
    MXTr3(re, im, 39, 40, 41);
    MXTr3(re, im, 42, 43, 44);
    MXTr3(re, im, 45, 46, 47);
    MXTr4(re, im, 48, 51, 54, 57);
    MXTr4(re, im, 49, 52, 55, 58);
    MXTr4(re, im, 50, 53, 56, 59);
    MXRot(re, im, 52, 0.8660254037844387, -0.49999999999999994);
    MXRot(re, im, 53, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 55, 0.5000000000000001, -0.8660254037844386);
    MXRot(re, im, 56, -0.4999999999999998, -0.8660254037844387);
    MXRot(re, im, 58, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 59, -1.0, -1.2246467991473532e-16);
    MXTr3(re, im, 48, 49, 50);
    MXTr3(re, im, 51, 52, 53);
    MXTr3(re, im, 54, 55, 56);
    MXTr3(re, im, 57, 58, 59);
    MXCshft(re, im, CSHFT_INDEXES_0);
    MXCshft(re, im, CSHFT_INDEXES_1);
    MXCshft(re, im, CSHFT_INDEXES_2);
    MXCshft(re, im, CSHFT_INDEXES_3);
}

//  Export public APIs.
module.exports = {
    "ApplyMixedRadixFFT_60": ApplyMixedRadixFFT_60
};