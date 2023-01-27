//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
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
const LC3Encoder = 
    LC3.Encoder.LC3Encoder;

//
//  Constants.
//

//  Input file.
const INPUT_PATH = Path.join(__dirname, "input.raw");

//  Output file.
const OUTPUT_PATH = Path.join(__dirname, "output.lc3");

//  Encoder configurations.
const CONFIG_FS = LC3SampleRate.FS_16000;
const CONFIG_NMS = LC3FrameDuration.NMS_10000US;
const CONFIG_BYTE_PER_FRAME = 80;

//
//  Main.
//
(function() {
    //  Load audio.
    let pcm = FS.readFileSync(INPUT_PATH);

    //  Create encoder.
    let ec = new LC3Encoder(CONFIG_NMS, CONFIG_FS);
    let frame_size = ec.getFrameSize();

    //  Open output file.
    let outfd = FS.openSync(OUTPUT_PATH, "w");
    let outheader = Buffer.allocUnsafe(4);
    outheader.writeUInt16BE(CONFIG_NMS.toMicroseconds(), 0);
    outheader.writeUInt16BE(CONFIG_FS.getSampleRate(), 2);
    FS.writeSync(outfd, outheader);

    //  Encode the audio.
    let frame = new Array(frame_size);
    let bytebuf = Buffer.allocUnsafe(402);
    for (
        let offset = 0; 
        offset + frame_size * 2 <= pcm.length; 
        offset += frame_size * 2
    ) {
        //  Get one frame.
        for (let i = 0; i < frame_size; ++i) {
            frame[i] = pcm.readInt16LE(offset + i * 2);
        }

        //  Encode the frame.
        let nbytes = CONFIG_BYTE_PER_FRAME;
        bytebuf.writeUInt16BE(nbytes, 0);
        ec.encode(frame, nbytes, bytebuf.slice(2, 2 + nbytes));

        //  Write encoded frame to the output file.
        FS.writeSync(outfd, bytebuf, 0, 2 + nbytes);
    }

    //  Write ending frame.
    FS.writeSync(outfd, Buffer.from([0x00, 0x00]));

    //  Close output file.
    FS.closeSync(outfd);
})();