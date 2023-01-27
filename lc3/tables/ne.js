//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Constants.
//

//  Nms, Fs to NE table (see Eq. 9).
const NE_TBL = [
    [
        80, 160, 240, 320, 400, 400
    ],
    [
        60, 120, 180, 240, 300, 300
    ]
];

//  Export public APIs.
module.exports = {
    "NE_TBL": NE_TBL
};