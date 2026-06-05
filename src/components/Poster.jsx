import "../styles/poster.css"

import playIcon from "../assets/icon-play.svg"

function Poster({ movie, className = "", showPlay = false, onPlayClick, onClick }) {
    if (!movie) return null

    return (
        <div className={`poster ${className}`}>
            <img className="poster__image"
                src={`https://image.tmdb.org/t/p/w500${movie}`}
                onClick={onClick}
            />

            {showPlay && onPlayClick && (
                <img className="poster__play"
                    src={playIcon}
                    onClick={onPlayClick}
                />
            )}
        </div>
    )
}

export default Poster
