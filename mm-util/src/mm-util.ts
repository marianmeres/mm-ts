

export const mm_sequence = (() => {
    let _counter = 0;
    return (prefix?:string) => {
        _counter++;
        if (prefix) return prefix + _counter.toString();
        return _counter;
    }
})();