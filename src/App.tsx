import { useContext, useEffect, useMemo, useState } from 'react'
import './App.css'
import { Scene } from './components'
import { MultipleContextProvider } from './utils'
import { FocusContext, TrajectoriesContext, XRContext } from './contexts'
import { createXRStore } from '@react-three/xr'
import { Focus, Trajectory, TrajectoryUtils } from './types'
import TimeControlsContext from './contexts/TimeControllerContext'


function App() {
    const xrStore = createXRStore();
    const memoizedXrStore = useMemo(() => xrStore, [xrStore])
    const [trajectories, setTrajectories] = useState<Trajectory[]>([])
    const [timeControls, setTimeControls] = useState<TimeControlsState>({
        time: new Date().getTime(),
        deltaTime: 86400000
    })

    useEffect(() => {
        TrajectoryUtils.load("data/objects.json").then(setTrajectories)
    }, [])

    return (<>
        <MultipleContextProvider contexts={[
            {
                context: TrajectoriesContext,
                value: trajectories
            },
            {
                context: TimeControlsContext,
                value: timeControls
            },
            {context: FocusContext, value: new Focus()},
            {context: XRContext, value: memoizedXrStore}
        ]}>
            <p>{new Date(timeControls.time).toISOString()}</p>
            <input style={{width: "100%"}} type="range" min={timeControls.time - 31536000} max={timeControls.time + 31536000} step={1000} value={timeControls.time} onChange={(e) => {
                setTimeControls({
                    ...timeControls,
                    time: parseInt(e.target.value)
                })
            }} />
            <Scene />
        </MultipleContextProvider>
    </>)
}

export default App
