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
const MXTr2 = 
    Lc3FftMxBaseOp.MXTr2;
// const MXTr3 = 
//     Lc3FftMxBaseOp.MXTr3;
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
const CSHFT_INDEXES_0 = [1, 32, 82, 65, 14, 144, 135, 29, 138, 125, 13, 112, 83, 97, 89, 137, 93, 113, 115, 27, 74, 150, 23, 98, 121, 37, 90, 17, 88, 105, 11, 48, 108, 107, 75, 30, 18, 120, 5, 8, 104, 131, 53, 116, 59, 156, 63, 102, 67, 78, 126, 45, 12, 80];
const CSHFT_INDEXES_1 = [2, 64, 134, 149, 143, 103, 99, 153, 119, 155, 31, 50, 20];
const CSHFT_INDEXES_2 = [3, 96, 57, 92, 81, 33, 114, 147, 79, 158, 127, 77, 94, 145, 15, 24, 130, 21, 34, 146, 47, 76, 62, 70, 22, 66, 46, 44, 132, 85, 9, 136, 61, 38, 122, 69, 142, 71, 54, 148, 111, 51, 52, 84, 129, 141, 39, 154, 151, 55, 28, 106, 43, 100];
const CSHFT_INDEXES_3 = [4, 128, 109, 139, 157, 95, 25, 10, 16, 56, 60, 6, 40];
const CSHFT_INDEXES_4 = [7, 72, 86, 41, 36, 58, 124, 133, 117, 91, 49, 140];
const CSHFT_INDEXES_5 = [19, 152, 87, 73, 118, 123, 101, 35, 26, 42, 68, 110];

//
//  Public functions.
//

/**
 *  Apply in-place mixed-radix FFT transform (prebuilt for block size 160).
 * 
 *  Note(s):
 *    [1] The size of `re` and `im` will not be checked.
 * 
 *  @param {Number[]} re 
 *    - The real part of each point.
 *  @param {Number[]} im 
 *    - The imaginary part of each point.
 */
function ApplyMixedRadixFFT_160(re, im) {
    MXTr5(re, im, 0, 32, 64, 96, 128);
    MXTr5(re, im, 1, 33, 65, 97, 129);
    MXTr5(re, im, 2, 34, 66, 98, 130);
    MXTr5(re, im, 3, 35, 67, 99, 131);
    MXTr5(re, im, 4, 36, 68, 100, 132);
    MXTr5(re, im, 5, 37, 69, 101, 133);
    MXTr5(re, im, 6, 38, 70, 102, 134);
    MXTr5(re, im, 7, 39, 71, 103, 135);
    MXTr5(re, im, 8, 40, 72, 104, 136);
    MXTr5(re, im, 9, 41, 73, 105, 137);
    MXTr5(re, im, 10, 42, 74, 106, 138);
    MXTr5(re, im, 11, 43, 75, 107, 139);
    MXTr5(re, im, 12, 44, 76, 108, 140);
    MXTr5(re, im, 13, 45, 77, 109, 141);
    MXTr5(re, im, 14, 46, 78, 110, 142);
    MXTr5(re, im, 15, 47, 79, 111, 143);
    MXTr5(re, im, 16, 48, 80, 112, 144);
    MXTr5(re, im, 17, 49, 81, 113, 145);
    MXTr5(re, im, 18, 50, 82, 114, 146);
    MXTr5(re, im, 19, 51, 83, 115, 147);
    MXTr5(re, im, 20, 52, 84, 116, 148);
    MXTr5(re, im, 21, 53, 85, 117, 149);
    MXTr5(re, im, 22, 54, 86, 118, 150);
    MXTr5(re, im, 23, 55, 87, 119, 151);
    MXTr5(re, im, 24, 56, 88, 120, 152);
    MXTr5(re, im, 25, 57, 89, 121, 153);
    MXTr5(re, im, 26, 58, 90, 122, 154);
    MXTr5(re, im, 27, 59, 91, 123, 155);
    MXTr5(re, im, 28, 60, 92, 124, 156);
    MXTr5(re, im, 29, 61, 93, 125, 157);
    MXTr5(re, im, 30, 62, 94, 126, 158);
    MXTr5(re, im, 31, 63, 95, 127, 159);
    MXRot(re, im, 33, 0.9992290362407229, -0.03925981575906861);
    MXRot(re, im, 34, 0.996917333733128, -0.07845909572784494);
    MXRot(re, im, 35, 0.9930684569549263, -0.11753739745783764);
    MXRot(re, im, 36, 0.9876883405951378, -0.15643446504023087);
    MXRot(re, im, 37, 0.9807852804032304, -0.19509032201612825);
    MXRot(re, im, 38, 0.9723699203976766, -0.2334453638559054);
    MXRot(re, im, 39, 0.9624552364536473, -0.27144044986507426);
    MXRot(re, im, 40, 0.9510565162951535, -0.3090169943749474);
    MXRot(re, im, 41, 0.9381913359224842, -0.34611705707749296);
    MXRot(re, im, 42, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 43, 0.9081431738250813, -0.4186597375374281);
    MXRot(re, im, 44, 0.8910065241883679, -0.45399049973954675);
    MXRot(re, im, 45, 0.8724960070727972, -0.4886212414969549);
    MXRot(re, im, 46, 0.8526401643540922, -0.5224985647159488);
    MXRot(re, im, 47, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 48, 0.8090169943749475, -0.5877852522924731);
    MXRot(re, im, 49, 0.785316930880745, -0.619093949309834);
    MXRot(re, im, 50, 0.7604059656000309, -0.6494480483301837);
    MXRot(re, im, 51, 0.7343225094356856, -0.6788007455329417);
    MXRot(re, im, 52, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 53, 0.6788007455329418, -0.7343225094356856);
    MXRot(re, im, 54, 0.6494480483301837, -0.7604059656000309);
    MXRot(re, im, 55, 0.619093949309834, -0.785316930880745);
    MXRot(re, im, 56, 0.5877852522924731, -0.8090169943749475);
    MXRot(re, im, 57, 0.5555702330196023, -0.8314696123025452);
    MXRot(re, im, 58, 0.5224985647159489, -0.8526401643540922);
    MXRot(re, im, 59, 0.48862124149695496, -0.8724960070727971);
    MXRot(re, im, 60, 0.4539904997395468, -0.8910065241883678);
    MXRot(re, im, 61, 0.41865973753742813, -0.9081431738250813);
    MXRot(re, im, 62, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 63, 0.346117057077493, -0.9381913359224842);
    MXRot(re, im, 65, 0.996917333733128, -0.07845909572784494);
    MXRot(re, im, 66, 0.9876883405951378, -0.15643446504023087);
    MXRot(re, im, 67, 0.9723699203976766, -0.2334453638559054);
    MXRot(re, im, 68, 0.9510565162951535, -0.3090169943749474);
    MXRot(re, im, 69, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 70, 0.8910065241883679, -0.45399049973954675);
    MXRot(re, im, 71, 0.8526401643540922, -0.5224985647159488);
    MXRot(re, im, 72, 0.8090169943749475, -0.5877852522924731);
    MXRot(re, im, 73, 0.7604059656000309, -0.6494480483301837);
    MXRot(re, im, 74, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 75, 0.6494480483301837, -0.7604059656000309);
    MXRot(re, im, 76, 0.5877852522924731, -0.8090169943749475);
    MXRot(re, im, 77, 0.5224985647159489, -0.8526401643540922);
    MXRot(re, im, 78, 0.4539904997395468, -0.8910065241883678);
    MXRot(re, im, 79, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 80, 0.30901699437494745, -0.9510565162951535);
    MXRot(re, im, 81, 0.23344536385590547, -0.9723699203976766);
    MXRot(re, im, 82, 0.15643446504023092, -0.9876883405951378);
    MXRot(re, im, 83, 0.078459095727845, -0.996917333733128);
    MXRot(re, im, 84, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 85, -0.07845909572784487, -0.996917333733128);
    MXRot(re, im, 86, -0.1564344650402308, -0.9876883405951378);
    MXRot(re, im, 87, -0.23344536385590534, -0.9723699203976767);
    MXRot(re, im, 88, -0.30901699437494734, -0.9510565162951536);
    MXRot(re, im, 89, -0.3826834323650897, -0.9238795325112867);
    MXRot(re, im, 90, -0.4539904997395467, -0.8910065241883679);
    MXRot(re, im, 91, -0.5224985647159488, -0.8526401643540923);
    MXRot(re, im, 92, -0.587785252292473, -0.8090169943749475);
    MXRot(re, im, 93, -0.6494480483301835, -0.760405965600031);
    MXRot(re, im, 94, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 95, -0.7604059656000309, -0.6494480483301838);
    MXRot(re, im, 97, 0.9930684569549263, -0.11753739745783764);
    MXRot(re, im, 98, 0.9723699203976766, -0.2334453638559054);
    MXRot(re, im, 99, 0.9381913359224842, -0.34611705707749296);
    MXRot(re, im, 100, 0.8910065241883679, -0.45399049973954675);
    MXRot(re, im, 101, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 102, 0.7604059656000309, -0.6494480483301837);
    MXRot(re, im, 103, 0.6788007455329418, -0.7343225094356856);
    MXRot(re, im, 104, 0.5877852522924731, -0.8090169943749475);
    MXRot(re, im, 105, 0.48862124149695496, -0.8724960070727971);
    MXRot(re, im, 106, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 107, 0.2714404498650743, -0.9624552364536473);
    MXRot(re, im, 108, 0.15643446504023092, -0.9876883405951378);
    MXRot(re, im, 109, 0.039259815759068666, -0.9992290362407229);
    MXRot(re, im, 110, -0.07845909572784487, -0.996917333733128);
    MXRot(re, im, 111, -0.1950903220161282, -0.9807852804032304);
    MXRot(re, im, 112, -0.30901699437494734, -0.9510565162951536);
    MXRot(re, im, 113, -0.4186597375374278, -0.9081431738250815);
    MXRot(re, im, 114, -0.5224985647159488, -0.8526401643540923);
    MXRot(re, im, 115, -0.6190939493098341, -0.7853169308807448);
    MXRot(re, im, 116, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 117, -0.7853169308807447, -0.6190939493098342);
    MXRot(re, im, 118, -0.8526401643540922, -0.5224985647159489);
    MXRot(re, im, 119, -0.9081431738250814, -0.41865973753742797);
    MXRot(re, im, 120, -0.9510565162951535, -0.3090169943749475);
    MXRot(re, im, 121, -0.9807852804032304, -0.1950903220161286);
    MXRot(re, im, 122, -0.996917333733128, -0.07845909572784507);
    MXRot(re, im, 123, -0.9992290362407229, 0.03925981575906871);
    MXRot(re, im, 124, -0.9876883405951378, 0.15643446504023073);
    MXRot(re, im, 125, -0.9624552364536474, 0.27144044986507393);
    MXRot(re, im, 126, -0.9238795325112868, 0.38268343236508967);
    MXRot(re, im, 127, -0.8724960070727971, 0.488621241496955);
    MXRot(re, im, 129, 0.9876883405951378, -0.15643446504023087);
    MXRot(re, im, 130, 0.9510565162951535, -0.3090169943749474);
    MXRot(re, im, 131, 0.8910065241883679, -0.45399049973954675);
    MXRot(re, im, 132, 0.8090169943749475, -0.5877852522924731);
    MXRot(re, im, 133, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 134, 0.5877852522924731, -0.8090169943749475);
    MXRot(re, im, 135, 0.4539904997395468, -0.8910065241883678);
    MXRot(re, im, 136, 0.30901699437494745, -0.9510565162951535);
    MXRot(re, im, 137, 0.15643446504023092, -0.9876883405951378);
    MXRot(re, im, 138, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 139, -0.1564344650402308, -0.9876883405951378);
    MXRot(re, im, 140, -0.30901699437494734, -0.9510565162951536);
    MXRot(re, im, 141, -0.4539904997395467, -0.8910065241883679);
    MXRot(re, im, 142, -0.587785252292473, -0.8090169943749475);
    MXRot(re, im, 143, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 144, -0.8090169943749473, -0.5877852522924732);
    MXRot(re, im, 145, -0.8910065241883678, -0.45399049973954686);
    MXRot(re, im, 146, -0.9510565162951535, -0.3090169943749475);
    MXRot(re, im, 147, -0.9876883405951377, -0.15643446504023098);
    MXRot(re, im, 148, -1.0, -1.2246467991473532e-16);
    MXRot(re, im, 149, -0.9876883405951378, 0.15643446504023073);
    MXRot(re, im, 150, -0.9510565162951536, 0.3090169943749473);
    MXRot(re, im, 151, -0.8910065241883679, 0.4539904997395467);
    MXRot(re, im, 152, -0.8090169943749476, 0.587785252292473);
    MXRot(re, im, 153, -0.7071067811865477, 0.7071067811865475);
    MXRot(re, im, 154, -0.5877852522924732, 0.8090169943749473);
    MXRot(re, im, 155, -0.4539904997395469, 0.8910065241883678);
    MXRot(re, im, 156, -0.30901699437494756, 0.9510565162951535);
    MXRot(re, im, 157, -0.15643446504023104, 0.9876883405951377);
    MXRot(re, im, 158, -1.8369701987210297e-16, 1.0);
    MXRot(re, im, 159, 0.15643446504023067, 0.9876883405951378);
    MXTr4(re, im, 0, 8, 16, 24);
    MXTr4(re, im, 1, 9, 17, 25);
    MXTr4(re, im, 2, 10, 18, 26);
    MXTr4(re, im, 3, 11, 19, 27);
    MXTr4(re, im, 4, 12, 20, 28);
    MXTr4(re, im, 5, 13, 21, 29);
    MXTr4(re, im, 6, 14, 22, 30);
    MXTr4(re, im, 7, 15, 23, 31);
    MXRot(re, im, 9, 0.9807852804032304, -0.19509032201612825);
    MXRot(re, im, 10, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 11, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 12, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 13, 0.5555702330196023, -0.8314696123025452);
    MXRot(re, im, 14, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 15, 0.19509032201612833, -0.9807852804032304);
    MXRot(re, im, 17, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 18, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 19, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 20, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 21, -0.3826834323650897, -0.9238795325112867);
    MXRot(re, im, 22, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 23, -0.9238795325112867, -0.3826834323650899);
    MXRot(re, im, 25, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 26, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 27, -0.1950903220161282, -0.9807852804032304);
    MXRot(re, im, 28, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 29, -0.9807852804032304, -0.1950903220161286);
    MXRot(re, im, 30, -0.9238795325112868, 0.38268343236508967);
    MXRot(re, im, 31, -0.5555702330196022, 0.8314696123025452);
    MXTr4(re, im, 0, 2, 4, 6);
    MXTr4(re, im, 1, 3, 5, 7);
    MXRot(re, im, 3, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 5, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 7, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 0, 1);
    MXTr2(re, im, 2, 3);
    MXTr2(re, im, 4, 5);
    MXTr2(re, im, 6, 7);
    MXTr4(re, im, 8, 10, 12, 14);
    MXTr4(re, im, 9, 11, 13, 15);
    MXRot(re, im, 11, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 13, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 15, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 8, 9);
    MXTr2(re, im, 10, 11);
    MXTr2(re, im, 12, 13);
    MXTr2(re, im, 14, 15);
    MXTr4(re, im, 16, 18, 20, 22);
    MXTr4(re, im, 17, 19, 21, 23);
    MXRot(re, im, 19, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 21, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 23, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 16, 17);
    MXTr2(re, im, 18, 19);
    MXTr2(re, im, 20, 21);
    MXTr2(re, im, 22, 23);
    MXTr4(re, im, 24, 26, 28, 30);
    MXTr4(re, im, 25, 27, 29, 31);
    MXRot(re, im, 27, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 29, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 31, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 24, 25);
    MXTr2(re, im, 26, 27);
    MXTr2(re, im, 28, 29);
    MXTr2(re, im, 30, 31);
    MXTr4(re, im, 32, 40, 48, 56);
    MXTr4(re, im, 33, 41, 49, 57);
    MXTr4(re, im, 34, 42, 50, 58);
    MXTr4(re, im, 35, 43, 51, 59);
    MXTr4(re, im, 36, 44, 52, 60);
    MXTr4(re, im, 37, 45, 53, 61);
    MXTr4(re, im, 38, 46, 54, 62);
    MXTr4(re, im, 39, 47, 55, 63);
    MXRot(re, im, 41, 0.9807852804032304, -0.19509032201612825);
    MXRot(re, im, 42, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 43, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 44, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 45, 0.5555702330196023, -0.8314696123025452);
    MXRot(re, im, 46, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 47, 0.19509032201612833, -0.9807852804032304);
    MXRot(re, im, 49, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 50, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 51, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 52, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 53, -0.3826834323650897, -0.9238795325112867);
    MXRot(re, im, 54, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 55, -0.9238795325112867, -0.3826834323650899);
    MXRot(re, im, 57, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 58, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 59, -0.1950903220161282, -0.9807852804032304);
    MXRot(re, im, 60, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 61, -0.9807852804032304, -0.1950903220161286);
    MXRot(re, im, 62, -0.9238795325112868, 0.38268343236508967);
    MXRot(re, im, 63, -0.5555702330196022, 0.8314696123025452);
    MXTr4(re, im, 32, 34, 36, 38);
    MXTr4(re, im, 33, 35, 37, 39);
    MXRot(re, im, 35, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 37, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 39, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 32, 33);
    MXTr2(re, im, 34, 35);
    MXTr2(re, im, 36, 37);
    MXTr2(re, im, 38, 39);
    MXTr4(re, im, 40, 42, 44, 46);
    MXTr4(re, im, 41, 43, 45, 47);
    MXRot(re, im, 43, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 45, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 47, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 40, 41);
    MXTr2(re, im, 42, 43);
    MXTr2(re, im, 44, 45);
    MXTr2(re, im, 46, 47);
    MXTr4(re, im, 48, 50, 52, 54);
    MXTr4(re, im, 49, 51, 53, 55);
    MXRot(re, im, 51, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 53, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 55, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 48, 49);
    MXTr2(re, im, 50, 51);
    MXTr2(re, im, 52, 53);
    MXTr2(re, im, 54, 55);
    MXTr4(re, im, 56, 58, 60, 62);
    MXTr4(re, im, 57, 59, 61, 63);
    MXRot(re, im, 59, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 61, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 63, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 56, 57);
    MXTr2(re, im, 58, 59);
    MXTr2(re, im, 60, 61);
    MXTr2(re, im, 62, 63);
    MXTr4(re, im, 64, 72, 80, 88);
    MXTr4(re, im, 65, 73, 81, 89);
    MXTr4(re, im, 66, 74, 82, 90);
    MXTr4(re, im, 67, 75, 83, 91);
    MXTr4(re, im, 68, 76, 84, 92);
    MXTr4(re, im, 69, 77, 85, 93);
    MXTr4(re, im, 70, 78, 86, 94);
    MXTr4(re, im, 71, 79, 87, 95);
    MXRot(re, im, 73, 0.9807852804032304, -0.19509032201612825);
    MXRot(re, im, 74, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 75, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 76, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 77, 0.5555702330196023, -0.8314696123025452);
    MXRot(re, im, 78, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 79, 0.19509032201612833, -0.9807852804032304);
    MXRot(re, im, 81, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 82, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 83, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 84, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 85, -0.3826834323650897, -0.9238795325112867);
    MXRot(re, im, 86, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 87, -0.9238795325112867, -0.3826834323650899);
    MXRot(re, im, 89, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 90, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 91, -0.1950903220161282, -0.9807852804032304);
    MXRot(re, im, 92, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 93, -0.9807852804032304, -0.1950903220161286);
    MXRot(re, im, 94, -0.9238795325112868, 0.38268343236508967);
    MXRot(re, im, 95, -0.5555702330196022, 0.8314696123025452);
    MXTr4(re, im, 64, 66, 68, 70);
    MXTr4(re, im, 65, 67, 69, 71);
    MXRot(re, im, 67, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 69, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 71, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 64, 65);
    MXTr2(re, im, 66, 67);
    MXTr2(re, im, 68, 69);
    MXTr2(re, im, 70, 71);
    MXTr4(re, im, 72, 74, 76, 78);
    MXTr4(re, im, 73, 75, 77, 79);
    MXRot(re, im, 75, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 77, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 79, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 72, 73);
    MXTr2(re, im, 74, 75);
    MXTr2(re, im, 76, 77);
    MXTr2(re, im, 78, 79);
    MXTr4(re, im, 80, 82, 84, 86);
    MXTr4(re, im, 81, 83, 85, 87);
    MXRot(re, im, 83, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 85, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 87, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 80, 81);
    MXTr2(re, im, 82, 83);
    MXTr2(re, im, 84, 85);
    MXTr2(re, im, 86, 87);
    MXTr4(re, im, 88, 90, 92, 94);
    MXTr4(re, im, 89, 91, 93, 95);
    MXRot(re, im, 91, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 93, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 95, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 88, 89);
    MXTr2(re, im, 90, 91);
    MXTr2(re, im, 92, 93);
    MXTr2(re, im, 94, 95);
    MXTr4(re, im, 96, 104, 112, 120);
    MXTr4(re, im, 97, 105, 113, 121);
    MXTr4(re, im, 98, 106, 114, 122);
    MXTr4(re, im, 99, 107, 115, 123);
    MXTr4(re, im, 100, 108, 116, 124);
    MXTr4(re, im, 101, 109, 117, 125);
    MXTr4(re, im, 102, 110, 118, 126);
    MXTr4(re, im, 103, 111, 119, 127);
    MXRot(re, im, 105, 0.9807852804032304, -0.19509032201612825);
    MXRot(re, im, 106, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 107, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 108, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 109, 0.5555702330196023, -0.8314696123025452);
    MXRot(re, im, 110, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 111, 0.19509032201612833, -0.9807852804032304);
    MXRot(re, im, 113, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 114, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 115, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 116, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 117, -0.3826834323650897, -0.9238795325112867);
    MXRot(re, im, 118, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 119, -0.9238795325112867, -0.3826834323650899);
    MXRot(re, im, 121, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 122, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 123, -0.1950903220161282, -0.9807852804032304);
    MXRot(re, im, 124, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 125, -0.9807852804032304, -0.1950903220161286);
    MXRot(re, im, 126, -0.9238795325112868, 0.38268343236508967);
    MXRot(re, im, 127, -0.5555702330196022, 0.8314696123025452);
    MXTr4(re, im, 96, 98, 100, 102);
    MXTr4(re, im, 97, 99, 101, 103);
    MXRot(re, im, 99, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 101, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 103, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 96, 97);
    MXTr2(re, im, 98, 99);
    MXTr2(re, im, 100, 101);
    MXTr2(re, im, 102, 103);
    MXTr4(re, im, 104, 106, 108, 110);
    MXTr4(re, im, 105, 107, 109, 111);
    MXRot(re, im, 107, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 109, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 111, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 104, 105);
    MXTr2(re, im, 106, 107);
    MXTr2(re, im, 108, 109);
    MXTr2(re, im, 110, 111);
    MXTr4(re, im, 112, 114, 116, 118);
    MXTr4(re, im, 113, 115, 117, 119);
    MXRot(re, im, 115, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 117, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 119, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 112, 113);
    MXTr2(re, im, 114, 115);
    MXTr2(re, im, 116, 117);
    MXTr2(re, im, 118, 119);
    MXTr4(re, im, 120, 122, 124, 126);
    MXTr4(re, im, 121, 123, 125, 127);
    MXRot(re, im, 123, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 125, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 127, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 120, 121);
    MXTr2(re, im, 122, 123);
    MXTr2(re, im, 124, 125);
    MXTr2(re, im, 126, 127);
    MXTr4(re, im, 128, 136, 144, 152);
    MXTr4(re, im, 129, 137, 145, 153);
    MXTr4(re, im, 130, 138, 146, 154);
    MXTr4(re, im, 131, 139, 147, 155);
    MXTr4(re, im, 132, 140, 148, 156);
    MXTr4(re, im, 133, 141, 149, 157);
    MXTr4(re, im, 134, 142, 150, 158);
    MXTr4(re, im, 135, 143, 151, 159);
    MXRot(re, im, 137, 0.9807852804032304, -0.19509032201612825);
    MXRot(re, im, 138, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 139, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 140, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 141, 0.5555702330196023, -0.8314696123025452);
    MXRot(re, im, 142, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 143, 0.19509032201612833, -0.9807852804032304);
    MXRot(re, im, 145, 0.9238795325112867, -0.3826834323650898);
    MXRot(re, im, 146, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 147, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 148, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 149, -0.3826834323650897, -0.9238795325112867);
    MXRot(re, im, 150, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 151, -0.9238795325112867, -0.3826834323650899);
    MXRot(re, im, 153, 0.8314696123025452, -0.5555702330196022);
    MXRot(re, im, 154, 0.38268343236508984, -0.9238795325112867);
    MXRot(re, im, 155, -0.1950903220161282, -0.9807852804032304);
    MXRot(re, im, 156, -0.7071067811865475, -0.7071067811865476);
    MXRot(re, im, 157, -0.9807852804032304, -0.1950903220161286);
    MXRot(re, im, 158, -0.9238795325112868, 0.38268343236508967);
    MXRot(re, im, 159, -0.5555702330196022, 0.8314696123025452);
    MXTr4(re, im, 128, 130, 132, 134);
    MXTr4(re, im, 129, 131, 133, 135);
    MXRot(re, im, 131, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 133, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 135, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 128, 129);
    MXTr2(re, im, 130, 131);
    MXTr2(re, im, 132, 133);
    MXTr2(re, im, 134, 135);
    MXTr4(re, im, 136, 138, 140, 142);
    MXTr4(re, im, 137, 139, 141, 143);
    MXRot(re, im, 139, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 141, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 143, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 136, 137);
    MXTr2(re, im, 138, 139);
    MXTr2(re, im, 140, 141);
    MXTr2(re, im, 142, 143);
    MXTr4(re, im, 144, 146, 148, 150);
    MXTr4(re, im, 145, 147, 149, 151);
    MXRot(re, im, 147, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 149, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 151, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 144, 145);
    MXTr2(re, im, 146, 147);
    MXTr2(re, im, 148, 149);
    MXTr2(re, im, 150, 151);
    MXTr4(re, im, 152, 154, 156, 158);
    MXTr4(re, im, 153, 155, 157, 159);
    MXRot(re, im, 155, 0.7071067811865476, -0.7071067811865475);
    MXRot(re, im, 157, 6.123233995736766e-17, -1.0);
    MXRot(re, im, 159, -0.7071067811865475, -0.7071067811865476);
    MXTr2(re, im, 152, 153);
    MXTr2(re, im, 154, 155);
    MXTr2(re, im, 156, 157);
    MXTr2(re, im, 158, 159);
    MXCshft(re, im, CSHFT_INDEXES_0);
    MXCshft(re, im, CSHFT_INDEXES_1);
    MXCshft(re, im, CSHFT_INDEXES_2);
    MXCshft(re, im, CSHFT_INDEXES_3);
    MXCshft(re, im, CSHFT_INDEXES_4);
    MXCshft(re, im, CSHFT_INDEXES_5);
}

//  Export public APIs.
module.exports = {
    "ApplyMixedRadixFFT_160": ApplyMixedRadixFFT_160
};