//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3DctIi16F = 
    require("./dct2-16-f");
const Lc3DctIi16I = 
    require("./dct2-16-i");

//  Imported functions.
const DCTIIForward_16 = 
    Lc3DctIi16F.DCTIIForward_16;
const DCTIIInverse_16 = 
    Lc3DctIi16I.DCTIIInverse_16;

//  Exported public APIs.
module.exports = {
    "DCTIIForward_16": DCTIIForward_16,
    "DCTIIInverse_16": DCTIIInverse_16
};