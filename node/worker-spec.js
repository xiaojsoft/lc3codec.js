//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Constants.
//

//  Message types.
const MSGTYPE_HANDSHAKE = 0x01;
const MSGTYPE_RESET     = 0x02;
const MSGTYPE_ENCODE    = 0x05;
const MSGTYPE_DECODE    = 0x06;
const MSGTYPE_QUIT      = 0x16;

//  NAK mask.
const MSGNAK_MASK       = 0x80;

//  NAK reasons.
const MSGNAK_REASON_ILLEGAL_CMD    = 0x01;
const MSGNAK_REASON_ILLEGAL_DATA   = 0x02;
const MSGNAK_REASON_ILLEGAL_STATE  = 0x03;

//  Reset flags.
const MSGRST_FLAG_USE_ENCODER      = 0x01;
const MSGRST_FLAG_USE_DECODER      = 0x02;

//  Decoder flags.
const MSGDC_FLAG_BFI    = 0x01;

//  Export public APIs.
module.exports = {
    "MSGTYPE_HANDSHAKE": MSGTYPE_HANDSHAKE,
    "MSGTYPE_RESET": MSGTYPE_RESET,
    "MSGTYPE_ENCODE": MSGTYPE_ENCODE,
    "MSGTYPE_DECODE": MSGTYPE_DECODE,
    "MSGTYPE_QUIT": MSGTYPE_QUIT,
    "MSGNAK_MASK": MSGNAK_MASK,
    "MSGNAK_REASON_ILLEGAL_CMD": MSGNAK_REASON_ILLEGAL_CMD,
    "MSGNAK_REASON_ILLEGAL_DATA": MSGNAK_REASON_ILLEGAL_DATA,
    "MSGNAK_REASON_ILLEGAL_STATE": MSGNAK_REASON_ILLEGAL_STATE,
    "MSGRST_FLAG_USE_ENCODER": MSGRST_FLAG_USE_ENCODER,
    "MSGRST_FLAG_USE_DECODER": MSGRST_FLAG_USE_DECODER,
    "MSGDC_FLAG_BFI": MSGDC_FLAG_BFI
};