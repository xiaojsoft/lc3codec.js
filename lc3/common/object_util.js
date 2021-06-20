//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public functions.
//

/**
 *  Inherit the prototype methods from one constructor into another.
 * 
 *  @param {Function} ctor
 *    - Constructor function which needs to inherit the prototype.
 *  @param {Function} super_ctor
 *    - Constructor function to inherit prototype from.
 */
const Inherits = (function() {
    if (typeof(Object.create) == "function") {
        return function(ctor, super_ctor) {
            if (super_ctor) {
                ctor.super_ = super_ctor;
                ctor.prototype = Object.create(super_ctor.prototype, {
                    "constructor": {
                        "value": ctor,
                        "enumerable": false,
                        "writable": true,
                        "configurable": true
                    }
                });
            }
        };
    } else {
        return function(ctor, super_ctor) {
            if (super_ctor) {
                ctor.super_ = super_ctor;
                var tmp_ctor = function () {};
                tmp_ctor.prototype = super_ctor.prototype;
                ctor.prototype = new tmp_ctor();
                ctor.prototype.constructor = ctor;
            }          
        };
    }
})();

//  Export public APIs.
module.exports = {
    "Inherits": Inherits
};