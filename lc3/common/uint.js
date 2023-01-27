//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Constants.
//

//  Unsigned integer maximum values.
const UINT32_MAX = 4294967295;

//
//  Public functions.
//

/**
 *  Detect whether a number is a 32-bit unsigned integer.
 * 
 *  @param {Number} x
 *    - The number. 
 *  @returns 
 *    - True if so.
 */
function IsUInt32(x) {
    return Number.isInteger(x) && x >= 0 && x <= UINT32_MAX;
}

//  Export public APIs.
module.exports = {
    "UINT32_MAX": UINT32_MAX,
    "IsUInt32": IsUInt32
};