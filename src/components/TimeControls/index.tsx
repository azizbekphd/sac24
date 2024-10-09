import './index.css'
import { useContext, memo } from 'react'
import { TimeControlsContext } from '../../contexts'
import config from '../../globals/config.json'

const TimeControls: React.FC = memo(() => {
    const { timeControls, setTimeControls } = useContext(TimeControlsContext)

    return (
            <div className="time-controls">
                <input type="datetime-local" value={new Date(timeControls.time).toISOString().split('.')[0]} onChange={(e) => {
                    setTimeControls({
                        ...timeControls,
                        time: new Date(e.target.value).getTime()
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
                <input type="range"
                    min={-10}
                    max={10}
                    step={1} value={timeControls.deltaIndex}
                    className={`time-delta-slider ${
                        !timeControls.live ? (timeControls.deltaIndex === 0 ?
                            'paused' : '') : 'live'}`}
                    onChange={(e) => {
                        const newDelta = config.timeControls.timeDeltas[parseInt(e.target.value) + 10]
                        setTimeControls({
                            ...timeControls,
                            live: false,
                            deltaIndex: parseInt(e.target.value),
                            deltaTime: newDelta.value
                        })
                    }} />
                <div style={{width: '60px'}}>
                    {timeControls.live ? '' : config.timeControls.timeDeltas[timeControls.deltaIndex + 10].label}
                </div>
            </div>

    )
})

export default TimeControls
