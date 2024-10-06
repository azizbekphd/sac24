import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Scene, SideMenu } from './components'
import { MultipleContextProvider } from './utils'
import { FiltersContextType, FocusContext, TrajectoriesContext, TrajectoriesContextType, XRContext, Filters, FiltersContext } from './contexts'
import { createXRStore } from '@react-three/xr'
import { Focus, TrajectoryUtils } from './types'
import TimeControlsContext, { type TimeControlsState } from './contexts/TimeControllerContext'
import { useInterval } from './hooks'
import config from './globals/config.json'
import { nasaApi } from './globals/instances'


const xrStore = createXRStore();
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
    const [filters, setFilters] = useState<FiltersContextType>({
        filters: config.filters as Filters,
        setFilters: (_filters: FiltersContextType['filters']) => {
            setFilters({...filters, filters: _filters})
        }
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
        return () => {}
    }, [])

    useEffect(() => {
        if (trajectories.planets.length > 0) {
            nasaApi.getSmallBodies(filters.filters).then(smallBodies => {
                setTrajectories({
                    ...trajectories,
                    smallBodies: [...smallBodies]
                })
            })
        }
    }, [filters, trajectories.planets])

    useInterval(() => {
        setTimeControls({
            ...timeControls,
            time: timeControls.time + (timeControls.deltaTime * tick)
        })
    }, tick)

    return (<>
        <MultipleContextProvider contexts={[
            {context: FiltersContext, value: filters},
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
            <SideMenu />
            <div className="time-controls">
                <p style={{textAlign: 'right', width: 'max-content'}}>{new Date(timeControls.time).toISOString()}</p>
                <input type="range"
                    min={-10}
                    max={10}
                    step={1} value={timeControls.deltaIndex}
                    style={{
                        accentColor: !timeControls.live ? (
                            timeControls.deltaIndex !== 0 ?
                                '#0000ff' : '#ccc') : '#00ff00'
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
                <button onClick={() => setTimeControls({
                    ...timeControls,
                    time: new Date().getTime(),
                    live: true,
                    deltaIndex: 0, deltaTime: 1
                })} className={`live-button ${timeControls.live ? 'live' : ''}`}>
                    Live
                </button>
            </div>
            <Scene />
        </MultipleContextProvider>
    </>)
}

export default App
