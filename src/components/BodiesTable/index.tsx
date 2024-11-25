import { useContext, memo, useCallback } from 'react';
import { TrajectoriesContext, FiltersContext, FocusContext } from '../../contexts';
import './index.css'


const BodiesTable: React.FC = memo(() => {
    const { smallBodies } = useContext(TrajectoriesContext)
    const { filters, setFilters } = useContext(FiltersContext)
    const { hovered, selected } = useContext(FocusContext)

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage < 0) return;
        setFilters({
            ...filters,
            page: newPage
        })
    }, [filters, setFilters])

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setFilters({
            ...filters,
            pageSize: newPageSize
        })
    }, [filters, setFilters])

    return (
        <div className="bodies-table">
            <div className="row">
                <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                >
                    {"<"}
                </button>
                <span>Page: {filters.page}</span>
                <span>|</span>
                <span>Page size:</span>
                <select
                    value={filters.pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                >
                    <option value="10">10</option>
                    <option value="100">100</option>
                    <option value="1000">1000</option>
                </select>
                <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.pageSize > smallBodies.length}
                >{">"}</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Diameter</th>
                    </tr>
                </thead>
                <tbody>
                    {smallBodies.map((body, i) => (
                        <tr
                            key={i}
                            style={{
                                backgroundColor: selected.objectId === body.id ?
                                '#f0f0f0' :
                                (hovered.objectId === body.id ? '#f3f3f3' : '#ffffff')
                            }}
                            onPointerMove={(e) => {
                                e.stopPropagation()
                                hovered.setObjectId(body.id)
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation()
                                hovered.setObjectId(null)
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                selected.setObjectId(body.id)
                            }}
                        >
                            <td>{body.name}</td>
                            <td>{body.diameter}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
})

export default BodiesTable;
