import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { WATCHLIST_CATEGORIES } from "../constants/watchlistCategories"
import Poster from "../components/Poster.jsx"
import "../styles/watchlist.css"

function Watchlist() {
    const navigate = useNavigate()

    const [activeCategory, setActiveCategory] = useState("watching")
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [recommendations, setRecommendations] = useState([])

    useEffect(() => {
        async function loadEntries() {
            setLoading(true)
            setError("")

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (userError || !user) {
                setError(userError?.message || "User not found.")
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from("entries")
                .select("*")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false })

            const { data: recData } = await supabase
                .from("recommendations")
                .select(`
                    *,
                    profiles:from_user_id ( username )
                `)
                .eq("to_user_id", user.id)
                .order("created_at", { ascending: false })

            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }

            setEntries(data || [])
            setRecommendations(recData || [])
            setLoading(false)
        }

        loadEntries()
    }, [])

    const filteredEntries = useMemo(() => {
        return entries.filter(
            (entry) => entry.status === activeCategory
        )
    }, [entries, activeCategory])

    async function handleDeleteRecommendation(id) {
        await supabase.from("recommendations").delete().eq("id", id)

        setRecommendations((prev) =>
            prev.filter((r) => r.id !== id)
        )
    }

    if (loading) return <section className="watchlist">Loading watchlist...</section>
    if (error) return <section className="watchlist">{error}</section>

    return (
        <section className="watchlist">
            <div className="watchlist__header">
                <h2>My Watchlist</h2>
            </div>

            <div className="watchlist__main">
                <div className="watchlist__sidebar">
                    {WATCHLIST_CATEGORIES.map((cat) => (
                        <div
                            key={cat.value}
                            className={`watchlist__category ${
                                activeCategory === cat.value
                                    ? "watchlist__category--active"
                                    : ""
                            }`}
                            onClick={() => setActiveCategory(cat.value)}
                        >
                            {cat.label}
                        </div>
                    ))}
                </div>

                <div className="watchlist__content">
                    <div className="watchlist__items">
                        {filteredEntries.length === 0 ? (
                            <p>No items in this category yet.</p>
                        ) : (
                            filteredEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="watchlist__item"
                                    onClick={() =>
                                        navigate(
                                            `/details/${entry.media_type}/${entry.tmdb_id}`
                                        )
                                    }
                                >
                                    <Poster
                                        className="watchlist__poster"
                                        movie={entry.poster_path}
                                    />

                                    <div className="watchlist__info">
                                        <h4 className="watchlist__title">
                                            {entry.title || "Unknown title"}
                                        </h4>

                                        <span className="watchlist__type">
                                            {entry.media_type}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="watchlist__recommendations">
                <h3>Friends Recommendations</h3>

                {recommendations.length === 0 ? (
                    <p>No recommendations yet.</p>
                ) : (
                    <div className="watchlist__items">
                        {recommendations.map((rec) => (
                            <div
                                key={rec.id}
                                className="watchlist__item"
                            >
                                <button
                                    onClick={() =>
                                        handleDeleteRecommendation(rec.id)
                                    }
                                    className="watchlist__delete"
                                >
                                    X
                                </button>

                                <div className="watchlist__info">
                                    <p className="watchlist__title">
                                        {rec.title}
                                    </p>

                                    <p className="watchlist__type">
                                        {rec.profiles?.username}
                                    </p>
                                </div>

                                <Poster movie={rec.poster_path} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Watchlist