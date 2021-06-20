//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Warning(s):
//    [1] This is an example file. Do NOT use in production.
//

//
//  Imports.
//

//  Imported modules.
const LC3 = 
    require("./../..");
const FS = 
    require("fs");
const Path = 
    require("path");

//  Imported classes.
const LC3FrameDuration = 
    LC3.Core.LC3FrameDuration;
const LC3SampleRate = 
    LC3.Core.LC3SampleRate;
const LC3BEC = 
    LC3.Decoder.LC3BEC;
const LC3Decoder = 
    LC3.Decoder.LC3Decoder;

//
//  Constants.
//

//  Input file.
const INPUT_PATH = Path.join(__dirname, "input.lc3");

//  Output file.
const OUTPUT_PATH = Path.join(__dirname, "output.raw");

//
//  Main.
//
(function() {
    //  Open input/output files.
    let infd = FS.openSync(INPUT_PATH, "r");
    let outfd = FS.openSync(OUTPUT_PATH, "w");

    //  Get frame duration and sample rate.
    let hdr = Buffer.allocUnsafe(4);
    if (FS.readSync(infd, hdr) != 4) {
        throw new Error("File corrupted (truncated file header).");
    }
    let Nms, Fs;
    switch (hdr.readUInt16BE(0)) {
    case 10000:
        Nms = LC3FrameDuration.NMS_10000US;
        break;
    case 7500:
        Nms = LC3FrameDuration.NMS_07500US;
        break;
    default:
        throw new Error("File corrupted (illegal frame duration).");
    }
    switch (hdr.readUInt16BE(2)) {
    case 8000:
        Fs = LC3SampleRate.FS_08000;
        break;
    case 16000:
        Fs = LC3SampleRate.FS_16000;
        break;
    case 24000:
        Fs = LC3SampleRate.FS_24000;
        break;
    case 32000:
        Fs = LC3SampleRate.FS_32000;
        break;
    case 44100:
        Fs = LC3SampleRate.FS_44100;
        break;
    case 48000:
        Fs = LC3SampleRate.FS_48000;
        break;
    default:
        throw new Error("File corrupted (illegal sample rate).");
    }

    //  Create decoder.
    let dc = new LC3Decoder(Nms, Fs);

    //  Decode frames.
    let bfi = new LC3BEC();
    let frame = new Array(dc.getFrameSize());
    let pcmbuf = Buffer.allocUnsafe(frame.length * 2);
    let bytebuf = Buffer.allocUnsafe(402);
    let running = true;
    while (running) {
        //  Read the byte count of encoded frame.
        if (FS.readSync(infd, bytebuf, 0, 2) != 2) {
            throw new Error("File corrupted (truncated bitstream header).");
        }
        let nbytes = bytebuf.readUInt16BE(0);
        if (nbytes == 0) {
            running = false;
            continue;
        }
        if (nbytes < 20 || nbytes > 400) {
            throw new Error("File corrupted (illegal bitstream size).");
        }

        //  Read the encoded frame.
        if (FS.readSync(infd, bytebuf, 2, nbytes) != nbytes) {
            throw new Error("File corrupted (truncated bitstream data).");
        }

        //  Decode the frame.
        dc.decode(bytebuf.slice(2, 2 + nbytes), bfi, frame);
        if (bfi.isMarked()) {
            throw new Error("File corrupted (decode error).");
        }

        //  Write frame to output.
        for (let i = 0; i < frame.length; ++i) {
            pcmbuf.writeInt16LE(frame[i], i * 2);
        }
        FS.writeSync(outfd, pcmbuf);
    }

    //  Close input/output files.
    FS.closeSync(infd);
    FS.closeSync(outfd);
})();