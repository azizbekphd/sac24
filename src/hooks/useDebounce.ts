import { useEffect, useRef, useState } from "react";

function useDebounce<T> (value: T, delay: number = 500) {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        timerRef.current = setTimeout(() => setDebouncedValue(value), delay);

        return () => {
            clearTimeout(timerRef.current);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
