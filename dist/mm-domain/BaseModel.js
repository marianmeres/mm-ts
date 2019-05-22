"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mm_get_prototype_chain_1 = require("../mm-util/mm-get-prototype-chain");
const lodash_1 = require("lodash");
const isString = (v) => typeof v === 'string';
/**
 *
 */
class BaseModel {
    /**
     * @param data
     * @param {boolean} forceDirty
     */
    constructor(data, forceDirty = false) {
        /**
         * @type {Array}
         * @private
         */
        this._dirtyKeys = [];
        if (data && typeof data.toJSON === 'function') {
            data = data.toJSON();
        }
        this._data = Object.assign({}, this._defaults); // dolezity uvodny init...
        this.populate(Object.assign({}, this._defaults, data || {})); // populate via setters
        this.resetDirty();
        if (forceDirty) {
            this.markDirty();
        }
    }
    /**
     * @param data
     * @returns {BaseModel}
     */
    populate(data) {
        if (data) {
            // allow whitelisted only
            Object.keys(this._defaults).forEach((k) => {
                if (data[k] !== void 0) {
                    this.set(k, data[k]);
                }
            });
        }
        return this;
    }
    populateRelationships(rels) {
        //
    }
    // get id() {  throw new Error('Method id() must be overidden in extended models');}
    // get/set id je default
    get id() {
        return this._get('id');
    }
    set id(v) {
        this._set('id', v);
    }
    /**
     * @private
     */
    get _defaults() {
        // throw new Error('Method _defaults must be overidden in extended models');
        return BaseModel.defaults();
    }
    /**
     *
     */
    toJSON() {
        return Object.keys(this._data).reduce((out, k) => {
            out[k] = this.get(k);
            return out;
        }, {});
    }
    /**
     * defaultne to iste co `toJSON` akurat povolujeme custom override pre special case-y
     * (serializovanie non-primitivov do DB)
     */
    toJSONSerialized() {
        let json = this.toJSON();
        // NEW FEATURE: all plain object values are serialized/stringified
        // automatically (handly for JSONB types)
        return Object.keys(json).reduce((memo, k) => {
            if (lodash_1.isPlainObject(json[k])) {
                memo[k] = BaseModel.JSONStringify(json[k]);
            }
            else {
                memo[k] = json[k];
            }
            return memo;
        }, {});
        // return json;
    }
    /**
     * "over the wire" attributes filter hook
     * @param options
     * @param options
     * @private
     */
    _toJSONApiAttributes(options = null) {
        return this.toJSON();
    }
    /**
     * @param options
     * @returns {null}
     * @private
     */
    _toJSONApiRelationships(options = null) {
        return null;
    }
    /**
     * http://jsonapi.org/format/
     */
    toJSONApi(options = null) {
        let out = {
            type: this.entityType,
            id: this.id,
            attributes: this._toJSONApiAttributes(options),
        };
        const relationships = this._toJSONApiRelationships(options);
        if (relationships) {
            Object.assign(out, { relationships });
        }
        return out;
    }
    /**
     * @param k
     * @returns {PropertyDescriptor | boolean}
     * @private
     */
    _hasSetterFor(k) {
        const chain = mm_get_prototype_chain_1.mmGetPrototypeChain(this);
        if (Array.isArray(chain)) {
            return chain.some((proto) => {
                let desc = Object.getOwnPropertyDescriptor(proto, k);
                return desc && !!desc.set;
            });
        }
        return false;
    }
    /**
     * @param k
     * @returns {PropertyDescriptor | boolean}
     * @private
     */
    _hasGetterFor(k) {
        const chain = mm_get_prototype_chain_1.mmGetPrototypeChain(this);
        if (Array.isArray(chain)) {
            return chain.some((proto) => {
                let desc = Object.getOwnPropertyDescriptor(proto, k);
                return desc && !!desc.get;
            });
        }
        return false;
    }
    /**
     * general "safe" public setter (rozdielna funkcionalita od low level `_set`)
     * @param k
     * @param v
     * @returns {BaseModel}
     */
    set(k, v) {
        let oldRawValue = this._data[k];
        // IMPORTANT: prefer setter if exists
        this._hasSetterFor(k) ? (this[k] = v) : (this._data[k] = v);
        this._maybeMarkKeyDirty(k, oldRawValue);
        return this;
    }
    /**
     * @param k
     * @returns {any}
     */
    get(k) {
        // CONVENTION: prefer getter if exists (WARN: doesn't handle potential name colision)
        return this._hasGetterFor(k) ? this[k] : this._data[k];
    }
    /**
     * wrapper on top od _data, called by setters
     * @param k
     * @param v
     * @returns {this}
     * @private
     */
    _set(k, v) {
        let oldRawValue = this._data[k];
        this._data[k] = v;
        this._maybeMarkKeyDirty(k, oldRawValue);
        return this;
    }
    /**
     * wrapper on top of _data, called by getters
     * @param k
     * @param defaultValue
     * @param withToJSON
     * @private
     */
    _get(k, defaultValue = null, withToJSON = false) {
        let out = this._data[k] === null ? defaultValue : this._data[k];
        if (withToJSON && out && !out.toJSON) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
            // ...If the value has a toJSON() method, it's responsible to define
            // what data will be serialized...
            return Object.assign({}, out, { toJSON: () => JSON.stringify(out) });
        }
        return out;
    }
    /**
     * DRY
     * @param k
     * @param oldRawValue
     * @returns {this}
     * @private
     */
    _maybeMarkKeyDirty(k, oldRawValue) {
        let newRawValue = this._data[k];
        // if (oldRawValue !== newRawValue && -1 === this._dirtyKeys.indexOf(k)) {
        if (!lodash_1.isEqual(oldRawValue, newRawValue) &&
            -1 === this._dirtyKeys.indexOf(k)) {
            this._dirtyKeys.push(k);
        }
        return this;
    }
    /**
     * @returns {BaseModel}
     */
    resetDirty() {
        this._dirtyKeys = [];
        return this;
    }
    /**
     * @returns {BaseModel}
     */
    markDirty() {
        this.resetDirty();
        Object.keys(this._data).forEach((k) => this._dirtyKeys.push(k));
        return this;
    }
    /**
     * @returns {number}
     */
    isDirty() {
        return this._dirtyKeys.length;
    }
    /**
     * @returns {Array}
     */
    get dirtyKeys() {
        return this._dirtyKeys;
    }
    /**
     * @param k
     * @returns {boolean}
     */
    keyExists(k) {
        return this._data[k] !== void 0;
    }
    /**
     * helper
     * @param v
     * @private
     */
    _maybeUnserialize(v) {
        if (isString(v)) {
            try {
                v = JSON.parse(v);
            }
            catch (e) {
                v = {
                    __unserialize_error__: e.toString(),
                    __raw_value__: v,
                };
            }
        }
        return v;
    }
    /**
     * @returns {BaseModelData}
     */
    static defaults() {
        // throw new Error('Method defaults must be overidden in extended models');
        return {
            id: null,
        };
    }
    /**
     * Convention (db reasons mainly) - do not serialize empty values...
     * @param val
     * @constructor
     */
    static JSONStringify(val) {
        const isEmptyObject = (obj) => obj && Object.keys(obj).length === 0 && obj.constructor === Object;
        val = JSON.stringify(val);
        if (val === void 0 ||
            val === 'null' /*|| val === '{}' || isEmptyObject(val)*/) {
            val = null;
        }
        return val;
    }
}
exports.BaseModel = BaseModel;
