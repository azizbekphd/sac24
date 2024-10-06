import { useContext, memo } from 'react';
import { TrajectoriesContext } from '../../contexts';
import './index.css'

const BodiesTable: React.FC = memo(() => {
    const { smallBodies } = useContext(TrajectoriesContext)

    return (
        <div className="bodies-table">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Diameter</th>
                    </tr>
                </thead>
                <tbody>
                    {smallBodies.map((body, i) => (
                        <tr key={i}>
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
