import * as WebSocket from 'ws';
import * as http from 'http';
import { mmGetRandomStr } from '../mm-string';
import { WsMessage } from './WsMessage';
import { JSONApiEnvelope } from '../mm-util/mm-types';

// links/inspirations:
// https://github.com/websockets/ws
// https://github.com/JonnyFox/websocket-node-express/blob/master/server/src/server.ts
// https://github.com/maxleiko/ws-broadcast
// https://github.com/123game/rooms

//
export interface AdvancedWebSocket extends WebSocket {
    cid: string; // client id
    isAlive: boolean;
    ip: string;
    rooms: any; // Map of joined rooms
}

//
interface WssInitOptions {
    autoReconnectInterval?: number;
}

//
const _wsDebug = (msg) => console.log(msg);

/**
 * @param {"http".Server | number} serverOrPort
 * @param {WssInitOptions} options
 * @returns {WebSocket.Server}
 */
export const createWss = (
    serverOrPort: http.Server | number,
    options?: WssInitOptions
): WebSocket.Server => {
    options = Object.assign(
        // merge defaults with provided
        { autoReconnectInterval: 5000 },
        options || {}
    );

    const args: any = {};
    if (serverOrPort instanceof http.Server) {
        args.server = serverOrPort;
    } else {
        args.port = serverOrPort;
    }

    const wss = new WebSocket.Server(args);

    // debug
    if (args.port) {
        console.log(`WebSocket.Server listening on ${args.port}...`);
    } else {
        console.log(`WebSocket.Server listening on http.Server's port...`);
    }

    //
    wss.on('connection', (ws: AdvancedWebSocket, req) => {
        // initialize client
        // 1.
        ws.cid = mmGetRandomStr({ length: 16 /*, prefix: 'ws_' */ });
        // 2.
        ws.rooms = new Map();
        // 3.
        if (req.headers['x-forwarded-for']) {
            ws.ip = req.headers['x-forwarded-for'].toString();
        } else if (req.connection.remoteAddress) {
            ws.ip = req.connection.remoteAddress;
        }

        //
        _wsDebug(`Client ${ws.cid} connected from ${ws.ip}...`);
        ws.send(
            WsMessage.stringify({
                payload: ws.cid,
                type: WsMessage.TYPE_CONNECTION_ESTABLISHED,
            })
        );

        // ping/pong PART 1
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        // main message handler
        ws.on('message', (data: string) => {
            const msg: WsMessage = WsMessage.factory(data);

            // join?
            if (msg.isJoin) {
                ws.rooms.set(msg.room, true);
                wss.emit(`join`, msg, ws, req);
                wss.emit(`all`, msg, ws, req);
            }
            // leave?
            else if (msg.isLeave) {
                let res = ws.rooms.delete(msg.room);
                wss.emit(`leave`, msg, ws, req, res);
                wss.emit(`all`, msg, ws, req, res);
            }
            // broadcast?
            else if (msg.isBroadcast) {
                wsSend(wss, msg, ws);
                wss.emit(`broadcast`, msg, ws, req);
                wss.emit(`all`, msg, ws, req);
            }
            // `default` or unknown type...
            else {
                wss.emit(`message`, msg, ws, req);
                wss.emit(`all`, msg, ws, req);
            }

            // always echo back (use the original message id as payload), so we can
            // implement `onSuccess` callbacks
            ws.send(
                WsMessage.stringify({
                    payload: msg.id,
                    type: WsMessage.TYPE_ECHO,
                })
            );
        });

        // https://github.com/websockets/ws/issues/1256
        ws.on('error', (e) => {
            // Ignore network errors like `ECONNRESET`, `EPIPE`, etc.
            if ((e as any).errno) {
                return;
            }
            console.log(`WSS ERROR: ${e}`);
        });

        ws.on('close', () => {
            ws.isAlive = false; // treba toto?
            _wsDebug(`Client ${ws.cid} disconnected...`);
        });
    });

    // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
    // ping/pong PART 2
    setInterval(() => {
        wss.clients.forEach((ws: AdvancedWebSocket) => {
            if (!ws.isAlive) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping(null, void 0);
        });
    }, options.autoReconnectInterval);

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
export const wsSend = (
    wss: WebSocket.Server,
    msg: WsMessage,
    ws: WebSocket = null
) => {
    // empty room `` is considered "force to all"... subject of change...
    let forceToAllRooms = msg.room === '';
    // _wsDebug(`BROADCAST to ${forceToAllRooms ? 'all' : msg.room}`);
    wss.clients.forEach((client: AdvancedWebSocket) => {
        if (
            client !== ws &&
            client.readyState === WebSocket.OPEN &&
            // target by room id (to all in the room) or client id (directly, privately to one client)
            // or to all id room is '' (empty)
            (forceToAllRooms ||
                client.cid === msg.room ||
                client.rooms.has(msg.room))
        ) {
            client.send(msg.stringify());
        }
    });
};

// sugar
export const wsSendPayloadToRoom = (
    wss: WebSocket.Server,
    payload: string,
    room,
    type = null
) => {
    if (!Array.isArray(room)) {
        room = [room];
    }
    room.forEach((r) =>
        wsSend(wss, WsMessage.factory({ payload, room: r, type }))
    );
};

// sugar
export const wsSendPayloadToAll = (
    wss: WebSocket.Server,
    payload: string,
    type = null
) => {
    return wsSend(wss, WsMessage.factory({ payload, room: '', type }));
};

// sugar
export const wsSendJsonApiToRoom = (
    wss: WebSocket.Server,
    payload: JSONApiEnvelope,
    room
) => {
    return wsSendPayloadToRoom(
        wss,
        JSON.stringify(payload),
        room,
        WsMessage.TYPE_JSONAPI
    );
};
