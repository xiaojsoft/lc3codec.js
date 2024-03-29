//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//  NE (Nms, Fs) to ceil(log2(NE / 2)) table.
const NBITSLASTNZ_TBL = [
    [
        6, 7, 7, 8, 8, 8
    ],
    [
        5, 6, 7, 7, 8, 8
    ]
];

//  gg_off table (where gg_off = GGOFF_TBL[fsind][nbytes - 20], see Eq.110):
const GGOFF_TBL = [
    [
        -126, -126, -127, -128, -129, -130, 
        -130, -131, -132, -133, -134, -134, 
        -135, -136, -137, -138, -138, -139, 
        -140, -141, -142, -142, -143, -144, 
        -145, -146, -146, -147, -148, -149, 
        -150, -150, -151, -152, -153, -154, 
        -154, -155, -156, -157, -158, -158, 
        -159, -160, -161, -162, -162, -163, 
        -164, -165, -166, -166, -167, -168, 
        -169, -170, -170, -171, -172, -173, 
        -174, -174, -175, -176, -177, -178, 
        -178, -179, -180, -181, -182, -182, 
        -183, -184, -185, -186, -186, -187, 
        -188, -189, -190, -190, -191, -192, 
        -193, -194, -194, -195, -196, -197, 
        -198, -198, -199, -200, -201, -202, 
        -202, -203, -204, -205, -206, -206, 
        -207, -208, -209, -210, -210, -211, 
        -212, -213, -214, -214, -215, -216, 
        -217, -218, -218, -219, -220, -221, 
        -222, -222, -223, -224, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225, -225, -225, -225, 
        -225, -225, -225
    ],
    [
        -123, -123, -123, -124, -124, -125, 
        -125, -125, -126, -126, -127, -127, 
        -127, -128, -128, -129, -129, -129, 
        -130, -130, -131, -131, -131, -132, 
        -132, -133, -133, -133, -134, -134, 
        -135, -135, -135, -136, -136, -137, 
        -137, -137, -138, -138, -139, -139, 
        -139, -140, -140, -141, -141, -141, 
        -142, -142, -143, -143, -143, -144, 
        -144, -145, -145, -145, -146, -146, 
        -147, -147, -147, -148, -148, -149, 
        -149, -149, -150, -150, -151, -151, 
        -151, -152, -152, -153, -153, -153, 
        -154, -154, -155, -155, -155, -156, 
        -156, -157, -157, -157, -158, -158, 
        -159, -159, -159, -160, -160, -161, 
        -161, -161, -162, -162, -163, -163, 
        -163, -164, -164, -165, -165, -165, 
        -166, -166, -167, -167, -167, -168, 
        -168, -169, -169, -169, -170, -170, 
        -171, -171, -171, -172, -172, -173, 
        -173, -173, -174, -174, -175, -175, 
        -175, -176, -176, -177, -177, -177, 
        -178, -178, -179, -179, -179, -180, 
        -180, -181, -181, -181, -182, -182, 
        -183, -183, -183, -184, -184, -185, 
        -185, -185, -186, -186, -187, -187, 
        -187, -188, -188, -189, -189, -189, 
        -190, -190, -191, -191, -191, -192, 
        -192, -193, -193, -193, -194, -194, 
        -195, -195, -195, -196, -196, -197, 
        -197, -197, -198, -198, -199, -199, 
        -199, -200, -200, -201, -201, -201, 
        -202, -202, -203, -203, -203, -204, 
        -204, -205, -205, -205, -206, -206, 
        -207, -207, -207, -208, -208, -209, 
        -209, -209, -210, -210, -211, -211, 
        -211, -212, -212, -213, -213, -213, 
        -214, -214, -215, -215, -215, -216, 
        -216, -217, -217, -217, -218, -218, 
        -219, -219, -219, -220, -220, -221, 
        -221, -221, -222, -222, -223, -223, 
        -223, -224, -224, -225, -225, -225, 
        -226, -226, -227, -227, -227, -228, 
        -228, -229, -229, -229, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230, -230, -230, -230, 
        -230, -230, -230
    ],
    [
        -125, -125, -125, -126, -126, -126, 
        -126, -127, -127, -127, -128, -128, 
        -128, -128, -129, -129, -129, -129, 
        -130, -130, -130, -130, -131, -131, 
        -131, -132, -132, -132, -132, -133, 
        -133, -133, -133, -134, -134, -134, 
        -134, -135, -135, -135, -136, -136, 
        -136, -136, -137, -137, -137, -137, 
        -138, -138, -138, -138, -139, -139, 
        -139, -140, -140, -140, -140, -141, 
        -141, -141, -141, -142, -142, -142, 
        -142, -143, -143, -143, -144, -144, 
        -144, -144, -145, -145, -145, -145, 
        -146, -146, -146, -146, -147, -147, 
        -147, -148, -148, -148, -148, -149, 
        -149, -149, -149, -150, -150, -150, 
        -150, -151, -151, -151, -152, -152, 
        -152, -152, -153, -153, -153, -153, 
        -154, -154, -154, -154, -155, -155, 
        -155, -156, -156, -156, -156, -157, 
        -157, -157, -157, -158, -158, -158, 
        -158, -159, -159, -159, -160, -160, 
        -160, -160, -161, -161, -161, -161, 
        -162, -162, -162, -162, -163, -163, 
        -163, -164, -164, -164, -164, -165, 
        -165, -165, -165, -166, -166, -166, 
        -166, -167, -167, -167, -168, -168, 
        -168, -168, -169, -169, -169, -169, 
        -170, -170, -170, -170, -171, -171, 
        -171, -172, -172, -172, -172, -173, 
        -173, -173, -173, -174, -174, -174, 
        -174, -175, -175, -175, -176, -176, 
        -176, -176, -177, -177, -177, -177, 
        -178, -178, -178, -178, -179, -179, 
        -179, -180, -180, -180, -180, -181, 
        -181, -181, -181, -182, -182, -182, 
        -182, -183, -183, -183, -184, -184, 
        -184, -184, -185, -185, -185, -185, 
        -186, -186, -186, -186, -187, -187, 
        -187, -188, -188, -188, -188, -189, 
        -189, -189, -189, -190, -190, -190, 
        -190, -191, -191, -191, -192, -192, 
        -192, -192, -193, -193, -193, -193, 
        -194, -194, -194, -194, -195, -195, 
        -195, -196, -196, -196, -196, -197, 
        -197, -197, -197, -198, -198, -198, 
        -198, -199, -199, -199, -200, -200, 
        -200, -200, -201, -201, -201, -201, 
        -202, -202, -202, -202, -203, -203, 
        -203, -204, -204, -204, -204, -205, 
        -205, -205, -205, -206, -206, -206, 
        -206, -207, -207, -207, -208, -208, 
        -208, -208, -209, -209, -209, -209, 
        -210, -210, -210, -210, -211, -211, 
        -211, -212, -212, -212, -212, -213, 
        -213, -213, -213, -214, -214, -214, 
        -214, -215, -215, -215, -216, -216, 
        -216, -216, -217, -217, -217, -217, 
        -218, -218, -218, -218, -219, -219, 
        -219, -220, -220, -220, -220, -221, 
        -221, -221, -221, -222, -222, -222, 
        -222, -223, -223, -223, -224, -224, 
        -224, -224, -225, -225, -225, -225, 
        -226, -226, -226
    ],
    [
        -129, -129, -129, -129, -129, -130, 
        -130, -130, -130, -130, -131, -131, 
        -131, -131, -131, -132, -132, -132, 
        -132, -132, -133, -133, -133, -133, 
        -133, -134, -134, -134, -134, -134, 
        -135, -135, -135, -135, -135, -136, 
        -136, -136, -136, -136, -137, -137, 
        -137, -137, -137, -138, -138, -138, 
        -138, -138, -139, -139, -139, -139, 
        -139, -140, -140, -140, -140, -140, 
        -141, -141, -141, -141, -141, -142, 
        -142, -142, -142, -142, -143, -143, 
        -143, -143, -143, -144, -144, -144, 
        -144, -144, -145, -145, -145, -145, 
        -145, -146, -146, -146, -146, -146, 
        -147, -147, -147, -147, -147, -148, 
        -148, -148, -148, -148, -149, -149, 
        -149, -149, -149, -150, -150, -150, 
        -150, -150, -151, -151, -151, -151, 
        -151, -152, -152, -152, -152, -152, 
        -153, -153, -153, -153, -153, -154, 
        -154, -154, -154, -154, -155, -155, 
        -155, -155, -155, -156, -156, -156, 
        -156, -156, -157, -157, -157, -157, 
        -157, -158, -158, -158, -158, -158, 
        -159, -159, -159, -159, -159, -160, 
        -160, -160, -160, -160, -161, -161, 
        -161, -161, -161, -162, -162, -162, 
        -162, -162, -163, -163, -163, -163, 
        -163, -164, -164, -164, -164, -164, 
        -165, -165, -165, -165, -165, -166, 
        -166, -166, -166, -166, -167, -167, 
        -167, -167, -167, -168, -168, -168, 
        -168, -168, -169, -169, -169, -169, 
        -169, -170, -170, -170, -170, -170, 
        -171, -171, -171, -171, -171, -172, 
        -172, -172, -172, -172, -173, -173, 
        -173, -173, -173, -174, -174, -174, 
        -174, -174, -175, -175, -175, -175, 
        -175, -176, -176, -176, -176, -176, 
        -177, -177, -177, -177, -177, -178, 
        -178, -178, -178, -178, -179, -179, 
        -179, -179, -179, -180, -180, -180, 
        -180, -180, -181, -181, -181, -181, 
        -181, -182, -182, -182, -182, -182, 
        -183, -183, -183, -183, -183, -184, 
        -184, -184, -184, -184, -185, -185, 
        -185, -185, -185, -186, -186, -186, 
        -186, -186, -187, -187, -187, -187, 
        -187, -188, -188, -188, -188, -188, 
        -189, -189, -189, -189, -189, -190, 
        -190, -190, -190, -190, -191, -191, 
        -191, -191, -191, -192, -192, -192, 
        -192, -192, -193, -193, -193, -193, 
        -193, -194, -194, -194, -194, -194, 
        -195, -195, -195, -195, -195, -196, 
        -196, -196, -196, -196, -197, -197, 
        -197, -197, -197, -198, -198, -198, 
        -198, -198, -199, -199, -199, -199, 
        -199, -200, -200, -200, -200, -200, 
        -201, -201, -201, -201, -201, -202, 
        -202, -202, -202, -202, -203, -203, 
        -203, -203, -203, -204, -204, -204, 
        -204, -204, -205
    ],
    [
        -133, -133, -133, -133, -133, -134, 
        -134, -134, -134, -134, -134, -134, 
        -135, -135, -135, -135, -135, -135, 
        -136, -136, -136, -136, -136, -136, 
        -137, -137, -137, -137, -137, -137, 
        -138, -138, -138, -138, -138, -138, 
        -138, -139, -139, -139, -139, -139, 
        -139, -140, -140, -140, -140, -140, 
        -140, -141, -141, -141, -141, -141, 
        -141, -142, -142, -142, -142, -142, 
        -142, -142, -143, -143, -143, -143, 
        -143, -143, -144, -144, -144, -144, 
        -144, -144, -145, -145, -145, -145, 
        -145, -145, -146, -146, -146, -146, 
        -146, -146, -146, -147, -147, -147, 
        -147, -147, -147, -148, -148, -148, 
        -148, -148, -148, -149, -149, -149, 
        -149, -149, -149, -150, -150, -150, 
        -150, -150, -150, -150, -151, -151, 
        -151, -151, -151, -151, -152, -152, 
        -152, -152, -152, -152, -153, -153, 
        -153, -153, -153, -153, -154, -154, 
        -154, -154, -154, -154, -154, -155, 
        -155, -155, -155, -155, -155, -156, 
        -156, -156, -156, -156, -156, -157, 
        -157, -157, -157, -157, -157, -158, 
        -158, -158, -158, -158, -158, -158, 
        -159, -159, -159, -159, -159, -159, 
        -160, -160, -160, -160, -160, -160, 
        -161, -161, -161, -161, -161, -161, 
        -162, -162, -162, -162, -162, -162, 
        -162, -163, -163, -163, -163, -163, 
        -163, -164, -164, -164, -164, -164, 
        -164, -165, -165, -165, -165, -165, 
        -165, -166, -166, -166, -166, -166, 
        -166, -166, -167, -167, -167, -167, 
        -167, -167, -168, -168, -168, -168, 
        -168, -168, -169, -169, -169, -169, 
        -169, -169, -170, -170, -170, -170, 
        -170, -170, -170, -171, -171, -171, 
        -171, -171, -171, -172, -172, -172, 
        -172, -172, -172, -173, -173, -173, 
        -173, -173, -173, -174, -174, -174, 
        -174, -174, -174, -174, -175, -175, 
        -175, -175, -175, -175, -176, -176, 
        -176, -176, -176, -176, -177, -177, 
        -177, -177, -177, -177, -178, -178, 
        -178, -178, -178, -178, -178, -179, 
        -179, -179, -179, -179, -179, -180, 
        -180, -180, -180, -180, -180, -181, 
        -181, -181, -181, -181, -181, -182, 
        -182, -182, -182, -182, -182, -182, 
        -183, -183, -183, -183, -183, -183, 
        -184, -184, -184, -184, -184, -184, 
        -185, -185, -185, -185, -185, -185, 
        -186, -186, -186, -186, -186, -186, 
        -186, -187, -187, -187, -187, -187, 
        -187, -188, -188, -188, -188, -188, 
        -188, -189, -189, -189, -189, -189, 
        -189, -190, -190, -190, -190, -190, 
        -190, -190, -191, -191, -191, -191, 
        -191, -191, -192, -192, -192, -192, 
        -192, -192, -193, -193, -193, -193, 
        -193, -193, -194
    ]
];

//  Bitrate flag calculation constants.

//  BITRATE_C1[fsind] = 160 + fsind * 160:
const BITRATE_C1 = [ 160,  320,  480,  640,  800];

//  BITRATE_C2[fsind] = 480 + fsind * 160:
const BITRATE_C2 = [ 480,  640,  800,  960, 1120];

//  Export public APIs.
module.exports = {
    "NBITSLASTNZ_TBL": NBITSLASTNZ_TBL,
    "GGOFF_TBL": GGOFF_TBL,
    "BITRATE_C1": BITRATE_C1,
    "BITRATE_C2": BITRATE_C2
};