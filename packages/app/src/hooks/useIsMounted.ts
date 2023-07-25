import { useCallback, useRef, useEffect } from "preact/hooks";

export function useIsMounted() {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false
        };
    }, []);

    return useCallback(() => isMounted.current, []);
};
