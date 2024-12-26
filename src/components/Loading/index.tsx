import "./index.css"


interface LoadingProps {
    show: boolean;
    fullScreen?: boolean;
}

const Loading = ({ show, fullScreen }: LoadingProps) => {
    if (!show) return null

    return <>
        {fullScreen ?
            <div className="loading-wrapper">
                <div className="loading-spinner">
                    <div className="loading-spinner-inner"></div>
                </div>
            </div>
            :
            <div className="loading-spinner">
                <div className="loading-spinner-inner"></div>
            </div>
        }
    </>
}

export default Loading;
