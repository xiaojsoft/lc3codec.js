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

#  Debug switch (for development only).
DEBUG = False

#  Temporary variable set.
TMPVAR_USED = []
TMPVAR_FREE = []
TMPVAR_NEXTID = 0

#  FDCT opcode.
OUT_OPCODE = []

#  cos(45).
COS_45 = math.sqrt(2) / 2.0


def num_wrap(s):
    s = str(s)
    if s.startswith("-"):
        return "(" + s + ")"
    return s


def tmpvar_alloc():
    global TMPVAR_NEXTID
    
    if len(TMPVAR_FREE) != 0:
        tmpvar = TMPVAR_FREE.pop(0)
    else:
        tmpvar = "t%d" % TMPVAR_NEXTID
        TMPVAR_NEXTID += 1
    TMPVAR_USED.append(tmpvar)
    
    return tmpvar


def tmpvar_free(tmpvar):
    if tmpvar not in TMPVAR_USED:
        raise Exception("No such variable.")
    TMPVAR_USED.remove(tmpvar)
    TMPVAR_FREE.append(tmpvar)


def emit(text, var_in=[], var_out=[], nop=False, comment=False, mandatory=False, arith_add=0, arith_mul=0, arith_neg=0):
    OUT_OPCODE.append({
        "text": text,
        "in": var_in,
        "out": var_out,
        "nop": nop,
        "comment": comment,
        "mandatory": mandatory,
        "arith-add": arith_add,
        "arith-mul": arith_mul,
        "arith-neg": arith_neg
    })


def emit_comment(text):
    if DEBUG:
        emit(text, comment=True)


def emit_rotate(symlist_re, symlist_im, k, p, q, coeff=None):
    t = math.gcd(p, q)
    p //= t;
    q //= t;
    q_mul_2 = q * 2
    
    p %= q_mul_2
    
    if q < 0:
        #  Positive denominator is needed.
        p = -p
        q = -q
    
    if p == 0:
        if coeff is not None:
            sym0_r, sym0_i = symlist_re[k], symlist_im[k]
            prefix = num_wrap(coeff)
            emit("%s *= %s;" % (sym0_r, prefix), var_out=[sym0_r], arith_mul=1)
            emit("%s *= %s;" % (sym0_i, prefix), var_out=[sym0_i], arith_mul=1)
        
        #  No need to rotate.
        return
    
    sym0_r, sym0_i = symlist_re[k], symlist_im[k]
    
    if p == 1 and q == 1:
        if coeff is not None:
            prefix = num_wrap(-coeff)
            emit("%s = %s * %s;" % (sym0_r, prefix, sym0_r), var_in=[sym0_r], var_out=[sym0_r], arith_mul=1)
            emit("%s = %s * %s;" % (sym0_i, prefix, sym0_i), var_in=[sym0_i], var_out=[sym0_i], arith_mul=1)
        else:
            emit("%s = -%s;" % (sym0_r, sym0_r), var_in=[sym0_r], var_out=[sym0_r], arith_neg=1)
            emit("%s = -%s;" % (sym0_i, sym0_i), var_in=[sym0_i], var_out=[sym0_i], arith_neg=1)
        return
    
    if q == 2:
        if p == 1:
            symtmp0 = tmpvar_alloc()
            if coeff is not None:
                emit("%s = %s * %s;" % (symtmp0, num_wrap(coeff), sym0_r), var_in=[sym0_r], var_out=[symtmp0], arith_mul=1)
                emit("%s = %s * %s;" % (sym0_r, num_wrap(-coeff), sym0_i), var_in=[sym0_i], var_out=[sym0_r], arith_mul=1)
                emit("%s = %s;" % (sym0_i, symtmp0), var_in=[symtmp0], var_out=[sym0_i])
            else:
                emit("%s = %s;" % (symtmp0, sym0_r), var_in=[sym0_r], var_out=[symtmp0])
                emit("%s = -%s;" % (sym0_r, sym0_i), var_in=[sym0_i], var_out=[sym0_r], arith_neg=1)
                emit("%s = %s;" % (sym0_i, symtmp0), var_in=[symtmp0], var_out=[sym0_i])
            tmpvar_free(symtmp0)
            return
        elif p == 3:
            symtmp0 = tmpvar_alloc()
            if coeff is not None:
                emit("%s = %s * %s;" % (symtmp0, num_wrap(-coeff), sym0_r), var_in=[sym0_r], var_out=[symtmp0], arith_mul=1)
                emit("%s = %s * %s;" % (sym0_r, num_wrap(coeff), sym0_i), var_in=[sym0_i], var_out=[sym0_r], arith_mul=1)
                emit("%s = %s;" % (sym0_i, symtmp0), var_in=[symtmp0], var_out=[sym0_i])
            else:
                emit("%s = %s;" % (symtmp0, sym0_r), var_in=[sym0_r], var_out=[symtmp0])
                emit("%s = %s;" % (sym0_r, sym0_i), var_in=[sym0_i], var_out=[sym0_r])
                emit("%s = -%s;" % (sym0_i, symtmp0), var_in=[symtmp0], var_out=[sym0_i], arith_neg=1)
            tmpvar_free(symtmp0)
            return
        else:
            raise Exception("Never reach.")
    
    if q == 4:
        if p == 1:
            sign_c = "+"
            sign_c_imp = ""
            sign_s = "+"
            sign_s_imp = ""
            sign_s_inv = "-"
            sign_s_inv_imp = "-"
        elif p == 3:
            sign_c = "-"
            sign_c_imp = "-"
            sign_s = "+"
            sign_s_imp = ""
            sign_s_inv = "-"
            sign_s_inv_imp = "-"
        elif p == 5:
            sign_c = "-"
            sign_c_imp = "-"
            sign_s = "-"
            sign_s_imp = "-"
            sign_s_inv = "+"
            sign_s_inv_imp = ""
        elif p == 7:
            sign_c = "+"
            sign_c_imp = ""
            sign_s = "-"
            sign_s_imp = "-"
            sign_s_inv = "+"
            sign_s_inv_imp = ""
        else:
            raise Exception("Never reach.")
        
        symtmp0 = tmpvar_alloc()
        symtmp1 = tmpvar_alloc()
        
        cs = COS_45
        if coeff is not None:
            cs *= coeff
        cs = num_wrap(cs)
        
        if sign_s_inv == "+" and sign_c_imp == "-":
            emit("%s = %s - %s;" % (symtmp0, sym0_i, sym0_r), var_in=[sym0_i, sym0_r], var_out=[symtmp0], arith_add=1)
        else:
            emit("%s = %s%s %s %s;" % (symtmp0, sign_c_imp, sym0_r, sign_s_inv, sym0_i), var_in=[sym0_r, sym0_i], var_out=[symtmp0], arith_add=1, arith_neg=(1 if sign_c_imp == "-" else 0))
        if sign_c == "+" and sign_s_imp == "-":
            emit("%s = %s - %s;" % (symtmp1, sym0_i, sym0_r), var_in=[sym0_i, sym0_r], var_out=[symtmp1], arith_add=1)
        else:
            emit("%s = %s%s %s %s;" % (symtmp1, sign_s_imp, sym0_r, sign_c, sym0_i), var_in=[sym0_r, sym0_i], var_out=[symtmp1], arith_add=1, arith_neg=(1 if sign_s_imp == "-" else 0))
        emit("%s = %s * %s;" % (sym0_r, symtmp0, cs), var_in=[symtmp0], var_out=[sym0_r], arith_mul=1)
        emit("%s = %s * %s;" % (sym0_i, symtmp1, cs), var_in=[symtmp1], var_out=[sym0_i], arith_mul=1)
        
        tmpvar_free(symtmp0)
        tmpvar_free(symtmp1)
        
        return
    
    #  Use fallback complex multiplication algorithm.
    #
    #  Reference(s):
    #    [1] https://en.wikipedia.org/wiki/Multiplication_algorithm#Complex_multiplication_algorithm
    rad = math.pi * p / q
    c = math.cos(rad)
    d = math.sin(rad)
    if coeff is not None:
        c *= coeff
        d *= coeff
    
    symtmp0 = tmpvar_alloc()
    symtmp1 = tmpvar_alloc()
    symtmp2 = tmpvar_alloc()
    
    emit("%s = %s * (%s + %s);" % (symtmp0, num_wrap(c), sym0_r, sym0_i), var_in=[sym0_r, sym0_i], var_out=[symtmp0], arith_add=1, arith_mul=1)
    emit("%s = %s * %s;" % (symtmp1, sym0_r, num_wrap(d - c)), var_in=[sym0_r], var_out=[symtmp1], arith_mul=1)
    emit("%s = %s * %s;" % (symtmp2, sym0_i, num_wrap(c + d)), var_in=[sym0_i], var_out=[symtmp2], arith_mul=1)
    emit("%s = %s - %s;" % (sym0_r, symtmp0, symtmp2), var_in=[symtmp0, symtmp2], var_out=[sym0_r], arith_add=1)
    emit("%s = %s + %s;" % (sym0_i, symtmp0, symtmp1), var_in=[symtmp0, symtmp1], var_out=[sym0_i], arith_add=1)
    
    tmpvar_free(symtmp0)
    tmpvar_free(symtmp1)
    tmpvar_free(symtmp2)


def emit_fft__internal(symlist_re, symlist_im, mem_addrs, indexes, N):
    if N == 2:
        addr0 = mem_addrs[indexes[0]]
        addr1 = mem_addrs[indexes[1]]
        
        sym0_re, sym0_im = symlist_re[addr0], symlist_im[addr0]
        sym1_re, sym1_im = symlist_re[addr1], symlist_im[addr1]
        
        symtmp1_re = tmpvar_alloc()
        symtmp1_im = tmpvar_alloc()
        symtmp2_re = tmpvar_alloc()
        symtmp2_im = tmpvar_alloc()
        
        #let t1_r = __IN0_r;
        emit("%s = %s;" % (symtmp1_re, sym0_re), var_in=[sym0_re], var_out=[symtmp1_re])
        #let t1_i = __IN0_i;
        emit("%s = %s;" % (symtmp1_im, sym0_im), var_in=[sym0_im], var_out=[symtmp1_im])
        #let t2_r = __IN1_r;
        emit("%s = %s;" % (symtmp2_re, sym1_re), var_in=[sym1_re], var_out=[symtmp2_re])
        #let t2_i = __IN1_i;
        emit("%s = %s;" % (symtmp2_im, sym1_im), var_in=[sym1_im], var_out=[symtmp2_im])
        #__OUT0_r = t1_r + t2_r;
        emit("%s = %s + %s;" % (sym0_re, symtmp1_re, symtmp2_re), var_in=[symtmp1_re, symtmp2_re], var_out=[sym0_re], arith_add=1)
        #__OUT0_i = t1_i + t2_i;
        emit("%s = %s + %s;" % (sym0_im, symtmp1_im, symtmp2_im), var_in=[symtmp1_im, symtmp2_im], var_out=[sym0_im], arith_add=1)
        #__OUT1_r = t1_r - t2_r;
        emit("%s = %s - %s;" % (sym1_re, symtmp1_re, symtmp2_re), var_in=[symtmp1_re, symtmp2_re], var_out=[sym1_re], arith_add=1)
        #__OUT1_i = t1_i - t2_i;
        emit("%s = %s - %s;" % (sym1_im, symtmp1_im, symtmp2_im), var_in=[symtmp1_im, symtmp2_im], var_out=[sym1_im], arith_add=1)
        
        tmpvar_free(symtmp1_re)
        tmpvar_free(symtmp1_im)
        tmpvar_free(symtmp2_re)
        tmpvar_free(symtmp2_im)
    elif N == 3:
        addr0 = mem_addrs[indexes[0]]
        addr1 = mem_addrs[indexes[1]]
        addr2 = mem_addrs[indexes[2]]
        
        sym0_re, sym0_im = symlist_re[addr0], symlist_im[addr0]
        sym1_re, sym1_im = symlist_re[addr1], symlist_im[addr1]
        sym2_re, sym2_im = symlist_re[addr2], symlist_im[addr2]
        
        symtmp1_re = tmpvar_alloc()
        symtmp1_im = tmpvar_alloc()
        symtmp2_re = tmpvar_alloc()
        symtmp2_im = tmpvar_alloc()
        symtmp3_re = tmpvar_alloc()
        symtmp3_im = tmpvar_alloc()
        
        #let i0_r = __IN0_r;
        #let i0_i = __IN0_i;
        #let i1_r = __IN1_r;
        #let i1_i = __IN1_i;
        #let i2_r = __IN2_r;
        #let i2_i = __IN2_i;
        #let t1_r = i1_r + i2_r;
        emit("%s = %s + %s;" % (symtmp1_re, sym1_re, sym2_re), var_in=[sym1_re, sym2_re], var_out=[symtmp1_re], arith_add=1)
        #let t1_i = i1_i + i2_i;
        emit("%s = %s + %s;" % (symtmp1_im, sym1_im, sym2_im), var_in=[sym1_im, sym2_im], var_out=[symtmp1_im], arith_add=1)
        #let t2_r = i0_r - 0.5 * t1_r;
        emit("%s = %s - 0.5 * %s;" % (symtmp2_re, sym0_re, symtmp1_re), var_in=[sym0_re, symtmp1_re], var_out=[symtmp2_re], arith_add=1, arith_mul=1)
        #let t2_i = i0_i - 0.5 * t1_i;
        emit("%s = %s - 0.5 * %s;" % (symtmp2_im, sym0_im, symtmp1_im), var_in=[sym0_im, symtmp1_im], var_out=[symtmp2_im], arith_add=1, arith_mul=1)
        #let t3_r = 0.8660254037844386 * (i1_r - i2_r);
        emit("%s = 0.8660254037844386 * (%s - %s);" % (symtmp3_re, sym1_re, sym2_re), var_in=[sym1_re, sym2_re], var_out=[symtmp3_re], arith_add=1, arith_mul=1)
        #let t3_i = 0.8660254037844386 * (i1_i - i2_i);
        emit("%s = 0.8660254037844386 * (%s - %s);" % (symtmp3_im, sym1_im, sym2_im), var_in=[sym1_im, sym2_im], var_out=[symtmp3_im], arith_add=1, arith_mul=1)
        #__OUT0_r = i0_r + t1_r;
        emit("%s += %s;" % (sym0_re, symtmp1_re), var_in=[sym0_re, symtmp1_re], var_out=[sym0_re], arith_add=1)
        #__OUT0_i = i0_i + t1_i;
        emit("%s += %s;" % (sym0_im, symtmp1_im), var_in=[sym0_im, symtmp1_im], var_out=[sym0_im], arith_add=1)
        #__OUT1_r = t2_r + t3_i;
        emit("%s = %s + %s;" % (sym1_re, symtmp2_re, symtmp3_im), var_in=[symtmp2_re, symtmp3_im], var_out=[sym1_re], arith_add=1)
        #__OUT1_i = t2_i - t3_r;
        emit("%s = %s - %s;" % (sym1_im, symtmp2_im, symtmp3_re), var_in=[symtmp2_im, symtmp3_re], var_out=[sym1_im], arith_add=1)
        #__OUT2_r = t2_r - t3_i;
        emit("%s = %s - %s;" % (sym2_re, symtmp2_re, symtmp3_im), var_in=[symtmp2_re, symtmp3_im], var_out=[sym2_re], arith_add=1)
        #__OUT2_i = t2_i + t3_r;
        emit("%s = %s + %s;" % (sym2_im, symtmp2_im, symtmp3_re), var_in=[symtmp2_im, symtmp3_re], var_out=[sym2_im], arith_add=1)
        
        tmpvar_free(symtmp1_re)
        tmpvar_free(symtmp1_im)
        tmpvar_free(symtmp2_re)
        tmpvar_free(symtmp2_im)
        tmpvar_free(symtmp3_re)
        tmpvar_free(symtmp3_im)
    elif N == 4:
        addr0 = mem_addrs[indexes[0]]
        addr1 = mem_addrs[indexes[1]]
        addr2 = mem_addrs[indexes[2]]
        addr3 = mem_addrs[indexes[3]]
        
        sym0_re, sym0_im = symlist_re[addr0], symlist_im[addr0]
        sym1_re, sym1_im = symlist_re[addr1], symlist_im[addr1]
        sym2_re, sym2_im = symlist_re[addr2], symlist_im[addr2]
        sym3_re, sym3_im = symlist_re[addr3], symlist_im[addr3]
        
        symtmp1_re = tmpvar_alloc()
        symtmp1_im = tmpvar_alloc()
        symtmp2_re = tmpvar_alloc()
        symtmp2_im = tmpvar_alloc()
        symtmp3_re = tmpvar_alloc()
        symtmp3_im = tmpvar_alloc()
        symtmp4_re = tmpvar_alloc()
        symtmp4_im = tmpvar_alloc()
        
        #let i0_r = __IN0_r;
        #let i0_i = __IN0_i;
        #let i1_r = __IN1_r;
        #let i1_i = __IN1_i;
        #let i2_r = __IN2_r;
        #let i2_i = __IN2_i;
        #let i3_r = __IN3_r;
        #let i3_i = __IN3_i;
        #let t1_r = i0_r + i2_r;
        emit("%s = %s + %s;" % (symtmp1_re, sym0_re, sym2_re), var_in=[sym0_re, sym2_re], var_out=[symtmp1_re], arith_add=1)
        #let t1_i = i0_i + i2_i;
        emit("%s = %s + %s;" % (symtmp1_im, sym0_im, sym2_im), var_in=[sym0_im, sym2_im], var_out=[symtmp1_im], arith_add=1)
        #let t2_r = i1_r + i3_r;
        emit("%s = %s + %s;" % (symtmp2_re, sym1_re, sym3_re), var_in=[sym1_re, sym3_re], var_out=[symtmp2_re], arith_add=1)
        #let t2_i = i1_i + i3_i;
        emit("%s = %s + %s;" % (symtmp2_im, sym1_im, sym3_im), var_in=[sym1_im, sym3_im], var_out=[symtmp2_im], arith_add=1)
        #let t3_r = i0_r - i2_r;
        emit("%s = %s - %s;" % (symtmp3_re, sym0_re, sym2_re), var_in=[sym0_re, sym2_re], var_out=[symtmp3_re], arith_add=1)
        #let t3_i = i0_i - i2_i;
        emit("%s = %s - %s;" % (symtmp3_im, sym0_im, sym2_im), var_in=[sym0_im, sym2_im], var_out=[symtmp3_im], arith_add=1)
        #let t4_r = i1_r - i3_r;
        emit("%s = %s - %s;" % (symtmp4_re, sym1_re, sym3_re), var_in=[sym1_re, sym3_re], var_out=[symtmp4_re], arith_add=1)
        #let t4_i = i1_i - i3_i;
        emit("%s = %s - %s;" % (symtmp4_im, sym1_im, sym3_im), var_in=[sym1_im, sym3_im], var_out=[symtmp4_im], arith_add=1)
        #__OUT0_r = t1_r + t2_r;
        emit("%s = %s + %s;" % (sym0_re, symtmp1_re, symtmp2_re), var_in=[symtmp1_re, symtmp2_re], var_out=[sym0_re], arith_add=1)
        #__OUT0_i = t1_i + t2_i;
        emit("%s = %s + %s;" % (sym0_im, symtmp1_im, symtmp2_im), var_in=[symtmp1_im, symtmp2_im], var_out=[sym0_im], arith_add=1)
        #__OUT1_r = t3_r + t4_i;
        emit("%s = %s + %s;" % (sym1_re, symtmp3_re, symtmp4_im), var_in=[symtmp3_re, symtmp4_im], var_out=[sym1_re], arith_add=1)
        #__OUT1_i = t3_i - t4_r;
        emit("%s = %s - %s;" % (sym1_im, symtmp3_im, symtmp4_re), var_in=[symtmp3_im, symtmp4_re], var_out=[sym1_im], arith_add=1)
        #__OUT2_r = t1_r - t2_r;
        emit("%s = %s - %s;" % (sym2_re, symtmp1_re, symtmp2_re), var_in=[symtmp1_re, symtmp2_re], var_out=[sym2_re], arith_add=1)
        #__OUT2_i = t1_i - t2_i;
        emit("%s = %s - %s;" % (sym2_im, symtmp1_im, symtmp2_im), var_in=[symtmp1_im, symtmp2_im], var_out=[sym2_im], arith_add=1)
        #__OUT3_r = t3_r - t4_i;
        emit("%s = %s - %s;" % (sym3_re, symtmp3_re, symtmp4_im), var_in=[symtmp3_re, symtmp4_im], var_out=[sym3_re], arith_add=1)
        #__OUT3_i = t3_i + t4_r;
        emit("%s = %s + %s;" % (sym3_im, symtmp3_im, symtmp4_re), var_in=[symtmp3_im, symtmp4_re], var_out=[sym3_im], arith_add=1)
        
        tmpvar_free(symtmp1_re)
        tmpvar_free(symtmp1_im)
        tmpvar_free(symtmp2_re)
        tmpvar_free(symtmp2_im)
        tmpvar_free(symtmp3_re)
        tmpvar_free(symtmp3_im)
        tmpvar_free(symtmp4_re)
        tmpvar_free(symtmp4_im)
    elif N == 5:
        addr0 = mem_addrs[indexes[0]]
        addr1 = mem_addrs[indexes[1]]
        addr2 = mem_addrs[indexes[2]]
        addr3 = mem_addrs[indexes[3]]
        addr4 = mem_addrs[indexes[4]]
        
        sym0_re, sym0_im = symlist_re[addr0], symlist_im[addr0]
        sym1_re, sym1_im = symlist_re[addr1], symlist_im[addr1]
        sym2_re, sym2_im = symlist_re[addr2], symlist_im[addr2]
        sym3_re, sym3_im = symlist_re[addr3], symlist_im[addr3]
        sym4_re, sym4_im = symlist_re[addr4], symlist_im[addr4]
        
        symtmp1_re = tmpvar_alloc()
        symtmp1_im = tmpvar_alloc()
        symtmp2_re = tmpvar_alloc()
        symtmp2_im = tmpvar_alloc()
        symtmp3_re = tmpvar_alloc()
        symtmp3_im = tmpvar_alloc()
        symtmp4_re = tmpvar_alloc()
        symtmp4_im = tmpvar_alloc()
        symtmp5_re = tmpvar_alloc()
        symtmp5_im = tmpvar_alloc()
        symtmp6_re = tmpvar_alloc()
        symtmp6_im = tmpvar_alloc()
        symtmp7_re = tmpvar_alloc()
        symtmp7_im = tmpvar_alloc()
        symtmp8_re = tmpvar_alloc()
        symtmp8_im = tmpvar_alloc()
        symtmp9_re = tmpvar_alloc()
        symtmp9_im = tmpvar_alloc()
        symtmp10_re = tmpvar_alloc()
        symtmp10_im = tmpvar_alloc()
        symtmp11_re = tmpvar_alloc()
        symtmp11_im = tmpvar_alloc()

        #let i0_r = __IN0_r;
        #let i0_i = __IN0_i;
        #let i1_r = __IN1_r;
        #let i1_i = __IN1_i;
        #let i2_r = __IN2_r;
        #let i2_i = __IN2_i;
        #let i3_r = __IN3_r;
        #let i3_i = __IN3_i;
        #let i4_r = __IN4_r;
        #let i4_i = __IN4_i;
        #let t1_r = i1_r + i4_r;
        emit("%s = %s + %s;" % (symtmp1_re, sym1_re, sym4_re), var_in=[sym1_re, sym4_re], var_out=[symtmp1_re], arith_add=1)
        #let t1_i = i1_i + i4_i;
        emit("%s = %s + %s;" % (symtmp1_im, sym1_im, sym4_im), var_in=[sym1_im, sym4_im], var_out=[symtmp1_im], arith_add=1)
        #let t2_r = i2_r + i3_r;
        emit("%s = %s + %s;" % (symtmp2_re, sym2_re, sym3_re), var_in=[sym2_re, sym3_re], var_out=[symtmp2_re], arith_add=1)
        #let t2_i = i2_i + i3_i;
        emit("%s = %s + %s;" % (symtmp2_im, sym2_im, sym3_im), var_in=[sym2_im, sym3_im], var_out=[symtmp2_im], arith_add=1)
        #let t3_r = i1_r - i4_r;
        emit("%s = %s - %s;" % (symtmp3_re, sym1_re, sym4_re), var_in=[sym1_re, sym4_re], var_out=[symtmp3_re], arith_add=1)
        #let t3_i = i1_i - i4_i;
        emit("%s = %s - %s;" % (symtmp3_im, sym1_im, sym4_im), var_in=[sym1_im, sym4_im], var_out=[symtmp3_im], arith_add=1)
        #let t4_r = i2_r - i3_r;
        emit("%s = %s - %s;" % (symtmp4_re, sym2_re, sym3_re), var_in=[sym2_re, sym3_re], var_out=[symtmp4_re], arith_add=1)
        #let t4_i = i2_i - i3_i;
        emit("%s = %s - %s;" % (symtmp4_im, sym2_im, sym3_im), var_in=[sym2_im, sym3_im], var_out=[symtmp4_im], arith_add=1)
        #let t5_r = t1_r + t2_r;
        emit("%s = %s + %s;" % (symtmp5_re, symtmp1_re, symtmp2_re), var_in=[symtmp1_re, symtmp2_re], var_out=[symtmp5_re], arith_add=1)
        #let t5_i = t1_i + t2_i;
        emit("%s = %s + %s;" % (symtmp5_im, symtmp1_im, symtmp2_im), var_in=[symtmp1_im, symtmp2_im], var_out=[symtmp5_im], arith_add=1)
        #let t6_r = 0.5590169943749475 * (t1_r - t2_r);
        emit("%s = 0.5590169943749475 * (%s - %s);" % (symtmp6_re, symtmp1_re, symtmp2_re), var_in=[symtmp1_re, symtmp2_re], var_out=[symtmp6_re], arith_add=1, arith_mul=1)
        #let t6_i = 0.5590169943749475 * (t1_i - t2_i);
        emit("%s = 0.5590169943749475 * (%s - %s);" % (symtmp6_im, symtmp1_im, symtmp2_im), var_in=[symtmp1_im, symtmp2_im], var_out=[symtmp6_im], arith_add=1, arith_mul=1)
        #let t7_r = i0_r - 0.25 * t5_r;
        emit("%s = %s - 0.25 * %s;" % (symtmp7_re, sym0_re, symtmp5_re), var_in=[sym0_re, symtmp5_re], var_out=[symtmp7_re], arith_add=1, arith_mul=1)
        #let t7_i = i0_i - 0.25 * t5_i;
        emit("%s = %s - 0.25 * %s;" % (symtmp7_im, sym0_im, symtmp5_im), var_in=[sym0_im, symtmp5_im], var_out=[symtmp7_im], arith_add=1, arith_mul=1)
        #let t8_r = t7_r + t6_r;
        emit("%s = %s + %s;" % (symtmp8_re, symtmp7_re, symtmp6_re), var_in=[symtmp7_re, symtmp6_re], var_out=[symtmp8_re], arith_add=1)
        #let t8_i = t7_i + t6_i;
        emit("%s = %s + %s;" % (symtmp8_im, symtmp7_im, symtmp6_im), var_in=[symtmp7_im, symtmp6_im], var_out=[symtmp8_im], arith_add=1)
        #let t9_r = t7_r - t6_r;
        emit("%s = %s - %s;" % (symtmp9_re, symtmp7_re, symtmp6_re), var_in=[symtmp7_re, symtmp6_re], var_out=[symtmp9_re], arith_add=1)
        #let t9_i = t7_i - t6_i;
        emit("%s = %s - %s;" % (symtmp9_im, symtmp7_im, symtmp6_im), var_in=[symtmp7_im, symtmp6_im], var_out=[symtmp9_im], arith_add=1)
        #let t10_r = 0.9510565162951535 * t3_r + 0.5877852522924731 * t4_r;
        emit("%s = 0.9510565162951535 * %s + 0.5877852522924731 * %s;" % (symtmp10_re, symtmp3_re, symtmp4_re), var_in=[symtmp3_re, symtmp4_re], var_out=[symtmp10_re], arith_add=1, arith_mul=2)
        #let t10_i = 0.9510565162951535 * t3_i + 0.5877852522924731 * t4_i;
        emit("%s = 0.9510565162951535 * %s + 0.5877852522924731 * %s;" % (symtmp10_im, symtmp3_im, symtmp4_im), var_in=[symtmp3_im, symtmp4_im], var_out=[symtmp10_im], arith_add=1, arith_mul=2)
        #let t11_r = 0.5877852522924731 * t3_r - 0.9510565162951535 * t4_r;
        emit("%s = 0.5877852522924731 * %s - 0.9510565162951535 * %s;" % (symtmp11_re, symtmp3_re, symtmp4_re), var_in=[symtmp3_re, symtmp4_re], var_out=[symtmp11_re], arith_add=1, arith_mul=2)
        #let t11_i = 0.5877852522924731 * t3_i - 0.9510565162951535 * t4_i;
        emit("%s = 0.5877852522924731 * %s - 0.9510565162951535 * %s;" % (symtmp11_im, symtmp3_im, symtmp4_im), var_in=[symtmp3_im, symtmp4_im], var_out=[symtmp11_im], arith_add=1, arith_mul=2)
        #__OUT0_r = i0_r + t5_r;
        emit("%s += %s;" % (sym0_re, symtmp5_re), var_in=[sym0_re, symtmp5_re], var_out=[sym0_re], arith_add=1)
        #__OUT0_i = i0_i + t5_i;
        emit("%s += %s;" % (sym0_im, symtmp5_im), var_in=[sym0_im, symtmp5_im], var_out=[sym0_im], arith_add=1)
        #__OUT1_r = t8_r + t10_i;
        emit("%s = %s + %s;" % (sym1_re, symtmp8_re, symtmp10_im), var_in=[symtmp8_re, symtmp10_im], var_out=[sym1_re], arith_add=1)
        #__OUT1_i = t8_i - t10_r;
        emit("%s = %s - %s;" % (sym1_im, symtmp8_im, symtmp10_re), var_in=[symtmp8_im, symtmp10_re], var_out=[sym1_im], arith_add=1)
        #__OUT2_r = t9_r + t11_i;
        emit("%s = %s + %s;" % (sym2_re, symtmp9_re, symtmp11_im), var_in=[symtmp9_re, symtmp11_im], var_out=[sym2_re], arith_add=1)
        #__OUT2_i = t9_i - t11_r;
        emit("%s = %s - %s;" % (sym2_im, symtmp9_im, symtmp11_re), var_in=[symtmp9_im, symtmp11_re], var_out=[sym2_im], arith_add=1)
        #__OUT3_r = t9_r - t11_i;
        emit("%s = %s - %s;" % (sym3_re, symtmp9_re, symtmp11_im), var_in=[symtmp9_re, symtmp11_im], var_out=[sym3_re], arith_add=1)
        #__OUT3_i = t9_i + t11_r;
        emit("%s = %s + %s;" % (sym3_im, symtmp9_im, symtmp11_re), var_in=[symtmp9_im, symtmp11_re], var_out=[sym3_im], arith_add=1)
        #__OUT4_r = t8_r - t10_i;
        emit("%s = %s - %s;" % (sym4_re, symtmp8_re, symtmp10_im), var_in=[symtmp8_re, symtmp10_im], var_out=[sym4_re], arith_add=1)
        #__OUT4_i = t8_i + t10_r;
        emit("%s = %s + %s;" % (sym4_im, symtmp8_im, symtmp10_re), var_in=[symtmp8_im, symtmp10_re], var_out=[sym4_im], arith_add=1)
        
        tmpvar_free(symtmp1_re)
        tmpvar_free(symtmp1_im)
        tmpvar_free(symtmp2_re)
        tmpvar_free(symtmp2_im)
        tmpvar_free(symtmp3_re)
        tmpvar_free(symtmp3_im)
        tmpvar_free(symtmp4_re)
        tmpvar_free(symtmp4_im)
        tmpvar_free(symtmp5_re)
        tmpvar_free(symtmp5_im)
        tmpvar_free(symtmp6_re)
        tmpvar_free(symtmp6_im)
        tmpvar_free(symtmp7_re)
        tmpvar_free(symtmp7_im)
        tmpvar_free(symtmp8_re)
        tmpvar_free(symtmp8_im)
        tmpvar_free(symtmp9_re)
        tmpvar_free(symtmp9_im)
        tmpvar_free(symtmp10_re)
        tmpvar_free(symtmp10_im)
        tmpvar_free(symtmp11_re)
        tmpvar_free(symtmp11_im)
    else:
        #  Divide N into N1 and N2 (N = N1 * N2).
        N1 = -1
        N2 = -1
        for N2_test in [5, 4, 3, 2]:
            if (N % N2_test) == 0:
                N2 = N2_test
                N1 = N // N2
                break
        if N2 <= 0:
            raise Exception("Bad radix.")
        
        #  Perform N2-point DFT.
        for n1 in range(0, N1):
            dft_indexes = [None] * N2
            for n2 in range(0, N2):
                dft_indexes[n2] = indexes[N1 * n2 + n1]
            emit_fft__internal(symlist_re, symlist_im, mem_addrs, dft_indexes, N2)
            
            for n2 in range(0, N2):
                emit_rotate(symlist_re, symlist_im, mem_addrs[indexes[N1 * n2 + n1]], -2 * n1 * n2, N)
        
        #  Perform N1-point DFT.
        for n2 in range(0, N2):
            dft_indexes = [None] * N1
            for n1 in range(0, N1):
                dft_indexes[n1] = indexes[N1 * n2 + n1]
            emit_fft__internal(symlist_re, symlist_im, mem_addrs, dft_indexes, N1)
        
        #  Compute index re-order mapping.
        reorder = [None] * N
        for n1 in range(0, N1):
            for n2 in range(0, N2):
                reorder[N2 * n1 + n2] = N1 * n2 + n1
        
        #  Re-order the index.
        visited = set()
        for n in range(0, N):
            if n in visited:
                continue
            visited.add(n)
            cycle = [n]
            n_cur = n
            while True:
                n_next = reorder[n_cur]
                if n_next in visited:
                    break
                cycle.append(n_next)
                n_cur = n_next
                visited.add(n_next)
            
            if len(cycle) == 1:
                continue
            
            mem_addr_first = mem_addrs[indexes[cycle[0]]]
            for i in range(0, len(cycle) - 1):
                mem_addrs[indexes[cycle[i]]] = mem_addrs[indexes[cycle[i + 1]]]
            mem_addrs[indexes[cycle[len(cycle) - 1]]] = mem_addr_first


def emit_fft(symlist_re, symlist_im, N):
    indexes = [0] * N
    mem_addrs = [0] * N
    for n in range(0, N):
        indexes[n] = n
        mem_addrs[n] = n
    emit_fft__internal(symlist_re, symlist_im, mem_addrs, indexes, N)
    return mem_addrs


def scan_dead():
    line_count = len(OUT_OPCODE)

    last_assign = {}
    vertexes = []
    for i in range(0, line_count):
        vertexes.append(set())
    
    #  Compute the in-degree of each line (one line <=> one vertex).
    in_degree = [0] * line_count
    for line_id in range(0, line_count):
        line = OUT_OPCODE[line_id]
        if line["comment"] or line["nop"]:
            continue
        if line["mandatory"]:
            in_degree[line_id] += 1          #  Do NOT optimize.
        for var_in in line["in"]:
            var_last_assign = last_assign[var_in]
            vertexes[line_id].add(var_last_assign)
            in_degree[var_last_assign] += 1
        for var_out in line["out"]:
            last_assign[var_out] = line_id
    
    #  BFS queue shall be filled with initial dead lines.
    queue = []
    for line_id in range(0, line_count):
        line = OUT_OPCODE[line_id]
        if line["comment"] or line["nop"]:
            continue
        if in_degree[line_id] == 0:
            queue.append(line_id)
    
    #  BFS to detect all dead lines.
    while len(queue) != 0:
        front = queue.pop(0)
        OUT_OPCODE[front]["nop"] = True
        for vertex in vertexes[front]:
            in_degree[vertex] -= 1
            if in_degree[vertex] == 0:
                queue.append(vertex)


def is_zero(num):
    return abs(num) < 1E-8


def is_equal(n1, n2):
    return is_zero(n1 - n2)


def emit_dctii(N, C=None):
    N_div_2 = N // 2
    
    #
    #  xc[], Xc[].
    #
    xp_index = [0] * N
    for n in range(0, N_div_2):
        xp_index[n] = 2 * n
    for n in range(N_div_2, N):
        xp_index[n] = 2 * N - 1 - 2 * n
    
    xc_symlist_re = [None] * N_div_2
    xc_symlist_im = [None] * N_div_2
    for n in range(0, N_div_2):
        sym0_re = tmpvar_alloc()
        sym0_im = tmpvar_alloc()
        
        xc_symlist_re[n] = sym0_re
        xc_symlist_im[n] = sym0_im
        
        emit("%s = dct_in[%d];" % (sym0_re, xp_index[2 * n]), var_out=[sym0_re])
        emit("%s = dct_in[%d];" % (sym0_im, xp_index[2 * n + 1]), var_out=[sym0_im])
    Xc_addrs = emit_fft(xc_symlist_re, xc_symlist_im, N_div_2)
    
    #
    #  Xp[].
    #
    Xp_symlist_re = [None] * (N_div_2 + 1)
    Xp_symlist_im = [None] * (N_div_2 + 1)
    #  (... reuse xc[]...)
    for k in range(0, N_div_2):
        Xp_symlist_re[k] = xc_symlist_re[Xc_addrs[k]]
        Xp_symlist_im[k] = xc_symlist_im[Xc_addrs[k]]
    #  (... new symbol for Xp[N/2] ...)
    Xp_symlist_re[N_div_2] = tmpvar_alloc()
    Xp_symlist_im[N_div_2] = tmpvar_alloc()
    
    #  Xp[0] and Xp[N/2]:
    tmpvar0 = tmpvar_alloc()
    tmpvar1 = tmpvar_alloc()
    sym_Xp__0__re = Xp_symlist_re[0]
    sym_Xp__0__im = Xp_symlist_im[0]
    sym_Xp__N_div_2__re = Xp_symlist_re[N_div_2]
    sym_Xp__N_div_2__im = Xp_symlist_im[N_div_2]
    emit("%s = %s + %s;" % (tmpvar0, sym_Xp__0__re, sym_Xp__0__im), var_out=[tmpvar0], var_in=[sym_Xp__0__re, sym_Xp__0__im], arith_add=1)
    emit("%s = %s - %s;" % (tmpvar1, sym_Xp__0__re, sym_Xp__0__im), var_out=[tmpvar1], var_in=[sym_Xp__0__re, sym_Xp__0__im], arith_add=1)
    emit("%s = %s;" % (sym_Xp__0__re, tmpvar0), var_out=[sym_Xp__0__re], var_in=[tmpvar0])
    emit("%s = 0;" % sym_Xp__0__im, var_out=[sym_Xp__0__im])
    emit("%s = %s;" % (sym_Xp__N_div_2__re, tmpvar1), var_out=[sym_Xp__N_div_2__re], var_in=[tmpvar1])
    emit("%s = 0;" % sym_Xp__N_div_2__im, var_out=[sym_Xp__N_div_2__im])
    tmpvar_free(tmpvar0)
    tmpvar_free(tmpvar1)
    
    for k in range(1, N_div_2):
        sym_Xp_re_1 = Xp_symlist_re[k]
        sym_Xp_im_1 = Xp_symlist_im[k]
        sym_Xp_re_2 = Xp_symlist_re[N_div_2 - k]
        sym_Xp_im_2 = Xp_symlist_im[N_div_2 - k]
        
        if k < N_div_2 - k:
            symtmp1 = tmpvar_alloc()
            symtmp2 = tmpvar_alloc()
            symtmp3 = tmpvar_alloc()
            symtmp4 = tmpvar_alloc()
            
            #  Xp_0
            emit("%s = %s + %s;" % (symtmp1, sym_Xp_re_1, sym_Xp_re_2), var_out=[symtmp1], var_in=[sym_Xp_re_1, sym_Xp_re_2], arith_add=1)
            emit("%s = %s - %s;" % (symtmp2, sym_Xp_im_1, sym_Xp_im_2), var_out=[symtmp2], var_in=[sym_Xp_im_1, sym_Xp_im_2], arith_add=1)
            
            #  Xp_1  #  re->tmp3,  im->tmp4
            emit("%s = %s + %s;" % (symtmp3, sym_Xp_im_1, sym_Xp_im_2), var_out=[symtmp3], var_in=[sym_Xp_im_1, sym_Xp_im_2], arith_add=1)
            emit("%s = %s - %s;" % (symtmp4, sym_Xp_re_2, sym_Xp_re_1), var_out=[symtmp4], var_in=[sym_Xp_re_2, sym_Xp_re_1], arith_add=1)
            emit_rotate([symtmp3], [symtmp4], 0, -2 * k, N)
            
            emit("%s = %s + %s;" % (sym_Xp_re_1, symtmp1, symtmp3), var_out=[sym_Xp_re_1], var_in=[symtmp1, symtmp3], arith_add=1)
            emit("%s = %s + %s;" % (sym_Xp_im_1, symtmp2, symtmp4), var_out=[sym_Xp_im_1], var_in=[symtmp2, symtmp4], arith_add=1)
            
            emit("%s = %s - %s;" % (sym_Xp_re_2, symtmp1, symtmp3), var_out=[sym_Xp_re_2], var_in=[symtmp1, symtmp3], arith_add=1)
            emit("%s = %s - %s;" % (sym_Xp_im_2, symtmp4, symtmp2), var_out=[sym_Xp_im_2], var_in=[symtmp4, symtmp2], arith_add=1)
            
            tmpvar_free(symtmp1)
            tmpvar_free(symtmp2)
            tmpvar_free(symtmp3)
            tmpvar_free(symtmp4)
        elif k == N_div_2 - k:
            symtmp1 = tmpvar_alloc()
            symtmp3 = tmpvar_alloc()
            symtmp4 = tmpvar_alloc()
            
            #  Xp_0
            emit("%s = %s + %s;" % (symtmp1, sym_Xp_re_1, sym_Xp_re_2), var_out=[symtmp1], var_in=[sym_Xp_re_1, sym_Xp_re_2], arith_add=1)
            
            #  Xp_1  #  re->tmp3,  im->tmp4
            emit("%s = %s + %s;" % (symtmp3, sym_Xp_im_1, sym_Xp_im_2), var_out=[symtmp3], var_in=[sym_Xp_im_1, sym_Xp_im_2], arith_add=1)
            emit("%s = %s - %s;" % (symtmp4, sym_Xp_re_2, sym_Xp_re_1), var_out=[symtmp4], var_in=[sym_Xp_re_2, sym_Xp_re_1], arith_add=1)
            emit_rotate([symtmp3], [symtmp4], 0, -2 * k, N)
            
            emit("%s = %s + %s;" % (sym_Xp_re_1, symtmp1, symtmp3), var_out=[sym_Xp_re_1], var_in=[symtmp1, symtmp3], arith_add=1)
            emit("%s = %s;" % (sym_Xp_im_1, symtmp4), var_out=[sym_Xp_im_1], var_in=[symtmp4])
            
            tmpvar_free(symtmp1)
            tmpvar_free(symtmp3)
            tmpvar_free(symtmp4)
    
    #
    #  Xw[].
    #
    for k in range(1, N_div_2 + 1):
        if k == N_div_2:
            emit_rotate(Xp_symlist_re, Xp_symlist_im, k, -k, 2 * N)
        else:
            emit_rotate(Xp_symlist_re, Xp_symlist_im, k, -k, 2 * N, coeff=0.5)
    
    #
    #  Output.
    #
    for k in range(0, N_div_2 + 1):
        sym_Xw__k__re = Xp_symlist_re[k]
        coeff = C[k]
        if is_equal(coeff, 1.0):
            emit("dct_out[%d] = %s;" % (k, sym_Xw__k__re), var_in=[sym_Xw__k__re], mandatory=True)
        elif is_equal(coeff, -1.0):
            emit("dct_out[%d] = -%s;" % (k, sym_Xw__k__re), var_in=[sym_Xw__k__re], arith_neg=1, mandatory=True)
        else:
            emit("dct_out[%d] = %s * %s;" % (k, num_wrap(coeff), sym_Xw__k__re), var_in=[sym_Xw__k__re], arith_mul=1, mandatory=True)
    for k in range(N_div_2 + 1, N):
        sym_Xw__k__im = Xp_symlist_im[N - k]
        coeff = C[k]
        if is_equal(coeff, 1.0):
            emit("dct_out[%d] = -%s;" % (k, sym_Xw__k__im), var_in=[sym_Xw__k__im], mandatory=True, arith_neg=1)
        elif is_equal(coeff, -1.0):
            emit("dct_out[%d] = %s;" % (k, sym_Xw__k__im), var_in=[sym_Xw__k__im], mandatory=True)
        else:
            emit("dct_out[%d] = %s * %s;" % (k, num_wrap(-coeff), sym_Xw__k__im), var_in=[sym_Xw__k__im], arith_mul=1, mandatory=True)
    
    for k in range(0, N_div_2):
        tmpvar_free(xc_symlist_re[k])
        tmpvar_free(xc_symlist_im[k])
    tmpvar_free(Xp_symlist_re[-1])
    tmpvar_free(Xp_symlist_im[-1])


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
    
    #  Get orthogonalize swtich.
    orthogon = config["orthogon"]
    
    #  Get the output file path.
    outfile_path = os.path.join(BASE_DIR, config["output"])
    
    #
    #  Phase 2: Perform FDCT-II.
    #
    
    #  Generate C[].
    C = [1] * N
    if orthogon:
        C[0] = math.sqrt(1 / N)
        for i in range(1, N):
            C[i] = math.sqrt(2 / N)
    
    #  Perform FDCT-II.
    emit_dctii(N, C=C)
    
    #  Delete dead code.
    scan_dead()

    #
    #  Phase 3: Code generation.
    #
    
    func_name = "DCTIIForward_%d" % N
    
    #  Generate header.
    content  = hdr + "\n\n"
    
    #  Generate function body.
    content += "//\n"
    content += "//  Public functions.\n"
    content += "//\n"
    content += "\n"
    content += "/**\n"
    if orthogon:
        content += " *  Do %d-point Type-II FDCT (orthogonalized).\n" % N
        content += " * \n"
        content += " *  Note(s):\n"
        content += " *    [1] Expected output:\n"
        content += " *        dct_out[k] = C[K] * sum(n = 0...N-1, dct_in[n] * cos((2n + 1)kπ / 2N))\n"
        content += " *        (where 0 <= k < N, N = 16, C[k] = iif(k == 0, 1 / sqrt(N), 2 / sqrt(N))).\n"
        content += " *    [2] In-place transformation is supported.\n"
        content += " * \n"
    else:
        content += " *  Do %d-point Type-II FDCT (not orthogonalized).\n" % N
        content += " * \n"
        content += " *  Note(s):\n"
        content += " *    [1] Expected output:\n"
        content += " *        dct_out[k] = sum(n = 0...N-1, dct_in[n] * cos((2n + 1)kπ / 2N))\n"
        content += " *        (where 0 <= k < N, N = 16).\n"
        content += " *    [2] In-place transformation is supported.\n"
        content += " * \n"
    content += " *  @param {Number[]} dct_in\n"
    content += " *    - The input vector.\n"
    content += " *  @param {Number[]} [dct_out]\n"
    content += " *    - The output vector.\n"
    content += " *  @returns {Number[]}\n"
    content += " *    - The output vector.\n"
    content += " */\n"
    content += "function %s(dct_in, dct_out = new Array(16)) {\n" % func_name
    
    defs = set()
    for line in OUT_OPCODE:
        if line["comment"] or line["nop"]:
            continue
        for var_name in line["out"]:
            defs.add(var_name)
    defs = list(defs)
    defs.sort()
    if len(defs) != 0:
        content += "    let " + (", ".join(defs)) + ";\n"
    
    arith_adds = 0
    arith_muls = 0
    
    for line in OUT_OPCODE:
        debug_io = DEBUG
        if line["comment"]:
            lp = line["text"]
            debug_io = False
        elif line["nop"]:
            if DEBUG:
                lp = "// " + line["text"]
            else:
                continue
            debug_io = False
        else:
            lp = line["text"]
        if debug_io:
            lp += "    //  in=%s, out=%s, arith=%d/%d/%d"  % (json.dumps(line["in"]), json.dumps(line["out"]), line["arith-mul"],line["arith-add"],line["arith-neg"])
        if not (line["comment"] or line["nop"]):
            arith_adds += line["arith-add"]
            arith_muls += line["arith-mul"]
        content += "    %s\n" % lp
    
    content += "    return dct_out;\n"
    content += "}\n"
    
    #  Generate trailer.
    content += "\n"
    content += "//  Exported public APIs.\n"
    content += "module.exports = {\n"
    content += "    \"%s\": %s\n" % (func_name, func_name)
    content += "};"
    
    #  Write output file.
    if DEBUG:
        print(content)
    fp = open(outfile_path, "w", encoding="utf-8")
    fp.write(content)
    fp.close()
    
    print("OK! Mul/Add=%d/%d." % (arith_muls, arith_adds))


if __name__ == "__main__":
    main()

