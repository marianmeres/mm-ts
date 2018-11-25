import { BaseModel } from '../BaseModel';
import { SqlUtil } from '../../mm-util/SqlUtil';
import { Service } from '../Service';
export interface BaseFooData {
    id: any;
    label?: string;
}
export declare class BaseFoo extends BaseModel {
    readonly entityType = "foo";
    protected _data: BaseFooData;
    label: any;
    readonly bar: string;
    readonly _defaults: BaseFooData;
    static defaults(): BaseFooData;
}
export declare const fooService: (db?: SqlUtil) => FooService;
declare class FooService extends Service<BaseFoo> {
    protected _tableName: string;
    protected _modelCtor: typeof BaseFoo;
}
export {};
