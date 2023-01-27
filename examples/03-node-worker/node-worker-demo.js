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
const LC3BEC = 
    LC3.Decoder.LC3BEC;
const LC3Worker = 
    LC3.Worker.LC3Worker;

//
//  Constants.
//

//  Input file.
const INPUT_PATH = Path.join(__dirname, "input.raw");

//  Output file.
const OUTPUT_PATH = Path.join(__dirname, "output.raw");

//  Encoder configurations.
const CONFIG_FS = LC3SampleRate.FS_16000;
const CONFIG_NMS = LC3FrameDuration.NMS_10000US;
const CONFIG_BYTE_PER_FRAME = 80;

//
//  Main.
//
(async function() {
    //  Load audio.
    let pcm_in = FS.readFileSync(INPUT_PATH);

    //  Open output file.
    let outfd = FS.openSync(OUTPUT_PATH, "w");

    //  Create workers (1: encoder, 2: decoder).
    let worker1 = new LC3Worker(CONFIG_NMS, CONFIG_FS, true, false);
    worker1.on("error", function(error) {
        console.error("Worker 1 throw an exception:");
        console.error(error);
    }).on("close", function() {
        console.log("Worker 1 closed.");
    });
    let worker2 = new LC3Worker(CONFIG_NMS, CONFIG_FS, false, true);
    worker2.on("error", function(error) {
        console.error("Worker 2 throw an exception:");
        console.error(error);
    }).on("close", function() {
        console.log("Worker 2 closed.");
    });
    let frame_size = worker1.getFrameSize();

    //  Process the audio.
    let frame = new Int16Array(frame_size);
    let bytesbuf = Buffer.allocUnsafe(frame_size * 2);
    let bfi = new LC3BEC();
    for (
        let offset = 0; 
        offset + frame_size * 2 <= pcm_in.length; 
        offset += frame_size * 2
    ) {
        //  Get one frame.
        for (let i = 0; i < frame_size; ++i) {
            frame[i] = pcm_in.readInt16LE(offset + i * 2);
        }

        //  Encode the frame.
        let bytes = await worker1.encode(frame, CONFIG_BYTE_PER_FRAME);

        //  Decode the frame.
        let frame_dec = await worker2.decode(bytes, bfi);
        if (bfi.isMarked()) {
            throw new Error("Decode failed.");
        }
        for (let i = 0; i < frame_size; ++i) {
            bytesbuf.writeInt16LE(frame_dec[i], i * 2);
        }
        FS.writeSync(outfd, bytesbuf);
    }

    //  Close workers.
    if (!worker1.isClosed()) {
        worker1.close();
    }
    if (!worker2.isClosed()) {
        worker2.close();
    }

    //  Close output file.
    FS.closeSync(outfd);
})().catch(function(error) {
    console.error(error);
});