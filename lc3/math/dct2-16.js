//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
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
    //
    //  This function was generated by our proprietary DCT compiler 
    //  automatically.
    //  Do NOT modified the code manually.
    //
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
    t17 = t2 + t10;
    t20 = t3 + t11;
    t18 = t6 + t14;
    t21 = t7 + t15;
    t22 = t2 - t10;
    t23 = t3 - t11;
    t16 = t6 - t14;
    t19 = t7 - t15;
    t2 = t17 + t18;
    t3 = t20 + t21;
    t6 = t22 + t19;
    t7 = t23 - t16;
    t10 = t17 - t18;
    t11 = t20 - t21;
    t14 = t22 - t19;
    t15 = t23 + t16;
    t17 = t6 + t7;
    t20 = t7 - t6;
    t6 = t17 * 0.7071067811865476;
    t7 = t20 * 0.7071067811865476;
    t18 = t10;
    t10 = t11;
    t11 = -t18;
    t21 = t15 - t14;
    t22 = -t14 - t15;
    t14 = t21 * 0.7071067811865476;
    t15 = t22 * 0.7071067811865476;
    t19 = t0;
    t16 = t1;
    t23 = t2;
    t17 = t3;
    t0 = t19 + t23;
    t1 = t16 + t17;
    t2 = t19 - t23;
    t3 = t16 - t17;
    t20 = t4;
    t18 = t5;
    t21 = t6;
    t22 = t7;
    t4 = t20 + t21;
    t5 = t18 + t22;
    t6 = t20 - t21;
    t7 = t18 - t22;
    t23 = t8;
    t16 = t9;
    t19 = t10;
    t17 = t11;
    t8 = t23 + t19;
    t9 = t16 + t17;
    t10 = t23 - t19;
    t11 = t16 - t17;
    t20 = t12;
    t18 = t13;
    t21 = t14;
    t22 = t15;
    t12 = t20 + t21;
    t13 = t18 + t22;
    t14 = t20 - t21;
    t15 = t18 - t22;
    t23 = t0 + t1;
    t17 = t0 - t1;
    t0 = t23;
    t19 = t17;
    t16 = 0;
    t20 = t4 + t14;
    t18 = t5 - t15;
    t21 = t5 + t15;
    t22 = t14 - t4;
    t23 = 0.9238795325112865 * (t21 + t22);
    t17 = t21 * (-1.306562964876377);
    t24 = t22 * 0.5411961001461961;
    t21 = t23 - t24;
    t22 = t23 + t17;
    t4 = t20 + t21;
    t5 = t18 + t22;
    t14 = t20 - t21;
    t15 = t22 - t18;
    t20 = t8 + t10;
    t18 = t9 - t11;
    t21 = t9 + t11;
    t22 = t10 - t8;
    t24 = t21 + t22;
    t23 = t22 - t21;
    t21 = t24 * 0.7071067811865476;
    t22 = t23 * 0.7071067811865476;
    t8 = t20 + t21;
    t9 = t18 + t22;
    t10 = t20 - t21;
    t11 = t22 - t18;
    t17 = t12 + t6;
    t20 = t13 - t7;
    t18 = t13 + t7;
    t21 = t6 - t12;
    t22 = 0.38268343236509 * (t18 + t21);
    t24 = t18 * (-1.3065629648763766);
    t23 = t21 * (-0.5411961001461967);
    t18 = t22 - t23;
    t21 = t22 + t24;
    t12 = t17 + t18;
    t13 = t20 + t21;
    t6 = t17 - t18;
    t7 = t21 - t20;
    t17 = t2 + t2;
    t20 = t3 + t3;
    t22 = t2 - t2;
    t18 = t20;
    t20 = t22;
    t22 = -t18;
    t2 = t17 + t20;
    t3 = t22;
    t21 = 0.49759236333609846 * (t4 + t5);
    t24 = t4 * (-0.5466009335008787);
    t23 = t5 * 0.4485837931713182;
    t4 = t21 - t23;
    t5 = t21 + t24;
    t17 = 0.49039264020161516 * (t8 + t9);
    t20 = t8 * (-0.5879378012096795);
    t18 = t9 * 0.3928474791935508;
    t8 = t17 - t18;
    t9 = t17 + t20;
    t22 = 0.4784701678661044 * (t12 + t13);
    t21 = t12 * (-0.6236125064933357);
    t24 = t13 * 0.33332782923887316;
    t12 = t22 - t24;
    t13 = t22 + t21;
    t23 = 0.46193976625564326 * (t2 + t3);
    t17 = t2 * (-0.6532814824381885);
    t20 = t3 * 0.27059805007309806;
    t2 = t23 - t20;
    t3 = t23 + t17;
    t18 = 0.4409606321741774 * (t6 + t7);
    t22 = t6 * (-0.6766590005871764);
    t21 = t7 * 0.20526226376117845;
    t6 = t18 - t21;
    t7 = t18 + t22;
    t24 = 0.4157348061512726 * (t10 + t11);
    t23 = t10 * (-0.6935199226610738);
    t17 = t11 * 0.13794968964147153;
    t10 = t24 - t17;
    t11 = t24 + t23;
    t20 = 0.38650522668136833 * (t14 + t15);
    t18 = t14 * (-0.7037018687631913);
    t22 = t15 * 0.06930858459954536;
    t14 = t20 - t22;
    t15 = t20 + t18;
    t21 = t19 + t16;
    t19 = t21 * 0.7071067811865476;
    dct_out[0] = t0;
    dct_out[1] = t4;
    dct_out[2] = t8;
    dct_out[3] = t12;
    dct_out[4] = t2;
    dct_out[5] = t6;
    dct_out[6] = t10;
    dct_out[7] = t14;
    dct_out[8] = t19;
    dct_out[9] = -t15;
    dct_out[10] = -t11;
    dct_out[11] = -t7;
    dct_out[12] = -t3;
    dct_out[13] = -t13;
    dct_out[14] = -t9;
    dct_out[15] = -t5;
    return dct_out;
}

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
    //
    //  This function was generated by our proprietary DCT compiler 
    //  automatically.
    //  Do NOT modified the code manually.
    //
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
    t22 = 0.38650522668136833 * (t18 + t19);
    t21 = t18 * (-0.7037018687631913);
    t20 = t19 * 0.06930858459954536;
    t18 = t22 - t20;
    t19 = t22 + t21;
    t22 = t16 + t18;
    t21 = t17 - t19;
    t20 = -(t17 + t19);
    t23 = t16 - t18;
    t19 = 0.9238795325112865 * (t20 + t23);
    t18 = t20 * (-1.306562964876377);
    t16 = t23 * 0.5411961001461961;
    t20 = t19 - t16;
    t23 = t19 + t18;
    t2 = t22 + t20;
    t3 = t21 + t23;
    t14 = t22 - t20;
    t15 = t23 - t21;
    t17 = idct_in[2];
    t23 = idct_in[14];
    t21 = 0.49039264020161516 * (t17 + t23);
    t20 = t17 * (-0.5879378012096795);
    t18 = t23 * 0.3928474791935508;
    t17 = t21 - t18;
    t23 = t21 + t20;
    t19 = idct_in[6];
    t22 = idct_in[10];
    t16 = 0.4157348061512726 * (t19 + t22);
    t21 = t19 * (-0.6935199226610738);
    t20 = t22 * 0.13794968964147153;
    t19 = t16 - t20;
    t22 = t16 + t21;
    t18 = t17 + t19;
    t16 = t23 - t22;
    t21 = -(t23 + t22);
    t20 = t17 - t19;
    t17 = t21 + t20;
    t23 = t20 - t21;
    t21 = t17 * 0.7071067811865476;
    t20 = t23 * 0.7071067811865476;
    t4 = t18 + t21;
    t5 = t16 + t20;
    t12 = t18 - t21;
    t13 = t20 - t16;
    t19 = idct_in[3];
    t22 = idct_in[13];
    t18 = 0.4784701678661044 * (t19 + t22);
    t17 = t19 * (-0.6236125064933357);
    t16 = t22 * 0.33332782923887316;
    t19 = t18 - t16;
    t22 = t18 + t17;
    t21 = idct_in[5];
    t20 = idct_in[11];
    t23 = 0.4409606321741774 * (t21 + t20);
    t18 = t21 * (-0.6766590005871764);
    t17 = t20 * 0.20526226376117845;
    t21 = t23 - t17;
    t20 = t23 + t18;
    t16 = t19 + t21;
    t23 = t22 - t20;
    t18 = -(t22 + t20);
    t17 = t19 - t21;
    t19 = 0.38268343236509 * (t18 + t17);
    t22 = t18 * (-1.3065629648763766);
    t21 = t17 * (-0.5411961001461967);
    t18 = t19 - t21;
    t17 = t19 + t22;
    t6 = t16 + t18;
    t7 = t23 + t17;
    t10 = t16 - t18;
    t11 = t17 - t23;
    t8 = idct_in[4];
    t9 = idct_in[12];
    t18 = 0.9238795325112865 * (t8 + t9);
    t20 = t8 * (-1.306562964876377);
    t16 = t9 * 0.5411961001461961;
    t8 = t18 - t16;
    t9 = t18 + t20;
    t23 = t0 + t8;
    t19 = t1 + t9;
    t22 = t4 + t12;
    t17 = t5 + t13;
    t21 = t0 - t8;
    t18 = t1 - t9;
    t20 = t4 - t12;
    t16 = t5 - t13;
    t0 = t23 + t22;
    t1 = t19 + t17;
    t4 = t21 + t16;
    t5 = t18 - t20;
    t8 = t23 - t22;
    t9 = t19 - t17;
    t12 = t21 - t16;
    t13 = t18 + t20;
    t23 = t2 + t10;
    t19 = t3 + t11;
    t22 = t6 + t14;
    t21 = t7 + t15;
    t20 = t2 - t10;
    t18 = t3 - t11;
    t17 = t6 - t14;
    t16 = t7 - t15;
    t2 = t23 + t22;
    t3 = t19 + t21;
    t6 = t20 + t16;
    t7 = t18 - t17;
    t10 = t23 - t22;
    t11 = t19 - t21;
    t14 = t20 - t16;
    t15 = t18 + t17;
    t20 = t6 + t7;
    t23 = t7 - t6;
    t6 = t20 * 0.7071067811865476;
    t7 = t23 * 0.7071067811865476;
    t17 = t10;
    t10 = t11;
    t11 = -t17;
    t22 = t15 - t14;
    t21 = -t14 - t15;
    t14 = t22 * 0.7071067811865476;
    t15 = t21 * 0.7071067811865476;
    t18 = t0;
    t16 = t1;
    t19 = t2;
    t20 = t3;
    t0 = t18 + t19;
    t1 = t16 + t20;
    t2 = t18 - t19;
    t3 = t16 - t20;
    t23 = t4;
    t17 = t5;
    t22 = t6;
    t21 = t7;
    t4 = t23 + t22;
    t5 = t17 + t21;
    t6 = t23 - t22;
    t7 = t17 - t21;
    t18 = t8;
    t16 = t9;
    t19 = t10;
    t20 = t11;
    t8 = t18 + t19;
    t9 = t16 + t20;
    t10 = t18 - t19;
    t11 = t16 - t20;
    t23 = t12;
    t17 = t13;
    t22 = t14;
    t21 = t15;
    t12 = t23 + t22;
    t13 = t17 + t21;
    t14 = t23 - t22;
    t15 = t17 - t21;
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
    "DCTIIForward_16": DCTIIForward_16,
    "DCTIIInverse_16": DCTIIInverse_16
};