import "../styles/contentSection.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Poster from "./Poster.jsx"

function DiscoverContentSection({ title, fetchFunction }) {
    const navigate = useNavigate()
    const [items, setItems] = useState([])

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchFunction()
                setItems(data)
            } catch (err) {
                console.error(err)
            }
        }

        load()
    }, [fetchFunction])

    return (
        <section className="content-section">
            <h3 className="content-section__title">{title}</h3>

            <div className="content-section__grid">
                {items.map((item) => (
                    <Poster
                        key={item.id}
                        className="content-block"
                        movie={item.poster_path}
                        onClick={() =>
                            navigate(`/details/${item.media_type || (item.first_air_date ? "tv" : "movie")}/${item.id}`)
                        }
                    />
                ))}
            </div>
        </section>
    )
}

export default DiscoverContentSection