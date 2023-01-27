#!/bin/sh
#
#  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
#  Use of this source code is governed by a BSD-style license that can be
#  found in the LICENSE.md file.
#

#  Go to the script directory.
SCRIPTDIR="`realpath \"$0\"`"
cd "`dirname \"${SCRIPTDIR}\"`"

#  Generate bundle.
node bundle.js
if [ "$?" != "0" ]; then
    exit 1
fi
npx javascript-obfuscator "dist/lc3.js" --compact true --identifier-names-generator mangled --string-array false --rename-globals true --output "dist/lc3.min.js"
if [ "$?" != "0" ]; then
    exit 1
fi

#  Generate ES5-compatible script.
npx babel "dist/lc3.js" --out-file "dist/lc3.es5.js"
if [ "$?" != "0" ]; then
    exit 1
fi
npx javascript-obfuscator "dist/lc3.es5.js" --compact true --identifier-names-generator mangled --string-array false --rename-globals true --output "dist/lc3.es5.min.js"
if [ "$?" != "0" ]; then
    exit 1
fi

exit $?