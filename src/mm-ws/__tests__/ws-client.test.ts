import * as ws from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import { WsClient } from '../WsClient';
import isEqual from 'lodash-es/isEqual';
import * as dotenv from 'dotenv';
dotenv.config();

const WSS_PORT = parseInt(process.env.MM_TS_TESTING_WSS_PORT, 10);
const WS_URL = `ws://localhost:${WSS_PORT}`;

let wss: ws.Server;

// aync closer helper... hm...
let _closeWssIfTimer = 0;
const closeWssIf = (_wss: ws.Server, condition: () => boolean, done) => {
    if (!_wss) {
        done();
    } else if (condition()) {
        _wss.close(() => {
            _wss = void 0;
            done();
        });
    } else {
        _closeWssIfTimer && clearTimeout(_closeWssIfTimer);
        _closeWssIfTimer = setTimeout(
            () => closeWssIf(_wss, condition, done),
            10
        ) as any;
    }
};

let _doneIfTimer = 0;
const doneIf = (condition: () => boolean, done) => {
    if (condition()) {
        done();
    } else {
        _doneIfTimer && clearTimeout(_doneIfTimer);
        _doneIfTimer = setTimeout(() => doneIf(condition, done), 10) as any;
    }
};

// because of how jest handles settimeouts... I'm using filesystem to temporarily
// save values
const _file = path.resolve(__dirname, './tmp/output.txt');
const fileWrite = (data) => fs.writeFileSync(_file, data);
const fileRead = () =>
    fs.existsSync(_file) ? fs.readFileSync(_file).toString() : null;
const fileDelete = () => fs.existsSync(_file) && fs.unlinkSync(_file);

beforeEach(async (done) => {
    fileDelete();
    wss ? wss.close(done) : done();
});

afterEach(async (done) => {
    wss ? wss.close(done) : done();
});

test('multiple same event handlers on one client', async (done) => {
    let counter = 0;

    wss = new ws.Server({ port: WSS_PORT }, () => {
        const wsc = new WsClient(WS_URL);
        wsc.on(WsClient.EVENT_OPEN, (e) => {
            expect(wss.clients.size).toEqual(1);
            counter++;
            // wss.close(done);
        });
        wsc.on(WsClient.EVENT_OPEN, (e) => counter++);
        wsc.on(WsClient.EVENT_OPEN, (e) => counter++);
    });

    closeWssIf(wss, () => counter === 3, done);
});

test('server to client message works', async (done) => {
    let msg = '';

    wss = new ws.Server({ port: WSS_PORT }, () => {
        const wsc = new WsClient(WS_URL);

        wsc.on(WsClient.EVENT_OPEN, () => {
            ['a', 'b', 'c'].forEach((text) => {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(text);
                    }
                });
            });
        });

        wsc.on(WsClient.EVENT_MESSAGE, (data) => msg += data);
    });

    closeWssIf(wss, () => msg === 'abc', done);
});

test.only('client to server message works', async (done) => {
    wss = new ws.Server({ port: WSS_PORT }, () => {
        const wsc = new WsClient(WS_URL, { debug: false });
        wsc.send('heyho');
        wss.on('connection', (client) => client.on('message', fileWrite));
    });
    closeWssIf(wss, () => fileRead() === 'heyho', done);
});

test('onclose + onerror is emitted on unsuccessfull init', async (done) => {
    let close = 0;
    let error = 0;

    // let's test logger features here as well
    let log = {};
    const logger = (...args) => {
        // console.log(...args);
        log[args[1]] = args;
    };

    // tu server nebezi...
    const wsc = new WsClient(WS_URL, { debug: true, logger });
    wsc.on(WsClient.EVENT_CLOSE, (e) => close++);
    wsc.on(WsClient.EVENT_ERROR, (e) => error++);

    //
    doneIf(() => {
        if (close === 1 && error === 1) {
            // testujeme bazalne logger
            if (!Object.keys(log).length) {
                throw new Error('Expecting not empty log');
            }

            let willReconnectFlag = false;
            for (let k in log) {
                if (/reconnect/i.test(log[k].join())) {
                    willReconnectFlag = true;
                }
            }
            if (!willReconnectFlag) {
                throw new Error('Expecting reconnect info in log');
            }

            return true;
        }
        return false;
    }, done);
});

test.skip('true reconnect works', (done) => {
    done();
});
