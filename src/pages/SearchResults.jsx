import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { searchMulti } from "../backend/api/tmdb"
import SearchResult from "../components/SearchResult.jsx";
import SearchInput from "../components/SearchInput.jsx";
import "../styles/searchResults.css"

function SearchResults() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const query = searchParams.get("search")

    const [movies, setMovies] = useState([])
    const [tvSeries, setTvSeries] = useState([])
    const [activeTab, setActiveTab] = useState("movies");

    useEffect(() => {
        async function fetchResults() {
            if (!query) return
            try {
                const movieResults = await searchMulti(query, "movie")
                const tvResults = await searchMulti(query, "tv")

                setMovies(movieResults.slice(0, 5))
                setTvSeries(tvResults.slice(0, 5))
            } catch (error) { console.error("Search failed:", error) }
        }
        fetchResults()
    }, [query])

    // console.log(movies , tvSeries)

    return (
        <div className="search">
            <SearchInput placeholder="Search movies and TV shows..." />

            <h2 className="search__title">
                Search results{query && ` for "${query}"`}
            </h2>

            {/* MOBILE TABS */}
            <div className="search__tabs">
                <button
                    className={`search__tab ${activeTab === "movies" ? "active" : ""}`}
                    onClick={() => setActiveTab("movies")}
                >
                    Movies
                </button>

                <button
                    className={`search__tab ${activeTab === "tv" ? "active" : ""}`}
                    onClick={() => setActiveTab("tv")}
                >
                    TV Shows
                </button>
            </div>

            <div className="search__columns">
                {/* MOVIES */}
                <div
                    className={`search__column ${
                        activeTab !== "movies" ? "mobile-hidden" : ""
                    }`}
                >
                    <h3 className="search__column-title">Movies</h3>

                    {movies.map((item) => (
                        <SearchResult
                            key={`movie-${item.id}`}
                            item={item}
                            type="movie"
                        />
                    ))}
                </div>

                {/* TV SHOWS */}
                <div
                    className={`search__column ${
                        activeTab !== "tv" ? "mobile-hidden" : ""
                    }`}
                >
                    <h3 className="search__column-title">TV Shows</h3>

                    {tvSeries.map((item) => (
                        <SearchResult
                            key={`tv-${item.id}`}
                            item={item}
                            type="tv"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchResults