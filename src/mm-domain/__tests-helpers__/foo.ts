import { BaseModel } from '../BaseModel';
import { SqlUtil } from '../../mm-util/SqlUtil';
import { Service } from '../Service';
import pg from '../../../../../src/server/library/_utils/pg';

export interface BaseFooData {
    id: any;
    label?: string;
}

export class BaseFoo extends BaseModel {
    readonly entityType = 'foo';

    protected _data: BaseFooData;

    get label() {
        return this._get('label');
    }
    set label(v) {
        this._set('label', v);
    }

    get bar() {
        return 'baz';
    }

    get _defaults(): BaseFooData {
        return BaseFoo.defaults();
    }

    static defaults(): BaseFooData {
        return Object.assign({}, BaseModel.defaults(), {
            label: null,
        });
    }
}

// exposed factory
export const fooService = (db?: SqlUtil) => new FooService(db || SqlUtil.pg(pg));

class FooService extends Service<BaseFoo> {
    protected _tableName: string = 'foo';

    protected _modelCtor = BaseFoo;
}
