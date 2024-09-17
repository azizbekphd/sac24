import { useState } from 'react'
import './App.css'
import { Scene } from './components'

function App() {
    const [vr, setVr] = useState(false)

    return (<>
        <button onClick={() => {setVr(true)}}>Enter VR</button>
        <Scene objects={[1]} vr={vr} />
    </>)
}

export default App
