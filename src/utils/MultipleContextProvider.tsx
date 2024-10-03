import React, { memo, ReactNode, useMemo } from "react"

export type ContextValuePair<T> = { context: React.Context<T>, value: T };
type MultipleContextProviderProps = {
    contexts: ContextValuePair<any>[],
    children: ReactNode
};

const MultipleContextProvider = memo(function MultipleContextProvider({ contexts, children }: MultipleContextProviderProps) {
    const providers = useMemo(() => {
        return contexts.reduce<React.FC<{ children: ReactNode }>>((acc, entry) => {
            return ({children}: {children: ReactNode}) => (
                <entry.context.Provider value={entry.value}>
                    {acc({children})}
                </entry.context.Provider>
            );
        }, (props) => props.children);
    }, [contexts]);

    return providers({children});
});

export default MultipleContextProvider;

