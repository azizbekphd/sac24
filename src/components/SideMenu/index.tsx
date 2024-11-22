import { FocusContext } from '../../contexts'
import { FiltersMenu, BodiesTable } from '../index'
import SelectedBody from '../SelectedBody'
import './index.css'
import { useContext, useState } from "react"

const SideMenu: React.FC = () => {
    const [show, setShow] = useState<boolean>(true)
    const { selected } = useContext(FocusContext)

    return (
        <div className={`side-menu-wrapper ${show ? 'show' : ''}`}>
            <div className="side-menu">
            {selected.objectId ?
                <SelectedBody />
                :
                <>
                    <h2>Menu</h2>

                    <FiltersMenu />
                    <BodiesTable />
                </>
            }
            </div>
            <button className="side-menu-toggler" onClick={() => setShow(!show)}>
                {show ? 'Close' : 'Menu'}
            </button>
        </div>
    )
}

export default SideMenu
