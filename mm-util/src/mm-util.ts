

export const mm_sequence = (() => {
    let _counter = 0;
    return () => ++_counter;
})();