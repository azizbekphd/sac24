import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Scene, SideMenu, TimeControls } from './components'
import { MultipleContextProvider } from './utils'
import { FiltersContextType, FocusContext, TrajectoriesContext, TrajectoriesContextType, XRContext, Filters, FiltersContext } from './contexts'
import { createXRStore } from '@react-three/xr'
import { TrajectoryUtils } from './types'
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
    const [timeControls, setTimeControls] = useState<TimeControlsState>(config.timeControls.default)
    const [filters, setFilters] = useState<FiltersContextType>({
        filters: config.filters.default as unknown as Filters,
        setFilters: (_filters: FiltersContextType['filters']) => {
            setFilters({ ...filters, filters: _filters })
        }
    })
    const [selected, setSelected] = useState<string | null>(config.focus.default.selected.objectId)
    const [hovered, setHovered] = useState<string | null>(config.focus.default.hovered.objectId)

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
        return () => { }
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
        if (timeControls.live) {
            setTimeControls({
                ...timeControls,
                time: new Date().getTime()
            })
        } else {
            setTimeControls({
                ...timeControls,
                time: timeControls.time + (timeControls.deltaTime * tick)
            })
        }
    }, tick)

    return (<>
        <MultipleContextProvider contexts={[
            { context: FiltersContext, value: filters },
            {
                context: TrajectoriesContext,
                value: trajectories
            },
            {
                context: TimeControlsContext,
                value: { timeControls, setTimeControls }
            },
            { context: FocusContext, value: {
                selected: {
                    objectId: selected,
                    setObjectId: setSelected
                },
                hovered: {
                    objectId: hovered,
                    setObjectId: setHovered
                }
            },},
            { context: XRContext, value: memoizedXrStore }
        ]}>
            <Scene />
            <SideMenu />
            <TimeControls />
        </MultipleContextProvider>
    </>)
}

export default App
