import { useContext, memo, useState, useEffect } from 'react';
import { Filters, FiltersContext } from '../../contexts';
import { useDebounce } from '../../hooks';
import MenuSection from '../MenuSection';
import './index.css'

const FiltersMenu: React.FC = memo(() => {
    const {filters, setFilters} = useContext(FiltersContext)
    const [query, setQuery] = useState<string>(filters.query)
    const [debouncedQuery] = useDebounce<string>(query, 500)

    useEffect(() => {
        setFilters({...filters, query: debouncedQuery})
    }, [debouncedQuery])

    return (
        <div className="filters">
            {/* searchbar */}
            <input
                type="search"
                placeholder="Search..."
                className="row"
                value={query}
                onChange={(e) => setQuery(e.target.value)} />
            {/* selects */}
            <MenuSection title="Kind/group">
                <div className="row">
                    <label>Group</label>
                    <select value={filters.group} onChange={(e) => setFilters({...filters, group: e.target.value as Filters['group']})}>
                        <option value="all">All</option>
                        <option value="neo">NEO</option>
                        <option value="pha">PHA</option>
                    </select>
                </div>
                <div className="row">
                    <label>Kind</label>
                    <select value={filters.kind} onChange={(e) => setFilters({...filters, kind: e.target.value as Filters['kind']})}>
                        <option value="all">All</option>
                        <option value="asteroids">Asteroids</option>
                        <option value="comets">Comets</option>
                    </select>
                </div>
                <div className="row">
                    <label>Numbered state</label>
                    <select value={filters.numberedState} onChange={(e) => setFilters({...filters, numberedState: e.target.value as Filters['numberedState']})}>
                        <option value="all">All</option>
                        <option value="numbered">Numbered</option>
                        <option value="unnumbered">Unnumbered</option>
                    </select>
                </div>
            </MenuSection>
        </div>
    )
})

export default FiltersMenu;
