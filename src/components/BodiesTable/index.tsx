import { useContext, memo, useEffect, useState } from 'react';
import { TrajectoriesContext, FiltersContext, FocusContext } from '../../contexts';
import './index.css'
import config from '../../globals/config.json'

const BodiesTable: React.FC = memo(() => {
    const { smallBodies } = useContext(TrajectoriesContext)
    const { filters, setFilters } = useContext(FiltersContext)
    const { hovered, selected } = useContext(FocusContext)

    const [page, setPage] = useState(0); // Start from page 0
    const [pageSize, setPageSize] = useState(config.filters.default.range[1]);

    useEffect(() => {
        const start = page * pageSize;
        const end = start + pageSize - 1;
        setFilters({
            ...filters,
            range: [start, end]
        })
    }, [page, pageSize]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 0) return;
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
    };

    return (
        <div className="bodies-table">
            <div className="row">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                >
                    {"<"}
                </button>
                <span>Page: {page + 1}</span>
                <span>|</span>
                <span>Page size:</span>
                <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                >
                    <option value="10">10</option>
                    <option value="100">100</option>
                    <option value="1000">1000</option>
                </select>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={filters.range[1] - filters.range[0] + 1 < pageSize}
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
