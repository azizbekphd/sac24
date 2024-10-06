import { FiltersMenu, BodiesTable } from '../index'
import './index.css'
import { useState } from "react"

const SideMenu: React.FC = () => {
    const [show, setShow] = useState<boolean>(true)

    return (
        <div className={`side-menu-wrapper ${show ? 'show' : ''}`}>
            <div className="side-menu">
                <h2>Menu</h2>

                <FiltersMenu />
                <BodiesTable />
            </div>
            <button className="side-menu-toggler" onClick={() => setShow(!show)}>
                {show ? 'Close' : 'Menu'}
            </button>
        </div>
    )
}

export default SideMenu
