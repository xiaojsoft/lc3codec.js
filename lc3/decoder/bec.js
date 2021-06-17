//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public classes.
//

/**
 *  LC3 Bit Error Conditions (BEC) context.
 * 
 *  @constructor
 *  @param {Boolean} [initial] 
 *    - The initial BEC value.
 */
function LC3BEC(initial = false) {
    //
    //  Members.
    //

    //  BEC detected mark.
    let marked = initial;

    //
    //  Public methods.
    //

    /**
     *  Get whether BEC was detected.
     * 
     *  @returns {Boolean}
     *    - True if so.
     */
    this.isMarked = function() {
        return marked;
    };

    /**
     *  Mark as BEC detected.
     */
    this.mark = function() {
        marked = true;
    };

    /**
     *  Clear BEC detected mark.
     */
    this.clear = function() {
        marked = false;
    };
}

//  Export public APIs.
module.exports = {
    "LC3BEC": LC3BEC
};