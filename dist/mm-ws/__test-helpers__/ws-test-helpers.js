// import * as WebSocket from 'ws';
// import * as dotenv from 'dotenv';
// import { WsClient } from '../WsClient';
// import { WsMessage } from '../WsMessage';
// import { AdvancedWebSocket } from '../wss';
// dotenv.config();
//
// const WSS_PORT = parseInt(process.env.MM_TS_TESTING_WSS_PORT, 10);
// export const WSS_TEST_URL = `ws://localhost:${WSS_PORT}`;
//
// declare const global: any;
// // let wss: WebSocket.Server;
//
// export const factoryTestWss = async (_wss): Promise<WebSocket.Server> => {
//     await maybeCloseWss(_wss);
//
//     return new Promise((resolve, reject) => {
//         _wss = new WebSocket.Server({ port: WSS_PORT }, () => {
//             resolve(_wss);
//         });
//         _wss.on('error', reject);
//     }) as any;
//
//     // wss.on('all', (msg: WsMessage, ws: AdvancedWebSocket, req) => {
//     //     console.log(
//     //         `${ws.cid} / ${msg.type} / ${msg.room} / ${msg.payload}`
//     //     );
//     // });
//     // wss.on('connection', (ws) => {
//     //     ws.on('message', (data: string) => {
//     //         console.log('received: %s', data);
//     //     });
//     // });
//     // return wss;
// };
//
// export const maybeCloseWss = async (_wss?: WebSocket.Server) => {
//     if (!_wss) {
//         return void 0;
//     }
//     return new Promise((resolve, reject) => {
//         _wss.removeAllListeners();
//         _wss.close((e) => {
//             if (e) {
//                 return reject(e);
//             }
//             return resolve();
//         });
//     });
// };
//
// export const createTestWsc = (): WsClient => {
//     const wsc = new WsClient(WSS_TEST_URL);
//     // wsc.on('error')
//     return wsc;
// };
//
// // const wss = new WebSocket.Server({ port: 8080 });
// //
// // wss.on('connection', (ws) => {
// //     ws.on('message', (message) => {
// //         console.log('received: %s', message);
// //     });
// //
// //     ws.send('something');
// // });
