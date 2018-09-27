import * as EventEmitter from 'eventemitter3';
import { WsMessage, WsMessageData } from './WsMessage';
// import { mmUid } from '../mm-string';

/**
 * inspired by:
 * https://github.com/stepchowfun/socket.js/blob/master/client/socket.js
 * https://github.com/pladaria/reconnecting-websocket/blob/master/reconnecting-websocket.ts
 */

const isFn = (v: any) => typeof v === 'function';
const isWebSocket = (w: any) => typeof w === 'function' && w.CLOSING === 2;

export interface WsClientOptions {
    debug?: boolean;
    logger?: (...args) => any | null;
    reconnectDataProvider?: () => any | null;
    retryLimit?: number;
    // forced delay (priority over internal throthling mechanism) - nice for debugging
    delay?: number | ((retryCounter: number) => number);
}

export class WsClient extends EventEmitter {
    // WebSocket events
    static readonly EVENT_OPEN = 'open';
    static readonly EVENT_ERROR = 'error';
    static readonly EVENT_CLOSE = 'close';
    static readonly EVENT_MESSAGE = 'message';

    // custom WsClient events...
    static readonly EVENT_RECONNECT_SCHEDULING = 'reconnect_scheduling';
    static readonly EVENT_RECONNECTING = 'reconnecting';
    static readonly EVENT_RECONNECT_OPEN = 'reconnect_open';
    static readonly EVENT_SEND = 'send';

    // WebSocket readystate values
    static readonly READYSTATE_CONNECTING = 0;
    static readonly READYSTATE_OPEN = 1;
    static readonly READYSTATE_CLOSING = 2;
    static readonly READYSTATE_CLOSED = 3;

    logger = console.log;
    debug = false;
    reconnectDataProvider: (() => any) | null = null;

    protected _connection: WebSocket;
    protected _wasDisconnected = false;
    protected _queue: Array<WsMessageData | string> = []; // outgoing message queue
    protected _reconnectTimer = 0;
    protected _retryCounter = 0;
    protected _retryLimit = 0;
    protected _nextDelay = 1000; // default, overide via options

    // "once" map of `onSuccess` handlers...
    protected static _pendingCallbacks = new Map();

    // internal server assigned client id
    protected _cid;

    //
    protected _joinedRooms = new Map();

    /**
     * @param _url
     * @param options
     */
    constructor(protected _url: string, public readonly options?: WsClientOptions) {
        super();
        this.options = this.options || ({} as WsClientOptions);

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

        // I guess these bindings are not really needed...
        this._onopen = this._onopen.bind(this);
        this._onclose = this._onclose.bind(this);
        this._onerror = this._onerror.bind(this);
        this._onmessage = this._onmessage.bind(this);
        this._factoryConnection = this._factoryConnection.bind(this);

        // feature!
        this.on(WsClient.EVENT_RECONNECT_OPEN, this.rejoinAllRooms.bind(this));

        // tries to connect immediatelly
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
            this.logger('WsClient', (new Date()).toISOString(), ...args);
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
        const conn = new WebSocket(this._url) as any;
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

            // is this a good idea?
            this.clearQueue();

            // notify the application and gather any context to send to the server
            let reconnectData = isFn(this.reconnectDataProvider)
                ? this.reconnectDataProvider()
                : void 0;

            // 'reconnect' message info to server
            this._queue.push({
                type: WsMessage.TYPE_RECONNECT,
                payload: reconnectData,
            });
        }

        this.emit(WsClient.EVENT_OPEN, e);
        reconnect && this.emit(WsClient.EVENT_RECONNECT_OPEN, e);

        this._flushQueue();
    }

    /**
     * NOTE: every close is in this class considered as 'not clean' (network error etc...)
     * @param e
     * @private
     */
    _onclose(e) {
        // this.log('onclose', e);
        this.emit(WsClient.EVENT_CLOSE, e);

        this._wasDisconnected = true;

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
            }, nextDelay) as any;
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
        const m = WsMessage.factory(e.data);

        // feature - server echos back id, so we can implement `onSuccess`
        if (m.isEcho && WsClient._pendingCallbacks.has(m.payload)) {
            WsClient._pendingCallbacks.get(m.payload)(); // call `onSuccess` handler
            WsClient._pendingCallbacks.delete(m.payload);
        }
        //
        else if (m.isConnectionEstablished) {
            this._cid = m.payload; // ulozime si client id... mozno sa moze hodit
        }

        this.emit(WsClient.EVENT_MESSAGE, e.data);
    }

    /**
     * override to add wildcard support
     * @param event
     * @param args
     */
    emit(event, ...args) {
        this.log(event, args);
        return super.emit(event, ...args);
    }

    /**
     * @param data
     * @param onSuccess
     */
    send(data, onSuccess?: () => any) {
        if (isFn(onSuccess)) {
            try {
                let json = JSON.parse(data);
                if (json.id) {
                    WsClient._pendingCallbacks.set(json.id, onSuccess);
                } else {
                    this.log(
                        'warning',
                        'Missing message id, ignoring `onSuccess`.'
                    );
                }
            } catch (e) {
                this.log(
                    'warning',
                    'Unknown message format, ignoring `onSuccess`.'
                );
            }
        }
        this._queue.push(data);
        this._flushQueue();
    }

    /**
     * @private
     */
    _flushQueue() {
        if (
            this._queue.length &&
            this._connection.readyState === WsClient.READYSTATE_OPEN
        ) {
            for (let i = 0; i < this._queue.length; i++) {
                let msg = this._queue[i];
                if (typeof msg !== 'string') {
                    msg = WsMessage.stringify(msg);
                }

                this._connection.send(msg);
                this.emit(WsClient.EVENT_SEND, msg);
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
            next = isFn(delay) ? (delay as any)(this._retryLimit) : delay;
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
    protected _roomAction(isJoin: boolean, room, cb?) {
        if (this.isOpen()) {
            this.send(
                WsMessage.stringify({
                    type: isJoin
                        ? WsMessage.TYPE_JOIN_ROOM
                        : WsMessage.TYPE_LEAVE_ROOM,
                    room,
                }),
                () => {
                    // debug
                    const isRejoin = isJoin && this._joinedRooms.has(room);
                    const joinLabel = (isRejoin ? 'RE-' : '') + 'JOINED';
                    this.log(`${this.cid} ${isJoin ? joinLabel : 'LEFT'} ROOM ${room}`);

                    // save (!important)
                    isJoin
                        ? this._joinedRooms.set(room, true)
                        : this._joinedRooms.delete(room);

                    //
                    if (typeof cb === 'function') {
                        cb(room, isJoin);
                    }
                }
            );
        }
    }

    /**
     * @param room
     * @param cb
     */
    joinRoom(room, cb?) {
        this.onReady(() => this._roomAction(true, room, cb));
    }

    /**
     * @param room
     * @param cb
     */
    leaveRoom(room, cb?) {
        this.onReady(() => this._roomAction(false, room, cb));
    }

    /**
     * Important on reconnect!
     * @param cb
     */
    rejoinAllRooms(cb?) {
        this._joinedRooms.forEach((val, key) => this.joinRoom(key, cb));
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
        if (this.isOpen()) {
            cb();
        } else {
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
    onOpen(cb: (e) => any) {
        this.on(WsClient.EVENT_OPEN, cb);
    }

    /**
     * @param cb
     */
    onClose(cb: (e) => any) {
        this.on(WsClient.EVENT_CLOSE, cb);
    }

    /**
     * @param cb
     */
    onError(cb: (e) => any) {
        this.on(WsClient.EVENT_ERROR, cb);
    }

    /**
     * sugar
     * @param cb
     */
    onMessage(cb: (data) => any) {
        this.on(WsClient.EVENT_MESSAGE, cb);
    }
}
