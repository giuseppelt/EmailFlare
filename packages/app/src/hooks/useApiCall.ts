import { useCallback, useRef, useState } from "preact/hooks";
import { HttpCClientError } from "@httpc/client";
import { useIsMounted } from "./useIsMounted";


type ApiCallState<T = any> = Readonly<{
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    isCompleted: boolean
    result?: T
    error?: any
    errorMessage?: string
}>

const INITIAL_STATE: ApiCallState<any> = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    isCompleted: false,
    result: undefined,
    error: undefined,
    errorMessage: undefined,
};

export function useApiCall<T extends (...args: any[]) => Promise<any>>(fn: T) {
    const callId = useRef(0);
    const isMounted = useIsMounted();
    const [state, setState] = useState<ApiCallState<T>>(INITIAL_STATE);

    const call = useCallback(async (...args: Parameters<T>) => {
        const actualId = ++callId.current;

        if (!state.isLoading) {
            setState(s => ({ ...INITIAL_STATE, isLoading: true }));
        }

        try {
            const result = await fn(...args);
            if (isMounted() && actualId === callId.current) {
                setState({ ...INITIAL_STATE, isSuccess: true, isCompleted: true, result });
            }

            return { iSuccess: true, result };
        } catch (error) {
            let message = error?.message;
            if (error instanceof HttpCClientError) {
                message = `[HTTP-${error.status}] ${error.message}`;
            }

            if (isMounted() && actualId === callId.current) {
                setState({ ...INITIAL_STATE, isError: true, isCompleted: true, error, errorMessage: message });
            }

            return { iSuccess: false, error };
        }
    }, [fn]);

    const reset = useCallback(() => setState({ ...INITIAL_STATE }), []);

    return {
        ...state,
        call,
        reset,
    };
}
