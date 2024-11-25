import { FocusContext } from '../../contexts'
import { FiltersMenu, BodiesTable } from '../index'
import SelectedBody from '../SelectedBody'
import './index.css'
import { useContext, useEffect, useRef, useState } from "react"

const SideMenu: React.FC = () => {
    const [show, setShow] = useState<boolean>(true)
    const { selected } = useContext(FocusContext)
    const sideMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!selected.objectId) {
            document.title = 'Orrery'
        } else {
            sideMenuRef.current?.scrollTo({top: 0, behavior: 'smooth'})
        }
    }, [selected.objectId])

    return (
        <div className={`side-menu-wrapper ${show ? 'show' : ''}`}>
            <div className="side-menu" ref={sideMenuRef}>
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
