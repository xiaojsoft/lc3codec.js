//
//  Copyright 2021 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Lc3Fs = 
    require("./../lc3/common/fs");
const Lc3Nms = 
    require("./../lc3/common/nms");
const Lc3DcBec = 
    require("./../lc3/decoder/bec");
const Lc3TblNF = 
    require("./../lc3/tables/nf");
const Lc3Error = 
    require("./../lc3/error");
const Lc3NodeWorkerSpec = 
    require("./worker-spec");
const XRTLibAsyncLite = 
    require("xrtlibrary-asynclite");
const Events = 
    require("events");
const Path = 
    require("path");
const WorkerThreads = 
    require("worker_threads");
const Util = 
    require("util");

//  Imported classes.
const LC3SampleRate = 
    Lc3Fs.LC3SampleRate;
const LC3FrameDuration = 
    Lc3Nms.LC3FrameDuration;
const LC3BEC = 
    Lc3DcBec.LC3BEC;
const LC3BugError = 
    Lc3Error.LC3BugError;
const LC3IllegalOperationError = 
    Lc3Error.LC3IllegalOperationError;
const LC3IllegalParameterError = 
    Lc3Error.LC3IllegalParameterError;
const LwCompletion = 
    XRTLibAsyncLite.Synchronize.LwCompletion;
const LwSemaphore = 
    XRTLibAsyncLite.Synchronize.LwSemaphore;
const EventEmitter = 
    Events.EventEmitter;
const Worker = 
    WorkerThreads.Worker;

//  Imported constants.
const MSGTYPE_HANDSHAKE = 
    Lc3NodeWorkerSpec.MSGTYPE_HANDSHAKE;
const MSGTYPE_RESET = 
    Lc3NodeWorkerSpec.MSGTYPE_RESET;
const MSGTYPE_ENCODE = 
    Lc3NodeWorkerSpec.MSGTYPE_ENCODE;
const MSGTYPE_DECODE = 
    Lc3NodeWorkerSpec.MSGTYPE_DECODE;
const MSGTYPE_QUIT = 
    Lc3NodeWorkerSpec.MSGTYPE_QUIT;
const MSGRST_FLAG_USE_ENCODER = 
    Lc3NodeWorkerSpec.MSGRST_FLAG_USE_ENCODER;
const MSGRST_FLAG_USE_DECODER = 
    Lc3NodeWorkerSpec.MSGRST_FLAG_USE_DECODER;
const MSGNAK_MASK = 
    Lc3NodeWorkerSpec.MSGNAK_MASK;
const MSGDC_FLAG_BFI = 
    Lc3NodeWorkerSpec.MSGDC_FLAG_BFI;
const NF_TBL = 
    Lc3TblNF.NF_TBL;

//
//  Constants.
//

//  Path of the "worker-thread.js" file.
const WORKER_THREAD_MAINFILE = Path.join(__dirname, "worker-thread.js");

//  FSM states of the worker (main thread).
const STATE_INIT = 0;
const STATE_WORKER_NEW = 1;
const STATE_WORKER_HANDSHAKE = 2;
const STATE_WORKER_RESET = 3;
const STATE_WORKER_RESET_WAIT = 4;
const STATE_WORKER_STANDBY = 5;
const STATE_WORKER_QUERY = 6;
const STATE_WORKER_QUERY_WAIT = 7;
const STATE_CLOSING = -1;
const STATE_CLOSED = -2;

//
//  Public classes.
//

/**
 *  LC3 worker.
 * 
 *  Event(s):
 *    [1] "error" (error: Error):
 *        - An error was thrown.
 *    [2] "close" (no parameter):
 *        - The worker was closed.
 * 
 *  @constructor
 *  @param {InstanceType<typeof LC3FrameDuration>} Nms 
 *    - The frame duration.
 *  @param {InstanceType<typeof LC3SampleRate>} Fs 
 *    - The sample rate.
 *  @param {Boolean} [useEncoder]
 *    - True if the encoder should be enabled (default: true).
 *  @param {Boolean} [useDecoder]
 *    - True if the decoder should be enabled (default: true).
 */
function LC3Worker(Nms, Fs, useEncoder = true, useDecoder = true) {
    //  Let parent class initialize.
    EventEmitter.call(this);

    //
    //  Members.
    //

    //  Self reference.
    let self = this;

    //  Internal index of Nms, Fs.
    let index_Nms = Nms.getInternalIndex();
    let index_Fs = Fs.getInternalIndex();

    //  Table lookup.
    let NF = NF_TBL[index_Nms][index_Fs];

    //  Worker and its synchronizers.
    /**
     *  @type {?InstanceType<typeof Worker>}
     */
    let worker = null;
    let sync_worker_err = new LwCompletion();
    let sync_worker_exit = new LwCompletion();

    //  Synchronizers.
    let sync_cmd_close = new LwCompletion();
    let sync_closed = new LwCompletion();

    //  Query queue.
    let queryqueue = [];
    let queryqueue_sem = new LwSemaphore(0);

    //
    //  Public methods.
    //

    /**
     *  Get the frame size.
     * 
     *  @returns {Number}
     *    - The frame size.
     */
    this.getFrameSize = function() {
        return NF;
    };

    /**
     *  Encode one frame.
     * 
     *  @throws {LC3IllegalParameterError}
     *    - Frame size mismatches, or 
     *    - Byte count is not within specific range (20 <= nbytes <= 400).
     *  @throws {LC3IllegalOperationError}
     *    - The encoder was disabled, or 
     *    - The worker was already closed, or 
     *    - The worker is going to be closed, or 
     *    - The worker was closed unexpectedly.
     *  @param {Number[]|Int16Array} xs 
     *    - The frame.
     *  @param {Number} nbytes
     *    - The byte count.
     *  @returns {Promise<Buffer>}
     *    - The promise object:
     *      - Resolves with the encoded frame if succeeds, 
     *      - Rejects if error occurred.
     */
    this.encode = async function(xs, nbytes) {
        //  Check the frame size.
        if (xs.length != NF) {
            throw new LC3IllegalParameterError(
                "Frame size mismatches."
            );
        }

        //  Check the byte count.
        if (nbytes < 20 || nbytes > 400) {
            throw new LC3IllegalParameterError(
                "Byte count is not within specific range (20 <= nbytes <= 400)."
            );
        }

        //  Check the worker state.
        if (!useEncoder) {
            throw new LC3IllegalOperationError(
                "The encoder was disabled."
            );
        }
        if (sync_closed.isCompleted()) {
            throw new LC3IllegalOperationError(
                "The worker was already closed."
            );
        }
        if (sync_cmd_close.isCompleted()) {
            throw new LC3IllegalOperationError(
                "The worker is going to be closed."
            );
        }

        //  Build outgoing message.
        let msgsamplesz = Int16Array.BYTES_PER_ELEMENT;
        let msgouthdrsz = Math.max(8, msgsamplesz);
        let msgout = new SharedArrayBuffer(
            msgouthdrsz + 
            NF * msgsamplesz
        );
        let msgouthdrview = Buffer.from(msgout, 0, msgouthdrsz);
        let msgoutdataview = new Int16Array(msgout, msgouthdrsz, NF);
        msgouthdrview.writeUInt8(MSGTYPE_ENCODE, 0);
        msgouthdrview.writeUInt8(0, 1);
        msgouthdrview.writeUInt16BE(((
            NF | 
            (msgouthdrsz << 10)
        ) >>> 0), 2);
        msgouthdrview.writeUInt16BE(nbytes, 4);
        if (xs instanceof Int16Array) {
            for (let i = 0; i < NF; ++i) {
                msgoutdataview[i] = xs[i];
            }
        } else {
            for (let i = 0; i < NF; ++i) {
                let val = xs[i];
                if (val > 32767) {
                    val = 32767;
                } else if (val < -32768) {
                    val = -32768;
                } else {
                    //  Do nothing.
                }
                msgoutdataview[i] = val;
            }
        }

        //  Build completor.
        let completor = new LwCompletion();

        //  Enqueue the query (outgoing message and the completor) to the queue.
        queryqueue.push([msgout, completor]);
        queryqueue_sem.release();

        //  Wait for signals.
        let wh1 = completor.wait();
        let wh2 = sync_closed.wait();
        let wh = await Promise.race([wh1.handle, wh2.handle]);
        wh1.cancel();
        wh2.cancel();

        //  Handle the signal.
        let msgrcv;
        if (wh == wh1) {
            msgrcv = wh1.value;
        } else if (wh == wh2) {
            throw new LC3IllegalOperationError(
                "The worker was closed unexpectedly."
            );
        } else {
            throw new LC3BugError(
                "Illegal wait handle."
            );
        }

        //  Parse the received message.
        let msgrcvlen = msgrcv.byteLength;
        if (msgrcvlen < 4 + nbytes) {
            throw new LC3BugError(
                "Illegal reply (truncated)."
            );
        }
        let msgrcvhdr = Buffer.from(msgrcv, 0, 4);
        let msgrcvtype = msgrcvhdr.readUInt8(0);
        if ((msgrcvtype & MSGNAK_MASK) != 0) {
            throw new LC3BugError(
                "Illegal reply (NAKed)."
            );
        }
        if (msgrcvtype != MSGTYPE_ENCODE) {
            throw new LC3BugError(
                "Illegal reply (type mismatch)."
            );
        }
        let msgrcvconfig = msgrcvhdr.readUInt16BE(2);
        let msgrcvnbytes = ((msgrcvconfig & 1023) >>> 0);
        if (msgrcvnbytes != nbytes) {
            throw new LC3BugError(
                "Illegal reply (byte count mismatch)."
            );
        }
        let msgrcvframebytes = Buffer.from(msgrcv, 4, nbytes);

        return msgrcvframebytes;
    };

    /**
     *  Decode one frame.
     * 
     *  @throws {LC3IllegalOperationError}
     *    - The decoder was disabled, or 
     *    - The worker was already closed, or 
     *    - The worker is going to be closed, or 
     *    - The worker was closed unexpectedly.
     *  @param {Buffer|Uint8Array|Array} bytes 
     *    - The bytes buffer that contains the encoded frame.
     *  @param {InstanceType<typeof LC3BEC>} [bec] 
     *    - The bit error condition (BEC) context.
     *  @returns {Promise<Int16Array>}
     *    - The promise object:
     *      - Resolves with the decoded samples if succeeds, 
     *      - Rejects if error occurred.
     */
    this.decode = async function(
        bytes, 
        bec = new LC3BEC(false), 
    ) {
        let nbytes = bytes.length;

        //  Check the byte count.
        if (nbytes < 20 || nbytes > 400) {
            bec.mark();
        }

        //  Check the worker state.
        if (!useDecoder) {
            throw new LC3IllegalOperationError(
                "The decoder was disabled."
            );
        }
        if (sync_closed.isCompleted()) {
            throw new LC3IllegalOperationError(
                "The worker was already closed."
            );
        }
        if (sync_cmd_close.isCompleted()) {
            throw new LC3IllegalOperationError(
                "The worker is going to be closed."
            );
        }

        //  No byte shall be transmitted if BEC was marked.
        if (bec.isMarked()) {
            nbytes = 0;
        }

        //  Build outgoing message.
        let msgout = new SharedArrayBuffer(4 + nbytes);
        let msgouthdr = Buffer.from(msgout, 0, 4);
        let msgoutdata = Buffer.from(msgout, 4, nbytes);
        msgouthdr.writeUInt8(MSGTYPE_DECODE, 0);
        let msgoutflag = 0;
        if (bec.isMarked()) {
            msgoutflag |= MSGDC_FLAG_BFI;
        }
        msgouthdr.writeUInt8((msgoutflag >>> 0), 1);
        msgouthdr.writeUInt16BE(nbytes, 2);
        for (let i = 0; i < nbytes; ++i) {
            msgoutdata[i] = bytes[i];
        }
        
        //  Build completor.
        let completor = new LwCompletion();

        //  Enqueue the query (outgoing message and the completor) to the queue.
        queryqueue.push([msgout, completor]);
        queryqueue_sem.release();

        //  Wait for signals.
        let wh1 = completor.wait();
        let wh2 = sync_closed.wait();
        let wh = await Promise.race([wh1.handle, wh2.handle]);
        wh1.cancel();
        wh2.cancel();

        //  Handle the signal.
        let msgrcv;
        if (wh == wh1) {
            msgrcv = wh1.value;
        } else if (wh == wh2) {
            throw new LC3IllegalOperationError(
                "The worker was closed unexpectedly."
            );
        } else {
            throw new LC3BugError(
                "Illegal wait handle."
            );
        }

        //  Parse the received message.
        let msgrcvlen = msgrcv.byteLength;
        if (msgrcvlen < 4) {
            throw new LC3BugError(
                "Illegal reply (truncated)."
            );
        }
        let msgrcvhdr = Buffer.from(msgrcv, 0, 4);
        let msgrcvtype = msgrcvhdr.readUInt8(0);
        if ((msgrcvtype & MSGNAK_MASK) != 0) {
            throw new LC3BugError(
                "Illegal reply (NAKed)."
            );
        }
        if (msgrcvtype != MSGTYPE_DECODE) {
            throw new LC3BugError(
                "Illegal reply (type mismatch)."
            );
        }
        let msgrcvflag = msgrcvhdr.readUInt8(1);
        if ((msgrcvflag & MSGDC_FLAG_BFI) != 0) {
            bec.mark();
        }
        let bytes_per_sample = Int16Array.BYTES_PER_ELEMENT;
        let msgrcvconfig = msgrcvhdr.readUInt16BE(2);
        if (((msgrcvconfig & 1023) >>> 0) != NF) {
            throw new LC3BugError(
                "Illegal reply (frame size mismatches)."
            );
        }
        let msgrcvframeoff = (msgrcvconfig >>> 10);
        if (msgrcvframeoff + NF * bytes_per_sample > msgrcvlen) {
            throw new LC3BugError(
                "Illegal reply (truncated)."
            );
        }
        let msgrcvframe = new Int16Array(msgrcv, msgrcvframeoff, NF);

        return msgrcvframe;
    };

    /**
     *  Get whether the worker was already closed.
     * 
     *  @returns {Boolean}
     *    - True if so.
     */
    this.isClosed = function() {
        return sync_closed.isCompleted();
    };

    /**
     *  Close the worker.
     * 
     *  @throws {LC3IllegalOperationError}
     *    - The worker was already closed.
     */
    this.close = function() {
        if (sync_closed.isCompleted()) {
            throw new LC3IllegalOperationError(
                "The worker was already closed."
            );
        }
        sync_cmd_close.complete();
    };

    //
    //  Coroutines.
    //

    //  Main coroutine.
    (async function() {
        //  FSM state.
        let state = STATE_INIT;

        //  Incoming message queue.
        let msgrcvqueue = [];
        let msgrcvqueue_sem = new LwSemaphore(0);

        //  Completion synchronizer of current query.
        let querycompletor = null;

        //  Run the FSM.
        for (;;) {
            if (state == STATE_INIT) {
                //  Go to WORKER_NEW state.
                state = STATE_WORKER_NEW;
            } else if (state == STATE_WORKER_NEW) {
                //  Create worker thread.
                worker = new Worker(WORKER_THREAD_MAINFILE, {
                    "eval": false,
                    "workerData": null,
                    "stdin": false,
                    "stdout": false,
                    "stderr": false
                });
                worker.on("error", function(error) {
                    sync_worker_err.complete(error);
                });
                worker.on("message", function(msg) {
                    if (!(msg instanceof SharedArrayBuffer)) {
                        return;
                    }
                    msgrcvqueue.push(msg);
                    msgrcvqueue_sem.release();
                });
                worker.on("exit", function() {
                    sync_worker_exit.complete();
                });

                //  Go to WORKER_HANDSHAKE state.
                state = STATE_WORKER_HANDSHAKE;
            } else if (state == STATE_WORKER_HANDSHAKE) {
                //  Wait for signals.
                let wh1 = msgrcvqueue_sem.acquire();
                let wh2 = sync_worker_exit.wait();
                let wh3 = sync_cmd_close.wait();
                let wh = await Promise.race([
                    wh1.handle, 
                    wh2.handle, 
                    wh3.handle
                ]);
                wh1.cancel();
                wh2.cancel();
                wh3.cancel();

                //  Handle the signal.
                if (wh != wh1) {
                    if (wh1.status != LwSemaphore.WaitHandle.STATUS_CANCELLED) {
                        msgrcvqueue_sem.release();
                    }
                }
                if (wh == wh1) {
                    //  Try parse HANDSHAKE message.
                    let msghs = msgrcvqueue.shift();
                    let msghsview = Buffer.from(msghs, 0, msghs.byteLength);
                    if (
                        msghsview.length >= 4 && 
                        msghsview[0] == MSGTYPE_HANDSHAKE
                    ) {
                        //  Go to RESET state.
                        state = STATE_WORKER_RESET;
                    }
                } else if (wh == wh2) {
                    throw new LC3BugError(
                        "The worker thread was interrupted unexpectedly."
                    );
                } else if (wh == wh3) {
                    //  Not able to send QUIT here, terminate the thread 
                    //  forcibly.
                    if (!sync_worker_exit.isCompleted()) {
                        worker.terminate();
                    }

                    //  Go to CLOSING state.
                    state = STATE_CLOSING;
                } else {
                    throw new LC3BugError(
                        "Illegal wait handle."
                    );
                }
            } else if (state == STATE_WORKER_RESET) {
                //  Send RESET message.
                let msgsnd = new SharedArrayBuffer(4);
                let msgsndview = Buffer.from(msgsnd, 0, msgsnd.byteLength);
                msgsndview.writeUInt8(MSGTYPE_RESET, 0);
                let msgsndflag = 0;
                if (useEncoder) {
                    msgsndflag |= MSGRST_FLAG_USE_ENCODER;
                }
                if (useDecoder) {
                    msgsndflag |= MSGRST_FLAG_USE_DECODER;
                }
                msgsndview.writeUInt8((msgsndflag >>> 0), 1);
                msgsndview.writeUInt16BE(((
                    (index_Fs) | 
                    (index_Nms << 3)
                ) >>> 0), 2);
                if (!sync_worker_exit.isCompleted()) {
                    worker.postMessage(msgsnd);
                }

                //  Go to RESET_WAIT state.
                state = STATE_WORKER_RESET_WAIT;
            } else if (state == STATE_WORKER_RESET_WAIT) {
                //  Wait for signals.
                let wh1 = msgrcvqueue_sem.acquire();
                let wh2 = sync_worker_exit.wait();
                let wh3 = sync_cmd_close.wait();
                let wh = await Promise.race([
                    wh1.handle, 
                    wh2.handle, 
                    wh3.handle
                ]);
                wh1.cancel();
                wh2.cancel();
                wh3.cancel();

                //  Handle the signal.
                if (wh != wh1) {
                    if (wh1.status != LwSemaphore.WaitHandle.STATUS_CANCELLED) {
                        msgrcvqueue_sem.release();
                    }
                }
                if (wh == wh1) {
                    //  Try parse RESET reply message.
                    let msgrcv = msgrcvqueue.shift();
                    if (msgrcv.byteLength < 4) {
                        throw new LC3BugError(
                            "Bad RESET reply (truncated)."
                        );
                    }
                    let msgrcvview = Buffer.from(msgrcv, 0, msgrcv.byteLength);
                    let msgrcvtype = msgrcvview.readUInt8(0);
                    if ((msgrcvtype & MSGNAK_MASK) != 0) {
                        throw new LC3BugError(
                            "Bad RESET reply (NAKed)."
                        );
                    }

                    //  Go to STANDBY state.
                    state = STATE_WORKER_STANDBY;
                } else if (wh == wh2) {
                    throw new LC3BugError(
                        "The worker thread was interrupted unexpectedly."
                    );
                } else if (wh == wh3) {
                    //  Not able to send QUIT here, terminate the thread 
                    //  forcibly.
                    if (!sync_worker_exit.isCompleted()) {
                        worker.terminate();
                    }

                    //  Go to CLOSING state.
                    state = STATE_CLOSING;
                } else {
                    throw new LC3BugError(
                        "Illegal wait handle."
                    );
                }
            } else if (state == STATE_WORKER_STANDBY) {
                //  Wait for signals.
                let wh1 = sync_worker_exit.wait();
                let wh2 = sync_cmd_close.wait();
                let wh3 = queryqueue_sem.acquire();
                let wh = await Promise.race([
                    wh1.handle, 
                    wh2.handle, 
                    wh3.handle
                ]);
                wh1.cancel();
                wh2.cancel();
                wh3.cancel();

                //  Handle the signal.
                if (wh != wh3) {
                    if (wh3.status != LwSemaphore.WaitHandle.STATUS_CANCELLED) {
                        queryqueue_sem.release();
                    }
                }
                if (wh == wh1) {
                    throw new LC3BugError(
                        "The worker thread was interrupted unexpectly."
                    );
                } else if (wh == wh2) {
                    //  Send QUIT message.
                    let msgsnd = new SharedArrayBuffer(4);
                    let msgsndview = Buffer.from(msgsnd, 0, msgsnd.byteLength);
                    msgsndview.writeUInt8(MSGTYPE_QUIT, 0);
                    msgsndview.writeUInt8(0, 1);
                    msgsndview.writeUInt16BE(0, 2);
                    if (!sync_worker_exit.isCompleted()) {
                        worker.postMessage(msgsnd);
                    }

                    //  Go to CLOSING state.
                    state = STATE_CLOSING;
                } else if (wh == wh3) {
                    //  Go to WORKER_QUERY state.
                    state = STATE_WORKER_QUERY;
                } else {
                    throw new LC3BugError(
                        "Illegal wait handle."
                    );
                }
            } else if (state == STATE_WORKER_QUERY) {
                let queryinfo = queryqueue.shift();
                querycompletor = queryinfo[1];
                if (!sync_worker_exit.isCompleted()) {
                    worker.postMessage(queryinfo[0]);
                }
                state = STATE_WORKER_QUERY_WAIT;
            } else if (state == STATE_WORKER_QUERY_WAIT) {
                //  Wait for signals.
                let wh1 = msgrcvqueue_sem.acquire();
                let wh2 = sync_worker_exit.wait();
                let wh3 = sync_cmd_close.wait();
                let wh = await Promise.race([
                    wh1.handle, 
                    wh2.handle, 
                    wh3.handle
                ]);
                wh1.cancel();
                wh2.cancel();
                wh3.cancel();

                //  Handle the signal.
                if (wh != wh1) {
                    if (wh1.status != LwSemaphore.WaitHandle.STATUS_CANCELLED) {
                        msgrcvqueue_sem.release();
                    }
                }
                if (wh == wh1) {
                    //  Complete the query.
                    querycompletor.complete(msgrcvqueue.shift());

                    //  Go to STANDBY state.
                    state = STATE_WORKER_STANDBY;
                } else if (wh == wh2) {
                    throw new LC3BugError(
                        "The worker thread was interrupted unexpectedly."
                    );
                } else if (wh == wh3) {
                    //  Not able to send QUIT here, terminate the thread 
                    //  forcibly.
                    if (!sync_worker_exit.isCompleted()) {
                        worker.terminate();
                    }

                    //  Go to CLOSING state.
                    state = STATE_CLOSING;
                } else {
                    throw new LC3BugError(
                        "Illegal wait handle."
                    );
                }
            } else if (state == STATE_CLOSING) {
                if (worker !== null && !sync_worker_exit.isCompleted()) {
                    await (sync_worker_exit.wait()).handle;
                }
                state = STATE_CLOSED;
            } else if (state == STATE_CLOSED) {
                break;
            } else {
                throw new LC3BugError(
                    "Illegal state."
                );
            }
        }

        //  Rethrow if worker error occurred.
        if (sync_worker_err.isCompleted()) {
            throw sync_worker_err.getCompletionValue();
        }
    })().catch(function(error) {
        //  Emit "error" event.
        self.emit("error", error);
    }).finally(function() {
        //  Emit "close" event.
        self.emit("close");

        //  Resource cleanup (for accident coroutine exits).
        if (worker !== null && !sync_worker_exit.isCompleted()) {
            worker.unref();
            worker.terminate();
        }

        //  Assert the closed synchronizer.
        sync_closed.complete();
    });
}

//
//  Inheritances.
//
Util.inherits(LC3Worker, EventEmitter);

//  Export public APIs.
module.exports = {
    "LC3Worker": LC3Worker
};