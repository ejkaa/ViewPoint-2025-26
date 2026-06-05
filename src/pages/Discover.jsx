import DiscoverContentSection from "../components/DiscoverContentSection.jsx"
import {
    getDiscoverMovies,
    getDiscoverTv,
    getMoviesByGenre,
} from "../backend/api/tmdb"

function Discover() {

    const GENRES = [
        { id: 28, name: "Action" },
        { id: 35, name: "Comedy" },
        { id: 18, name: "Drama" },
        { id: 27, name: "Horror" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Sci-Fi" },
    ]
    return (
        <section className="home">
            <div className="home__image">
                <div className="home__overlay">
                    <h1 className="home__title">Discover</h1>
                </div>
            </div>

            <div className="home__latest">

                <DiscoverContentSection
                    title="Recommended Movies"
                    fetchFunction={getDiscoverMovies}
                />

                <DiscoverContentSection
                    title="Recommended TV Shows"
                    fetchFunction={getDiscoverTv}
                />

                {GENRES.map((genre) => (
                    <DiscoverContentSection
                        key={genre.id}
                        title={genre.name}
                        fetchFunction={() => getMoviesByGenre(genre.id)}
                    />
                ))}

            </div>
        </section>
    )
}

export default Discover