//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Fs = 
    require("./../../lc3/common/fs");
const Lc3Nms = 
    require("./../../lc3/common/nms");
const Lc3EcEncoder = 
    require("./../../lc3/encoder/encoder");
const Lc3DcDecoder = 
    require("./../../lc3/decoder/decoder");
const Lc3DcBec = 
    require("./../../lc3/decoder/bec");
const Lc3Error = 
    require("./../../lc3/error");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3Encoder = 
    Lc3EcEncoder.LC3Encoder;
const LC3Decoder = 
    Lc3DcDecoder.LC3Decoder;
const LC3BEC = 
    Lc3DcBec.LC3BEC;
const LC3Error = 
    Lc3Error.LC3Error;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;
const LC3IllegalIndexError = 
    Lc3Error.LC3IllegalIndexError;

//  Export public APIs.
module.exports = {
    "Core": {
        "LC3SampleRate": 
            LC3SampleRate,
        "LC3FrameDuration": 
            LC3FrameDuration
    },
    "Encoder": {
        "LC3Encoder": 
            LC3Encoder
    },
    "Decoder": {
        "LC3Decoder": 
            LC3Decoder,
        "LC3BEC": 
            LC3BEC
    },
    "Error": {
        "LC3Error": 
            LC3Error,
        "LC3IllegalParameterError": 
            LC3IllegalParameterError,
        "LC3IllegalIndexError": 
            LC3IllegalIndexError
    }
};