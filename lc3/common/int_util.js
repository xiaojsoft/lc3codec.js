//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public functions.
//

/**
 *  Do integer division.
 * 
 *  @param {Number} a 
 *    - The divident.
 *  @param {Number} b 
 *    - The divisor.
 *  @returns {Number}
 *    - The quotient.
 */
function IntDiv(a, b) {
    a -= (a % b);
    return Math.round(a / b);
}

//  Export public APIs.
module.exports = {
    "IntDiv": IntDiv
};