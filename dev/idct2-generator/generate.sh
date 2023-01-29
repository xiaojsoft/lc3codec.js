#!/bin/bash
#
#  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
#  Use of this source code is governed by a BSD-style license that can be
#  found in the LICENSE.md file.
#

#  Go to the script directory.
SCRIPTDIR="`realpath \"$0\"`"
cd "`dirname \"${SCRIPTDIR}\"`"

#  Generate all.
for config_file in config-*.json; do
    echo ":: ${config_file} ::"
    ./compiler.py "${config_file}"
    if [ "$?" != "0" ]; then
        exit 1
    fi
    echo ""
done

exit 0
