//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Error = 
    require("./../error");

//  Imported classes.
const LC3IllegalIndexError = 
    Lc3Error.LC3IllegalIndexError;

//
//  Public classes.
//

/**
 *  LC3 slide window.
 * 
 *  @constructor
 *  @param {Number} windowSize 
 *    - The window size.
 *  @param {Number} historySize 
 *    - The history size.
 *  @param {Number} [fillValue] 
 *    - The initial fill value.
 */
function LC3SlideWindow(windowSize, historySize, fillValue = 0) {
    //
    //  Members.
    //

    //  Data storage.
    let storageSize = windowSize + historySize;
    let storage = new Array(storageSize);
    for (let i = 0; i < storageSize; ++i) {
        storage[i] = fillValue;
    }

    //
    //  Public methods.
    //

    /**
     *  Append a block of data.
     * 
     *  @param {Array[]} block 
     *    - The data block.
     */
    this.append = function(block) {
        let ncopy = Math.min(block.length, storageSize);
        let nrsvd = storageSize - ncopy;
        for (let i = 0, j = ncopy; i < nrsvd; ++i, ++j) {
            storage[i] = storage[j];
        }
        for (let i = 0, j = nrsvd; i < ncopy; ++i, ++j) {
            storage[j] = block[i];
        }
    };

    /**
     *  Get data at specified index.
     * 
     *  @throws {LC3IllegalIndexError}
     *    - Index out of range.
     *  @param {Number} idx 
     *    - The index.
     *  @returns {Number}
     *    - The data.
     */
    this.get = function(idx) {
        idx += historySize;
        if (idx < 0 || idx >= storageSize) {
            throw new LC3IllegalIndexError("Index out of range.");
        }
        return storage[idx];
    };

    /**
     *  Set data at specified index.
     * 
     *  @throws {LC3IllegalIndexError}
     *    - Index out of range.
     *  @param {Number} idx 
     *    - The index.
     *  @param {Number} data
     *    - The data.
     */
    this.set = function(idx, data) {
        idx += historySize;
        if (idx < 0 || idx >= storageSize) {
            throw new LC3IllegalIndexError("Index out of range.");
        }
        storage[idx] = data;
    };

    /**
     *  Bulk copy.
     * 
     *  @throws {LC3IllegalIndexError}
     *    - Index out of range (either source or destination).
     *  @param {Array} dst 
     *    - The destination.
     *  @param {Number} dstoff 
     *    - The offset of the destination.
     *  @param {Number} srcoff 
     *    - The offset of the source.
     *  @param {Number} n 
     *    - The count of items to be copied.
     */
    this.copyTo = function(dst, dstoff, srcoff, n) {
        if (n <= 0) {
            return;
        }
        if (dstoff < 0 || dstoff + n > dst.length) {
            throw new LC3IllegalIndexError("Index (destination) out of range.");
        }
        let srcbegin = srcoff + historySize, srcend = srcbegin + n;
        if (
            srcbegin < 0 || srcbegin >= storageSize || 
            srcend < 0 || srcend > storageSize
        ) {
            throw new LC3IllegalIndexError("Index (source) out of range.");
        }
        for (let i1 = srcbegin, i2 = dstoff; i1 < srcend; ++i1, ++i2) {
            dst[i2] = storage[i1];
        }
    };
}

//  Export public APIs.
module.exports = {
    "LC3SlideWindow": LC3SlideWindow
};