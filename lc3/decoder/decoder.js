//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3DcSns = 
    require("./sns");
const Lc3DcPlc = 
    require("./plc");
const Lc3DcMdct = 
    require("./ld-mdct");
const Lc3DcLtpf = 
    require("./ltpf");
const Lc3DcBec = 
    require("./bec");
const Lc3Fs = 
    require("./../common/fs");
const Lc3Nms = 
    require("./../common/nms");
const Lc3TblI10 = 
    require("./../tables/i10");
const Lc3TblI75 = 
    require("./../tables/i75");
const Lc3TblAcSpec = 
    require("./../tables/ac_spec");
const Lc3TblTns = 
    require("./../tables/tns");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3BEC = 
    Lc3DcBec.LC3BEC;
const LC3SpectralNoiseShapingDecoder = 
    Lc3DcSns.LC3SpectralNoiseShapingDecoder;
const LC3PacketLossConcealment = 
    Lc3DcPlc.LC3PacketLossConcealment;
const LC3MDCTSynthesizer = 
    Lc3DcMdct.LC3MDCTSynthesizer;
const LC3LongTermPostfilterDecoder = 
    Lc3DcLtpf.LC3LongTermPostfilterDecoder;

//  Imported constants.
const AC_TNS_ORDER_CUMFREQ = 
    Lc3TblTns.AC_TNS_ORDER_CUMFREQ;
const AC_TNS_ORDER_FREQ = 
    Lc3TblTns.AC_TNS_ORDER_FREQ;
const AC_TNS_COEF_CUMFREQ = 
    Lc3TblTns.AC_TNS_COEF_CUMFREQ;
const AC_TNS_COEF_FREQ = 
    Lc3TblTns.AC_TNS_COEF_FREQ;
const AC_SPEC_LOOKUP = 
    Lc3TblAcSpec.AC_SPEC_LOOKUP;
const AC_SPEC_CUMFREQ = 
    Lc3TblAcSpec.AC_SPEC_CUMFREQ;
const AC_SPEC_FREQ = 
    Lc3TblAcSpec.AC_SPEC_FREQ;
const I_8000_10 = 
    Lc3TblI10.I_8000_10;
const I_16000_10 = 
    Lc3TblI10.I_16000_10;
const I_24000_10 = 
    Lc3TblI10.I_24000_10;
const I_32000_10 = 
    Lc3TblI10.I_32000_10;
const I_48000_10 = 
    Lc3TblI10.I_48000_10;
const I_8000_75 = 
    Lc3TblI75.I_8000_75;
const I_16000_75 = 
    Lc3TblI75.I_16000_75;
const I_24000_75 = 
    Lc3TblI75.I_24000_75;
const I_32000_75 = 
    Lc3TblI75.I_32000_75;
const I_48000_75 = 
    Lc3TblI75.I_48000_75;

//
//  Constants.
//

//  Cursor member definitions.
const CURMEMN = 2;
const CURMEMB_BP = 0;
const CURMEMB_BITNO = 1;

//  Arithmetic Code (AC) context member definitions.
const ACCTXMEMN = 4;
const ACCTXMEMB_LOW = 0;
const ACCTXMEMB_RANGE = 1;
const ACCTXMEMB_BEC = 2;
const ACCTXMEMB_BP = 3;

//  Nms, Fs to Ifs table.
const IFS_TBL = [
    [
        I_8000_10, I_16000_10, I_24000_10, I_32000_10, I_48000_10, I_48000_10
    ],
    [
        I_8000_75, I_16000_75, I_24000_75, I_32000_75, I_48000_75, I_48000_75
    ]
];

//  Nms, Fs to NF table.
const NF_TBL = [
    [
        80, 160, 240, 320, 480, 480
    ],
    [
        60, 120, 180, 240, 360, 360
    ]
];

//  NF (Nms, Fs) to NE table (see Eq. 9).
const NE_TBL = [
    [
        80, 160, 240, 320, 400, 400
    ],
    [
        60, 120, 180, 240, 300, 300
    ]
];

//  Nms, Fs to nbitsBW table (see Table 3.6).
const NBITSBW_TBL = [
    [0, 1, 2, 2, 3, 3],
    [0, 1, 2, 2, 3, 3]
];

//  Nms, Fs to NB table.
const NB_TBL = [
    [
        64, 64, 64, 64, 64, 64
    ],
    [
        60, 64, 64, 64, 64, 64
    ]
];

//  NE (Nms, Fs) to ceil(log2(NE / 2)) table.
const NBITSLASTNZ_TBL = [
    [
        6, 7, 7, 8, 8, 8
    ],
    [
        5, 6, 7, 7, 8, 8
    ]
];

//  TNS_LPC_WEIGHTING_TH[Nms] = 48 * Nms.
const TNS_LPC_WEIGHTING_TH = [
    480, //  [0] = 48 * Nms(= 10ms).
    360  //  [1] = 48 * Nms(= 7.5ms).
];

//  Nms to NFstart, NFwidth table (see Table 3.19).
const NFSTART_TBL = [24, 18];
const NFWIDTH_TBL = [3, 2];

//  Nms, Pbw to bw_stop table (see Table 3.18).
const BW_STOP_TBL = [
    [
        80, 160, 240, 320, 400
    ],
    [
        60, 120, 180, 240, 300
    ]
];

//  Nms, Pbw to TNS start_freq[f] table.
const TNS_STARTFREQ_TBL = [
    [                //  Nms = 10ms:
        [12],        //  Pbw = NB(0)
        [12],        //  Pbw = WB(1)
        [12],        //  Pbw = SSWB(2)
        [12, 160],   //  Pbw = SWB(3)
        [12, 200]    //  Pbw = FB
    ],
    [                //  Nms = 7.5ms:
        [9],         //  Pbw = NB(0)
        [9],         //  Pbw = WB(1)
        [9],         //  Pbw = SSWB(2)
        [9, 120],    //  Pbw = SWB(3)
        [9, 150]     //  Pbw = FB
    ]
];

//  Nms, Pbw to TNS stop_freq[f] table.
const TNS_STOPFREQ_TBL = [
    [                //  Nms = 10ms:
        [80],        //  Pbw = NB(0)
        [160],       //  Pbw = WB(1)
        [240],       //  Pbw = SSWB(2)
        [160, 320],  //  Pbw = SWB(3)
        [200, 400]   //  Pbw = FB
    ],
    [                //  Nms = 7.5ms:
        [60],        //  Pbw = NB(0)
        [120],       //  Pbw = WB(1)
        [180],       //  Pbw = SSWB(2)
        [120, 240],  //  Pbw = SWB(3)
        [150, 300]   //  Pbw = FB
    ]
];

//
//  Public classes.
//

/**
 *  LC3 decoder.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3Decoder(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Algorithm contexts.
    let NF = NF_TBL[index_Nms][index_Fs];
    // console.log("NF=" + NF.toString());

    let NB = NB_TBL[index_Nms][index_Fs];

    let Ifs = IFS_TBL[index_Nms][index_Fs];

    let NE = NE_TBL[index_Nms][index_Fs];
    let NEDiv2 = (NE >>> 1);
    // console.log("NE=" + NE.toString());

    let fsInd = Fs.getSampleRateIndex();
    let fsIndP1 = fsInd + 1;
    // console.log("fs_ind=" + fsInd.toString());

    let nbits_BW = NBITSBW_TBL[index_Nms][index_Fs];
    let nbits_lastnz = NBITSLASTNZ_TBL[index_Nms][index_Fs];
    // console.log("nbits_bw=" + nbits_BW.toString());
    // console.log("nbits_lastnz=" + nbits_lastnz.toString());

    let cur_side = new Array(CURMEMN);

    let tns_lpc_weighting_th = TNS_LPC_WEIGHTING_TH[index_Nms];

    let tns_RCorder = new Array(2);
    let tns_RCi = [new Array(8), new Array(8)];
    let tns_RCq = [new Array(8), new Array(8)];
    let tns_S = new Array(8);

    let tns_startfreq_Nms = TNS_STARTFREQ_TBL[index_Nms];
    let tns_stopfreq_Nms = TNS_STOPFREQ_TBL[index_Nms];

    let Xq = new Array(NE);
    let Xs = new Array(NE);
    let save_lev = new Array(NE);

    let resBits = new Array(3200);
    let nResBits = 0;

    let NFstart = NFSTART_TBL[index_Nms], NFwidth = NFWIDTH_TBL[index_Nms];
    // console.log("NFstart=" + NFstart);
    // console.log("NFwidth=" + NFwidth);
    let bw_stop_Nms = BW_STOP_TBL[index_Nms];

    let INF = new Array(NE);

    //  SNS.
    let sns = new LC3SpectralNoiseShapingDecoder(NF, NB, Ifs);

    //  PLC.
    let plc = new LC3PacketLossConcealment(NF);

    //  LD-MDCT synthesizer.
    let imdct = new LC3MDCTSynthesizer(Nms, Fs, NF);

    //  LTPF (decoder-side).
    let ltpf_dec = new LC3LongTermPostfilterDecoder(Nms, Fs, NF);

    //
    //  Public methods.
    //

    /**
     *  Decode one frame.
     * 
     *  @param {Buffer} bytes 
     *  @param {InstanceType<typeof LC3BEC>} [bec]
     *    - The bit error condition (BEC) context.
     *  @param {Number[]} [rbuf]
     *    - The buffer of the returning array (used for reducing array 
     *      allocation).
     *  @returns {Number[]}
     *    - The decoded samples.
     */
    this.decode = function(
        bytes, 
        bec = new LC3BEC(false), 
        rbuf = new Array(NF)
    ) {
        //  Ensure the returning array buffer size.
        while (rbuf.length < NF) {
            rbuf.push(0);
        }

        let nbytes = bytes.length;
        let nbits = ((nbytes << 3) >>> 0);
        // console.log("nbytes=" + nbytes.toString());
        // console.log("nbits=" + nbits.toString());

        //  Mark BEC if byte count is too small.
        if (nbytes < 20 || nbytes > 400) {
            bec.mark();
        }

        //  Bitstream decoding (3.4.2).

        //  Initialization (3.4.2.2).
        cur_side[CURMEMB_BP] = nbytes - 1;
        cur_side[CURMEMB_BITNO] = 0;
        let rateFlag = (nbits > (160 + fsInd * 160) ? 512 : 0);
        // console.log("rateFlag=" + rateFlag.toString());

        //  Bandwidth.
        let Pbw = 0;
        if (!bec.isMarked()) {
            if (nbits_BW > 0) {
                Pbw = Impl_ReadUInt(bytes, cur_side, nbits_BW);
                if (fsInd < Pbw) {
                    bec.mark();
                }
            }
        }
        // console.log("Pbw=" + Pbw);

        //  Last non-zero tuple.
        let lastnz = 0;
        if (!bec.isMarked()) {
            let tmp_lastnz = Impl_ReadUInt(bytes, cur_side, nbits_lastnz);
            lastnz = (((tmp_lastnz + 1) << 1) >>> 0);
            // console.log("lastnz=" + lastnz.toString());
            if (lastnz > NE) {
                bec.mark();
            }
        }

        //  LSB mode bit.
        let lsbMode = 0;
        if (!bec.isMarked()) {
            lsbMode = Impl_ReadBit(bytes, cur_side);
        }
        // console.log("lsbMode=" + lsbMode.toString());

        //  Global Gain.
        let gg_ind = 0;
        if (!bec.isMarked()) {
            gg_ind = Impl_ReadUInt(bytes, cur_side, 8);
        }
        // console.log("gg_ind=" + gg_ind.toString());

        //  TNS activation flag.
        let num_tns_filters = 0;
        for (let f = 0; f < 2; ++f) {
            tns_RCorder[f] = 0;
        }
        if (!bec.isMarked()) {
            num_tns_filters = (Pbw < 3 ? 1 : 2);
            // console.log("num_tns_filters=" + num_tns_filters.toString());
            for (let f = 0; f < num_tns_filters; ++f) {
                tns_RCorder[f] = Impl_ReadBit(bytes, cur_side);
            }
        }
        // console.log("RCorder=" + tns_RCorder.toString());

        //  Pitch present flag.
        let ltpf_pitch_present = 0;
        if (!bec.isMarked()) {
            ltpf_pitch_present = Impl_ReadBit(bytes, cur_side);
        }
        // console.log("pitch_present=" + ltpf_pitch_present);

        //  SNS-VQ integer bits.
        let ind_LF = 0, ind_HF = 0;
        let submode_MSB = 0, submode_LSB = 0;
        let idxA = 0, idxB = 0;
        let Gind = 0;
        let LS_indA = 0, LS_indB = 0;
        let shape_j = 0, gain_i = 0;
        if (!bec.isMarked()) {
            //  Stage 1 SNS VQ decoding (3.4.7.2.1).
            ind_LF = Impl_ReadUInt(bytes, cur_side, 5);
            ind_HF = Impl_ReadUInt(bytes, cur_side, 5);

            //  Stage 2 SNS VQ decoding (3.4.7.2.2).

            //  The second stage MSB submode bit, initial gain index, and the 
            //  Leading Sign index shall first be read from the decoded 
            //  bitstream as follows:
            submode_MSB = Impl_ReadBit(bytes, cur_side);
            if (submode_MSB == 0) {
                Gind = Impl_ReadUInt(bytes, cur_side, 1);
            } else {
                Gind = Impl_ReadUInt(bytes, cur_side, 2);
            }
            LS_indA = Impl_ReadBit(bytes, cur_side);

            if (submode_MSB == 0) {
                //  If submodeMSB equals 0, corresponding to one of the shapes 
                //  (shape_j =0 or shape_j =1), the following demultiplexing 
                //  procedure shall be applied:

                //  ‘regular’/’regular_lf’ demultiplexing, establish if shape_j 
                //  is 0 or 1.

                //  dec_split_st2VQ_CW(cxRx, szA = 4780008U>>1, szB = 14)
                let cwRx = Impl_ReadUInt(bytes, cur_side, 25);
                let szA = 2390004, szB = 14;
                let idxBorGainLSB;
                if (cwRx >= szB * szA) {
                    idxA = 0;
                    idxBorGainLSB = 0;
                    submode_LSB = 0;
                    bec.mark();
                } else {
                    idxBorGainLSB = Math.trunc(cwRx / szA);
                    idxA = cwRx - idxBorGainLSB * szA;
                    idxBorGainLSB -= 2;
                    submode_LSB = (idxBorGainLSB < 0 ? 1 : 0);
                    idxBorGainLSB = idxBorGainLSB + 2 * submode_LSB;
                }
                //  End of dec_split_st2VQ_CW().

                if (submode_LSB != 0) {
                    //  for regular_lf:
                    Gind = ((Gind << 1) >>> 0) + idxBorGainLSB; 
                } else {
                    //  for regular:
                    idxB = (idxBorGainLSB >>> 1);
                    LS_indB = ((idxBorGainLSB & 1) >>> 0);
                }
            } else {
                //  If submodeMSB equals 1, (‘outlier_near’ or ‘outlier_far’ 
                //  submodes) the following demultiplexing procedure shall be 
                //  applied:

                //  outlier_* demultiplexing, establish if shape_j is 2 or 3.
                let tmp = Impl_ReadUInt(bytes, cur_side, 24);

                idxA = tmp;
                submode_LSB = 0;

                if (tmp >= 16708096 /*  ((30316544U>>1) + 1549824U)  */) {
                    bec.mark();
                } else {
                    tmp -= 15158272 /*  (30316544U>>1)  */;
                    if (tmp >= 0) {
                        submode_LSB = 1;
                        Gind = (((Gind << 1) | (tmp & 1)) >>> 0);
                        idxA = (tmp >>> 1);
                    }
                }
            }

            //  Finally, the decombined/demultiplexed second stage indices 
            //  shape_j and gain_i shall be determined as follows:
            shape_j = ((submode_MSB << 1) >>> 0) + submode_LSB;
            gain_i = Gind;
            // console.log("shape_j=" + shape_j.toString());
            // console.log("gain_i=" + gain_i);
        }
        // console.log("ind_LF=" + ind_LF.toString());
        // console.log("ind_HF=" + ind_HF.toString());
        // console.log("Gind=" + Gind);
        // console.log("submodeMSB=" + submode_MSB);
        // console.log("submodeLSB=" + submode_LSB);
        // console.log("LS_indA=" + LS_indA);
        // console.log("LS_indB=" + LS_indB);
        // console.log("idxA=" + idxA);
        // console.log("idxB=" + idxB);

        //  LTPF data.
        let ltpf_active = 0;
        let ltpf_pitch_index = 0;
        if (!bec.isMarked()) {
            if (ltpf_pitch_present != 0) {
                ltpf_active = Impl_ReadUInt(bytes, cur_side, 1);
                ltpf_pitch_index = Impl_ReadUInt(bytes, cur_side, 9);
            }
        }
        // console.log("ltpf_active=" + ltpf_active.toString());
        // console.log("pitch_index=" + ltpf_pitch_index.toString());

        //  Noise Level.
        let F_NF = 0;
        if (!bec.isMarked()) {
            F_NF = Impl_ReadUInt(bytes, cur_side, 3);
        }
        // console.log("F_NF=" + F_NF.toString());

        //  Bandwidth interpretation (3.4.2.4).

        //  Arithmetic decoding (3.4.2.5).

        //  Arithmetic decoder initialization.
        let ac_ctx = new Array(ACCTXMEMN);
        Impl_AcDecInit(bytes, ac_ctx, bec);

        //  TNS data.
        let tns_lpc_weighting = (nbits < tns_lpc_weighting_th ? 1 : 0);
        for (let f = 0; f < 2; ++f) {
            let RCi_f = tns_RCi[f];
            for (let k = 0; k < 8; ++k) {
                RCi_f[k] = 8;
            }
        }
        if (!bec.isMarked()) {
tnsloop:
            for (let f = 0; f < num_tns_filters; ++f) {
                if (tns_RCorder[f] > 0) {
                    let RCorder_fS1 = Impl_AcDecode(
                        bytes, 
                        ac_ctx, 
                        AC_TNS_ORDER_CUMFREQ[tns_lpc_weighting], 
                        AC_TNS_ORDER_FREQ[tns_lpc_weighting], 
                        8
                    );
                    if (bec.isMarked()) {
                        break tnsloop;
                    }
                    tns_RCorder[f] = RCorder_fS1 + 1;
                    let RCi_f = tns_RCi[f];
                    for (let k = 0; k <= RCorder_fS1; ++k) {
                        let RCi_f_k = Impl_AcDecode(
                            bytes, 
                            ac_ctx, 
                            AC_TNS_COEF_CUMFREQ[k], 
                            AC_TNS_COEF_FREQ[k], 
                            17
                        );
                        if (bec.isMarked()) {
                            break tnsloop;
                        }
                        RCi_f[k] = RCi_f_k;
                    }
                }
            }
        }
        // console.log("tns_lpc_weighting=" + tns_lpc_weighting.toString());
        // console.log("rc_order_ari=" + tns_RCorder.toString());
        // console.log("rc_i=" + tns_RCi.toString());

        //  Spectral data.
        for (let k = 0; k < NE; ++k) {
            Xq[k] = 0;
        }
        if (!bec.isMarked()) {
            let c = 0;
specloop:
            for (let k = 0; k < lastnz; k += 2) {
                let t = c + rateFlag;
                if (k > NEDiv2) {
                    t += 256;
                }
                // let k0 = k, k1 = k + 1;
                let Xq_k0 = 0, Xq_k1 = 0;
                let lev = 0;
                let sym = 0;
                for (; lev < 14; ++lev) {
                    let pki = AC_SPEC_LOOKUP[t + ((Math.min(lev, 3) << 10) >>> 0)];
                    sym = Impl_AcDecode(bytes, ac_ctx, AC_SPEC_CUMFREQ[pki], AC_SPEC_FREQ[pki], 17);
                    if (sym < 16) {
                        break;
                    }
                    if (lsbMode == 0 || lev > 0) {
                        let bit = Impl_ReadBit(bytes, cur_side);
                        Xq_k0 += ((bit << lev) >>> 0);
                        bit = Impl_ReadBit(bytes, cur_side);
                        Xq_k1 += ((bit << lev) >>> 0);
                    }
                }
                if (lev == 14) {
                    bec.mark();
                    break;
                }
                if (lsbMode == 1) {
                    save_lev[k] = lev;
                }

                let a = ((sym & 3) >>> 0);
                let b = (sym >>> 2);
                Xq_k0 += ((a << lev) >>> 0);
                Xq_k1 += ((b << lev) >>> 0);

                if (Xq_k0 > 0) {
                    let bit = Impl_ReadBit(bytes, cur_side);
                    if (bit == 1) {
                        Xq_k0 = -Xq_k0;
                    }
                }
                if (Xq_k1 > 0) {
                    let bit = Impl_ReadBit(bytes, cur_side);
                    if (bit == 1) {
                        Xq_k1 = -Xq_k1;
                    }
                }

                if (lev > 3) {
                    lev = 3;
                }
                if (lev <= 1) {
                    t = 1 + (a + b) * (lev + 1);
                } else {
                    t = 12 + lev;
                }

                c = (((c & 15) << 4) >>> 0) + t;

                Xq[k] = Xq_k0;
                Xq[k + 1] = Xq_k1;

                if (ac_ctx[ACCTXMEMB_BP] - cur_side[CURMEMB_BP] > 3) {
                    bec.mark();
                    break;
                }
            }
        }

        // console.log("X_hat_q_ari=" + Xq.toString());

        //  Residual data and finalization.
        let nbits_residual = 0;
        if (!bec.isMarked()) {
            let nbits_side = nbits - (
                ((cur_side[CURMEMB_BP] << 3) >>> 0) + 
                8 - 
                cur_side[CURMEMB_BITNO]
            );
            let nbits_ari = (((ac_ctx[ACCTXMEMB_BP] - 3) << 3) >>> 0) + 
                            25 - 
                            Math.trunc(Math.log2(ac_ctx[ACCTXMEMB_RANGE]));
            nbits_residual = nbits - (nbits_side + nbits_ari);
            // console.log("nbits_residual=" + nbits_residual.toString());
            if (nbits_residual < 0) {
                bec.mark();
            }
        }

        //  Decode residual bits.
        nResBits = 0;
        if (!bec.isMarked()) {
            if (lsbMode == 0) {
                for (let k = 0; k < NE; ++k) {
                    if (Xq[k] != 0) {
                        if (nResBits == nbits_residual) {
                            break;
                        }
                        resBits[nResBits] = Impl_ReadBit(bytes, cur_side);
                        ++(nResBits);
                    }
                }
            } else {
                for (let k = 0; k < lastnz; k += 2) {
                    if (save_lev[k] > 0) {
                        if (nbits_residual == 0) {
                            break;
                        }
                        let bit = Impl_ReadBit(bytes, cur_side);
                        --(nbits_residual);
                        if (bit == 1) {
                            let Xq_k = Xq[k];
                            if (Xq_k > 0) {
                                ++(Xq[k]);
                            } else if (Xq_k < 0) {
                                --(Xq[k]);
                            } else {
                                if (nbits_residual == 0) {
                                    break;
                                }
                                bit = Impl_ReadBit(bytes, cur_side);
                                --(nbits_residual);
                                if (bit == 0) {
                                    Xq[k] = 1;
                                } else {
                                    Xq[k] = -1;
                                }
                            }
                        }
                        if (nbits_residual == 0) {
                            break;
                        }
                        bit = Impl_ReadBit(bytes, cur_side);
                        --(nbits_residual);
                        if (bit == 1) {
                            let k1 = k + 1;
                            let Xq_k1 = Xq[k1];
                            if (Xq_k1 > 0) {
                                ++(Xq[k1]);
                            } else if (Xq_k1 < 0) {
                                --(Xq[k1]);
                            } else {
                                if (nbits_residual == 0) {
                                    break;
                                }
                                bit = Impl_ReadBit(bytes, cur_side);
                                --(nbits_residual);
                                if (bit == 0) {
                                    Xq[k1] = 1;
                                } else {
                                    Xq[k1] = -1;
                                }
                            }
                        }
                    }
                }
            }

            // console.log("nResBits=" + nResBits.toString());
            // console.log("resBits=" + resBits.slice(0, nResBits).toString());
        }

        //  Noise Filling Seed.
        let nf_seed = 0;
        if (!bec.isMarked()) {
            let tmp = 0;
            for (let k = 0; k < NE; ++k) {
                tmp += Math.abs(Xq[k]) * k;
                tmp &= 0xffff;
            }
            nf_seed = (tmp >>> 0);
        }
        // console.log("nf_seed=" + nf_seed.toString());

        //  Zero frame flag.
        let zeroFrameFlag = 0;
        if (!bec.isMarked()) {
            if (
                lastnz == 2 && 
                Xq[0] == 0 && 
                Xq[1] == 0 && 
                gg_ind == 0 && 
                F_NF == 7
            ) {
                zeroFrameFlag = 1;
            }
        }
        // console.log("zeroFrameFlag=" + zeroFrameFlag);

        //  Residual decoding (3.4.3).
        if (!bec.isMarked()) {
            //  Residual decoding shall be performed only when lsbMode is 0.
            if (lsbMode == 0) {
                let k = 0, n = 0;
                while (k < NE && n < nResBits) {
                    let Xq_k = Xq[k];
                    if (Xq_k != 0) {
                        if (resBits[n] == 0) {
                            if (Xq_k > 0) {
                                Xq[k] -= 0.1875;
                            } else {
                                Xq[k] -= 0.3125;
                            }
                        } else {
                            if (Xq_k > 0) {
                                Xq[k] += 0.3125;
                            } else {
                                Xq[k] += 0.1875;
                            }
                        }
                        ++n;
                    }
                    ++k;
                }
            }
        }
        // console.log("X_hat_q=" + Xq.toString());

        //  Noise filling (3.4.4).
        if (!bec.isMarked()) {
            //  Noise filling shall be performed only when zeroFrameFlag is 0.
            if (zeroFrameFlag == 0) {
                let bw_stop = bw_stop_Nms[Pbw];
                // console.log("bw_stop=" + bw_stop.toString());

                //  Eq. 119
                for (let k = 0; k < bw_stop; ++k) {
                    let INF_flag = false;
                    if (k >= NFstart && k < bw_stop) {
                        INF_flag = true;
                        for (
                            let i = k - NFwidth, 
                                iEnd = Math.min(bw_stop - 1, k + NFwidth); 
                            i <= iEnd; 
                            ++i
                        ) {
                            if (Math.abs(Xq[i]) >= 1e-6) {
                                INF_flag = false;
                                break;
                            }
                        }
                    }
                    INF[k] = INF_flag;
                }

                //  Pseudocode under Table 3.19.
                let L_hat_NF = (8 - F_NF) / 16;
                for (let k = 0; k < bw_stop; ++k) {
                    if (INF[k]) {
                        nf_seed = (((13849 + nf_seed * 31821) & 0xFFFF) >>> 0);
                        if (nf_seed < 0x8000) {
                            Xq[k] = L_hat_NF;
                        } else {
                            Xq[k] = -L_hat_NF;
                        }
                    }
                }

            }
        }
        // console.log("X_hat_q_nf=" + Xq.toString());

        //  Global gain (3.4.5).
        let Xf = Xq;
        let gg_off = 0;
        if (!bec.isMarked()) {
            //  Eq. 121
            gg_off = -Math.min(115, Math.trunc(nbits / (10 * fsIndP1))) - 105 - 5 * fsIndP1;
            // console.log("gg_off=" + gg_off.toString());

            //  Eq. 120
            let gg = Math.pow(10, (gg_ind + gg_off) / 28);
            for (let k = 0; k < NE; ++k) {
                Xf[k] *= gg;
            }
        }
        // console.log("Xf[]=" + Xf.toString());

        //  TNS decoder (3.4.6).
        if (!bec.isMarked()) {
            //  Eq. 122.
            for (let f = 0; f < 2; ++f) {
                let RCi_f = tns_RCi[f];
                let RCq_f = tns_RCq[f];
                for (let k = 0; k < 8; ++k) {
                    RCq_f[k] = Math.sin(((RCi_f[k] - 8) * Math.PI) / 17);
                }
            }
            // console.log("RCq[][]=" + tns_RCq.toString());

            //  Load start_freq[f] and stop_freq[f] according to Table 3.20.
            let start_freq = tns_startfreq_Nms[Pbw];
            let stop_freq = tns_stopfreq_Nms[Pbw];
            // console.log("start_freq[]=" + start_freq.toString());
            // console.log("stop_freq[]=" + stop_freq.toString());

            //  Pseudocode under Table 3.20:
            for (let k = 0; k < NE; ++k) {
                Xs[k] = Xf[k];
            }
            
            for (let k = 0; k < 8; ++k) {     //  s[0] = s[1] = ... = s[7] = 0
                tns_S[k] = 0;
            }

            for (let f = 0; f < num_tns_filters; ++f) {
                let RCorder_fS1 = tns_RCorder[f] - 1;
                let RCq_f = tns_RCq[f];
                if (RCorder_fS1 >= 0) {
                    for (let n = start_freq[f], nEnd = stop_freq[f]; n < nEnd; ++n) {
                        let t = Xf[n] - RCq_f[RCorder_fS1] * tns_S[RCorder_fS1];
                        for (let k = RCorder_fS1 - 1; k >= 0; --k) {
                            t -= RCq_f[k] * tns_S[k];
                            tns_S[k + 1] = RCq_f[k] * t + tns_S[k];
                        }
                        Xs[n] = t;
                        tns_S[0] = t;
                    }
                }
            }
        }
        // console.log("X_s_tns[]=" + Xs.toString());

        //  SNS decoder (3.4.7).
        let X_hat = null;
        if (!bec.isMarked()) {
            let succeed = sns.update(
                ind_LF, 
                ind_HF, 
                shape_j, 
                gain_i, 
                LS_indA, 
                idxA, 
                LS_indB, 
                idxB, 
                Xs
            );
            if (succeed) {
                X_hat = sns.getSpectrumCoefficients();
            } else {
                bec.mark();
            }
        }
        // console.log("X_hat_ss[]=" + X_hat);

        //  Packet Loss Concealment (Appendix B).
        if (bec.isMarked()) {
            //  The LTPF shall be limited to cases 1 and 3 by setting 
            //  ltpf_active = 0.
            ltpf_active = 0;

            //  Do packet loss concealment.
            X_hat = plc.conceal();
        } else {
            plc.good(X_hat);
        }

        //  Low delay MDCT synthesis (3.4.8).
        let x_hat = imdct.update(X_hat);
        // console.log("x_hat[]=" + x_hat.toString());

        //  Long Term Postfilter (3.4.9).
        let x_ltpf_hat = ltpf_dec.update(x_hat, ltpf_active, ltpf_pitch_index, nbits);
        // console.log("x_ltpf_hat[]=" + x_ltpf_hat.toString());

        //  Output signal scaling and rounding.
        for (let i = 0; i < NF; ++i) {
            let tmp = x_ltpf_hat[i];
            tmp = Math.round(tmp);
            if (tmp > 32767) {
                tmp = 32767;
            } else if (tmp < -32768) {
                tmp = -32768;
            }
            rbuf[i] = tmp;
        }

        return rbuf;
    };
}

//
//  Private functions.
//

/**
 *  Implementation of read_bit() function.
 * 
 *  @param {Buffer} bytes 
 *    - The bytes buffer.
 *  @param {Array} cursor 
 *    - The cursor.
 *  @returns {Number}
 *    - The bit.
 */
function Impl_ReadBit(bytes, cursor) {
    //  Load cursor members.
    let bp = cursor[CURMEMB_BP];
    let bitno = cursor[CURMEMB_BITNO];
    
    try {
        //  read_bit() implementation.
        let bv = bytes.readUInt8(bp);
        let bit = ((bv & (1 << bitno)) != 0 ? 1 : 0);

        if (bitno >= 7) {
            bitno = 0;
            --(bp);
        } else {
            ++(bitno);
        }

        return bit;
    } finally {
        //  Save cursor members.
        cursor[CURMEMB_BP] = bp;
        cursor[CURMEMB_BITNO] = bitno;
    }
}

/**
 *  Implementation of read_uint() function.
 * 
 *  @param {Buffer} bytes 
 *    - The bytes buffer.
 *  @param {Array} cursor 
 *    - The cursor.
 *  @param {Number} numbits
 *    - The count of bits.
 *  @returns {Number}
 *    - The value.
 */
function Impl_ReadUInt(bytes, cursor, numbits) {
    //  Load cursor members.
    let bp = cursor[CURMEMB_BP];
    let bitno = cursor[CURMEMB_BITNO];

    try {
        //  read_uint() implementation.
        let value = 0;
        let vshift = 0;
        while (numbits != 0) {
            let bitrem = 8 - bitno;
            let bitnread = Math.min(bitrem, numbits);

            let bv = bytes.readUInt8(bp);
            bv = ((bv >>> bitno) & (((1 << bitnread) >>> 0) - 1));
            value |= (bv << vshift);

            bitno += bitnread;
            numbits -= bitnread;
            vshift += bitnread;

            if (bitno >= 8) {
                bitno = 0;
                --(bp);
            }
        }

        return (value >>> 0);
    } finally {
        //  Save cursor members.
        cursor[CURMEMB_BP] = bp;
        cursor[CURMEMB_BITNO] = bitno;
    }
}

/**
 *  Implementation of ac_dec_init() function.
 * 
 *  @param {Buffer} bytes 
 *    - The byte buffer.
 *  @param {Array} ac_ctx 
 *    - The context.
 *  @param {InstanceType<typeof LC3BEC>} bec
 *    - The BEC context.
 */
function Impl_AcDecInit(bytes, ac_ctx, bec) {
    let st_low = 0;
    for (let i = 0; i < 3; ++i) {
        st_low <<= 8;
        st_low  |= bytes.readUInt8(i);
    }
    ac_ctx[ACCTXMEMB_LOW] = (st_low >>> 0);
    ac_ctx[ACCTXMEMB_RANGE] = 0x00ffffff;
    ac_ctx[ACCTXMEMB_BEC] = bec;
    ac_ctx[ACCTXMEMB_BP] = 3;
}

/**
 *  Implementation of ac_decode() function.
 * 
 *  @param {Buffer} bytes 
 *    - The byte buffer.
 *  @param {Array} ac_ctx 
 *    - The context.
 *  @param {Number[]} cum_freqs
 *    - The cumulated frequency of symbols.
 *  @param {Number[]} sym_freqs
 *    - The frequency of symbols.
 *  @param {Number} numsym
 *    - The count of symbols.
 *  @param {InstanceType<typeof LC3BEC>} bec
 *    - The BEC context.
 *  @returns {Number}
 *    - The value.
 */
function Impl_AcDecode(bytes, ac_ctx, cum_freqs, sym_freqs, numsym) {
    //  Load context members.
    let st_low = ac_ctx[ACCTXMEMB_LOW];
    let st_range = ac_ctx[ACCTXMEMB_RANGE];
    let bp = ac_ctx[ACCTXMEMB_BP];
    let bec = ac_ctx[ACCTXMEMB_BEC];

    try {
        //  ac_decode() implementation.
        let tmp = (st_range >>> 10);
        if (st_low >= ((tmp << 10) >>> 0)) {
            bec.mark();
            return 0;
        }

        let val = numsym - 1;
        while (st_low < tmp * cum_freqs[val]) {
            --(val);
        }
        st_low -= tmp * cum_freqs[val];
        st_range = tmp * sym_freqs[val];
        while (st_range < 0x10000) {
            st_low <<= 8;
            st_low  |= bytes.readUInt8(bp);
            st_low   = ((st_low & 0x00ffffff) >>> 0);
            st_range = ((st_range << 8) >>> 0);
            ++(bp);
        }

        return val;
    } finally {
        //  Save context members.
        ac_ctx[ACCTXMEMB_LOW] = st_low;
        ac_ctx[ACCTXMEMB_RANGE] = st_range;
        ac_ctx[ACCTXMEMB_BP] = bp;
    }
}

//  Export public APIs.
module.exports = {
    "LC3Decoder": LC3Decoder
};