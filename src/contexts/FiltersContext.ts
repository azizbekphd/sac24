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
    asteroidClasses: string[];
    cometClasses: string[];

    constructor(args: any) {
        this.order = args.order;
        this.ascending = args.ascending;
        this.range = args.range;
        this.query = args.query;
        this.group = args.group;
        this.kind = args.kind;
        this.numberedState = args.numberedState;
        this.asteroidClasses = args.asteroidClasses;
        this.cometClasses = args.cometClasses;
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

    static classesToFilter(classDef: typeof config.filters.asteroidClasses[0], kind: string): string {
        const kindFilter = `kind.like.${kind === 'comets' ? 'c' : 'a'}%`
        const params = classDef.params.map((param) => `${param.field}.${param.operator}.${param.value}`)
        params.push(kindFilter)
        const filter = params.length > 1 ? `and(${params.join(', ')})` : params[0]
        return filter
    }
}

interface FiltersContextType {
    filters: Filters;
    setFilters: (filters: Filters) => void;
}

const FiltersContext = createContext<FiltersContextType>({
    filters: config.filters.default as unknown as Filters,
    setFilters: () => {},
})

export default FiltersContext;
export { Filters, type FiltersContextType };
