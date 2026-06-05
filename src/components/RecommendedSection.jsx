import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Poster from "./Poster.jsx"

function RecommendedSection({ title, fetchFunction, type }) {
    const navigate = useNavigate()
    const [items, setItems] = useState([])

    useEffect(() => {
        async function load() {
            const data = await fetchFunction()
            setItems(data)
        }

        load()
    }, [fetchFunction])

    if (!items.length) return null

    return (
        <section className="content-section">
            <h3 className="content-section__title">
                {title}
            </h3>

            <div className="content-section__grid">
                {items.map((item) => (
                    <Poster
                        key={item.id}
                        movie={item.poster_path}
                        onClick={() =>
                            navigate(`/details/${type}/${item.id}`)
                        }
                    />
                ))}
            </div>
        </section>
    )
}

export default RecommendedSection