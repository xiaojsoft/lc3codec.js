//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public functions.
//

/**
 *  Flip (a part of) an array.
 * 
 *  @param {Array} arr 
 *    - The array.
 *  @param {Number} [start] 
 *    - The start position of the range (inclusive).
 *  @param {Number} [end] 
 *    - The end position of the range (exclusive).
 */
function ArrayFlip(arr, start = 0, end = arr.length) {
    let left = start, right = end - 1;
    while (left < right) {
        let tmp = arr[left];
        arr[left] = arr[right];
        arr[right] = tmp;

        ++(left);
        --(right);
    }
}

//  Export public APIs.
module.exports = {
    "ArrayFlip": ArrayFlip
};