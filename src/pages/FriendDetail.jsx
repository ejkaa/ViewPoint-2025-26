import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import Poster from "../components/Poster.jsx"

import "../styles/friendDetail.css"

function FriendDetail() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [profile, setProfile] = useState(null)
    const [entries, setEntries] = useState([])
    const [topRated, setTopRated] = useState([])

    useEffect(() => {
        if (!id) return

        async function loadProfile() {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .maybeSingle()

            setProfile(data)
        }

        async function loadEntries() {
            const { data } = await supabase
                .from("entries")
                .select("*")
                .eq("user_id", id)
                .order("updated_at", { ascending: false })
                .limit(6)

            setEntries(data || [])
        }

        async function loadTopRated() {
            const { data } = await supabase
                .from("entries")
                .select("*")
                .eq("user_id", id)
                .not("rating", "is", null)
                .order("rating", { ascending: false })
                .limit(6)

            setTopRated(data || [])
        }

        loadProfile()
        loadEntries()
        loadTopRated()
    }, [id])

    if (!profile) return <p>Loading...</p>

    return (
        <section className="friend">
            {/* TOP */}
            <div className="friend__top">
                <div className="friend__avatar" />

                <div className="friend__info">
                    <h2 className="friend__username">
                        {profile.username}
                    </h2>

                    <p className="friend__bio">
                        {profile.bio || "No bio yet."}
                    </p>
                </div>
            </div>

            {/* TOP RATED */}
            <div className="friend__section">
                <h3 className="friend__section-title">Top Rated</h3>

                <div className="friend__grid">
                    {topRated.length === 0 && <p>No rated entries yet.</p>}

                    {topRated.map((entry) => (
                        <div
                            key={entry.id}
                            className="friend__card"
                            onClick={() =>
                                navigate(
                                    `/details/${entry.media_type}/${entry.tmdb_id}`
                                )
                            }
                        >
                            <Poster movie={entry.poster_path} />

                            <div className="friend__card-info">
                                <p className="friend__card-title">
                                    {entry.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RECENT */}
            <div className="friend__section">
                <h3 className="friend__section-title">
                    Recently Watching
                </h3>

                <div className="friend__grid">
                    {entries.length === 0 && <p>No entries yet.</p>}

                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="friend__card"
                            onClick={() =>
                                navigate(
                                    `/details/${entry.media_type}/${entry.tmdb_id}`
                                )
                            }
                        >
                            <Poster movie={entry.poster_path} />

                            <div className="friend__card-info">
                                <p className="friend__card-title">
                                    {entry.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FriendDetail