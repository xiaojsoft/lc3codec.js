#!/bin/sh
#
#  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
#  Use of this source code is governed by a BSD-style license that can be
#  found in the LICENSE.md file.
#

#  Go to the script directory.
SCRIPTDIR="`realpath \"$0\"`"
cd "`dirname \"${SCRIPTDIR}\"`"

#  Go to project root directory.
cd ".."

#  Generate the error file.
python3 scripts/ecg/generate.py LC3 error.template error.js

exit $?