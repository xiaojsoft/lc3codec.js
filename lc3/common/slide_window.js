//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
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
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;
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

    //  Cursor.
    let cursor = 0;

    //  Data storage.
    let storageSize = windowSize + historySize;
    let storage = new Array(storageSize);
    for (let i = 0; i < storageSize; ++i) {
        storage[i] = fillValue;
    }

    //  Single element buffer.
    let singlebuf = new Array(1);

    //  Self reference.
    let self = this;

    //
    //  Public methods.
    //

    /**
     *  Append items to the tail of a slide window.
     * 
     *  @param {Number[]} items 
     *    - The items.
     */
    this.append = function(items) {
        let n = items.length;

        //  Get the count of items to be copied and also get the source offset.
        let srcoff = 0, srcrem = n;
        if (n > storageSize) {
            srcoff = n - storageSize;
            srcrem = storageSize;
        }

        //  Copy data.
        while (srcrem != 0) {
            let currem = storageSize - cursor;
            let c = srcrem;
            if (currem < c) {
                c = currem;
            }
            for (let i = 0; i < c; ++i) {
                storage[cursor] = items[srcoff];
                ++(cursor);
                ++(srcoff);
            }
            if (cursor >= storageSize) {
                cursor = 0;
            }
            srcrem -= c;
        }
    };

    /**
     *  Set value at specified offset.
     * 
     *  @param {Number} off 
     *    - The index.
     *  @param {Number} value
     *    - The value.
     */
    this.set = function(off, value) {
        singlebuf[0] = value;
        try {
            self.bulkSet(singlebuf, 0, off, 1);
        } catch(error) {
            throw new LC3IllegalIndexError(
                "Illegal offset."
            );
        }
    };

    /**
     *  Get value at specified offset.
     * 
     *  @param {Number} off 
     *    - The offset.
     *  @returns {Number}
     *    - The value.
     */
    this.get = function(off) {
        try {
            self.bulkGet(singlebuf, 0, off, 1);
        } catch(error) {
            throw new LC3IllegalIndexError(
                "Illegal offset."
            );
        }
        return singlebuf[0];
    };

    /**
     *  Set bulk of items of the slide window.
     * 
     *  @throws {LC3IllegalIndexError}
     *    - Illegal offset.
     *  @throws {LC3IllegalParameterError}
     *    - The count is out of range, or 
     *    - The source doesn't contain enough items.
     *  @param {Number[]} src 
     *    - The source.
     *  @param {Number} srcoff 
     *    - The position (offset relative to the first element of the source) of
     *      the first element that would be set to the slide window.
     *  @param {Number} offset 
     *    - The offset of the first element to be set of the slide window.
     *  @param {Number} n 
     *    - The count of items to be set.
     */
    this.bulkSet = function(
        src,
        srcoff,
        offset,
        n
    ) {
        //  No operation needed if `n` is zero.
        if (n <= 0) {
            return;
        }

        //  Check the count of items to be retrieved.
        let baseoff = historySize + offset;
        if (n > storageSize - baseoff) {
            throw new LC3IllegalParameterError(
                "The count is out of range."
            );
        }

        //  Check offset.
        if (offset >= 0) {
            if (offset >= windowSize) {
                throw new LC3IllegalIndexError("Illegal offset.");
            }
        } else {
            if (-offset > historySize) {
                throw new LC3IllegalIndexError("Illegal offset.");
            }
        }

        //  Check the source.
        let srclen = src.length;
        if (srcoff < 0 || srcoff + n > srclen) {
            throw new LC3IllegalParameterError(
                "The source doesn't contain enough items."
            );
        }

        //  Get the offset of the first item to be retrieved.
        let front = cursor + baseoff;
        if (front >= storageSize) {
            front -= storageSize;
        }

        //  Copy data.
        while (n != 0) {
            let storrem = storageSize - front;
            let c = storrem;
            if (n < c) {
                c = n;
            }
            for (let i = 0; i < c; ++i) {
                storage[front] = src[srcoff];
                ++(srcoff);
                ++(front);
            }
            if (front >= storageSize) {
                front = 0;
            }
            n -= c;
        }
    };

    /**
     *  Get bulk of items from the slide window.
     * 
     *  @throws {LC3IllegalIndexError}
     *    - Illegal offset.
     *  @throws {LC3IllegalParameterError}
     *    - No enough item(s).
     *  @param {Number[]} dst 
     *    - The destination.
     *  @param {Number} dstoff
     *    - The position (offset relative to the first element of the 
     *      destination) where the first retrieved item would be written to.
     *  @param {Number} offset 
     *    - The offset of the first element to be retrieved from the slide 
     *      window.
     *  @param {Number} n 
     *    - The count of items to be retrieved.
     */
    this.bulkGet = function(
        dst,
        dstoff,
        offset,
        n
    ) {
        let baseoff = historySize + offset;

        //  Check the count of items to be retrieved.
        if (n > storageSize - baseoff) {
            throw new LC3IllegalParameterError("No enough item(s).");
        }

        //  Check offset.
        if (offset >= 0) {
            if (offset >= windowSize) {
                throw new LC3IllegalIndexError("Illegal offset.");
            }
        } else {
            if (-offset > historySize) {
                throw new LC3IllegalIndexError("Illegal offset.");
            }
        }

        //  Get the offset of the first item to be retrieved.
        let front = cursor + baseoff;
        if (front >= storageSize) {
            front -= storageSize;
        }

        //  Copy data.
        while (n != 0) {
            let storrem = storageSize - front;
            let c = storrem;
            if (n < c) {
                c = n;
            }
            for (let i = 0; i < c; ++i) {
                dst[dstoff] = storage[front];
                ++(dstoff);
                ++(front);
            }
            if (front >= storageSize) {
                front = 0;
            }
            n -= c;
        }
    };
}

//  Export public APIs.
module.exports = {
    "LC3SlideWindow": LC3SlideWindow
};