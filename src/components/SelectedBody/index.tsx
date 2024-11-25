import { FocusContext, TrajectoriesContext } from '../../contexts'
import { PropertyFormatter } from '../../utils'
import { useCallback, useContext, useEffect, useMemo } from "react"
import "./index.css"


const SelectedBody: React.FC = () => {
    const { selected } = useContext(FocusContext)
    const { planets, smallBodies } = useContext(TrajectoriesContext)
    const selectedObject = useMemo(() => {
        const objects = [...planets, ...smallBodies]
        const object = objects.find(obj => obj.id === selected.objectId)
        if (!(object && object.sourceJSON)) {
            return object
        }
        return JSON.parse(object?.sourceJSON)
    }, [planets, smallBodies, selected.objectId])

    const closeHandler = useCallback(() => {
        selected.setObjectId(null)
    }, [selected])

    useEffect(() => {
        if (selected.objectId) {
            document.title = `${selectedObject?.name} - Orrery`
        }
    }, [selected.objectId, selectedObject])

    return (
        <>
            <div className="row">
                <button onClick={closeHandler} className='back-button'>{"<"}</button>
                <h3>{selectedObject?.name}</h3>
            </div>
            <div className="data-table">
                <table>
                    <tbody>
                        <tr className="header">
                            <th colSpan={2}>General</th>
                        </tr>
                        <tr>
                            <td>Full name</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.full_name)
                            }</td>
                        </tr>
                        <tr>
                            <td>Type</td>
                            <td>{
                                PropertyFormatter.formatBoolean(
                                    selectedObject?.kind.startsWith('c'),
                                    'Comet', 'Asteroid')
                            }</td>
                        </tr>
                        <tr>
                            <td>Primary designation</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.pdes)
                            }</td>
                        </tr>
                        <tr>
                            <td>Orbit class</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.class)
                            }</td>
                        </tr>
                        <tr>
                            <td>Is NEO</td>
                            <td>{
                                PropertyFormatter.formatBoolean(selectedObject?.neo)
                            }</td>
                        </tr>
                        <tr>
                            <td>Is PHA</td>
                            <td>{
                                PropertyFormatter.formatBoolean(selectedObject?.pha)
                            }</td>
                        </tr>
                        <tr className="header">
                            <th colSpan={2}>Physical Characteristics</th>
                        </tr>
                        <tr>
                            <td>Diameter</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.diameter, 'km')
                            }</td>
                        </tr>
                        <tr>
                            <td>Rotation period</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.rot_per, 'h')
                            }</td>
                        </tr>
                        <tr>
                            <td>Geometric albedo</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.albedo)
                            }</td>
                        </tr>
                        <tr>
                            <td>Object bi/tri-axial ellipsoid dimensions</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.extent)
                            }</td>
                        </tr>
                        <tr>
                            <td>Spectral taxonomic type (SMASSII)</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.spec_B)
                            }</td>
                        </tr>
                        <tr>
                            <td>Spectral taxonomic type (Tholen)</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.spec_T)
                            }</td>
                        </tr>
                        <tr className="header">
                            <th colSpan={2}>Orbital Parameters</th>
                        </tr>
                        <tr>
                            <td>Orbital period</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.per_y, 'y')
                            }</td>
                        </tr>
                        <tr>
                            <td>Eccentricity</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.e)
                            }</td>
                        </tr>
                        <tr>
                            <td>Semi-major axis</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.a, 'au')
                            }</td>
                        </tr>
                        <tr>
                            <td>Longitude of ascending node</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.om, 'deg')
                            }</td>
                        </tr>
                        <tr>
                            <td>Mean anomaly</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.ma, 'deg')
                            }</td>
                        </tr>
                        <tr>
                            <td>Inclination</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.i, 'deg')
                            }</td>
                        </tr>
                        <tr>
                            <td>Argument of perihelion</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.w, 'deg')
                            }</td>
                        </tr>
                        <tr>
                            <td>Perihelion distance</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.q, 'au')
                            }</td>
                        </tr>
                        <tr>
                            <td>Aphelion distance</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.ad, 'au')
                            }</td>
                        </tr>
                        <tr className="header">
                            <th colSpan={2}>Additional Orbital Metrics</th>
                        </tr>
                        <tr>
                            <td>Jupiter Tisserand Invariant</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.t_jup)
                            }</td>
                        </tr>
                        <tr>
                            <td>Earth Minimum Orbit Intersection Distance</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.moid, 'au')
                            }</td>
                        </tr>
                        <tr>
                            <td>Jupiter Minimum Orbit Intersection Distance</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.moid_jup, 'au')
                            }</td>
                        </tr>
                        <tr>
                            <td>Mean motion</td>
                            <td>{
                                PropertyFormatter.formatNumber(selectedObject?.n, 'deg/d')
                            }</td>
                        </tr>
                        <tr className="header">
                            <th colSpan={2}>Observational Details</th>
                        </tr>
                        <tr>
                            <td>Time of perihelion passage</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.tp_cal)
                            }</td>
                        </tr>
                        <tr>
                            <td>Epoch of osculation</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.epoch_cal)
                            }</td>
                        </tr>
                        <tr>
                            <td>Producer</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.producer)
                            }</td>
                        </tr>
                        <tr>
                            <td>Days spanned by the data-arc</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.data_arc, 'd')
                            }</td>
                        </tr>
                        <tr>
                            <td>Date of first observation</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.first_obs)
                            }</td>
                        </tr>
                        <tr>
                            <td>Date of last observation</td>
                            <td>{
                                PropertyFormatter.format(selectedObject?.last_obs)
                            }</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default SelectedBody
