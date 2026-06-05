import "../styles/contentSection.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPopularMovies } from "../backend/api/tmdb"
import Poster from "./Poster.jsx";

function ContentSection({ title }) {
    const navigate = useNavigate()
    const [movies, setMovies] = useState([])
    const numberOfBlocks = 20

    useEffect(() => {
        async function fetchMovies() {
            try {
                const movies = await getPopularMovies()
                setMovies(movies.slice(0, numberOfBlocks))
            } catch (error) {
                console.error(error)
            }
        }

        fetchMovies()
    }, [])

    // console.log(movies)
    return (
        <section className="content-section">
            <h3 className="content-section__title">{title}</h3>

            <div className="content-section__grid">
                {movies.map((movie) => (
                    <Poster className="content-block"
                        movie={movie.poster_path}
                        onClick={() => navigate(`/details/${movie.media_type}/${movie.id}`)}
                    />
                ))}
            </div>
        </section>
    )
}

export default ContentSection
