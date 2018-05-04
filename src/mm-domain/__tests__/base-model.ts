import { BaseModel } from '../BaseModel';

class Foo extends BaseModel {
    readonly entityType = 'foo';
    protected _data: any;
    get name() {
        return this._get('name');
    }
    set name(v) {
        this._set('name', v);
    }
    get _defaults() {
        return Foo.defaults();
    }
    static defaults() {
        return Object.assign({}, BaseModel.defaults(), {
            name: null,
        });
    }
    _toJSONApiRelationships(options: any = null) {
        return {
            baz: { type: 'baz', id: 123 },
        };
    }
}

test('is dirty sanity check', () => {
    let m = new Foo({ name: 'bar' });
    expect(m.isDirty()).toBeFalsy();
    m.name = 'baz';
    expect(m.isDirty()).toBeTruthy();
    expect(m.resetDirty().isDirty()).toBeFalsy();
});

it('`toJSONApi` works', () => {
    let m = new Foo({ name: 'bar' });
    expect(m.toJSON().name).toEqual('bar');
    expect(m.toJSONApi().type).toEqual('foo');
    expect(m.toJSONApi().attributes.name).toEqual('bar');
    expect(m.toJSONApi().relationships.baz.id).toEqual(123);
});
