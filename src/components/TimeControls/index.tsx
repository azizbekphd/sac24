import './index.css'
import { useContext, memo } from 'react'
import { TimeControlsContext } from '../../contexts'
import config from '../../globals/config.json'


const timeStepsNumber = (config.timeControls.timeDeltas.length - 1) / 2


const TimeControls: React.FC = memo(() => {
    const { timeControls, setTimeControls } = useContext(TimeControlsContext)

    return (
            <div className="time-controls">
                <input type="datetime-local" className="datetime" value={new Date(timeControls.time).toISOString().split('.')[0]} onChange={(e) => {
                    setTimeControls({
                        ...timeControls,
                        live: false,
                        time: new Date(e.target.value).getTime()
                    })
                }} />
                <button onClick={() => {
                    if (timeControls.live) {
                        setTimeControls({
                            ...timeControls,
                            live: false,
                            deltaIndex: 0,
                            deltaTime: 0
                        })
                    } else {
                        setTimeControls({
                            ...timeControls,
                            time: new Date().getTime(),
                            live: true,
                            deltaIndex: 0, deltaTime: 1
                        })
                    }
                }} className={`live-button ${timeControls.live ? 'live' : ''}`}>
                    Live
                </button>
                <input type="range"
                    min={-timeStepsNumber}
                    max={timeStepsNumber}
                    step={1} value={timeControls.deltaIndex}
                    className={`time-delta-slider ${
                        !timeControls.live ? (timeControls.deltaIndex === 0 ?
                            'paused' : '') : 'live'}`}
                    onChange={(e) => {
                        const newDelta = config.timeControls.timeDeltas[parseInt(e.target.value) + timeStepsNumber]
                        setTimeControls({
                            ...timeControls,
                            live: false,
                            deltaIndex: parseInt(e.target.value),
                            deltaTime: newDelta.value
                        })
                    }} />
                <div style={{width: '60px'}}>
                    {timeControls.live ? '' : config.timeControls.timeDeltas[timeControls.deltaIndex + timeStepsNumber].label}
                </div>
            </div>

    )
})

export default TimeControls
