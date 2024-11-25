import { useContext, memo, useState, useEffect } from 'react';
import { Filters, FiltersContext } from '../../contexts';
import { useDebounce } from '../../hooks';
import MenuSection from '../MenuSection';
import './index.css'
import config from '../../globals/config.json'

const FiltersMenu: React.FC = memo(() => {
    const {filters, setFilters} = useContext(FiltersContext)
    const [query, setQuery] = useState<string>(filters.query)
    const debouncedQuery = useDebounce<string>(query, 500)

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
                    <select value={filters.group} onChange={
                            (e) => setFilters({
                                ...filters,
                                page: 1,
                                group: e.target.value as Filters['group']
                            })
                    }>
                        <option value="all">All</option>
                        <option value="neo">NEO</option>
                        <option value="pha">PHA</option>
                    </select>
                </div>
                <div className="row">
                    <label>Kind</label>
                    <select value={filters.kind} onChange={
                            (e) => setFilters({
                                ...filters,
                                page: 1,
                                kind: e.target.value as Filters['kind']
                            })
                    }>
                        <option value="all">All</option>
                        <option value="asteroids">Asteroids</option>
                        <option value="comets">Comets</option>
                    </select>
                </div>
                <div className="row">
                    <label>Numbered state</label>
                    <select value={filters.numberedState} onChange={
                            (e) => setFilters({
                                ...filters,
                                page: 1,
                                numberedState: e.target.value as Filters['numberedState']
                            })
                    }>
                        <option value="all">All</option>
                        <option value="numbered">Numbered</option>
                        <option value="unnumbered">Unnumbered</option>
                    </select>
                </div>
            </MenuSection>

            <MenuSection title={`Asteroid class${filters.asteroidClasses.length > 0 ? ' *' : ''}`}>
                {/* checkboxes */}
                {config.filters.asteroidClasses.map((classDef, i) => {
                    const filter = Filters.classesToFilter(classDef, 'asteroids')
                    return (
                        <div key={i} className="row">
                            <input
                                id={classDef.value}
                                type="checkbox"
                                checked={filters.asteroidClasses.includes(filter)}
                                onChange={(e) => {
                                    const ac = [...filters.asteroidClasses]
                                    if (e.target.checked) {
                                        !ac.includes(filter) && ac.push(filter)
                                    } else {
                                        ac.includes(filter) && ac.splice(ac.indexOf(filter), 1)
                                    }
                                    setFilters({
                                        ...filters,
                                        page: 1,
                                        asteroidClasses: ac
                                    })
                                }}
                            />
                            <label
                                className="tooltip-label"
                                title={classDef.description}
                                htmlFor={classDef.value}>{classDef.label}</label>
                        </div>
                    )
                })}
            </MenuSection>

            <MenuSection title={`Comet class${filters.cometClasses.length > 0 ? ' *' : ''}`}>
                {/* checkboxes */}
                {config.filters.cometClasses.map((classDef, i) => {
                    const filter = Filters.classesToFilter(classDef, 'comets')
                    return (
                        <div key={i} className="row">
                            <input
                                id={classDef.value}
                                type="checkbox"
                                checked={filters.cometClasses.includes(filter)}
                                onChange={(e) => {
                                    const ac = [...filters.cometClasses]
                                    if (e.target.checked) {
                                        !ac.includes(filter) && ac.push(filter)
                                    } else {
                                        ac.includes(filter) && ac.splice(ac.indexOf(filter), 1)
                                    }
                                    setFilters({
                                        ...filters,
                                        page: 1,
                                        cometClasses: ac
                                    })
                                }}
                            />
                            <label
                                className="tooltip-label"
                                title={classDef.description}
                                htmlFor={classDef.value}>{classDef.label}</label>
                        </div>
                    )
                })}
            </MenuSection>
        </div>
    )
})

export default FiltersMenu;
