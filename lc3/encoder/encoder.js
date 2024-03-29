//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3EcLdMdct = 
    require("./ld-mdct");
const Lc3EcBwDetector = 
    require("./bw-detector");
const Lc3EcAkDetector = 
    require("./attack-detector");
const Lc3EcSns = 
    require("./sns");
const Lc3EcSq = 
    require("./sq");
const Lc3EcTns = 
    require("./tns");
const Lc3EcLtpf = 
    require("./ltpf");
const Lc3EcNle = 
    require("./nle");
const Lc3TblAcSpec = 
    require("./../tables/ac_spec");
const Lc3TblNE = 
    require("./../tables/ne");
const Lc3TblNF = 
    require("./../tables/nf");
const Lc3TblSns = 
    require("./../tables/sns");
const Lc3TblTns = 
    require("./../tables/tns");
const Lc3Fs = 
    require("./../common/fs");
const Lc3Nms = 
    require("./../common/nms");
const Lc3Error = 
    require("./../error");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;
const LC3MDCTAnalyzer = 
    Lc3EcLdMdct.LC3MDCTAnalyzer;
const LC3BandwidthDetector = 
    Lc3EcBwDetector.LC3BandwidthDetector;
const LC3AttackDetector = 
    Lc3EcAkDetector.LC3AttackDetector;
const LC3SpectralNoiseShapingEncoder = 
    Lc3EcSns.LC3SpectralNoiseShapingEncoder;
const LC3TemporalNoiseShapingEncoder = 
    Lc3EcTns.LC3TemporalNoiseShapingEncoder;
const LC3LongTermPostfilter = 
    Lc3EcLtpf.LC3LongTermPostfilter;
const LC3SpectralQuantization = 
    Lc3EcSq.LC3SpectralQuantization;
const LC3NoiseLevelEstimation = 
    Lc3EcNle.LC3NoiseLevelEstimation;

//  Imported constants.
const AC_SPEC_LOOKUP = 
    Lc3TblAcSpec.AC_SPEC_LOOKUP;
const AC_SPEC_CUMFREQ = 
    Lc3TblAcSpec.AC_SPEC_CUMFREQ;
const AC_SPEC_FREQ = 
    Lc3TblAcSpec.AC_SPEC_FREQ;
const SNS_GAINLSBBITS = 
    Lc3TblSns.SNS_GAINLSBBITS;
const SNS_GAINMSBBITS = 
    Lc3TblSns.SNS_GAINMSBBITS;
const AC_TNS_ORDER_CUMFREQ = 
    Lc3TblTns.AC_TNS_ORDER_CUMFREQ;
const AC_TNS_ORDER_FREQ = 
    Lc3TblTns.AC_TNS_ORDER_FREQ;
const AC_TNS_COEF_CUMFREQ = 
    Lc3TblTns.AC_TNS_COEF_CUMFREQ;
const AC_TNS_COEF_FREQ = 
    Lc3TblTns.AC_TNS_COEF_FREQ;
const NE_TBL = 
    Lc3TblNE.NE_TBL;
const NF_TBL = 
    Lc3TblNF.NF_TBL;

//
//  Constants.
//

//  Cursor member definitions.
const CURMEMN = 2;
const CURMEMB_BP = 0;
const CURMEMB_BITNO = 1;

//  Arithmetic Code (AC) context member definitions.
const ACCTXMEMN = 6;
const ACCTXMEMB_LOW = 0;
const ACCTXMEMB_RANGE = 1;
const ACCTXMEMB_CACHE = 2;
const ACCTXMEMB_CARRY = 3;
const ACCTXMEMB_CARRYCOUNT = 4;
const ACCTXMEMB_BP = 5;

//
//  Public classes.
//

/**
 *  LC3 encoder.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 */
function LC3Encoder(Nms, Fs) {
    //
    //  Members.
    //

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];
    let NE = NE_TBL[index_Nms][index_Fs];
    let NE_div_2 = (NE >>> 1);

    //  Algorithm contexts.
    let mdct = new LC3MDCTAnalyzer(Nms, Fs);

    let bwdet = new LC3BandwidthDetector(Nms, Fs);

    let akdet = new LC3AttackDetector(Nms, Fs);

    let sns = new LC3SpectralNoiseShapingEncoder(Nms, Fs);
    let sns_vqp_buf = new Array(6);

    let tns = new LC3TemporalNoiseShapingEncoder(Nms, Fs);

    let ltpf_enc = new LC3LongTermPostfilter(Nms, Fs);
    let ltpf_enc_param_buf = new Array(4);

    let sqtz = new LC3SpectralQuantization(Nms, Fs);
    let sqtz_param_buf = new Array(9);

    let res_bits = new Array(3200);

    let nle = new LC3NoiseLevelEstimation(Nms, Fs);

    let cur_side = new Array(CURMEMN);
    let ac_ctx = new Array(ACCTXMEMN);
    let lsbs = new Array(3200);

    let xs_clipped = new Array(NF);

    //
    //  Public methods.
    //

    /**
     *  Get the frame size.
     * 
     *  @returns {Number}
     *    - The frame size.
     */
    this.getFrameSize = function() {
        return NF;
    };

    /**
     *  Encode one frame.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - Frame size mismatches, or 
     *    - Byte count is not within specific range (20 <= nbytes <= 400), or 
     *    - Length of the buffer (i.e. bytesbuf) is smaller than the byte count.
     *  @param {Number[]|Int16Array} xs 
     *    - The frame.
     *  @param {Number} nbytes
     *    - The byte count.
     *  @param {Buffer|Uint8Array|Array} [bytesbuf]
     *    - The preallocated bytes buffer (used for reducing buffer allocation, 
     *      must contain at least `nbytes` bytes).
     *  @returns {Buffer|Uint8Array|Array}
     *    - The bytes buffer that contains the encoded frame.
     */
    this.encode = function(
        xs, 
        nbytes, 
        bytesbuf = NewDefaultByteBuffer(400)
    ) {
        //  Check the frame size.
        if (xs.length != NF) {
            throw new LC3IllegalParameterError(
                "Frame size mismatches."
            );
        }

        //  Check the byte count.
        if (nbytes < 20 || nbytes > 400) {
            throw new LC3IllegalParameterError(
                "Byte count is not within specific range (20 <= nbytes <= 400)."
            );
        }

        //  Check the length of the buffer.
        if (bytesbuf.length < nbytes) {
            throw new LC3IllegalParameterError(
                "Length of the buffer (i.e. bytesbuf) is smaller than the " + 
                "byte count."
            );
        }

        //  Clip the input signal (Eq. 5).
        if (typeof(Int16Array) != "undefined" && (xs instanceof Int16Array)) {
            for (let n = 0; n < NF; ++n) {
                xs_clipped[n] = xs[n];
            }
        } else {
            for (let n = 0; n < NF; ++n) {
                let tmp = xs[n];
                if (tmp > 32767) {
                    xs_clipped[n] = 32767;
                } else if (tmp < -32768) {
                    xs_clipped[n] = -32768;
                } else {
                    xs_clipped[n] = tmp;
                }
            }
        }

        //  Calculate bit count.
        let nbits = ((nbytes << 3) >>> 0);

        //  Low Delay MDCT analysis (3.3.4).
        mdct.update(xs_clipped);
        let nn_flag = mdct.getNearNyquistFlag();
        // console.log("near_nyquist_flag=" + nn_flag.toString());
        let X = mdct.getSpectralCoefficients();
        // console.log("X[]=" + X.toString());
        let EB = mdct.getSpectralEnergyBandEstimation();
        // console.log("EB[]=" + EB.toString());

        //  Bandwidth detector (3.3.5).
        let Pbw = bwdet.detect(EB);
        let nbitsBW = bwdet.getBitConsumption();
        // console.log("Pbw=" + Pbw.toString());
        // console.log("nbitsBW=" + nbitsBW.toString());

        //  Time domain sttack detector (3.3.6).
        akdet.update(xs_clipped, nbytes);
        let F_att = akdet.getAttackFlag();
        // console.log("F_att=" + F_att.toString());

        //  Spectral Noise Shaping (SNS) (3.3.7).
        sns.update(EB, X, F_att);
        let Xs = sns.getShapedSpectrumCoefficients();
        // console.log("Xs[]=" + Xs.toString());
        sns.getVectorQuantizationParameters(sns_vqp_buf);
        let sns_ind_LF = sns_vqp_buf[0];
        let sns_ind_HF = sns_vqp_buf[1];
        let sns_gain_i = sns_vqp_buf[2];
        let sns_shape_j = sns_vqp_buf[3];
        let sns_indexjoint = sns_vqp_buf[4];
        let sns_LSindA = sns_vqp_buf[5];
        // console.log("gain_i=" + sns_gain_i.toString());
        // console.log("shape_j=" + sns_shape_j.toString());
        // console.log("ind_LF=" + sns_ind_LF.toString());
        // console.log("ind_HF=" + sns_ind_HF.toString());
        // console.log("LS_indA=" + sns_LSindA.toString());
        
        // sns.getShapedSpectrumCoefficients
        //  Temporal Noise Shaping (TNS) (3.3.8).
        tns.update(Xs, Pbw, nn_flag, nbits);
        let nbitsTNS = tns.getBitConsumption();
        // console.log("nbitsTNS=" + nbitsTNS);
        let num_tns_filters = tns.getRcCount();
        // console.log("num_tns_filters=" + num_tns_filters);
        let tns_RCorder = tns.getRcOrders();
        // console.log("RCorder[]=" + tns_RCorder.toString());
        let tns_RCi = tns.getRcIndices();
        // console.log("RCi[][]=" + JSON.stringify(tns_RCi));
        // let tns_RCq = tns.getRcCoefficients();
        // console.log("RCq[][]=" + JSON.stringify(tns_RCq));
        let tns_lpc_weighting = tns.getLpcWeighting();
        // console.log("tns_lpc_weighting=" + tns_lpc_weighting.toString());
        let Xf = tns.getFilteredSpectrumCoefficients();
        // console.log("Xf[]=" + Xf.toString());

        //  Long Term Postfilter (3.3.9).
        ltpf_enc.update(xs_clipped, nbits, nn_flag);
        ltpf_enc.getEncoderParameters(ltpf_enc_param_buf);
        let nbitsLTPF = ltpf_enc_param_buf[0];
        // console.log("nbitsLTPF=" + nbitsLTPF.toString());
        let ltpf_pitch_present = ltpf_enc_param_buf[1];
        // console.log("pitch_present=" + ltpf_pitch_present.toString());
        let ltpf_pitch_index = ltpf_enc_param_buf[3];
        // console.log("pitch_index=" + ltpf_pitch_index.toString());
        let ltpf_active = ltpf_enc_param_buf[2];
        // console.log("ltpf_active=" + ltpf_active.toString());

        //  Spectral quantization (3.3.10).
        sqtz.update(Xf, nbits, nbitsBW, nbitsTNS, nbitsLTPF);
        let Xq = sqtz.getQuantizedSpectrumCoefficients();
        // console.log("Xq[]=" + Xq.toString());
        sqtz.getQuantizedParameters(sqtz_param_buf);
        let gg = sqtz_param_buf[0];
        let gg_ind = sqtz_param_buf[1];
        let lastnz_trunc = sqtz_param_buf[2];
        let rateFlag = sqtz_param_buf[3];
        // let modeFlag = sqtz_param_buf[4];
        let nbits_spec = sqtz_param_buf[5];
        let nbits_trunc = sqtz_param_buf[6];
        let nbits_lastnz = sqtz_param_buf[7];
        let lsbMode = sqtz_param_buf[8];
        // console.log("gg=" + gg.toString());
        // console.log("gg_ind=" + gg_ind.toString());
        // console.log("lastnz_trunc=" + lastnz_trunc.toString());
        // console.log("rateFlag=" + rateFlag.toString());
        // console.log("modeFlag=" + modeFlag.toString());
        // console.log("nbits_spec=" + nbits_spec.toString());
        // console.log("nbits_trunc=" + nbits_trunc.toString());
        // console.log("nbits_lastnz=" + nbits_lastnz.toString());
        // console.log("lsbMode=" + lsbMode);

        //  Residual coding (3.3.11).
        let nbits_residual_max = (nbits_spec - nbits_trunc + 4);
        let nbits_residual = 0;
        for (let k = 0; k < NE && nbits_residual < nbits_residual_max; ++k) {
            let Xq_k = Xq[k];
            if (Xq_k != 0) {
                res_bits[nbits_residual] = (Xf[k] >= Xq_k * gg ? 1 : 0);
                ++(nbits_residual);
            }
        }
        // console.log("nbits_residual=" + nbits_residual.toString());
        // console.log("res_bits[]=" + res_bits.slice(
        //     0, nbits_residual
        // ).toString());

        //  Noise level estimation (3.3.12).
        nle.update(Xf, Xq, Pbw, gg);
        let F_NF = nle.getNoiseLevel();

        //  Bitstream encoding (3.3.13).
        //
        //  Incorporated errata:
        //    [1] https://www.bluetooth.org/errata/errata_view.cfm?errata_id=16703
        let bitstream = bytesbuf;
        if (bitstream.length != nbytes) {
            bitstream = bitstream.slice(0, nbytes);
        }
        bitstream = bitstream.fill(0);

        //  Initialization (3.3.13.2).
        cur_side[CURMEMB_BP] = nbytes - 1;
        cur_side[CURMEMB_BITNO] = 0;

        //  Side information (3.3.13.3).

        //  Bandwidth.
        if (nbitsBW > 0) {
            Impl_WriteUIntBackward(
                bitstream, 
                cur_side, 
                Pbw, 
                nbitsBW
            );
        }

        //  Last non-zero tuple.
        Impl_WriteUIntBackward(
            bitstream, 
            cur_side, 
            (lastnz_trunc >>> 1) - 1, 
            nbits_lastnz
        );

        //  LSB mode bit.
        Impl_WriteBitBackward(
            bitstream, 
            cur_side, 
            lsbMode
        );

        //  Global Gain.
        Impl_WriteUIntBackward(
            bitstream, 
            cur_side, 
            gg_ind, 
            8
        );

        //  TNS activation flag.
        for (let f = 0; f < num_tns_filters; ++f) {
            let tns_active;
            if (tns_RCorder[f] > 0) {
                tns_active = 1;
            } else {
                tns_active = 0;
            }
            Impl_WriteBitBackward(
                bitstream, 
                cur_side, 
                tns_active
            );
        }

        //  Pitch present flag.
        Impl_WriteBitBackward(
            bitstream, 
            cur_side, 
            ltpf_pitch_present
        );

        //  Encode SCF VQ parameters - 1st stage (10 bits).
        Impl_WriteUIntBackward(
            bitstream, 
            cur_side, 
            sns_ind_LF, 
            5
        );
        Impl_WriteUIntBackward(
            bitstream, 
            cur_side, 
            sns_ind_HF, 
            5
        );

        //  Encode SCF VQ parameters - 2nd stage side-info (3-4 bits).
        Impl_WriteBitBackward(
            bitstream, 
            cur_side, 
            (sns_shape_j >>> 1)
        );
        // let submode_LSB = ((sns_shape_j & 1) >>> 0);
        let submode_MSB = (sns_shape_j >>> 1);
        // console.log("submode_LSB=" + submode_LSB.toString());
        // console.log("submode_MSB=" + submode_MSB.toString());
        let gain_MSBs = (sns_gain_i >>> SNS_GAINLSBBITS[sns_shape_j]);
        Impl_WriteUIntBackward(
            bitstream, 
            cur_side, 
            gain_MSBs, 
            SNS_GAINMSBBITS[sns_shape_j]
        );
        Impl_WriteBitBackward(
            bitstream, 
            cur_side, 
            sns_LSindA
        );

        //  Encode SCF VQ parameters - 2nd stage MPVQ data.
        if (submode_MSB == 0) {
            Impl_WriteUIntBackward(
                bitstream, 
                cur_side, 
                sns_indexjoint, 
                25
            );
        } else {
            Impl_WriteUIntBackward(
                bitstream, 
                cur_side, 
                sns_indexjoint, 
                24
            );
        }

        //  LTPF data.
        if (ltpf_pitch_present != 0) {
            Impl_WriteBitBackward(
                bitstream,
                cur_side,
                ltpf_active
            );
            Impl_WriteUIntBackward(
                bitstream, 
                cur_side, 
                ltpf_pitch_index, 
                9
            );
        }

        //  Noise Factor.
        Impl_WriteUIntBackward(
            bitstream, 
            cur_side, 
            F_NF, 
            3
        );

        //  Arithmetic encoding (3.3.13.4).
        
        //  Arithmetic encoder initialization.
        Impl_AcEncInit(ac_ctx);
        let c = 0;
        let nlsbs = 0;
        let lsb0 = 0, lsb1 = 0;

        //  TNS data.
        for (let f = 0; f < num_tns_filters; ++f) {
            let tns_RCorder_fS1 = tns_RCorder[f] - 1;
            let tns_RCi_f = tns_RCi[f];
            if (tns_RCorder_fS1 >= 0) {
                Impl_AcEncode(
                    bitstream, 
                    ac_ctx, 
                    AC_TNS_ORDER_CUMFREQ[tns_lpc_weighting][tns_RCorder_fS1], 
                    AC_TNS_ORDER_FREQ[tns_lpc_weighting][tns_RCorder_fS1]
                );
                for (let k = 0; k <= tns_RCorder_fS1; ++k) {
                    let tns_RCi_f_k = tns_RCi_f[k];
                    Impl_AcEncode(
                        bitstream, 
                        ac_ctx, 
                        AC_TNS_COEF_CUMFREQ[k][tns_RCi_f_k], 
                        AC_TNS_COEF_FREQ[k][tns_RCi_f_k]
                    );
                }
            }
        }

        //  Spectral data.
        for (let k = 0; k < lastnz_trunc; k += 2) {
            let Xq_k0 = Xq[k];
            let Xq_k1 = Xq[k + 1];

            let t = c + rateFlag;
            if (k > NE_div_2) {
                t += 256;
            }

            let a = Math.abs(Xq_k0);
            let a_lsb = a;
            let b = Math.abs(Xq_k1);
            let b_lsb = b;
            let lev = 0;
            while (Math.max(a, b) >= 4) {
                let pki = AC_SPEC_LOOKUP[t + ((Math.min(lev, 3) << 10) >>> 0)];
                Impl_AcEncode(
                    bitstream, 
                    ac_ctx, 
                    AC_SPEC_CUMFREQ[pki][16], 
                    AC_SPEC_FREQ[pki][16]
                );
                if (lsbMode == 1 && lev == 0) {
                    lsb0 = ((a & 1) >>> 0);
                    lsb1 = ((b & 1) >>> 0);
                } else {
                    Impl_WriteBitBackward(
                        bitstream, 
                        cur_side, 
                        ((a & 1) >>> 0)
                    );
                    Impl_WriteBitBackward(
                        bitstream, 
                        cur_side, 
                        ((b & 1) >>> 0)
                    );
                }
                a >>>= 1;
                b >>>= 1;
                ++(lev);
            }
            let pki = AC_SPEC_LOOKUP[t + ((Math.min(lev, 3) << 10) >>> 0)];
            let sym = a + ((b << 2) >>> 0);
            Impl_AcEncode(
                bitstream, 
                ac_ctx, 
                AC_SPEC_CUMFREQ[pki][sym], 
                AC_SPEC_FREQ[pki][sym]
            );
            if (lsbMode == 1 && lev > 0) {
                a_lsb >>>= 1;
                b_lsb >>>= 1;
                lsbs[nlsbs++] = lsb0;
                if (a_lsb == 0 && Xq_k0 != 0) {
                    lsbs[nlsbs++] = (Xq_k0 > 0 ? 0 : 1);
                }
                lsbs[nlsbs++] = lsb1;
                if (b_lsb == 0 && Xq_k1 != 0) {
                    lsbs[nlsbs++] = (Xq_k1 > 0 ? 0 : 1);
                }
            }
            if (a_lsb > 0) {
                Impl_WriteBitBackward(bitstream, cur_side, (Xq_k0 > 0 ? 0 : 1));
            }
            if (b_lsb > 0) {
                Impl_WriteBitBackward(bitstream, cur_side, (Xq_k1 > 0 ? 0 : 1));
            }
            lev = Math.min(lev, 3);
            if (lev <= 1) {
                t = 1 + (a + b) * (lev + 1);
            } else {
                t = 12 + lev;
            }
            c = (((c & 15) << 4) >>> 0) + t;
        }

        //  Residual data and finalization (3.3.13.5).

        //  Residual bits.
        let nbits_side = nbits - (
            8 * cur_side[CURMEMB_BP] + 8 - cur_side[CURMEMB_BITNO]
        );
        let nbits_ari = ((ac_ctx[ACCTXMEMB_BP] << 3) >>> 0) + 25 - 
                        Math.trunc(Math.log2(ac_ctx[ACCTXMEMB_RANGE]));
        if (ac_ctx[ACCTXMEMB_CACHE] >= 0) {
            nbits_ari += 8;
        }
        if (ac_ctx[ACCTXMEMB_CARRYCOUNT] > 0) {
            nbits_ari += (((ac_ctx[ACCTXMEMB_CARRYCOUNT]) << 3) >>> 0);
        }
        // console.log("nbits_ari=" + nbits_ari);
        let nbits_residual_enc = nbits - nbits_side - nbits_ari;
        // console.log("nbits_side=" + nbits_side);
        // console.log("nbits_residual=" + nbits_residual);
        // console.log("nbits_residual_enc=" + nbits_residual_enc);
        if (lsbMode == 0) {
            if (nbits_residual < nbits_residual_enc) {
                nbits_residual_enc = nbits_residual;
            }
            for (let k = 0; k < nbits_residual_enc; ++k) {
                Impl_WriteBitBackward(bitstream, cur_side, res_bits[k]);
            }
        } else {
            if (nlsbs < nbits_residual_enc) {
                nbits_residual_enc = nlsbs;
            }
            // console.log("nlsbs=" + nlsbs.toString());
            for (let k = 0; k < nbits_residual_enc; ++k) {
                Impl_WriteBitBackward(bitstream, cur_side, lsbs[k]);
            }
        }
        Impl_AcEncFinish(bitstream, ac_ctx);

        return bitstream;
    };
}

//
//  Private functions.
//

/**
 *  Implementation of write_bit_backward() function.
 * 
 *  @param {Buffer|Uint8Array|Array} bytes 
 *    - The bytes buffer.
 *  @param {Array} cursor 
 *    - The cursor.
 *  @param {Number} bit 
 *    - The bit.
 */
function Impl_WriteBitBackward(bytes, cursor, bit) {
    //  Load cursor members.
    let bp = cursor[CURMEMB_BP];
    let bitno = cursor[CURMEMB_BITNO];

    try {
        //  Write bit backward.
        let mask = ((1 << bitno) >>> 0);
        let bv = bytes[bp];
        if (bit == 0) {
            bv &= (0xFF ^ mask);
        } else {
            bv |= mask;
        }
        bytes[bp] = (bv >>> 0);
        if (bitno == 7) {
            bitno = 0;
            --(bp);
        } else {
            ++(bitno);
        }
    } finally {
        //  Save cursor members.
        cursor[CURMEMB_BP] = bp;
        cursor[CURMEMB_BITNO] = bitno;
    }
}

/**
 *  Implementation of write_uint_backward() function.
 * 
 *  @param {Buffer|Uint8Array|Array} bytes 
 *    - The bytes buffer.
 *  @param {Array} cursor 
 *    - The cursor.
 *  @param {Number} val 
 *    - The unsigned integer.
 *  @param {Number} numbits 
 *    - The bit count.
 */
function Impl_WriteUIntBackward(bytes, cursor, val, numbits) {
    //  Load cursor members.
    let bp = cursor[CURMEMB_BP];
    let bitno = cursor[CURMEMB_BITNO];

    try {
        //  Write unsigned integer backward.
        while (numbits != 0) {
            let bitrem = 8 - bitno;
            let bitncopy = Math.min(bitrem, numbits);

            let bv = bytes[bp];

            let m = ((1 << bitncopy) >>> 0) - 1;

            bv &= ((m << bitno) ^ 0xFF);
            bv |= ((val & m) << bitno);
            bytes[bp] = (bv >>> 0);

            val >>>= bitncopy;
            numbits -= bitncopy;
            bitno += bitncopy;

            if (bitno >= 8) {
                bitno = 0;
                --(bp);
            }
        }
    } finally {
        //  Save cursor members.
        cursor[CURMEMB_BP] = bp;
        cursor[CURMEMB_BITNO] = bitno;
    }

}

/**
 *  Implementation of ac_enc_init() function.
 * 
 *  @param {Array} ctx 
 *    - The context.
 */
function Impl_AcEncInit(ctx) {
    ctx[ACCTXMEMB_LOW] = 0;
    ctx[ACCTXMEMB_RANGE] = 0x00ffffff;
    ctx[ACCTXMEMB_CACHE] = -1;
    ctx[ACCTXMEMB_CARRY] = 0;
    ctx[ACCTXMEMB_CARRYCOUNT] = 0;
    ctx[ACCTXMEMB_BP] = 0;
}

/**
 *  Implementation of ac_encode() function.
 * 
 *  @param {Buffer|Uint8Array|Array} bytes 
 *    - The bytes buffer.
 *  @param {Array} ctx 
 *    - The context.
 *  @param {Number} cum_freq
 *    - The cumulated frequency.
 *  @param {Number} sym_freq
 *    - The symbol frequency.
 */
function Impl_AcEncode(bytes, ctx, cum_freq, sym_freq) {
    //  Load context members.
    let st_low = ctx[ACCTXMEMB_LOW];
    let st_range = ctx[ACCTXMEMB_RANGE];
    let st_cache = ctx[ACCTXMEMB_CACHE];
    let st_carry = ctx[ACCTXMEMB_CARRY];
    let st_carrycount = ctx[ACCTXMEMB_CARRYCOUNT];
    let bp = ctx[ACCTXMEMB_BP];

    try {
        //  ac_encode() implementation.
        let r = (st_range >>> 10);
        st_low += r * cum_freq;
        if ((st_low >>> 24) != 0) {
            st_carry = 1;
            st_low = ((st_low & 0x00ffffff) >>> 0);
        }
        st_range = r * sym_freq;
        while (st_range < 0x10000) {
            st_range = ((st_range << 8) >>> 0);

            //  ac_shift() implementation.
            if (st_low < 0x00ff0000 || st_carry == 1) {
                if (st_cache >= 0) {
                    bytes[bp] = st_cache + st_carry;
                    ++(bp);
                }
                while (st_carrycount > 0) {
                    bytes[bp] = (((st_carry + 0xff) & 0xff) >>> 0);
                    ++(bp);
                    --(st_carrycount);
                }
                st_cache = (st_low >>> 16);
                st_carry = 0;
            } else {
                ++(st_carrycount);
            }
            st_low = (((st_low << 8) & 0x00ffffff) >>> 0);
        }
    } finally {
        //  Save context members.
        ctx[ACCTXMEMB_LOW] = st_low;
        ctx[ACCTXMEMB_RANGE] = st_range;
        ctx[ACCTXMEMB_CACHE] = st_cache;
        ctx[ACCTXMEMB_CARRY] = st_carry;
        ctx[ACCTXMEMB_CARRYCOUNT] = st_carrycount;
        ctx[ACCTXMEMB_BP] = bp;
    }
}

/**
 *  Implementation of ac_enc_finish() function.
 * 
 *  @param {Buffer|Uint8Array|Array} bytes 
 *    - The bytes buffer.
 *  @param {Array} ctx 
 *    - The context.
 */
function Impl_AcEncFinish(bytes, ctx) {
    //  Load context members.
    
    let st_low = ctx[ACCTXMEMB_LOW];
    let st_range = ctx[ACCTXMEMB_RANGE];
    let st_cache = ctx[ACCTXMEMB_CACHE];
    let st_carry = ctx[ACCTXMEMB_CARRY];
    let st_carrycount = ctx[ACCTXMEMB_CARRYCOUNT];
    let bp = ctx[ACCTXMEMB_BP];

    try {
        let bits = 1;
        while ((st_range >>> (24 - bits)) == 0) {
            ++(bits);
        }
        let mask = (0x00ffffff >>> bits);
        let val = st_low + mask;
        let over1 = (val >>> 24);
        let high = st_low + st_range;
        let over2 = (high >>> 24);
        high = ((high & 0x00ffffff) >>> 0);
        val = (((val & 0x00ffffff) & (0xffffffff ^ mask)) >>> 0);
        if (over1 == over2) {
            if (val + mask >= high) {
                ++(bits);
                mask >>>= 1;
                val = ((((st_low + mask) & 0x00ffffff) & (0xffffffff ^ mask)) >>> 0);
            }
            if (val < st_low) {
                st_carry = 1;
            }
        }
        st_low = val;
        for (; bits > 0; bits -= 8) {
            //  ac_shift() implementation.
            if (st_low < 0x00ff0000 || st_carry == 1) {
                if (st_cache >= 0) {
                    bytes[bp] = st_cache + st_carry;
                    ++(bp);
                }
                while (st_carrycount > 0) {
                    bytes[bp] = (((st_carry + 0xff) & 0xff) >>> 0);
                    ++(bp);
                    --(st_carrycount);
                }
                st_cache = (st_low >>> 16);
                st_carry = 0;
            } else {
                ++(st_carrycount);
            }
            st_low = (((st_low << 8) & 0x00ffffff) >>> 0);
        }
        bits += 8;
        let lastbyte;
        if (st_carrycount > 0) {
            bytes[bp] = st_cache;
            ++(bp);
            for (; st_carrycount > 1; --st_carrycount) {
                bytes[bp] = 0xff;
                ++(bp);
            }
            lastbyte = (0xff >>> (8 - bits));
        } else {
            lastbyte = st_cache;
        }
        let m1 = (0xff >>> bits);
        let m2 = ((0xff ^ m1) >>> 0);
        let bv = bytes[bp];
        bv = (((bv & m1) | (lastbyte & m2)) >>> 0);
        bytes[bp] = bv;
    } finally {
        //  Save context members.
        ctx[ACCTXMEMB_LOW] = st_low;
        ctx[ACCTXMEMB_RANGE] = st_range;
        ctx[ACCTXMEMB_CACHE] = st_cache;
        ctx[ACCTXMEMB_CARRY] = st_carry;
        ctx[ACCTXMEMB_CARRYCOUNT] = st_carrycount;
        ctx[ACCTXMEMB_BP] = bp;
    }
}

/**
 *  Create a new default byte buffer.
 * 
 *  @param {Number} sz
 *    - The size.
 *  @returns {Buffer|Uint8Array|Array}
 *    - The byte buffer.
 */
const NewDefaultByteBuffer = (function() {
    if (typeof(Buffer) != "undefined") {
        //  Node.JS environment.
        return function(sz) {
            return Buffer.allocUnsafe(sz);
        };
    } else if (typeof(Uint8Array) != "undefined") {
        //  Not in Node.JS, but Uint8Array is available.
        return function(sz) {
            return new Uint8Array(sz);
        };
    } else {
        //  Fallback to default Array.
        return function(sz) {
            return new Array(sz);
        };
    }
})();

//  Export public APIs.
module.exports = {
    "LC3Encoder": LC3Encoder
};