"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const http = require("http");
const mm_string_1 = require("../mm-string");
const WsMessage_1 = require("./WsMessage");
//
const _wsDebug = (msg) => console.log(msg);
const isOpen = (client) => client.readyState === WebSocket.OPEN;
const _notAllowedHostWarn = new Map();
/**
 * @param {"http".Server | number} serverOrPort
 * @param {WssInitOptions} options
 * @returns {WebSocket.Server}
 */
exports.createWss = (serverOrPort, options) => {
    options = Object.assign(
    // merge defaults with provided
    { autoReconnectInterval: 5000 }, options || {});
    const args = {};
    if (serverOrPort instanceof http.Server) {
        args.server = serverOrPort;
    }
    else {
        args.port = serverOrPort;
    }
    args.path = args.path === void 0 ? '/ws/' : args.path; // hard default
    const wss = new WebSocket.Server(args);
    // debug
    if (args.port) {
        console.log(`WebSocket.Server listening on ${args.port}...`);
    }
    else {
        console.log(`WebSocket.Server listening on http.Server's port...`);
    }
    //
    wss.on('connection', (ws, req) => {
        // console.log(req.headers, req.connection.remoteAddress);
        if (options.originWhitelist && options.originWhitelist.length) {
            const origin = req.headers.origin;
            if (origin && -1 === options.originWhitelist.indexOf(origin)) {
                if (!_notAllowedHostWarn.has(origin)) {
                    _notAllowedHostWarn.set(origin, true);
                    console.error(`Origin ${origin} not allowed. Ignoring...`);
                }
                ws.close();
                return;
            }
        }
        // initialize client
        // 1.
        ws.cid = mm_string_1.mmGetRandomStr({ length: 16 /*, prefix: 'ws_' */ });
        // 2.
        ws.rooms = new Map();
        // 3.
        if (req.headers['x-forwarded-for']) {
            ws.ip = req.headers['x-forwarded-for'].toString();
        }
        else if (req.connection.remoteAddress) {
            ws.ip = req.connection.remoteAddress;
        }
        //
        // _wsDebug(`Client ${ws.cid} connected from ${ws.ip}...`);
        isOpen(ws) &&
            ws.send(WsMessage_1.WsMessage.stringify({
                payload: ws.cid,
                type: WsMessage_1.WsMessage.TYPE_CONNECTION_ESTABLISHED,
            }), (err) => {
                if (err) {
                    console.error(err);
                }
            });
        // ping/pong PART 1
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        // main message handler
        ws.on('message', (data) => {
            const msg = WsMessage_1.WsMessage.factory(data);
            // join?
            if (msg.isJoin) {
                ws.rooms.set(msg.room, true);
                wss.emit(WsMessage_1.WsMessage.TYPE_JOIN_ROOM, msg, ws, req);
                wss.emit(`all`, msg, ws, req);
            }
            // leave?
            else if (msg.isLeave) {
                let res = ws.rooms.delete(msg.room);
                wss.emit(WsMessage_1.WsMessage.TYPE_LEAVE_ROOM, msg, ws, req, res);
                wss.emit(`all`, msg, ws, req, res);
            }
            // broadcast?
            else if (msg.isBroadcast) {
                exports.wsSend(wss, msg, ws);
                wss.emit(WsMessage_1.WsMessage.TYPE_BROADCAST, msg, ws, req);
                wss.emit(`all`, msg, ws, req);
            }
            // heartbeat?
            else if (msg.isHeartbeat) {
                wss.emit(WsMessage_1.WsMessage.TYPE_HEARTBEAT, msg, ws, req);
                wss.emit(`all`, msg, ws, req); // hm... chceme heartbeat aj medzi all?
            }
            else if (msg.isReconnect) {
                wss.emit(WsMessage_1.WsMessage.TYPE_RECONNECT, msg, ws, req);
                wss.emit(`all`, msg, ws, req);
            }
            // `default` or unknown type...
            else {
                wss.emit(`message`, msg, ws, req);
                wss.emit(`all`, msg, ws, req);
            }
            // always echo back (use the original message id as payload), so we can
            // implement `onSuccess` callbacks
            // UNLESS msg.expectResponse is true - in that case, leave that
            // responsibility on the handler
            if (!msg.expectsResponse) {
                isOpen(ws) &&
                    ws.send(WsMessage_1.WsMessage.stringify({
                        payload: { id: msg.id },
                        type: WsMessage_1.WsMessage.TYPE_ECHO,
                    }));
            }
        });
        // https://github.com/websockets/ws/issues/1256
        ws.on('error', (e) => {
            // Ignore network errors like `ECONNRESET`, `EPIPE`, etc.
            if (e.errno) {
                return;
            }
            console.error(`ws: ${e.toString()}`);
        });
        ws.on('close', () => {
            ws.isAlive = false; // treba toto?
            // _wsDebug(`Client ${ws.cid} disconnected...`);
        });
    });
    // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
    // ping/pong PART 2
    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (isOpen(ws)) {
                // adding...
                if (!ws.isAlive) {
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping(null, void 0);
            }
        });
    }, options.autoReconnectInterval);
    // hm...
    wss.on('error', (e) => {
        console.log(`Websocket.Server ${e.toString()}`);
    });
    return wss;
};
/*********************************************************************************
 * helpers
 ********************************************************************************/
/**
 * @param {WebSocket.Server} wss
 * @param {WsMessage} msg
 * @param {WebSocket} ws
 */
exports.wsSend = (wss, msg, ws = null) => {
    // empty room `` is considered "force to all"... subject of change...
    let forceToAllRooms = msg.room === '';
    // _wsDebug(`BROADCAST to ${forceToAllRooms ? 'all' : msg.room}`);
    wss.clients.forEach((client) => {
        if (client !== ws &&
            isOpen(client) &&
            // target by room id (to all in the room) or client id (directly, privately to one client)
            // or to all if room is '' (empty)
            (forceToAllRooms ||
                client.cid === msg.room ||
                client.rooms.has(msg.room))) {
            client.send(msg.stringify());
        }
    });
};
// sugar
exports.wsSendPayloadToRoom = (wss, payload, room, type = null) => {
    if (!Array.isArray(room)) {
        room = [room];
    }
    room.forEach((r) => exports.wsSend(wss, WsMessage_1.WsMessage.factory({ payload, room: r, type })));
};
// sugar
exports.wsSendPayloadToAll = (wss, payload, type = null) => {
    return exports.wsSend(wss, WsMessage_1.WsMessage.factory({ payload, room: '', type }));
};
// sugar
exports.wsSendJsonApiToRoom = (wss, payload, room) => {
    return exports.wsSendPayloadToRoom(wss, JSON.stringify(payload), room, WsMessage_1.WsMessage.TYPE_JSONAPI);
};
// sugar
exports.wsSendJsonApiUpdateToRoom = (wss, payload, room) => {
    return exports.wsSendPayloadToRoom(wss, JSON.stringify(payload), room, WsMessage_1.WsMessage.TYPE_JSONAPI_UPDATE);
};
// sugar
exports.wsSendJsonApiDeleteToRoom = (wss, payload, room) => {
    return exports.wsSendPayloadToRoom(wss, JSON.stringify(payload), room, WsMessage_1.WsMessage.TYPE_JSONAPI_DELETE);
};
