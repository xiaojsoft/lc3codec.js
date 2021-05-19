//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Util = require("util");

//
//  Classes.
//

/**
 *  LC3 error.
 * 
 *  @constructor
 *  @extends {Error}
 *  @param {String} [message]
 *      - The message.
 */
function LC3Error(message = "") {
    //  Let parent class initialize.
    Error.call(this, message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}

/**
 *  LC3 bug error.
 * 
 *  @constructor
 *  @extends {LC3Error}
 *  @param {String} [message]
 *      - The message.
 */
function LC3BugError(message = "") {
    //  Let parent class initialize.
    LC3Error.call(this, message);
}

/**
 *  LC3 illegal parameter error.
 * 
 *  @constructor
 *  @extends {LC3Error}
 *  @param {String} [message]
 *      - The message.
 */
function LC3IllegalParameterError(message = "") {
    //  Let parent class initialize.
    LC3Error.call(this, message);
}

/**
 *  LC3 illegal index error.
 * 
 *  @constructor
 *  @extends {LC3Error}
 *  @param {String} [message]
 *      - The message.
 */
function LC3IllegalIndexError(message = "") {
    //  Let parent class initialize.
    LC3Error.call(this, message);
}

//
//  Inheritances.
//
Util.inherits(LC3Error, Error);
Util.inherits(LC3BugError, LC3Error);
Util.inherits(LC3IllegalParameterError, LC3Error);
Util.inherits(LC3IllegalIndexError, LC3Error);

//  Export public APIs.
module.exports = {
    "LC3Error": LC3Error,
    "LC3BugError": LC3BugError,
    "LC3IllegalParameterError": LC3IllegalParameterError,
    "LC3IllegalIndexError": LC3IllegalIndexError
};