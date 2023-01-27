//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Constants.
//

//  Nms, Fs to Z table (see Eq. 3).
const Z_TBL = [
    [
        30, 60, 90, 120, 180, 180
    ],
    [
        14, 28, 42,  56,  84,  84
    ]
];

//  Export public APIs.
module.exports = {
    "Z_TBL": Z_TBL
};