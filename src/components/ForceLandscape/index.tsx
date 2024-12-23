import React from "react"
import "./index.css"


const ForceLandscape = ({ children }: {children: React.ReactNode}) => {
    return <>
        <div className="landscape-hint">
            <img src="/sac24/icons/phone-rotate.svg" alt="rotate your device to landscape mode" />
            <p>Please rotate your device to landscape mode.</p>
        </div>
        <div className="landscape-content">
            {children}
        </div>
    </>
}

export default ForceLandscape
