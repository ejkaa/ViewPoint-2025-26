import ContentSection from "../components/ContentSection.jsx";
import SearchInput from "../components/SearchInput.jsx";
import RecommendedSection from "../components/RecommendedSection.jsx";
import {
    getRecommended,
    getRecommendedTv
} from "../backend/api/tmdb"
import "../styles/home.css"

function Home() {
    return (
        <section className="home">
            <div className="home__image">
                <div className="home__overlay">
                    <h1 className="home__title">ViewPoint</h1>
                    <div className="home__input">
                        <SearchInput placeholder="Search movies and TV shows..." />
                    </div>
                </div>
            </div>

            <div className="home__latest" id="latest">

                <RecommendedSection
                    title="Recommended For You"
                    fetchFunction={getRecommended}
                    type="movie"
                />

                <RecommendedSection
                    title="Recommended TV Shows"
                    fetchFunction={getRecommendedTv}
                    type="tv"
                />

                <ContentSection title="Most Popular" />

            </div>
        </section>
    )
}

export default Home
