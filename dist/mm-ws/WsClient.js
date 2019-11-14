"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("eventemitter3");
const WsMessage_1 = require("./WsMessage");
/**
 * inspired by:
 * https://github.com/stepchowfun/socket.js/blob/master/client/socket.js
 * https://github.com/pladaria/reconnecting-websocket/blob/master/reconnecting-websocket.ts
 */
const isFn = (v) => typeof v === 'function';
const isWebSocket = (w) => typeof w === 'function' && w.CLOSING === 2;
class WsClient extends EventEmitter {
    /**
     * @param _url
     * @param options
     */
    constructor(_url, options) {
        super();
        this._url = _url;
        this.options = options;
        this.logger = console.log;
        this.debug = false;
        this.reconnectDataProvider = null;
        this._wasDisconnected = false;
        this._queue = []; // outgoing message queue
        this._reconnectTimer = 0;
        this._retryCounter = 0;
        this._retryLimit = 0;
        this._nextDelay = 1000; // default, overide via options
        //
        this._joinedRooms = new Map();
        // internal flag to avoid rejoins if not needed (connection was not broken)
        this._rejoinNeeded = false;
        this.options = this.options || {};
        // options mapped to mutable public props
        ['logger', 'debug', 'reconnectDataProvider'].forEach((k) => {
            if (this.options[k] !== void 0) {
                this[k] = this.options[k];
            }
        });
        // options mapped to private props
        if (this.options.retryLimit !== void 0) {
            this._retryLimit = parseInt(`${this.options.retryLimit}`, 10);
            if (isNaN(this._retryLimit)) {
                this._retryLimit = 0;
            }
        }
        // not sure if these bindings are really needed...
        this._onopen = this._onopen.bind(this);
        this._onclose = this._onclose.bind(this);
        this._onerror = this._onerror.bind(this);
        this._onmessage = this._onmessage.bind(this);
        this._factoryConnection = this._factoryConnection.bind(this);
        // feature!
        this.on(WsClient.EVENT_RECONNECT_OPEN, this.rejoinAllRooms.bind(this));
        // try to connect immediatelly
        this._connection = this._factoryConnection();
    }
    /**
     * will be set on server's first successfull TYPE_CONNECTION_ESTABLISHED message
     */
    get cid() {
        // if (!this._cid) { this._cid = mmUid(); } // do not auto generate
        return this._cid;
    }
    /**
     * @param args
     */
    log(...args) {
        if (this.debug && isFn(this.logger)) {
            this.logger(...args);
        }
    }
    /**
     * idea is, that the 'native' WebSocket instance shoult be considered low-level
     * and not really be used directly unless needed...
     */
    get connection() {
        return this._connection;
    }
    /**
     *
     */
    clearQueue() {
        if (this._queue.length) {
            return this._queue.splice(0, this._queue.length).length;
        }
        return 0;
    }
    /**
     * @private
     */
    _factoryConnection() {
        const conn = new WebSocket(this._url);
        conn.onopen = this._onopen;
        conn.onclose = this._onclose;
        conn.onerror = this._onerror;
        conn.onmessage = this._onmessage;
        return conn;
    }
    /**
     * @param e
     * @private
     */
    _onopen(e) {
        let reconnect = false;
        this._nextDelay = 1000; // reset
        // if we are reconnecting...
        if (this._wasDisconnected) {
            this._wasDisconnected = false;
            reconnect = true;
            // is this a good idea? (can cause significant server load issues under
            // certain circumstances)
            this.clearQueue();
            // notify the application and gather any context to send to the server
            let reconnectData = isFn(this.reconnectDataProvider)
                ? this.reconnectDataProvider()
                : void 0;
            // 'reconnect' message info to server
            this._queue.push({
                type: WsMessage_1.WsMessage.TYPE_RECONNECT,
                payload: reconnectData,
            });
        }
        this.emit(WsClient.EVENT_OPEN, e);
        reconnect && this.emit(WsClient.EVENT_RECONNECT_OPEN, e);
        this._flushQueue();
    }
    /**
     * NOTE: every close is in this package considered as 'not clean' (network error etc...)
     * @param e
     * @private
     */
    _onclose(e) {
        this.emit(WsClient.EVENT_CLOSE, e);
        this._wasDisconnected = true;
        this._rejoinNeeded = true;
        // just in case... hm...
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
        }
        let doRetry;
        // 0 -> no limit
        if (this._retryLimit === 0) {
            doRetry = true;
        }
        // negative -> no retry
        else if (this._retryLimit < 0) {
            doRetry = false;
        }
        // positive -> maybe retry (respect the limit)
        else {
            doRetry = this._retryLimit >= this._retryCounter++;
        }
        if (doRetry) {
            let nextDelay = this._getReconnectDelay();
            this.emit(WsClient.EVENT_RECONNECT_SCHEDULING, nextDelay);
            this._reconnectTimer = setTimeout(() => {
                this.emit(WsClient.EVENT_RECONNECTING);
                this._connection = this._factoryConnection();
                this._reconnectTimer = 0;
            }, nextDelay);
        }
    }
    /**
     * @param e
     * @private
     */
    _onerror(e) {
        this.emit(WsClient.EVENT_ERROR, e);
    }
    /**
     * @param e
     * @private
     */
    _onmessage(e) {
        //
        const m = WsMessage_1.WsMessage.factory(e.data);
        // FEATURE - server echos back id, so we can implement `onSuccess`
        if (m.isEcho &&
            m.payload &&
            m.payload.id &&
            WsClient._pendingCallbacks.has(m.payload.id)) {
            // call `onSuccess` handler with response (if provided)
            WsClient._pendingCallbacks.get(m.payload.id)(m.payload.response);
            WsClient._pendingCallbacks.delete(m.payload.id);
        }
        //
        else if (m.isConnectionEstablished) {
            this._cid = m.payload; // save client id... might be usefull maybe
        }
        this.emit(WsClient.EVENT_MESSAGE, e.data);
    }
    /**
     * @param event
     * @param args
     */
    emit(event, ...args) {
        this.log(event, args);
        // maybe emit wilcard here as well?
        return super.emit(event, ...args);
    }
    /**
     * @param msg
     * @param onSuccess
     */
    send(msg, onSuccess) {
        if (isFn(onSuccess)) {
            // IMPORTANT: if our `onSuccess` contains arguments, let's consider it
            // as request-response kind of message and signal to server that we
            // are expecting direct response (in the form of ECHO message with
            // `response` key in the payload)
            // NOTE: applicable only on WsMessage
            if (msg instanceof WsMessage_1.WsMessage) {
                msg.expectsResponse = onSuccess.length > 0;
            }
            try {
                let id = msg instanceof WsMessage_1.WsMessage ? msg.id : JSON.parse(msg).id;
                if (id) {
                    WsClient._pendingCallbacks.set(id, onSuccess);
                }
                else {
                    this.log('warning', 'Missing message id, ignoring `onSuccess`.');
                }
            }
            catch (e) {
                this.log('warning', 'Unknown message format, ignoring `onSuccess`.', e.toString());
            }
        }
        this._queue.push(msg instanceof WsMessage_1.WsMessage ? msg.stringify() : msg);
        this._flushQueue();
    }
    /**
     * @private
     */
    _flushQueue() {
        // note: it might be reasonable (but risky) to inspect the queue here
        // before actual send to remove dupes (or consider other heuristics...)
        if (this._queue.length && this.isOpen()) {
            for (let i = 0; i < this._queue.length; i++) {
                let msg = this._queue[i];
                if (typeof msg !== 'string') {
                    msg = WsMessage_1.WsMessage.stringify(msg);
                }
                // no-op for undefined messages
                if (msg !== void 0) {
                    this._connection.send(msg);
                    this.emit(WsClient.EVENT_SEND, msg);
                }
            }
            this.clearQueue();
        }
    }
    /**
     * @private
     */
    _getReconnectDelay() {
        let next;
        // providing custom option has priority...
        const { delay } = this.options;
        if (delay) {
            next = isFn(delay) ? delay(this._retryLimit) : delay;
        }
        // default: throttle each repeat, but not more than 1 minute
        if (typeof next !== 'number') {
            this._nextDelay *= 1.25; // throttle factor
            this._nextDelay = Math.min(this._nextDelay, 60000);
            next = this._nextDelay;
        }
        return next;
    }
    /**
     * @param isJoin
     * @param room
     * @param cb
     * @private
     */
    _roomAction(isJoin, room, cb) {
        let doRoomAction = true;
        // if we're about to do the same roomAction without previous interruption
        // we may safely skip to save potential server overhead...
        if (!this._rejoinNeeded &&
            ((isJoin && this._joinedRooms.has(room)) ||
                (!isJoin && !this._joinedRooms.has(room)))) {
            doRoomAction = false;
        }
        if (!doRoomAction) {
            this.log(`Skipping (unneeded) ${isJoin ? 'JOIN' : 'LEAVE'} for ${room}`);
        }
        // we don't need to check for `isOpen` because messages are queued in order
        // and will be flushed once connection becomes ready
        if (doRoomAction) {
            // && this.isOpen()
            this.send(WsMessage_1.WsMessage.stringify({
                type: isJoin
                    ? WsMessage_1.WsMessage.TYPE_JOIN_ROOM
                    : WsMessage_1.WsMessage.TYPE_LEAVE_ROOM,
                room,
            }), () => {
                // debug
                const isRejoin = isJoin && this._joinedRooms.has(room);
                const joinLabel = (isRejoin ? 'RE-' : '') + 'JOINED';
                this.log(`${this.cid} ${isJoin ? joinLabel : 'LEFT'} ROOM ${room}`);
                // save (!important)
                isJoin
                    ? this._joinedRooms.set(room, true)
                    : this._joinedRooms.delete(room);
                //
                isFn(cb) && cb(room, isJoin);
            });
        }
    }
    /**
     * @param room
     * @param cb
     */
    joinRoom(room, cb) {
        this.onReady(() => this._roomAction(true, room, cb));
    }
    isJoined(room) {
        return this._joinedRooms.has(room);
    }
    /**
     * @param room
     * @param cb
     */
    leaveRoom(room, cb) {
        this.onReady(() => this._roomAction(false, room, cb));
    }
    /**
     * Important on reconnect!
     * @param cb
     */
    rejoinAllRooms(cb) {
        if (this._rejoinNeeded) {
            this._joinedRooms.forEach((val, key) => this.joinRoom(key, cb));
            this._rejoinNeeded = false;
        }
    }
    /**
     *
     */
    get joinedRooms() {
        return this._joinedRooms;
    }
    /**
     * @param cb
     */
    onReady(cb) {
        if (!isFn(cb)) {
            return;
        }
        if (this.isOpen()) {
            cb();
        }
        else {
            this.on(WsClient.EVENT_OPEN, cb); // or `once` ?
        }
    }
    /**
     * only sugar below
     */
    /**
     *
     */
    isOpen() {
        return this.connection.readyState === WsClient.READYSTATE_OPEN;
    }
    /**
     * @param cb
     */
    onOpen(cb) {
        this.on(WsClient.EVENT_OPEN, cb);
    }
    /**
     * @param cb
     */
    onClose(cb) {
        this.on(WsClient.EVENT_CLOSE, cb);
    }
    /**
     * @param cb
     */
    onError(cb) {
        this.on(WsClient.EVENT_ERROR, cb);
    }
    /**
     * sugar
     * @param cb
     */
    onMessage(cb) {
        this.on(WsClient.EVENT_MESSAGE, cb);
    }
}
exports.WsClient = WsClient;
// WebSocket events
WsClient.EVENT_OPEN = 'open';
WsClient.EVENT_ERROR = 'error';
WsClient.EVENT_CLOSE = 'close';
WsClient.EVENT_MESSAGE = 'message';
// custom WsClient events...
WsClient.EVENT_RECONNECT_SCHEDULING = 'reconnect_scheduling';
WsClient.EVENT_RECONNECTING = 'reconnecting';
WsClient.EVENT_RECONNECT_OPEN = 'reconnect_open';
WsClient.EVENT_SEND = 'send';
// WebSocket readystate values
WsClient.READYSTATE_CONNECTING = 0;
WsClient.READYSTATE_OPEN = 1;
WsClient.READYSTATE_CLOSING = 2;
WsClient.READYSTATE_CLOSED = 3;
// "once" map of `onSuccess` handlers...
WsClient._pendingCallbacks = new Map();
