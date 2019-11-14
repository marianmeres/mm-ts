import { BaseModel } from '../BaseModel';
import { SqlUtil } from '../../mm-util/SqlUtil';
import { Service } from '../Service';
export interface BaseFooData {
    id: any;
    label?: string;
}
export declare class BaseFoo extends BaseModel<BaseFooData> {
    readonly entityType = "foo";
    get label(): any;
    set label(v: any);
    get bar(): string;
    get _defaults(): BaseFooData;
    static defaults(): BaseFooData;
}
export declare const fooService: (db?: SqlUtil) => FooService;
declare class FooService extends Service<BaseFoo> {
    protected _tableName: string;
    protected _modelCtor: typeof BaseFoo;
}
export {};
