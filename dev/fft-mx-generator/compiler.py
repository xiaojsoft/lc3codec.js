#!/usr/bin/env python3
#
#  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
#  Use of this source code is governed by a BSD-style license that can be
#  found in the LICENSE.md file.
#

import os
import sys
import math
import json


#  File/folder settings.
BASE_DIR = os.path.dirname(os.path.realpath(__file__))
#OUT_DIR = os.path.join(BASE_DIR, "output")
HDRFILE_PATH = os.path.join(BASE_DIR, "header.js")
#CFGFILE_PATH = os.path.join(BASE_DIR, "config.json")

#  Maximum lines within single JS function.
MAX_FUNCTION_LINES = 500

#  JS generation settings.
IO_REAL = "re"
IO_IMAG = "im"

#  Debug switch (for development only).
DEBUG = False

#  Output container.
OUT_CSHFT = []
OUT_OPCODE = []
OUT_BASEOPS = set()


def l2_dist(x1, y1, x2, y2):
    return math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2))


def emit(indexes, mem_addresses, depth=0):
    N = len(indexes)
    ONLY_RADIX_2 = False
    pfx = "    " * depth
    if N == 2:
        OUT_BASEOPS.add("MXTr2")
        OUT_OPCODE.append("MXTr2(%s, %s, %d, %d);" % (IO_REAL, IO_IMAG, mem_addresses[indexes[0]], mem_addresses[indexes[1]]))
        if DEBUG:
            print(pfx + "DFT(2): ", indexes[0], indexes[1], "(mem:", mem_addresses[indexes[0]], mem_addresses[indexes[1]], ")")
    elif N == 3 and not ONLY_RADIX_2:
        OUT_BASEOPS.add("MXTr3")
        OUT_OPCODE.append("MXTr3(%s, %s, %d, %d, %d);" % (IO_REAL, IO_IMAG, mem_addresses[indexes[0]], mem_addresses[indexes[1]], mem_addresses[indexes[2]]))
        if DEBUG:
            print("DFT(3): ", mem_addresses[indexes[0]], mem_addresses[indexes[1]], mem_addresses[indexes[2]])
    elif N == 4 and not ONLY_RADIX_2:
        OUT_BASEOPS.add("MXTr4")
        OUT_OPCODE.append("MXTr4(%s, %s, %d, %d, %d, %d);" % (IO_REAL, IO_IMAG, mem_addresses[indexes[0]], mem_addresses[indexes[1]], mem_addresses[indexes[2]], mem_addresses[indexes[3]]))
        if DEBUG:
            print("DFT(4): ", mem_addresses[indexes[0]], mem_addresses[indexes[1]], mem_addresses[indexes[2]], mem_addresses[indexes[3]])
    elif N == 5 and not ONLY_RADIX_2:
        OUT_BASEOPS.add("MXTr5")
        OUT_OPCODE.append("MXTr5(%s, %s, %d, %d, %d, %d, %d);" % (IO_REAL, IO_IMAG, mem_addresses[indexes[0]], mem_addresses[indexes[1]], mem_addresses[indexes[2]], mem_addresses[indexes[3]], mem_addresses[indexes[4]]))
        if DEBUG:
            print("DFT(5): ", mem_addresses[indexes[0]], mem_addresses[indexes[1]], mem_addresses[indexes[2]], mem_addresses[indexes[3]], mem_addresses[indexes[4]])
    else:
        #  Divide N into N1 and N2 (N = N1 * N2).
        N1 = 0
        N2 = 0
        if ONLY_RADIX_2:
            if N % 2 == 0:
                N2 = 2
                N1 = N // N2
        else:
            for t in [5, 4, 3, 2]:
                if (N % t) == 0:
                    N2 = t
                    N1 = N // N2
                    break
        if N1 == 0:
            raise Exception("Bad radix.")
        if DEBUG:
            print(pfx + "N1, N2=", N1, N2, indexes)
        
        #  Generate twiddle factors.
        TW_r = [None] * N
        TW_i = [None] * N
        for i in range(0, N1):
            for j in range(0, N2):
                off = i * j
                if TW_r[off] is None:
                    rad = ((-2 * math.pi) / N) * off
                    TW_r[off] = math.cos(rad)
                    TW_i[off] = math.sin(rad)
        
        #  Perform N1-point DFT.
        for k1 in range(0, N1):
            #  N2-point DFT (basic transform, without changing memory addresses)
            dft_indexes = [None] * N2
            for k2 in range(0, N2):
                i = indexes[N1 * k2 + k1]
                dft_indexes[k2] = i
            emit(dft_indexes, mem_addresses, depth + 1)
        
        #  Apply twiddle factors.
        for k2 in range(0, N2):
            for k1 in range(0, N1):
                tw_off = k1 * k2
                tw_re = TW_r[tw_off]
                tw_im = TW_i[tw_off]
                
                if l2_dist(tw_re, tw_im, 1, 0) < 1e-32:
                    continue
                
                i = indexes[N1 * k2 + k1]
                
                if DEBUG:
                    print(pfx + "twiddle", i, N1 * k2, k1, tw_off)
                
                OUT_BASEOPS.add("MXRot")
                OUT_OPCODE.append("MXRot(%s, %s, %d, %s, %s);" % (IO_REAL, IO_IMAG, mem_addresses[i], str(tw_re), str(tw_im)))
        
        #  Perform N2-point DFT.
        for k2 in range(0, N2):
            #  N1-point DFT
            dft_indexes = [0] * N1
            for k1 in range(0, N1):
                i = indexes[N1 * k2 + k1]
                dft_indexes[k1] = i
            emit(dft_indexes, mem_addresses, depth + 1)
        
        #  shuffle
        mem_reorder = [None] * N
        for k1 in range(0, N1):
            for k2 in range(0, N2):
                mem_reorder[N2 * k1 + k2] = mem_addresses[indexes[N1 * k2 + k1]]
        for i in range(0, N):
            mem_addresses[indexes[i]] = mem_reorder[i]
        

def main():
    #
    #  Phase 1: Load and prepare.
    #
    
    #  Parse the command-line arguments.
    if len(sys.argv) != 2:
        print("./compiler.py [config]")
        sys.exit(1)
    cfgfile_path = sys.argv[1]
    
    #  Read the header file.
    fp = open(HDRFILE_PATH, "r", encoding="utf-8")
    hdr = fp.read().rstrip()
    fp.close()
    
    #  Read the configuration file.
    fp = open(cfgfile_path, "r", encoding="utf-8")
    config = json.loads(fp.read())
    fp.close()
    
    #  Get and check the N.
    N = config["N"]
    if not (isinstance(N, int) and N > 0):
        raise Exception("Illegal point count.")
    
    #  Get the output file path.
    outfile_path = os.path.join(BASE_DIR, config["output"])
    
    #  Prepare DFT contexts.
    indexes = [0] * N
    mem_addresses = [0] * N
    for i in range(0, N):
        indexes[i] = i
        mem_addresses[i] = i
    
    #
    #  Phase 2: DFT.
    #
    
    #  Perform N-point DFT.
    if N > 1:
        emit(indexes, mem_addresses)
    
    #  DEBUG: Print memory address (DFT index) mapping.
    if DEBUG:
        for i in range(0, N):
            j = mem_addresses[i]
            print("out", "index=" + str(i), "storage_addr=" + str(j))
    
    #  Restore DFT indexing.
    visited = set()
    cyc_id = 0
    for i in range(0, N):
        if i in visited:
            continue
        visited.add(i)
        cycle = [i]
        cc_cur = i
        while True:
            cc_next = mem_addresses[cc_cur]
            if cc_next == i:
                break
            else:
                cc_cur = cc_next
                visited.add(cc_next)
                cycle.append(cc_next)
        
        if len(cycle) == 1:
            continue
        elif len(cycle) == 2:
            OUT_BASEOPS.add("MXSwap")
            OUT_OPCODE.append("MXSwap(%s, %s, %d, %d);" % (IO_REAL, IO_IMAG, cycle[0], cycle[1]))
        else:
            if DEBUG:
                print("cyc:", cycle)
            
            cyc_name = "CSHFT_INDEXES_%d" % cyc_id
            
            OUT_BASEOPS.add("MXCshft")
            OUT_CSHFT.append("const %s = %s;" % (cyc_name, json.dumps(cycle)))
            OUT_OPCODE.append("MXCshft(%s, %s, %s);" % (IO_REAL, IO_IMAG, cyc_name))
            cyc_id += 1
    
    #
    #  Phase 3: Code generation.
    #
    
    #  Generate the header and module dependencies.
    content  = hdr + "\n\n"
    if len(OUT_BASEOPS) != 0:
        content += "//\n"
        content += "//  Imports.\n"
        content += "//\n"
        content += "\n"
        content += "//  Imported modules.\n"
        content += "const Lc3FftMxBaseOp = \n"
        content += "    require(\"./fft-mx-baseop\");\n"
        content += "\n"
        
        content += "//  Imported functions.\n"
        
        for baseop in ["MXTr2", "MXTr3", "MXTr4", "MXTr5", "MXRot", "MXSwap", "MXCshft"]:
            if baseop in OUT_BASEOPS:
                content += "const %s = \n" % baseop
                content += "    Lc3FftMxBaseOp.%s;\n" % baseop
            else:
                content += "// const %s = \n" % baseop
                content += "//     Lc3FftMxBaseOp.%s;\n" % baseop
        content += "\n"
    
    #  Generate constants.
    if len(OUT_CSHFT) != 0:
        content += "//\n"
        content += "//  Constants.\n"
        content += "//\n"
        content += "\n"
        content += "//  Cyclic shift indexes.\n"
        for line in OUT_CSHFT:
            content += line + "\n"
        content += "\n"
    
    #  Divide all DFT opcodes into one or multiple parts.
    opc_parts = []
    opc_cursor = 0
    opc_count = len(OUT_OPCODE)
    while opc_cursor < opc_count:
        opc_pos1 = opc_cursor
        opc_pos2 = opc_cursor + MAX_FUNCTION_LINES
        if opc_pos2 > opc_count:
            opc_pos2 = opc_count
        opc_parts.append(OUT_OPCODE[opc_pos1:opc_pos2])
        opc_cursor = opc_pos2
    if len(opc_parts) == 0:
        opc_parts.append([])
    
    #  Generate DFT function.
    func_pfx = "ApplyMixedRadixFFT_%d" % N
    opc_part_count = len(opc_parts)
    if opc_part_count > 1:
        content += "//\n"
        content += "//  Private functions.\n"
        content += "//\n"
        content += "\n"
        for opc_part_id in range(0, opc_part_count):
            opc_part_num = opc_part_id + 1
            content += "/**\n"
            content += " *  Part %d of %s().\n" % (opc_part_num, func_pfx)
            content += " * \n"
            content += " *  @param {Number[]} %s \n" % IO_REAL
            content += " *    - The real part of each point.\n"
            content += " *  @param {Number[]} %s \n" % IO_IMAG
            content += " *    - The imaginary part of each point.\n"
            content += " */\n"
            content += "function %s_Part%d(%s, %s) {\n" % (func_pfx, opc_part_num, IO_REAL, IO_IMAG)
            for line in opc_parts[opc_part_id]:
                content += "    %s\n" % line
            content += "}\n"
            content += "\n"
        
        content += "//\n"
        content += "//  Public functions.\n"
        content += "//\n"
        content += "\n"
        content += "/**\n"
        content += " *  Apply in-place mixed-radix FFT transform (prebuilt for block size %d).\n" % N
        content += " * \n"
        content += " *  Note(s):\n"
        content += " *    [1] The size of `%s` and `%s` will not be checked.\n" % (IO_REAL, IO_IMAG)
        content += " * \n"
        content += " *  @param {Number[]} %s \n" % IO_REAL
        content += " *    - The real part of each point.\n"
        content += " *  @param {Number[]} %s \n" % IO_IMAG
        content += " *    - The imaginary part of each point.\n"
        content += " */\n"
        content += "function %s(%s, %s) {\n" % (func_pfx, IO_REAL, IO_IMAG)
        for opc_part_id in range(0, opc_part_count):
            opc_part_num = opc_part_id + 1
            content += "    %s_Part%d(%s, %s);\n" % (func_pfx, opc_part_num, IO_REAL, IO_IMAG)
        content += "}\n"
        content += "\n"
    else:
        content += "//\n"
        content += "//  Public functions.\n"
        content += "//\n"
        content += "\n"
        content += "/**\n"
        content += " *  Apply in-place mixed-radix FFT transform (prebuilt for block size %d).\n" % N
        content += " * \n"
        content += " *  Note(s):\n"
        content += " *    [1] The size of `%s` and `%s` will not be checked.\n" % (IO_REAL, IO_IMAG)
        content += " * \n"
        content += " *  @param {Number[]} %s \n" % IO_REAL
        content += " *    - The real part of each point.\n"
        content += " *  @param {Number[]} %s \n" % IO_IMAG
        content += " *    - The imaginary part of each point.\n"
        content += " */\n"
        content += "function %s(%s, %s) {\n" % (func_pfx, IO_REAL, IO_IMAG)
        for line in opc_parts[0]:
            content += "    %s\n" % line
        content += "}\n"
        content += "\n"
    
    #  Generate module ending.
    content += "//  Export public APIs.\n"
    content += "module.exports = {\n"
    content += "    \"%s\": %s\n" % (func_pfx, func_pfx)
    content += "};"
    
    #  Write output file.
    if DEBUG:
        print(content)
    fp = open(outfile_path, "w", encoding="utf-8")
    fp.write(content)
    fp.close()
    
    print("OK!")


if __name__ == "__main__":
    main()

