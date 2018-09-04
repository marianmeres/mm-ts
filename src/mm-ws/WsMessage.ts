import { mmUid } from '../mm-string';

interface WsMessageData {
    id?: string;
    type?: string;
    room?: string;
    payload?: string;
}

export class WsMessage {
    // "system" types
    static readonly TYPE_JOIN_ROOM = 'join';
    static readonly TYPE_LEAVE_ROOM = 'leave';
    static readonly TYPE_BROADCAST = 'broadcast';
    static readonly TYPE_ECHO = 'echo';
    static readonly TYPE_HEARTBEAT = 'heartbeat';
    static readonly TYPE_CONNECTION_ESTABLISHED = 'connected';

    // "app" types
    static readonly TYPE_JSONAPI = 'jsonapi';

    constructor(
        protected _payload: string,
        protected _type: string = null, // join / leave
        protected _room: string | number = null,
        protected _id: string = null
    ) {
        if (!this._id) {
            this._id = mmUid();
        }
    }

    static factory(data: string | WsMessageData): WsMessage {
        let parsed;

        if (typeof data === 'string') {
            try {
                parsed = JSON.parse(data);
            } catch (e) {
                return new WsMessage(data.toString());
            }
        } else {
            parsed = data;
        }

        let { payload, type, room, id } = parsed;

        // parsed ok, but still if all are undefined, consider it as unknown
        if (![payload, type, room, id].some((v) => v !== void 0)) {
            return new WsMessage(data.toString());
        }

        return new WsMessage(payload, type, room, id);
    }

    // type sugar
    static stringify(data: WsMessageData) {
        if (!data.id) {
            data.id = mmUid();
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
        };
    }
}
