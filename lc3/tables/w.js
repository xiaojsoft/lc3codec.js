//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3TblW10_80 = 
    require("./w10_80");
const Lc3TblW10_160 = 
    require("./w10_160");
const Lc3TblW10_240 = 
    require("./w10_240");
const Lc3TblW10_320 = 
    require("./w10_320");
const Lc3TblW10_480 = 
    require("./w10_480");
const Lc3TblW75_60 = 
    require("./w75_60");
const Lc3TblW75_120 = 
    require("./w75_120");
const Lc3TblW75_180 = 
    require("./w75_180");
const Lc3TblW75_240 = 
    require("./w75_240");
const Lc3TblW75_360 = 
    require("./w75_360");
const Lc3ArrayUtil = 
    require("./../common/array_util");

//  Imported constants.
const W10_80 = 
    Lc3TblW10_80.W10_80;
const W10_160 = 
    Lc3TblW10_160.W10_160;
const W10_240 = 
    Lc3TblW10_240.W10_240;
const W10_320 = 
    Lc3TblW10_320.W10_320;
const W10_480 = 
    Lc3TblW10_480.W10_480;
const W75_60 = 
    Lc3TblW75_60.W75_60;
const W75_120 = 
    Lc3TblW75_120.W75_120;
const W75_180 = 
    Lc3TblW75_180.W75_180;
const W75_240 = 
    Lc3TblW75_240.W75_240;
const W75_360 = 
    Lc3TblW75_360.W75_360;

//  Imported functions.
const ArrayFlip = 
    Lc3ArrayUtil.ArrayFlip;

//
//  Constants.
//

//  Nms, Fs to W table.
const W_TBL = [
    [
        W10_80, W10_160, W10_240, W10_320, W10_480, W10_480
    ],
    [
        W75_60, W75_120, W75_180, W75_240, W75_360, W75_360
    ]
];
const W_FLIPPED_TBL = [
    [
        ArrayFlip(W10_80.slice()), 
        ArrayFlip(W10_160.slice()), 
        ArrayFlip(W10_240.slice()), 
        ArrayFlip(W10_320.slice()), 
        ArrayFlip(W10_480.slice()), 
        ArrayFlip(W10_480.slice())
    ],
    [
        ArrayFlip(W75_60.slice()), 
        ArrayFlip(W75_120.slice()), 
        ArrayFlip(W75_180.slice()), 
        ArrayFlip(W75_240.slice()), 
        ArrayFlip(W75_360.slice()), 
        ArrayFlip(W75_360.slice())
    ]
];

//  Export public APIs.
module.exports = {
    "W_TBL": W_TBL,
    "W_FLIPPED_TBL": W_FLIPPED_TBL
};