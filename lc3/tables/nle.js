//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Constants.
//

//  Nms to NFstart, NFwidth table (see Table 3.17, 3.19).
const NFSTART_TBL = [24, 18];
const NFWIDTH_TBL = [3, 2];

//  Nms, Pbw to bw_stop table (see Table 3.16, 3.18).
const BW_STOP_TBL = [
    [
        80, 160, 240, 320, 400
    ],
    [
        60, 120, 180, 240, 300
    ]
];

//  Export public APIs.
module.exports = {
    "NFSTART_TBL": NFSTART_TBL,
    "NFWIDTH_TBL": NFWIDTH_TBL,
    "BW_STOP_TBL": BW_STOP_TBL
};