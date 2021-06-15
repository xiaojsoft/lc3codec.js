//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//  NE (Nms, Fs) to ceil(log2(NE / 2)) table.
const NBITSLASTNZ_TBL = [
    [
        6, 7, 7, 8, 8, 8
    ],
    [
        5, 6, 7, 7, 8, 8
    ]
];

//  Export public APIs.
module.exports = {
    "NBITSLASTNZ_TBL": NBITSLASTNZ_TBL
};