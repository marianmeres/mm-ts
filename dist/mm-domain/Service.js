"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TableDao_1 = require("../mm-util/TableDao");
exports.assertWhereNotString = (where) => {
    if (typeof where === 'string') {
        throw new Error('`where` as string is not supported at model level');
    }
};
/**
 * takes care of common usual use-cases... it's ok to overwrite if special case
 * is needed, and is also OK not to be tied up with the usual cases...
 */
class Service {
    constructor(_db) {
        this._db = _db;
    }
    set db(db) {
        this._db = db;
    }
    get db() {
        if (!this._db) {
            throw new Error('SqlUtil instance not provided');
        }
        return this._db;
    }
    get dao() {
        return new TableDao_1.TableDao(this._tableName, Object.assign({}, { db: this.db }, this._daoOptions || {}));
    }
    /**
     * low level fetcher - to be overridden for custom needs
     * @param pk
     * @param assert
     * @param debug
     * @private
     */
    _fetchRow(pk, assert, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dao.fetchRow(pk, assert, debug);
        });
    }
    /**
     * @param id
     * @param {boolean} assert
     * @param debug
     * @returns {Promise<TModel extends BaseModel>}
     */
    find(id, assert = true, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            let pk = { id };
            if (this._isDeletedColName) {
                pk = Object.assign(Object.assign({}, pk), { [this._isDeletedColName]: 0 });
            }
            const row = yield this._fetchRow(pk, assert, debug);
            return row ? new this._modelCtor(row) : null;
        });
    }
    /**
     * @param where
     * @param {boolean} assert
     * @param debug
     * @returns {Promise<TModel extends BaseModel>}
     */
    findWhere(where, assert = false, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            exports.assertWhereNotString(where);
            if (this._isDeletedColName) {
                where = Object.assign(Object.assign({}, where), { [this._isDeletedColName]: 0 });
            }
            const row = yield this._fetchRow(where, assert, debug);
            return row ? new this._modelCtor(row) : null;
        });
    }
    /**
     * @param where
     * @param options
     * @param debug
     * @returns {Promise<TModel[]>}
     */
    fetchAll(where, options, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            exports.assertWhereNotString(where);
            if (this._isDeletedColName) {
                where = Object.assign(Object.assign({}, where), { [this._isDeletedColName]: 0 });
            }
            let rows = yield this.dao.fetchAll(where, options, debug);
            return rows.map((row) => new this._modelCtor(row));
        });
    }
    /**
     * @param where
     * @returns {Promise<number>}
     */
    fetchCount(where) {
        return __awaiter(this, void 0, void 0, function* () {
            exports.assertWhereNotString(where);
            return this.dao.fetchCount(where);
        });
    }
    /**
     * @param {TModel} model
     * @param debug
     * @returns {Promise<TModel extends BaseModel>}
     */
    save(model, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!model.isDirty()) {
                return model;
            }
            let data = yield this.dao.save(model.toJSONSerialized(), debug);
            model.populate(data);
            return model;
        });
    }
    /**
     * @param id
     * @param {boolean} hard
     * @param debug
     * @returns {Promise<any>}
     */
    delete(id, hard = false, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            if (hard || !this._isDeletedColName) {
                return this.dao.delete(id, debug);
            }
            else {
                let db = this.dao.db;
                return this.dao.query(`
                    UPDATE ${db.qi(this.dao.tableName)} 
                    SET ${db.qi(this._isDeletedColName)} = 1 
                    WHERE id = $1
                `
                    .replace(/\s\s+/g, ' ')
                    .trim(), [id], debug);
            }
        });
    }
}
exports.Service = Service;
