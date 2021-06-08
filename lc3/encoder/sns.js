//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Nms = require("./../common/nms");
const Lc3Fs = require("./../common/fs");
const Lc3TblSns = require("./../tables/sns");
const Lc3Pvq = require("./../math/pvq");
const Lc3Mpvq = require("./../math/mpvq");
const Lc3Error = require("./../error");

//  Imported classes.
const LC3FrameDuration = Lc3Nms.LC3FrameDuration;
const LC3IllegalParameterError = Lc3Error.LC3IllegalParameterError;
const LC3SampleRate = Lc3Fs.LC3SampleRate;
const MPVQ = Lc3Mpvq.MPVQ;

//  Imported functions.
const PVQSearch = Lc3Pvq.PVQSearch;
const PVQNormalize = Lc3Pvq.PVQNormalize;

//
//  Constants.
//

//  Pre-emphasis factors (Eq. 21).
//  PEFACTOR_GTILT_{gtilt}[b] = 10 ^ (b * gtilt / 630) (Eq. 21).
const PEFACTOR_GTILT_TBL = [
    [  //  PEFACTOR_GTILT_14[b]:
        1.0, 1.052500285277733, 1.107756850509709, 1.1659144011798317, 1.22712523985119, 1.2915496650148839, 1.3593563908785256, 1.4307229891937576, 1.5058363542798405, 1.5848931924611136, 1.6681005372000588, 1.7556762912750012, 1.847849797422291, 1.944862438937362, 2.046968271807521, 2.154434690031884, 2.2675431258708016, 2.386589786858581, 2.51188643150958, 2.6437611857490997, 2.7825594022071245, 2.9286445646252366, 3.082399239745143, 3.24422607917163, 3.4145488738336014, 3.5938136638046276, 3.782489906389384, 3.9810717055349722, 4.190079105786669, 4.4100594541767375, 4.641588833612778, 4.885273571519389, 5.141751827683927, 5.411695265464636, 5.695810810737687, 5.99484250318941, 6.309573444801933, 6.6408278506348415, 6.989473207273485, 7.3564225445964135, 7.742636826811269, 8.149127469020742, 8.576958985908941, 9.027251779484576, 9.501185073181436, 10.0, 10.525002852777327, 11.077568505097092, 11.659144011798316, 12.271252398511898, 12.91549665014884, 13.593563908785255, 14.307229891937572, 15.058363542798407, 15.848931924611133, 16.68100537200059, 17.556762912750013, 18.478497974222908, 19.448624389373624, 20.46968271807521, 21.544346900318832, 22.67543125870802, 23.865897868585808, 25.118864315095795
    ],
    [  //  PEFACTOR_GTILT_18[b]:
        1.0, 1.0680004325145758, 1.1406249238513209, 1.2181879120101156, 1.3010252169108314, 1.3894954943731377, 1.4839817889675653, 1.5848931924611136, 1.692666615037876, 1.8077686769634342, 1.93069772888325, 2.06198600950222, 2.202201949987375, 2.3519526350709588, 2.51188643150958, 2.6826957952797255, 2.8651202696637807, 3.0599496872071956, 3.268027589410125, 3.4902548789595804, 3.72759372031494, 3.9810717055349722, 4.25178630338289, 4.540909610972476, 4.849693428528198, 5.179474679231212, 5.531681197617227, 5.907837911587945, 6.309573444801933, 6.738627168030947, 7.196856730011519, 7.686246100397738, 8.208914159638255, 8.767123872968682, 9.363292088239415, 10.0, 10.680004325145754, 11.406249238513208, 12.181879120101154, 13.010252169108314, 13.894954943731374, 14.839817889675654, 15.848931924611133, 16.92666615037876, 18.077686769634344, 19.306977288832506, 20.6198600950222, 22.022019499873746, 23.51952635070959, 25.118864315095795, 26.826957952797258, 28.651202696637803, 30.59949687207196, 32.68027589410125, 34.90254878959581, 37.2759372031494, 39.810717055349734, 42.5178630338289, 45.40909610972477, 48.49693428528198, 51.7947467923121, 55.316811976172275, 59.078379115879436, 63.09573444801933
    ],
    [  //  PEFACTOR_GTILT_22[b]:
        1.0, 1.0837288500594884, 1.1744682204512609, 1.2728050939810585, 1.3793756008499514, 1.4948691337092335, 1.620032807264131, 1.7556762912750012, 1.9026770482201645, 2.06198600950222, 2.234633726916594, 2.4217370391754693, 2.6245062966121013, 2.8442531908013184, 3.082399239745143, 3.340484983513245, 3.6201799498237976, 3.92329345403096, 4.25178630338289, 4.607783481263822, 4.993587893473147, 5.411695265464636, 5.864810286914368, 6.3558641080547655, 6.888033300956566, 7.464760408417121, 8.089776213383482, 8.767123872968682, 9.501185073181436, 10.296708373561293, 11.158839925077485, 12.093156760002127, 13.105702869106235, 14.203028299557833, 15.392231526442181, 16.68100537200059, 18.077686769634344, 19.591310694591456, 21.231668610207745, 23.00937180778458, 24.935920049841585, 27.023775960790164, 29.286445646252357, 31.738566062542784, 34.3959997014966, 37.2759372031494, 40.39700856005881, 43.77940363263582, 47.44500275508661, 51.41751827683925, 55.722647955071736, 60.388241190619574, 65.44447918262519, 70.92407016732852, 76.86246100397739, 83.29806647658269, 90.27251779484574, 97.83093190178289, 106.02220333016724, 114.89932049577536, 124.51970847350331, 134.94560047373244, 146.24444042198513, 158.48931924611142
    ],
    [  //  PEFACTOR_GTILT_26[b]:
        1.0, 1.0996888996439915, 1.2093156760002128, 1.329871025062904, 1.462444404219852, 1.6082338776670415, 1.7685569433018589, 1.944862438937362, 2.1387436354339573, 2.3519526350709588, 2.586416205275969, 2.8442531908013184, 3.127793661701214, 3.4395999701496587, 3.782489906389384, 4.159562163071847, 4.574224338109261, 5.030223729100138, 5.531681197617227, 6.083128409389046, 6.689548786914143, 7.3564225445964135, 8.089776213383482, 8.896237102461816, 9.783093190178288, 10.758358985421792, 11.830847954653533, 13.010252169108314, 14.307229891937572, 15.733501896818456, 17.301957388458945, 19.026770482201638, 20.9235282953511, 23.00937180778458, 25.303150764802094, 27.825594022071243, 30.59949687207196, 33.649927044908566, 37.004451245116094, 40.69338427167146, 44.75006297250449, 49.211147509232795, 54.116952654646376, 59.51181211687404, 65.44447918262519, 71.96856730011521, 79.14303458321822, 87.03271661530563, 95.7089123677128, 105.25002852777327, 115.74228805920579, 127.28050939810586, 139.9689633261297, 153.92231526442174, 169.26666150378762, 186.14066873551212, 204.696827180752, 225.1028286430176, 247.54308193718992, 272.22037938999074, 299.357729472049, 329.2003721230412, 362.0179949823796, 398.1071705534973
    ],
    [  //  PEFACTOR_GTILT_30[b]:
        1.0, 1.1158839925077484, 1.2451970847350329, 1.3894954943731377, 1.5505157798326246, 1.7301957388458942, 1.93069772888325, 2.154434690031884, 2.4040991835099716, 2.6826957952797255, 2.9935772947204895, 3.340484983513245, 3.72759372031494, 4.159562163071847, 4.641588833612778, 5.179474679231212, 5.779692884153313, 6.449466771037623, 7.196856730011519, 8.030857221391514, 8.961505019466045, 10.0, 11.158839925077485, 12.451970847350331, 13.894954943731374, 15.505157798326245, 17.301957388458945, 19.306977288832506, 21.544346900318832, 24.040991835099717, 26.826957952797258, 29.935772947204903, 33.404849835132445, 37.2759372031494, 41.59562163071847, 46.4158883361278, 51.7947467923121, 57.79692884153313, 64.49466771037623, 71.96856730011521, 80.30857221391513, 89.61505019466045, 100.0, 111.5883992507748, 124.51970847350331, 138.94954943731375, 155.05157798326255, 173.01957388458945, 193.06977288832496, 215.44346900318845, 240.40991835099717, 268.26957952797244, 299.357729472049, 334.04849835132444, 372.7593720314942, 415.9562163071847, 464.15888336127773, 517.9474679231213, 577.9692884153313, 644.946677103762, 719.6856730011522, 803.0857221391512, 896.150501946605, 1000.0
    ],
    [  //  PEFACTOR_GTILT_30[b]:
        1.0, 1.1158839925077484, 1.2451970847350329, 1.3894954943731377, 1.5505157798326246, 1.7301957388458942, 1.93069772888325, 2.154434690031884, 2.4040991835099716, 2.6826957952797255, 2.9935772947204895, 3.340484983513245, 3.72759372031494, 4.159562163071847, 4.641588833612778, 5.179474679231212, 5.779692884153313, 6.449466771037623, 7.196856730011519, 8.030857221391514, 8.961505019466045, 10.0, 11.158839925077485, 12.451970847350331, 13.894954943731374, 15.505157798326245, 17.301957388458945, 19.306977288832506, 21.544346900318832, 24.040991835099717, 26.826957952797258, 29.935772947204903, 33.404849835132445, 37.2759372031494, 41.59562163071847, 46.4158883361278, 51.7947467923121, 57.79692884153313, 64.49466771037623, 71.96856730011521, 80.30857221391513, 89.61505019466045, 100.0, 111.5883992507748, 124.51970847350331, 138.94954943731375, 155.05157798326255, 173.01957388458945, 193.06977288832496, 215.44346900318845, 240.40991835099717, 268.26957952797244, 299.357729472049, 334.04849835132444, 372.7593720314942, 415.9562163071847, 464.15888336127773, 517.9474679231213, 577.9692884153313, 644.946677103762, 719.6856730011522, 803.0857221391512, 896.150501946605, 1000.0
    ]
];

//  W[k] (Eq. 26).
const WK = [
    0.08333333333333333,  //  = 1 / 12
    0.16666666666666666,  //  = 2 / 12
    0.25000000000000000,  //  = 3 / 12
    0.25000000000000000,  //  = 3 / 12
    0.16666666666666666,  //  = 2 / 12
    0.08333333333333333,  //  = 1 / 12
];

//  fatt table.
const FATT_TBL = [
    0.5, 0.3
];

//  Minimum noise floor (= 2 ^ -32, Eq. 23).
const NSFLOOR_MIN = 2.3283064365386963e-10;
const DCTII_16x16 = Lc3TblSns.DCTII_16x16;
const HFCB = Lc3TblSns.HFCB;
const LFCB = Lc3TblSns.LFCB;
const GIJ = Lc3TblSns.GIJ;
const MPVQ_16x10 = new MPVQ(16, 10);

//
//  Public classes.
//

/**
 *  LC3 spectral noise shaping encoder.
 * 
 *  @constructor
 *  @param {Number} Nf 
 *    - The frame size.
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 *  @param {Number[]} Ifs
 *    - The band indices.
 *  @param {Number[]} NB
 *    - The number of bands.
 */
function LC3SpectralNoiseShapingEncoder(Nf, Nms, Fs, Ifs, NB) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Pre-emphasis table (3.7).
    // let gtilt = 0;
    let Pfactor = PEFACTOR_GTILT_TBL[index_Fs];

    //  Attack factor (3.3.7.2.7).
    let fatt = FATT_TBL[index_Nms];

    //  Misc. contexts.
    let EB2 = new Array(64);
    let Etmp = new Array(64);

    let scf0 = new Array(16);
    let scf1 = new Array(16);

    let t2rot = new Array(16);
    let t2rot_setA = new Array(10);
    let t2rot_setB = new Array(6);

    let sns_y0_setA = new Array(10);
    let sns_y0_setB = new Array(6);
    let sns_y0 = new Array(16);
    // let sns_y1_setA = new Array(10);
    let sns_y1 = new Array(16);
    let sns_y2 = new Array(16);
    let sns_y3 = new Array(16);

    let sns_xq0 = new Array(16);
    let sns_xq1 = new Array(16);
    let sns_xq2 = new Array(16);
    let sns_xq3 = new Array(16);

    let sns_xq = [
        sns_xq0, sns_xq1, sns_xq2, sns_xq3
    ];

    let mpvq_enum_cache = [0, 0];

    let ind_LF = -1;
    let ind_HF = -1;

    let st1 = new Array(16);
    let r1 = new Array(16);
    for (let n = 0; n < 16; ++n) {
        st1[n] = 0;
        r1[n] = 0;
    }

    let scfQ = new Array(16);
    let scfQint = new Array(64);
    let scfQint_tmp = new Array(64);

    let idxA = -1, LS_indA = -1;

    let gsns = new Array(64);

    let index_joint = 0;

    let Xs = new Array(Nf);
    for (let n = 0; n < Nf; ++n) {
        Xs[n] = 0;
    }

    let shape_j = -1, gain_i = -1;

    //
    //  Public methods.
    //

    /**
     *  Update with one frame.
     * 
     *  @param {Number[]} EB 
     *    - The spectral energy band estimation.
     *  @param {Number[]} X 
     *    - The spectral coefficients.
     *  @param {Number} Fatt_k
     *    - The attack flag.
     */
    this.update = function(EB, X, Fatt_k) {
        //  Padding (3.3.7.2.1).
        if (NB < 64) {
            let i = 0, j = 0;
            for (let iEnd = 64 - NB; i < iEnd; ++i, j += 2) {
                let EBi = EB[i];
                EB2[j] = EBi;
                EB2[j + 1] = EBi;
            }
            for (; j < 64; ++i, ++j) {
                EB2[j] = EB[i];
            }
            EB = EB2;
        }

        //  Smoothing (3.3.7.2.2).
        Etmp[0] = 0.75 * EB[0] + 0.25 * EB[1];                      //  Eq. 20
        Etmp[63] = 0.25 * EB[62] + 0.75 * EB[63];
        for (let b = 1; b < 63; ++b) {
            Etmp[b] = 0.25 * EB[b - 1] + 0.5 * EB[b] + 0.25 * EB[b + 1];
        }
        // console.log("ES[b]=" + Etmp.toString());

        //  Pre-emphasis (3.3.7.2.3).
        for (let b = 0; b < 64; ++b) {                              //  Eq. 21
            Etmp[b] *= Pfactor[b];
        }
        // console.log("EP[b]=" + Etmp.toString());

        //  Noise floor (3.3.7.2.4).
        let nsfloor = 0;                                            //  Eq. 23
        for (let b = 0; b < 64; ++b) {
            nsfloor += Etmp[b];
        }
        nsfloor = ((nsfloor / 64) * 1e-4);
        if (nsfloor < NSFLOOR_MIN) {
            nsfloor = NSFLOOR_MIN;
        }
        // console.log("nsfloor=" + nsfloor);

        //  Logarithm (3.3.7.2.5).
        for (let b = 0; b < 64; ++b) {                          //  Eq. 22, 24
            Etmp[b] = 0.5 * Math.log2(Math.max(Etmp[b], nsfloor) + 1e-31);
        }
        // console.log("EL[b]=" + Etmp.toString());

        //  Band energy grouping (3.3.7.2.6).
        let E4 = new Array(16);                                     //  Eq. 25
        E4[0] = WK[0] * Etmp[0] + 
                WK[1] * Etmp[0] + 
                WK[2] * Etmp[1] + 
                WK[3] * Etmp[2] + 
                WK[4] * Etmp[3] + 
                WK[5] * Etmp[4];
        E4[15] = WK[0] * Etmp[59] + 
                 WK[1] * Etmp[60] + 
                 WK[2] * Etmp[61] + 
                 WK[3] * Etmp[62] + 
                 WK[4] * Etmp[63] + 
                 WK[5] * Etmp[63];
        for (let b2 = 1, b2Mul4 = 4; b2 < 15; ++b2, b2Mul4 += 4) {
            E4[b2] = WK[0] * Etmp[b2Mul4 - 1] + 
                     WK[1] * Etmp[b2Mul4    ] + 
                     WK[2] * Etmp[b2Mul4 + 1] + 
                     WK[3] * Etmp[b2Mul4 + 2] + 
                     WK[4] * Etmp[b2Mul4 + 3] + 
                     WK[5] * Etmp[b2Mul4 + 4];
        }
        // console.log("E4[b]=" + E4.toString());

        //  Mean removal and scaling, attack handling (3.3.7.2.7).
        let E4mean = 0;
        for (let b = 0; b < 16; ++b) {
            E4mean += E4[b];
        }
        E4mean /= 16;
        for (let b2 = 0; b2 < 16; ++b2) {                           //  Eq. 27
            scf0[b2] = 0.85 * (E4[b2] - E4mean);
        }
        let scf;
        if (Fatt_k != 0) {
            // scf1 
            scf1[0] = (scf0[0] + scf0[1] + scf0[2]) / 3;            //  Eq. 29
            scf1[1] = (scf0[0] + scf0[1] + scf0[2] + scf0[3]) / 4;  //  Eq. 30
            for (let n = 2; n < 14; ++n) {
                scf1[n] = (                                         //  Eq. 31
                    scf0[n - 2] + 
                    scf0[n - 1] + 
                    scf0[n    ] + 
                    scf0[n + 1] + 
                    scf0[n + 2]
                ) / 5;
            }
            scf1[14] = (                                            //  Eq. 32
                scf0[12] + 
                scf0[13] + 
                scf0[14] + 
                scf0[15]
            ) / 4;
            scf1[15] = (scf0[13] + scf0[14] + scf0[15]) / 3;        //  Eq. 33
            
            let scf1_mean = 0;
            for (let b = 0; b < 16; ++b) {
                scf1_mean += scf1[b];
            }
            scf1_mean /= 16;
            for (let n = 0; n < 16; ++n) {                          //  Eq. 34
                scf1[n] = fatt * (scf1[n] - scf1_mean);
            }

            scf = scf1;
        } else {
            scf = scf0;                                             //  Eq. 28
        }
        // console.log("scf=" + scf.toString());

        //
        //  SNS quantization (3.3.7.3).
        //

        //  Stage 1 (3.3.7.3.2).
        let dMSE_LFmin = Infinity;
        let dMSE_HFmin = Infinity;
        for (let i = 0; i < 32; ++i) {
            let LFCBi = LFCB[i];
            let HFCBi = HFCB[i];

            let dMSE_LFi = 0;
            let dMSE_HFi = 0;
            for (let n = 0; n < 8; ++n) {
                let tmp = scf[n] - LFCBi[n];                        //  Eq. 35
                dMSE_LFi += tmp * tmp;

                tmp = scf[n + 8] - HFCBi[n];                        //  Eq. 36
                dMSE_HFi += tmp * tmp;
            }

            if (dMSE_LFi < dMSE_LFmin) {                            //  Eq. 37
                dMSE_LFmin = dMSE_LFi;
                ind_LF = i;
            }

            if (dMSE_HFi < dMSE_HFmin) {                            //  Eq. 38
                dMSE_HFmin = dMSE_HFi;
                ind_HF = i;
            }
        }

        // console.log("ind_LF=" + ind_LF);
        // console.log("ind_HF=" + ind_HF);

        let LFCB_ind_LF = LFCB[ind_LF];
        let HFCB_ind_HF = HFCB[ind_HF];
        for (let n = 0; n < 8; ++n) {
            st1[n] = LFCB_ind_LF[n];                                //  Eq. 39
            st1[n + 8] = HFCB_ind_HF[n];                            //  Eq. 40
        }
        
        for (let n = 0; n < 16; ++n) {
            r1[n] = scf[n] - st1[n];                                //  Eq. 41
        }
        // console.log("r1[n]=" + r1.toString());

        //  Stage 2 (3.3.7.3.3).

        //  Stage 2 target preparation (3.3.7.3.3.3).
        for (let n = 0; n < 16; ++n) {
            let tmp = 0;
            for (let row = 0; row < 16; ++row) {
                tmp += r1[row] * DCTII_16x16[row][n];
            }
            t2rot[n] = tmp;
        }
        for (let n = 0; n < 10; ++n) {
            t2rot_setA[n] = t2rot[n];
        }
        for (let n = 10, i = 0; n < 16; ++n, ++i) {
            t2rot_setB[i] = t2rot[n];
        }
        // console.log("t2rot[n]=" + t2rot.toString());

        //  Shape candidates (3.3.6.3.3.4).
        PVQSearch(10, 10, t2rot_setA, sns_y0_setA);
        PVQSearch( 6,  1, t2rot_setB, sns_y0_setB);
        // PVQSearch(10, 10, t2rot_setA, sns_y1_setA);
        PVQSearch(16,  8,      t2rot,      sns_y2);
        PVQSearch(16,  6,      t2rot,      sns_y3);
        for (let n = 0; n < 10; ++n) {
            sns_y0[n] = sns_y0_setA[n];
            sns_y1[n] = sns_y0_setA[n];
        }
        for (let n = 10, i = 0; n < 16; ++n, ++i) {
            sns_y0[n] = sns_y0_setB[i];
            sns_y1[n] = 0;
        }
        PVQNormalize(sns_y0, sns_xq0);
        PVQNormalize(sns_y1, sns_xq1);
        PVQNormalize(sns_y2, sns_xq2);
        PVQNormalize(sns_y3, sns_xq3);

        // console.log("sns_y0[n]=" + sns_y0.toString());
        // console.log("sns_y1[n]=" + sns_y1.toString());
        // console.log("sns_y2[n]=" + sns_y2.toString());
        // console.log("sns_y3[n]=" + sns_y3.toString());

        // console.log("sns_xq0[n]=" + sns_xq0.toString());
        // console.log("sns_xq1[n]=" + sns_xq1.toString());
        // console.log("sns_xq2[n]=" + sns_xq2.toString());
        // console.log("sns_xq3[n]=" + sns_xq3.toString());

        //  Shape and gain combination determination (3.3.7.3.3.7).
        let dMSE_min = Infinity;
        for (let j = 0; j < 4; ++j) {
            let GIJ_j = GIJ[j];
            let sns_xq_j = sns_xq[j];
            for (let i = 0, iEnd = GIJ_j.length; i < iEnd; ++i) {
                let GIJ_ij = GIJ_j[i];
                let dMSE_ji = 0;
                for (let n = 0; n < 16; ++n) {
                    let tmp = t2rot[n] - GIJ_ij * sns_xq_j[n];
                    dMSE_ji += tmp * tmp;
                }
                if (dMSE_ji < dMSE_min) {
                    dMSE_min = dMSE_ji;
                    shape_j = j;
                    gain_i = i;
                }
            }
        }
        // console.log("shape_j=" + shape_j);
        // console.log("gain_i=" + gain_i);

        //  Enumeration of the selected PVQ pulse configurations (3.3.7.3.3.8).
        let idxB = -1, LS_indB = -1;
        switch (shape_j) {
        case 0:
            MPVQ_16x10.enumerate(sns_y0_setB, mpvq_enum_cache);
            idxB = mpvq_enum_cache[1];
            LS_indB = mpvq_enum_cache[0];
        case 1:
            MPVQ_16x10.enumerate(sns_y0_setA, mpvq_enum_cache);
            idxA = mpvq_enum_cache[1];
            LS_indA = mpvq_enum_cache[0];
            break;
        case 2:
            MPVQ_16x10.enumerate(sns_y2, mpvq_enum_cache);
            idxA = mpvq_enum_cache[1];
            LS_indA = mpvq_enum_cache[0];
            break;
        case 3:
            MPVQ_16x10.enumerate(sns_y3, mpvq_enum_cache);
            idxA = mpvq_enum_cache[1];
            LS_indA = mpvq_enum_cache[0];
            break;
        }

        // console.log("idxA=" + idxA);
        // console.log("LS_indA=" + LS_indA);
        // console.log("idxB=" + idxB);
        // console.log("LS_indB=" + LS_indB);

        //  Multiplexing of SNS VQ codewords (3.3.7.3.4).
        switch (shape_j) {
        case 0:
            index_joint = (2 * idxB + LS_indB + 2) * 2390004 + idxA;//  Eq. 58
            break;
        case 1:
            index_joint = ((gain_i & 1) >>> 0) * 2390004 + idxA;    //  Eq. 59
            break;
        case 2:
            index_joint = idxA;                                     //  Eq. 60
            break;
        case 3:
            index_joint = 15158272 + ((gain_i & 1) >>> 0) +         //  Eq. 61
                          2 * idxA;
            break;
        }
        // console.log("index_joint=" + index_joint.toString());

        //  Synthesis of the Quantized SNS scale factor vector (3.3.7.3.4.3).
        let sns_xq_shape_j = sns_xq[shape_j];
        let GIJ_gain_i_shape_j = GIJ[shape_j][gain_i];
        for (let n = 0; n < 16; ++n) {
            let scfQ_n = st1[n];
            for (let col = 0; col < 16; ++col) {
                scfQ_n += GIJ_gain_i_shape_j * 
                          sns_xq_shape_j[col] * 
                          DCTII_16x16[n][col];
            }
            scfQ[n] = scfQ_n;
        }
        // console.log("scfQ=" + scfQ.toString());

        //  SNS scale factors interpolation (3.3.7.4).
        scfQint[0] = scfQ[0];                                       //  Eq. 63
        scfQint[1] = scfQ[0];
        for (let n = 0; n < 15; ++n) {
            let t1 = scfQ[n];
            let t2 = (scfQ[n + 1] - t1) / 8;
            let t3 = 4 * n;
            scfQint[t3 + 2] = t1 +     t2;
            scfQint[t3 + 3] = t1 + 3 * t2;
            scfQint[t3 + 4] = t1 + 5 * t2;
            scfQint[t3 + 5] = t1 + 7 * t2;
        }
        {
            let t1 = scfQ[15];
            let t2 = (t1 - scfQ[14]) / 8;
            scfQint[62] = t1 +     t2;
            scfQint[63] = t1 + 3 * t2;
        }
        // console.log("scfQint=" + scfQint);
        
        let scfQint_use = scfQint;
        if (NB < 64) {
            let i = 0, iEnd = 64 - NB, j = 0;
            for (; i < iEnd; ++i, j += 2) {
                scfQint_tmp[i] = 0.5 * (scfQint[j] + scfQint[j + 1]);
            }
            for (; i < NB; ++i) {
                scfQint_tmp[i] = scfQint[iEnd + i];
            }
            scfQint_use = scfQint_tmp;
        }

        for (let b = 0; b < NB; ++b) {                              //  Eq. 64
            gsns[b] = Math.pow(2, -scfQint_use[b]);
        }
        for (let b = NB; b < 64; ++b) {
            gsns[b] = 0;
        }
        // console.log("gsns[b]=" + gsns.toString());

        //  Spectral shaping (3.3.7.5).
        for (let b = 0; b < NB; ++b) {
            let gsns_b = gsns[b];
            for (let k = Ifs[b], kEnd = Ifs[b + 1]; k < kEnd; ++k) {
                Xs[k] = X[k] * gsns_b;
            }
        }
        // console.log("Xs[n]=" + Xs.toString());
    };

    /**
     *  Get vector quantization parameters.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - VQP size mismatches.
     *  @param {Number[]} [VQP] 
     *    - The buffer of returned vector quantization parameters (used to 
     *      reducing array allocation).
     *  @returns 
     *    - The vector quantization parameters (denotes as VQP[]), where:
     *      - VQP[0] = ind_LF,
     *      - VQP[1] = ind_HF,
     *      - VQP[2] = gain_i,
     *      - VQP[3] = shape_j,
     *      - VQP[4] = index_joint
     *      - VQP[5] = LS_indA
     */
    this.getVectorQuantizationParameters = function(VQP = new Array(6)) {
        //  Check VQP size.
        if (VQP.length != 6) {
            throw new LC3IllegalParameterError(
                "VQP size mismatches."
            );
        }

        //  Write VQ parameters.
        VQP[0] = ind_LF;
        VQP[1] = ind_HF;
        VQP[2] = gain_i;
        VQP[3] = shape_j;
        VQP[4] = index_joint;
        VQP[5] = LS_indA;

        return VQP;
    };

    /**
     *  Get the shaped spectrum coefficients (i.e. Xs[k]).
     * 
     *  @returns {Number[]}
     *    - The shaped spectrum coefficients.
     */
    this.getShapedSpectrumCoefficients = function() {
        return Xs;
    };
}

//  Export public APIs.
module.exports = {
    "LC3SpectralNoiseShapingEncoder": LC3SpectralNoiseShapingEncoder
};