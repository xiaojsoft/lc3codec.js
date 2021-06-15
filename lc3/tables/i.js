//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3TblI10 = 
    require("./i10");
const Lc3TblI75 = 
    require("./i75");

//  Imported constants.
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

//  Nms, Fs to Ifs table.
const I_TBL = [
    [
        I_8000_10, I_16000_10, I_24000_10, I_32000_10, I_48000_10, I_48000_10
    ],
    [
        I_8000_75, I_16000_75, I_24000_75, I_32000_75, I_48000_75, I_48000_75
    ]
];

//  Export public APIs.
module.exports = {
    "I_TBL": I_TBL
};