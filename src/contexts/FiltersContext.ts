import { createContext } from "react";
import config from '../globals/config.json';

class Filters {
    order: 'name' | 'diameter';
    ascending: boolean;
    range: [number, number];
    query: string;
    group: 'all' | 'neo' | 'pha';
    kind: 'all' | 'asteroids' | 'comets';
    numberedState: 'all' | 'numbered' | 'unnumbered';

    constructor(args: any) {
        this.order = args.order;
        this.ascending = args.ascending;
        this.range = args.range;
        this.query = args.query;
        this.group = args.group;
        this.kind = args.kind;
        this.numberedState = args.numberedState;
    }

    static mappings = {
        group: {
            'neo': 'neo',
            'pha': 'pha',
        },
        kind: {
            'asteroids': 'a',
            'comets': 'c',
        },
        numberedState: {
            'numbered': 'n',
            'unnumbered': 'u',
        }
    }
}

interface FiltersContextType {
    filters: Filters;
    setFilters: (filters: Filters) => void;
}

const FiltersContext = createContext<FiltersContextType>({
    filters: config.filters as Filters,
    setFilters: () => {},
})

export default FiltersContext;
export { Filters, type FiltersContextType };
