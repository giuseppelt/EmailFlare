import { useCallback, useEffect, useRef, useState } from "preact/hooks";


export function useTimeout<T>(timeout = 5000, condition: T, callback: (value: T) => void) {
    useEffect(() => {
        if (condition) {
            const tId = setTimeout(() => callback(condition), timeout);
            return () => clearTimeout(tId);
        }
    }, [condition]);
}

export function useValueTimeout<T = boolean>(timeout = 5000, initialState = false) {
    const initialValue = useRef<any>(initialState);
    const [state, setState] = useState<any>();

    const reset = useCallback(() => setValue(initialValue.current), []);
    const setValue = useCallback((v?: T) => setState(v ?? true), []);

    useTimeout(timeout, state, reset);

    return {
        value: state as T,
        set: setValue,
        reset
    };
}
