"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mm_string_1 = require("../mm-string");
/**
 * Simple value object with factory... nothing fancy
 */
class WsMessage {
    constructor(_payload, _type = null, // join / leave
    _room = null, _id = null, expectsResponse = void 0) {
        this._payload = _payload;
        this._type = _type;
        this._room = _room;
        this._id = _id;
        this.expectsResponse = expectsResponse;
        if (!this._id) {
            this._id = mm_string_1.mmUid();
        }
    }
    static factory(data) {
        let parsed;
        if (typeof data === 'string') {
            try {
                parsed = JSON.parse(data);
            }
            catch (e) {
                return new WsMessage(data.toString());
            }
        }
        else {
            parsed = data;
        }
        let { payload, type, room, id, expectsResponse } = parsed;
        // parsed ok, but still if all are undefined, consider it as unknown
        if (![payload, type, room, id, expectsResponse].some((v) => v !== void 0)) {
            return new WsMessage(data.toString());
        }
        return new WsMessage(payload, type, room, id, expectsResponse);
    }
    // type sugar
    static stringify(data) {
        if (!data.id) {
            data.id = mm_string_1.mmUid();
        }
        return JSON.stringify(data);
    }
    stringify() {
        return JSON.stringify(this.toJSON());
    }
    get id() {
        return this._id;
    }
    get payload() {
        return this._payload;
    }
    get parsedPayload() {
        try {
            return JSON.parse(this.payload);
        }
        catch (e) {
            return {};
        }
    }
    get type() {
        return this._type;
    }
    get room() {
        return this._room ? `${this._room}` : '';
    }
    get isBroadcast() {
        return WsMessage.TYPE_BROADCAST === this.type;
    }
    get isJoin() {
        return WsMessage.TYPE_JOIN_ROOM === this.type;
    }
    get isLeave() {
        return WsMessage.TYPE_LEAVE_ROOM === this.type;
    }
    get isEcho() {
        return WsMessage.TYPE_ECHO === this.type;
    }
    get isReconnect() {
        return WsMessage.TYPE_RECONNECT === this.type;
    }
    get isHeartbeat() {
        return WsMessage.TYPE_HEARTBEAT === this.type;
    }
    get isConnectionEstablished() {
        return WsMessage.TYPE_CONNECTION_ESTABLISHED === this.type;
    }
    toJSON() {
        return {
            payload: this.payload,
            type: this.type,
            room: this.room,
            id: this.id,
            expectsResponse: this.expectsResponse ? true : void 0,
        };
    }
}
exports.WsMessage = WsMessage;
// "system" types
WsMessage.TYPE_JOIN_ROOM = 'JOIN';
WsMessage.TYPE_LEAVE_ROOM = 'LEAVE';
WsMessage.TYPE_BROADCAST = 'BROADCAST';
WsMessage.TYPE_ECHO = 'ECHO';
WsMessage.TYPE_HEARTBEAT = 'HEARTBEAT';
WsMessage.TYPE_RECONNECT = 'RECONNECT';
WsMessage.TYPE_CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED';
// "app" types... hm... (smells too narrow...)
WsMessage.TYPE_JSONAPI = 'JSONAPI';
WsMessage.TYPE_JSONAPI_UPDATE = 'JSONAPI_UPDATE';
WsMessage.TYPE_JSONAPI_DELETE = 'JSONAPI_DELETE';
