//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Note(s):
//    [1] This file is generated automatically by a FDCT compiler, which locates
//        at "./../../dev/fdct2-generator/" directory.
//        Do NOT modify this file manually.
//

//
//  Public functions.
//

/**
 *  Do 16-point Type-II FDCT (not orthogonalized).
 * 
 *  Note(s):
 *    [1] Expected output:
 *        dct_out[k] = sum(n = 0...N-1, dct_in[n] * cos((2n + 1)kπ / 2N))
 *        (where 0 <= k < N, N = 16).
 *    [2] In-place transformation is supported.
 * 
 *  @param {Number[]} dct_in
 *    - The input vector.
 *  @param {Number[]} [dct_out]
 *    - The output vector.
 *  @returns {Number[]}
 *    - The output vector.
 */
function DCTIIForward_16(dct_in, dct_out = new Array(16)) {
    let t0, t1, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t2, t20, t21, t22, t23, t24, t3, t4, t5, t6, t7, t8, t9;
    t0 = dct_in[0];
    t1 = dct_in[2];
    t2 = dct_in[4];
    t3 = dct_in[6];
    t4 = dct_in[8];
    t5 = dct_in[10];
    t6 = dct_in[12];
    t7 = dct_in[14];
    t8 = dct_in[15];
    t9 = dct_in[13];
    t10 = dct_in[11];
    t11 = dct_in[9];
    t12 = dct_in[7];
    t13 = dct_in[5];
    t14 = dct_in[3];
    t15 = dct_in[1];
    t16 = t0 + t8;
    t17 = t1 + t9;
    t18 = t4 + t12;
    t19 = t5 + t13;
    t20 = t0 - t8;
    t21 = t1 - t9;
    t22 = t4 - t12;
    t23 = t5 - t13;
    t0 = t16 + t18;
    t1 = t17 + t19;
    t4 = t20 + t23;
    t5 = t21 - t22;
    t8 = t16 - t18;
    t9 = t17 - t19;
    t12 = t20 - t23;
    t13 = t21 + t22;
    t16 = t2 + t10;
    t17 = t3 + t11;
    t18 = t6 + t14;
    t19 = t7 + t15;
    t20 = t2 - t10;
    t21 = t3 - t11;
    t22 = t6 - t14;
    t23 = t7 - t15;
    t2 = t16 + t18;
    t3 = t17 + t19;
    t6 = t20 + t23;
    t7 = t21 - t22;
    t10 = t16 - t18;
    t11 = t17 - t19;
    t14 = t20 - t23;
    t15 = t21 + t22;
    t16 = t6 + t7;
    t17 = t7 - t6;
    t6 = t16 * 0.7071067811865476;
    t7 = t17 * 0.7071067811865476;
    t18 = t10;
    t10 = t11;
    t11 = -t18;
    t19 = t15 - t14;
    t20 = -t14 - t15;
    t14 = t19 * 0.7071067811865476;
    t15 = t20 * 0.7071067811865476;
    t21 = t0;
    t22 = t1;
    t23 = t2;
    t16 = t3;
    t0 = t21 + t23;
    t1 = t22 + t16;
    t2 = t21 - t23;
    t3 = t22 - t16;
    t17 = t4;
    t18 = t5;
    t19 = t6;
    t20 = t7;
    t4 = t17 + t19;
    t5 = t18 + t20;
    t6 = t17 - t19;
    t7 = t18 - t20;
    t21 = t8;
    t22 = t9;
    t23 = t10;
    t16 = t11;
    t8 = t21 + t23;
    t9 = t22 + t16;
    t10 = t21 - t23;
    t11 = t22 - t16;
    t17 = t12;
    t18 = t13;
    t19 = t14;
    t20 = t15;
    t12 = t17 + t19;
    t13 = t18 + t20;
    t14 = t17 - t19;
    t15 = t18 - t20;
    t23 = t0 + t1;
    t16 = t0 - t1;
    t0 = t23;
    t21 = t16;
    t22 = 0;
    t17 = t4 + t14;
    t18 = t5 - t15;
    t19 = t5 + t15;
    t20 = t14 - t4;
    t23 = 0.9238795325112865 * (t19 + t20);
    t16 = t19 * (-1.306562964876377);
    t24 = t20 * 0.5411961001461961;
    t19 = t23 - t24;
    t20 = t23 + t16;
    t4 = t17 + t19;
    t5 = t18 + t20;
    t14 = t17 - t19;
    t15 = t20 - t18;
    t23 = t8 + t10;
    t16 = t9 - t11;
    t24 = t9 + t11;
    t17 = t10 - t8;
    t18 = t24 + t17;
    t19 = t17 - t24;
    t24 = t18 * 0.7071067811865476;
    t17 = t19 * 0.7071067811865476;
    t8 = t23 + t24;
    t9 = t16 + t17;
    t10 = t23 - t24;
    t11 = t17 - t16;
    t20 = t12 + t6;
    t18 = t13 - t7;
    t19 = t13 + t7;
    t23 = t6 - t12;
    t16 = 0.38268343236509 * (t19 + t23);
    t24 = t19 * (-1.3065629648763766);
    t17 = t23 * (-0.5411961001461967);
    t19 = t16 - t17;
    t23 = t16 + t24;
    t12 = t20 + t19;
    t13 = t18 + t23;
    t6 = t20 - t19;
    t7 = t23 - t18;
    t16 = t2 + t2;
    t24 = t3 + t3;
    t17 = t2 - t2;
    t20 = t24;
    t24 = t17;
    t17 = -t20;
    t2 = t16 + t24;
    t3 = t17;
    t18 = 0.49759236333609846 * (t4 + t5);
    t19 = t4 * (-0.5466009335008787);
    t23 = t5 * 0.4485837931713182;
    t4 = t18 - t23;
    t5 = t18 + t19;
    t20 = 0.49039264020161516 * (t8 + t9);
    t16 = t8 * (-0.5879378012096795);
    t24 = t9 * 0.3928474791935508;
    t8 = t20 - t24;
    t9 = t20 + t16;
    t17 = 0.4784701678661044 * (t12 + t13);
    t18 = t12 * (-0.6236125064933357);
    t19 = t13 * 0.33332782923887316;
    t12 = t17 - t19;
    t13 = t17 + t18;
    t23 = 0.46193976625564326 * (t2 + t3);
    t20 = t2 * (-0.6532814824381885);
    t16 = t3 * 0.27059805007309806;
    t2 = t23 - t16;
    t3 = t23 + t20;
    t24 = 0.4409606321741774 * (t6 + t7);
    t17 = t6 * (-0.6766590005871764);
    t18 = t7 * 0.20526226376117845;
    t6 = t24 - t18;
    t7 = t24 + t17;
    t19 = 0.4157348061512726 * (t10 + t11);
    t23 = t10 * (-0.6935199226610738);
    t20 = t11 * 0.13794968964147153;
    t10 = t19 - t20;
    t11 = t19 + t23;
    t16 = 0.38650522668136833 * (t14 + t15);
    t24 = t14 * (-0.7037018687631913);
    t17 = t15 * 0.06930858459954536;
    t14 = t16 - t17;
    t15 = t16 + t24;
    t18 = t21 + t22;
    t21 = t18 * 0.7071067811865476;
    dct_out[0] = t0;
    dct_out[1] = t4;
    dct_out[2] = t8;
    dct_out[3] = t12;
    dct_out[4] = t2;
    dct_out[5] = t6;
    dct_out[6] = t10;
    dct_out[7] = t14;
    dct_out[8] = t21;
    dct_out[9] = -t15;
    dct_out[10] = -t11;
    dct_out[11] = -t7;
    dct_out[12] = -t3;
    dct_out[13] = -t13;
    dct_out[14] = -t9;
    dct_out[15] = -t5;
    return dct_out;
}

//  Exported public APIs.
module.exports = {
    "DCTIIForward_16": DCTIIForward_16
};