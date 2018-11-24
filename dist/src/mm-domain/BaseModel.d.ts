import { JSONApiData } from '../mm-util/mm-types';
export interface BaseModelData {
    id: any;
    [index: string]: any;
}
/**
 *
 */
export declare class BaseModel {
    /**
     * to be added at extended level
     */
    readonly entityType: string;
    /**
     * @type {BaseModelData}
     * @private
     */
    protected _data: BaseModelData;
    /**
     * @type {Array}
     * @private
     */
    protected _dirtyKeys: any[];
    /**
     * @param data
     * @param {boolean} forceDirty
     */
    constructor(data?: any, forceDirty?: boolean);
    /**
     * @param data
     * @returns {BaseModel}
     */
    populate(data: any): this;
    populateRelationships(rels: any): void;
    id: any;
    /**
     * @returns {BaseModelData}
     * @private
     */
    readonly _defaults: BaseModelData;
    /**
     * @returns {BaseModelData}
     */
    toJSON(): BaseModelData;
    /**
     * defaultne to iste co `toJSON` akurat povolujeme custom override pre special case-y
     * (serializovanie non-primitivov do DB)
     * @returns {BaseModelData}
     */
    toJSONSerialized(): BaseModelData;
    /**
     * "over the wire" attributes filter hook
     * @param options
     * @returns {BaseModelData}
     * @private
     */
    protected _toJSONApiAttributes(options?: any): BaseModelData;
    /**
     * @param options
     * @returns {null}
     * @private
     */
    protected _toJSONApiRelationships(options?: any): any;
    /**
     * http://jsonapi.org/format/
     */
    toJSONApi(options?: any): JSONApiData;
    /**
     * @param k
     * @returns {PropertyDescriptor | boolean}
     * @private
     */
    protected _hasSetterFor(k: any): boolean;
    /**
     * @param k
     * @returns {PropertyDescriptor | boolean}
     * @private
     */
    protected _hasGetterFor(k: any): boolean;
    /**
     * general "safe" public setter (rozdielna funkcionalita od low level `_set`)
     * @param k
     * @param v
     * @returns {BaseModel}
     */
    set(k: any, v: any): this;
    /**
     * @param k
     * @returns {any}
     */
    get(k: any): any;
    /**
     * wrapper on top od _data, called by setters
     * @param k
     * @param v
     * @returns {this}
     * @private
     */
    protected _set(k: any, v: any): this;
    /**
     * wrapper on top of _data, called by getters
     * @param k
     * @param defaultValue
     * @param withToJSON
     * @private
     */
    protected _get(k: any, defaultValue?: any, withToJSON?: boolean): any;
    /**
     * DRY
     * @param k
     * @param oldRawValue
     * @returns {this}
     * @private
     */
    protected _maybeMarkKeyDirty(k: any, oldRawValue: any): this;
    /**
     * @returns {BaseModel}
     */
    resetDirty(): this;
    /**
     * @returns {BaseModel}
     */
    markDirty(): this;
    /**
     * @returns {number}
     */
    isDirty(): number;
    /**
     * @returns {Array}
     */
    readonly dirtyKeys: any[];
    /**
     * @param k
     * @returns {boolean}
     */
    keyExists(k: any): boolean;
    /**
     * helper
     * @param v
     * @private
     */
    protected _maybeUnserialize(v: any): any;
    /**
     * @returns {BaseModelData}
     */
    static defaults(): BaseModelData;
    /**
     * Convention (db reasons mainly) - do not serialize empty values...
     * @param val
     * @constructor
     */
    static JSONStringify(val: any): any;
}
