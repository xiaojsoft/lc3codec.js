//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Fs = 
    require("./../lc3/common/fs");
const Lc3Nms = 
    require("./../lc3/common/nms");
const Lc3DcBec = 
    require("./../lc3/decoder/bec");
const Lc3DcDecoder = 
    require("./../lc3/decoder/decoder");
const Lc3EcEncoder = 
    require("./../lc3/encoder/encoder");
const Lc3NodeWorkerSpec = 
    require("./worker-spec");
const XRTLibAsyncLite = 
    require("xrtlibrary-asynclite");
const Process = 
    require("process");
const WorkerThreads = 
    require("worker_threads");

//  Imported classes.
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3BEC = 
    Lc3DcBec.LC3BEC;
const LC3Decoder = 
    Lc3DcDecoder.LC3Decoder;
const LC3Encoder = 
    Lc3EcEncoder.LC3Encoder;
const LwSemaphore = 
    XRTLibAsyncLite.Synchronize.LwSemaphore;

//  Imported constants.
const MSGTYPE_HANDSHAKE = 
    Lc3NodeWorkerSpec.MSGTYPE_HANDSHAKE;
const MSGTYPE_RESET = 
    Lc3NodeWorkerSpec.MSGTYPE_RESET;
const MSGTYPE_ENCODE = 
    Lc3NodeWorkerSpec.MSGTYPE_ENCODE;
const MSGTYPE_DECODE = 
    Lc3NodeWorkerSpec.MSGTYPE_DECODE;
const MSGTYPE_QUIT = 
    Lc3NodeWorkerSpec.MSGTYPE_QUIT;
const MSGNAK_MASK = 
    Lc3NodeWorkerSpec.MSGNAK_MASK;
const MSGNAK_REASON_ILLEGAL_CMD = 
    Lc3NodeWorkerSpec.MSGNAK_REASON_ILLEGAL_CMD;
const MSGNAK_REASON_ILLEGAL_DATA = 
    Lc3NodeWorkerSpec.MSGNAK_REASON_ILLEGAL_DATA;
const MSGNAK_REASON_ILLEGAL_STATE = 
    Lc3NodeWorkerSpec.MSGNAK_REASON_ILLEGAL_STATE;
const MSGRST_FLAG_USE_ENCODER = 
    Lc3NodeWorkerSpec.MSGRST_FLAG_USE_ENCODER;
const MSGRST_FLAG_USE_DECODER = 
    Lc3NodeWorkerSpec.MSGRST_FLAG_USE_DECODER;
const MSGDC_FLAG_BFI = 
    Lc3NodeWorkerSpec.MSGDC_FLAG_BFI;

//
//  Constants.
//

//
//  Main entry.
//
(async function() {
    //  Environment check.
    if (WorkerThreads.isMainThread) {
        throw new Error("This script can only be run in Worker.");
    }

    //  Encoder/decoder instance.
    let encoder = null;
    let decoder = null;

    //  Get message port.
    let msgport = WorkerThreads.parentPort;

    //  Incoming message queue.
    let msgrcvqueue = [];
    let msgrcvqueue_sem = new LwSemaphore(0);

    //  Listen message port.
    msgport.on("message", function(msg) {
        if (!(msg instanceof SharedArrayBuffer)) {
            return;
        }
        msgrcvqueue.push(msg);
        msgrcvqueue_sem.release();
    });

    //  Send HANDSHAKE message.
    {
        let msgsnd = new SharedArrayBuffer(4);
        let msgsndview = Buffer.from(msgsnd, 0, msgsnd.byteLength);
        msgsndview.writeUInt8(MSGTYPE_HANDSHAKE, 0);
        msgsndview.writeUInt8(0, 1);
        msgsndview.writeUInt16BE(0, 2);
        msgport.postMessage(msgsnd);
    }

    //  Handle requests.
    for (;;) {
        //  Wait for one message.
        await msgrcvqueue_sem.acquire().handle;
        let msgrcv = msgrcvqueue.shift();
        let msgrcvlen = msgrcv.byteLength;
        let msgrcvview = Buffer.from(msgrcv, 0, msgrcvlen);

        //  Drop the message if it is too short.
        if (msgrcvlen < 4) {
            continue;
        }

        //  Handle the message.
        let msgtype = msgrcvview.readUInt8(0);
        if (msgtype == MSGTYPE_QUIT) {
            break;
        } else if (msgtype == MSGTYPE_RESET) {
            let msgflag = msgrcvview.readUInt8(1);
            let msgconfig = msgrcvview.readUInt16BE(2);

            let Nms, Fs;
            switch (((msgconfig >>> 3) & 0x03) >>> 0) {
            case 0:
                Nms = LC3FrameDuration.NMS_10000US;
                break;
            case 1:
                Nms = LC3FrameDuration.NMS_07500US;
                break;
            default:
                //  NAK the message.
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_DATA, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }
            switch ((msgconfig & 0x07) >>> 0) {
            case 0:
                Fs = LC3SampleRate.FS_08000;
                break;
            case 1:
                Fs = LC3SampleRate.FS_16000;
                break;
            case 2:
                Fs = LC3SampleRate.FS_24000;
                break;
            case 3:
                Fs = LC3SampleRate.FS_32000;
                break;
            case 4:
                Fs = LC3SampleRate.FS_44100;
                break;
            case 5:
                Fs = LC3SampleRate.FS_48000;
                break;
            default:
                //  NAK the message.
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_DATA, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            if ((msgflag & MSGRST_FLAG_USE_ENCODER) != 0) {
                encoder = new LC3Encoder(Nms, Fs);
            } else {
                encoder = null;
            }
            if ((msgflag & MSGRST_FLAG_USE_DECODER) != 0) {
                decoder = new LC3Decoder(Nms, Fs);
            } else {
                decoder = null;
            }

            //  ACK the message.
            msgrcvview.writeUInt8(0, 1);
            msgrcvview.writeUInt16BE(0, 2);
            msgport.postMessage(msgrcv.slice(0, 4));
        } else if (msgtype == MSGTYPE_ENCODE) {
            //  NAK if the message is too short.
            if (msgrcvlen < 8) {
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_DATA, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            //  NAK if the encoder is not reset.
            if (encoder === null) {
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_STATE, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            //  Get frame size and frame data offset.
            let msgconfig = msgrcvview.readUInt16BE(2);
            let NF = ((msgconfig & 1023) >>> 0);
            let msgframeoff = (msgconfig >>> 10);

            //  NAK if frame size mismatches.
            if (NF != encoder.getFrameSize()) {
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_DATA, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            //  NAK if there is no enough frame data truncated.
            let msgsamplesz = Int16Array.BYTES_PER_ELEMENT;
            if (msgframeoff + msgsamplesz * NF > msgrcvlen) {
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_DATA, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            //  Get the byte count of encoded frame.
            let msgexword1 = msgrcvview.readUInt16BE(4);
            // let msgexword2 = msgrcvview.readUInt16BE(6);
            let msgnbytes = ((msgexword1 & 1023) >>> 0);

            //  NAK if the byte count exceeds.
            if (msgnbytes < 20 || msgnbytes > 400) {
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_DATA, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            //  Create reply message.
            let msgsnd = new SharedArrayBuffer(4 + msgnbytes);
            let msgsndhdr = Buffer.from(msgsnd, 0, 4);
            let msgsndframebytes = Buffer.from(msgsnd, 4, msgnbytes);
            msgsndhdr.writeUInt8(msgtype, 0);
            msgsndhdr.writeUInt8(0, 1);
            msgsndhdr.writeUInt16BE(msgnbytes, 2);

            //  Get the frame.
            let msgframe = new Int16Array(msgrcv, msgframeoff, NF);

            //  Encode the frame.
            encoder.encode(msgframe, msgnbytes, msgsndframebytes);

            //  Send reply.
            msgport.postMessage(msgsnd);
        } else if (msgtype == MSGTYPE_DECODE) {
            //  NAK if the decoder is not reset.
            if (decoder === null) {
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_STATE, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            //  Get BFI.
            let bec = new LC3BEC();
            let msgrcvflag = msgrcvview.readUInt8(1);
            if ((msgrcvflag & MSGDC_FLAG_BFI) != 0) {
                bec.mark();
            }

            //  Get the byte count of encoded frame.
            let msgrcvconfig = msgrcvview.readUInt16BE(2);
            let nbytes = ((msgrcvconfig & 1023) >>> 0);

            //  NAK if there is no enough encoded bytes.
            if (msgrcvlen < 4 + nbytes) {
                msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
                msgrcvview.writeUInt8(0, 1);
                msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_DATA, 2);
                msgport.postMessage(msgrcv.slice(0, 4));
                continue;
            }

            //  Create reply message.
            let NF = decoder.getFrameSize();
            let bytes_per_sample = Int16Array.BYTES_PER_ELEMENT;
            let msgsndhdrsz = Math.max(4, bytes_per_sample);
            let msgsnd = new SharedArrayBuffer(
                msgsndhdrsz + NF * bytes_per_sample
            );
            let msgsndhdr = Buffer.from(msgsnd, 0, msgsndhdrsz);
            let msgsndframe = new Int16Array(msgsnd, msgsndhdrsz, NF);

            //  Decode the frame.
            decoder.decode(Buffer.from(msgrcv, 4, nbytes), bec, msgsndframe);

            //  Fill the header of the reply message.
            msgsndhdr.writeUInt8(msgtype, 0);
            let msgsndflag = 0;
            if (bec.isMarked()) {
                msgsndflag |= MSGDC_FLAG_BFI;
            }
            msgsndhdr.writeUInt8(msgsndflag, 1);
            msgsndhdr.writeUInt16BE(((
                NF | 
                (msgsndhdrsz << 10)
            ) >>> 0), 2);

            //  Send reply.
            msgport.postMessage(msgsnd);
        } else {
            //  NAK the message.
            msgrcvview.writeUInt8(((msgtype | MSGNAK_MASK) >>> 0), 0);
            msgrcvview.writeUInt8(0, 1);
            msgrcvview.writeUInt16BE(MSGNAK_REASON_ILLEGAL_CMD, 2);
            msgport.postMessage(msgrcv.slice(0, 4));
        }
    }

    //  Delete message port listener.
    msgport.removeAllListeners("message");
})().then(function() {
    Process.exit(0);
}).catch(function(error) {
    // console.error(error.message || "Unknown error.");
    Process.exit(1);
});