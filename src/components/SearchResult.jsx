import "../styles/searchResult.css"

import { useNavigate } from "react-router-dom";
import Poster from "./Poster.jsx";

function SearchResult({ item, type }) {
    const navigate = useNavigate();

    const title = type === "movie" ? item.title : item.name;

    return (
        <div className="search__result"
            onClick={() => navigate(`/details/${type}/${item.id}`)}
        >
            <Poster className="search__poster" movie={item.poster_path} />

            <div className="search__text">
                <h3 className="search__name">{title}</h3>

                <p className="search__description">
                    {item.overview || "No description available."}
                </p>

                <span className="search__genres">
                    {type === "movie" ? "Movie" : "TV Series"}
                </span>
            </div>

            <div className="search__score">
                {item.vote_average?.toFixed(1) || "–"}
            </div>
        </div>
    );
}

export default SearchResult;