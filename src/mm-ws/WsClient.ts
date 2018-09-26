import * as EventEmitter from 'eventemitter3';
import { WsMessage, WsMessageData } from './WsMessage';

/**
 * inspired by:
 * https://github.com/stepchowfun/socket.js/blob/master/client/socket.js
 * https://github.com/pladaria/reconnecting-websocket/blob/master/reconnecting-websocket.ts
 */

const isFn = (v) => typeof v === 'function';

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
    // protected _queue: (WsMessageData | string)[] = []; // outgoing message queue
    protected _queue: Array<WsMessageData | string> = []; // outgoing message queue
    protected _reconnectTimer = 0;
    protected _retryCounter = 0;
    protected _retryLimit = 0;
    protected _nextDelay = 1000; // default, overide via options

    // "once" map of `onSuccess` handlers...
    protected static _pendingCallbacks = new Map();

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

        // tries to connect immediatelly
        this._connection = this._factoryConnection();
    }

    /**
     * @param args
     */
    log(...args) {
        if (this.debug && isFn(this.logger)) {
            this.logger('WsClient', new Date(), ...args);
        }
    }

    /**
     * idea is, that the native WebSocket instance shoult be considered low-level
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

        // default
        if (typeof next !== 'number') {
            this._nextDelay *= 1.25; // throttle factor
            next = this._nextDelay;
        }

        return next;
    }

    /**
     * sugar
     * @param cb
     */
    onOpen(cb: (e) => any) {
        this.on(WsClient.EVENT_OPEN, cb);
    }

    /**
     * sugar
     * @param cb
     */
    onClose(cb: (e) => any) {
        this.on(WsClient.EVENT_CLOSE, cb);
    }

    /**
     * sugar
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
