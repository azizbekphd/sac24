import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Scene } from './components'
import { MultipleContextProvider } from './utils'
import { FocusContext, TrajectoriesContext, TrajectoriesContextType, XRContext } from './contexts'
import { createXRStore } from '@react-three/xr'
import { Focus, TrajectoryUtils } from './types'
import TimeControlsContext, { type TimeControlsState } from './contexts/TimeControllerContext'
import { useInterval } from './hooks'
import config from './globals/config.json'
import { NasaApi } from './repositories'


const xrStore = createXRStore();
const nasaApi = new NasaApi()
const tick = 40;

function App() {
    const memoizedXrStore = useMemo(() => xrStore, [xrStore])
    const [trajectories, setTrajectories] = useState<TrajectoriesContextType>({
        planets: [],
        smallBodies: [],
    })
    const [timeControls, setTimeControls] = useState<TimeControlsState>({
        time: new Date().getTime(),
        live: true,
        deltaIndex: 0,
        deltaTime: 1,
    })

    useEffect(() => {
        if (trajectories.planets.length === 0) {
            TrajectoryUtils.load("data/planets.json").then(planets => {
                setTrajectories({
                    ...trajectories,
                    planets
                })
            })
            return
        }
        const chunks = trajectories.smallBodies.length / config.smallBodies.chunkSize
        if (chunks < config.smallBodies.totalChunks) {
            nasaApi.getSmallBodiesFromFile(chunks).then(smallBodies => {
                setTrajectories({
                    ...trajectories,
                    smallBodies: [...trajectories.smallBodies, ...smallBodies]
                })
            })
            return
        }
        return () => {}
    }, [trajectories])

    useInterval(() => {
        setTimeControls({
            ...timeControls,
            time: timeControls.time + (timeControls.deltaTime * tick)
        })
    }, tick)

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
            <p style={{textAlign: 'right'}}>{new Date(timeControls.time).toISOString()}</p>
            <input type="range"
                min={-10}
                max={10}
                step={1} value={timeControls.deltaIndex}
                style={{
                    accentColor: !timeControls.live ? (
                        timeControls.deltaIndex !== 0 ?
                            '#0000ff' : '#ccc') : '#00ff00',
                    width: '100%'
                }}
                onChange={(e) => {
                    const newDelta = config.timeDeltas[parseInt(e.target.value) + 10]
                    setTimeControls({
                        ...timeControls,
                        live: false,
                        deltaIndex: parseInt(e.target.value),
                        deltaTime: newDelta.value
                    })
                }} />
            <Scene />
        </MultipleContextProvider>
    </>)
}

export default App
