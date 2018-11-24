"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModel_1 = require("../BaseModel");
const Service_1 = require("../Service");
class BaseFoo extends BaseModel_1.BaseModel {
    constructor() {
        super(...arguments);
        this.entityType = 'foo';
    }
    get label() {
        return this._get('label');
    }
    set label(v) {
        this._set('label', v);
    }
    get bar() {
        return 'baz';
    }
    get _defaults() {
        return BaseFoo.defaults();
    }
    static defaults() {
        return Object.assign({}, BaseModel_1.BaseModel.defaults(), {
            label: null,
        });
    }
}
exports.BaseFoo = BaseFoo;
// exposed factory
exports.fooService = (db) => new FooService(db);
class FooService extends Service_1.Service {
    constructor() {
        super(...arguments);
        this._tableName = 'foo';
        this._modelCtor = BaseFoo;
    }
}
