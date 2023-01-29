//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Note(s):
//    [1] This file is generated automatically by a IDCT compiler, which locates
//        at "./../../dev/idct2-generator/" directory.
//        Do NOT modify this file manually.
//

//
//  Public functions.
//

/**
 *  Do 16-point Type-II IDCT (not orthogonalized).
 * 
 *  Note(s):
 *    [1] Expected output:
 *        idct_out[n] = sum(k = 0...N-1, idct_in[k] * cos((2n + 1)kπ / 2N))
 *        (where 0 <= n < N, N = 16).
 *    [2] In-place transformation is supported.
 * 
 *  @param {Number[]} idct_in
 *    - The input vector.
 *  @param {Number[]} [idct_out]
 *    - The output vector.
 *  @returns {Number[]}
 *    - The output vector.
 */
function DCTIIInverse_16(idct_in, idct_out = new Array(16)) {
    let t0, t1, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t2, t20, t21, t22, t23, t3, t4, t5, t6, t7, t8, t9;
    t16 = idct_in[0];
    t17 = 0.7071067811865476 * idct_in[8];
    t0 = t16 + t17;
    t1 = t16 - t17;
    t16 = idct_in[1];
    t17 = idct_in[15];
    t20 = 0.49759236333609846 * (t16 + t17);
    t21 = t16 * (-0.5466009335008787);
    t22 = t17 * 0.4485837931713182;
    t16 = t20 - t22;
    t17 = t20 + t21;
    t18 = idct_in[7];
    t19 = idct_in[9];
    t20 = 0.38650522668136833 * (t18 + t19);
    t21 = t18 * (-0.7037018687631913);
    t22 = t19 * 0.06930858459954536;
    t18 = t20 - t22;
    t19 = t20 + t21;
    t20 = t16 + t18;
    t21 = t17 - t19;
    t22 = -(t17 + t19);
    t23 = t16 - t18;
    t16 = 0.9238795325112865 * (t22 + t23);
    t17 = t22 * (-1.306562964876377);
    t18 = t23 * 0.5411961001461961;
    t22 = t16 - t18;
    t23 = t16 + t17;
    t2 = t20 + t22;
    t3 = t21 + t23;
    t14 = t20 - t22;
    t15 = t23 - t21;
    t19 = idct_in[2];
    t16 = idct_in[14];
    t20 = 0.49039264020161516 * (t19 + t16);
    t21 = t19 * (-0.5879378012096795);
    t22 = t16 * 0.3928474791935508;
    t19 = t20 - t22;
    t16 = t20 + t21;
    t17 = idct_in[6];
    t18 = idct_in[10];
    t23 = 0.4157348061512726 * (t17 + t18);
    t20 = t17 * (-0.6935199226610738);
    t21 = t18 * 0.13794968964147153;
    t17 = t23 - t21;
    t18 = t23 + t20;
    t22 = t19 + t17;
    t23 = t16 - t18;
    t20 = -(t16 + t18);
    t21 = t19 - t17;
    t19 = t20 + t21;
    t16 = t21 - t20;
    t20 = t19 * 0.7071067811865476;
    t21 = t16 * 0.7071067811865476;
    t4 = t22 + t20;
    t5 = t23 + t21;
    t12 = t22 - t20;
    t13 = t21 - t23;
    t17 = idct_in[3];
    t18 = idct_in[13];
    t22 = 0.4784701678661044 * (t17 + t18);
    t23 = t17 * (-0.6236125064933357);
    t20 = t18 * 0.33332782923887316;
    t17 = t22 - t20;
    t18 = t22 + t23;
    t19 = idct_in[5];
    t16 = idct_in[11];
    t21 = 0.4409606321741774 * (t19 + t16);
    t22 = t19 * (-0.6766590005871764);
    t23 = t16 * 0.20526226376117845;
    t19 = t21 - t23;
    t16 = t21 + t22;
    t20 = t17 + t19;
    t21 = t18 - t16;
    t22 = -(t18 + t16);
    t23 = t17 - t19;
    t17 = 0.38268343236509 * (t22 + t23);
    t18 = t22 * (-1.3065629648763766);
    t19 = t23 * (-0.5411961001461967);
    t22 = t17 - t19;
    t23 = t17 + t18;
    t6 = t20 + t22;
    t7 = t21 + t23;
    t10 = t20 - t22;
    t11 = t23 - t21;
    t8 = idct_in[4];
    t9 = idct_in[12];
    t16 = 0.9238795325112865 * (t8 + t9);
    t17 = t8 * (-1.306562964876377);
    t18 = t9 * 0.5411961001461961;
    t8 = t16 - t18;
    t9 = t16 + t17;
    t19 = t0 + t8;
    t20 = t1 + t9;
    t21 = t4 + t12;
    t22 = t5 + t13;
    t23 = t0 - t8;
    t16 = t1 - t9;
    t17 = t4 - t12;
    t18 = t5 - t13;
    t0 = t19 + t21;
    t1 = t20 + t22;
    t4 = t23 + t18;
    t5 = t16 - t17;
    t8 = t19 - t21;
    t9 = t20 - t22;
    t12 = t23 - t18;
    t13 = t16 + t17;
    t19 = t2 + t10;
    t20 = t3 + t11;
    t21 = t6 + t14;
    t22 = t7 + t15;
    t23 = t2 - t10;
    t16 = t3 - t11;
    t17 = t6 - t14;
    t18 = t7 - t15;
    t2 = t19 + t21;
    t3 = t20 + t22;
    t6 = t23 + t18;
    t7 = t16 - t17;
    t10 = t19 - t21;
    t11 = t20 - t22;
    t14 = t23 - t18;
    t15 = t16 + t17;
    t19 = t6 + t7;
    t20 = t7 - t6;
    t6 = t19 * 0.7071067811865476;
    t7 = t20 * 0.7071067811865476;
    t21 = t10;
    t10 = t11;
    t11 = -t21;
    t22 = t15 - t14;
    t23 = -t14 - t15;
    t14 = t22 * 0.7071067811865476;
    t15 = t23 * 0.7071067811865476;
    t16 = t0;
    t17 = t1;
    t18 = t2;
    t19 = t3;
    t0 = t16 + t18;
    t1 = t17 + t19;
    t2 = t16 - t18;
    t3 = t17 - t19;
    t20 = t4;
    t21 = t5;
    t22 = t6;
    t23 = t7;
    t4 = t20 + t22;
    t5 = t21 + t23;
    t6 = t20 - t22;
    t7 = t21 - t23;
    t16 = t8;
    t17 = t9;
    t18 = t10;
    t19 = t11;
    t8 = t16 + t18;
    t9 = t17 + t19;
    t10 = t16 - t18;
    t11 = t17 - t19;
    t20 = t12;
    t21 = t13;
    t22 = t14;
    t23 = t15;
    t12 = t20 + t22;
    t13 = t21 + t23;
    t14 = t20 - t22;
    t15 = t21 - t23;
    idct_out[0] = t0;
    idct_out[1] = t15;
    idct_out[2] = t1;
    idct_out[3] = t14;
    idct_out[4] = t4;
    idct_out[5] = t11;
    idct_out[6] = t5;
    idct_out[7] = t10;
    idct_out[8] = t8;
    idct_out[9] = t7;
    idct_out[10] = t9;
    idct_out[11] = t6;
    idct_out[12] = t12;
    idct_out[13] = t3;
    idct_out[14] = t13;
    idct_out[15] = t2;
    return idct_out;
}

//  Exported public APIs.
module.exports = {
    "DCTIIInverse_16": DCTIIInverse_16
};