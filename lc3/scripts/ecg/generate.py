#!/usr/bin/env python3
#
#  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
#  Use of this source code is governed by a BSD-style license that can be
#  found in the LICENSE.md file.
#

import os
import sys
from typing import List, Union, Tuple


def convert_camelcase_to_description(name: str) -> str:
    """Convert camel-case name to descriptive text.

    :param name: The camel-case name.
    :return: The descriptive text.
    """

    cursor = 0
    words = []
    while cursor < len(name):
        find_position = cursor + 1
        while find_position < len(name):
            if not (name[find_position].isupper() or name[find_position].isdigit()):
                break
            find_position += 1
        if find_position == cursor + 1:
            while find_position < len(name):
                if name[find_position].isupper() or name[find_position].isdigit():
                    break
                find_position += 1
            word = name[cursor:find_position]
            cursor = find_position
            if len(words) == 0:
                word = word[0].upper() + word[1:].lower()
            else:
                word = word.lower()
            words.append(word)
        else:
            if find_position < len(name):
                find_position -= 1
            word = name[cursor:find_position]
            cursor = find_position
            words.append(word)

    return " ".join(words)


def get_header_text() -> str:
    """Get the header text.

    :return: The header text.
    """

    script_dir = os.path.dirname(os.path.abspath(__file__))
    header_file = os.path.join(script_dir, "header.txt")
    fp = open(header_file, "r")
    header_text = fp.read().strip()
    fp.close()

    return header_text


def get_classes(path: str):
    """Get classes.

    :param path: The classes file.
    :rtype: list[str]
    :return: The class list.
    """

    fp = open(path, "r")
    lines = fp.readlines()
    fp.close()

    classes = []
    for line in lines:
        line = line.strip()
        if len(line) == 0 or line.startswith("#"):
            continue
        classes.append(line)

    return classes


def main() -> int:
    """Main entry.

    :return: The exit code.
    """

    if len(sys.argv) != 4:
        sys.stderr.write("Invalid parameter.\n")
        return 1

    header = get_header_text()
    prefix = sys.argv[1]
    classes = get_classes(sys.argv[2])

    prefix_desc = convert_camelcase_to_description(prefix)
    if not (prefix_desc[0].isupper() or prefix_desc[0].isdigit()):
        prefix_desc = prefix_desc[0].upper() + prefix_desc[1:]

    fp = open(sys.argv[3], "w")
    fp.write(header + "\n\n")
    fp.write("//\n")
    fp.write("//  Imports.\n")
    fp.write("//\n\n")
    fp.write("//  Imported modules.\n")
    fp.write("const Lc3ObjUtil = require(\"./common/object_util\");\n\n")
    fp.write("//\n")
    fp.write("//  Imported classes.\n")
    fp.write("//\n")
    fp.write("const Inherits = Lc3ObjUtil.Inherits;\n\n")
    fp.write("//\n")
    fp.write("//  Classes.\n")
    fp.write("//\n\n")
    fp.write("/**\n")
    fp.write(" *  " + prefix_desc + " error.\n")
    fp.write(" * \n")
    fp.write(" *  @constructor\n")
    fp.write(" *  @extends {Error}\n")
    fp.write(" *  @param {String} [message]\n")
    fp.write(" *      - The message.\n")
    fp.write(" */\n")
    fp.write("function " + prefix + "Error(message = \"\") {\n")
    fp.write("    //  Let parent class initialize.\n")
    fp.write("    Error.call(this, message);\n")
    fp.write("    Error.captureStackTrace(this, this.constructor);\n")
    fp.write("    this.name = this.constructor.name;\n")
    fp.write("    this.message = message;\n")
    fp.write("}\n")
    inherits: List[Union[Tuple[str, str]]] = [(prefix + "Error", "Error")]

    for class_name in classes:
        parent = prefix + "Error"
        parts = class_name.split()
        if len(parts) > 1:
            parent = prefix + parts[1] + "Error"
            class_name = parts[0]
        class_desc = convert_camelcase_to_description(prefix + class_name)
        fp.write("\n")
        fp.write("/**\n")
        fp.write(" *  " + class_desc + " error.\n")
        fp.write(" * \n")
        fp.write(" *  @constructor\n")
        fp.write(" *  @extends {" + parent + "}\n")
        fp.write(" *  @param {String} [message]\n")
        fp.write(" *      - The message.\n")
        fp.write(" */\n")
        fp.write("function " + prefix + class_name + "Error(message = \"\") {\n")
        fp.write("    //  Let parent class initialize.\n")
        fp.write("    " + prefix + "Error.call(this, message);\n")
        fp.write("}\n")
        inherits.append((prefix + class_name + "Error", parent))
    fp.write("\n")

    fp.write("//\n")
    fp.write("//  Inheritances.\n")
    fp.write("//\n")
    for child, parent in inherits:
        fp.write("Inherits(%s, %s);\n" % (child, parent))
    fp.write("\n")

    fp.write("//  Export public APIs.\n")
    fp.write("module.exports = {\n")
    for idx in range(0, len(inherits)):
        child, parent = inherits[idx]
        if idx + 1 == len(inherits):
            fp.write("    \"%s\": %s\n" % (child, child))
        else:
            fp.write("    \"%s\": %s,\n" % (child, child))
    fp.write("};")

    fp.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
