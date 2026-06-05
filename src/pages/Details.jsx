import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getMovieDetails, getTvDetails } from "../backend/api/tmdb"
import { supabase } from "../lib/supabase"
import { WATCHLIST_CATEGORIES } from "../constants/watchlistCategories"

import shareIcon from "../assets/icon-share.svg"
import addIcon from "../assets/icon-add.svg"
import playIcon from "../assets/icon-play.svg"
import savedIcon from "../assets/icon-saved.svg"

import Poster from "../components/Poster.jsx"
import Button from "../components/Button.jsx"
import "../styles/details.css"

function Details({ isLoggedIn }) {
    const { mediaType, id } = useParams()

    const [media, setMedia] = useState(null)

    const [showCopied, setShowCopied] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [savedCategory, setSavedCategory] = useState(null)
    const [isOverlayOpen, setIsOverlayOpen] = useState(false)
    const [entryId, setEntryId] = useState(null)

    const [saveError, setSaveError] = useState("")
    const [saveLoading, setSaveLoading] = useState(false)
    const [showRecommend, setShowRecommend] = useState(false)
    const [friends, setFriends] = useState([])

    const [ratingInput, setRatingInput] = useState("")
    const [ratingError, setRatingError] = useState("")
    const [ratingLoading, setRatingLoading] = useState(false)

    const [episodesWatched, setEpisodesWatched] = useState(0)

    const normalizedMediaType = mediaType === "tv" ? "tv" : "movie"
    const mediaTitle = media?.title || media?.name || "Unknown title"

    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [commentLoading, setCommentLoading] = useState(false)
    const [showShared, setShowShared] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)

    useEffect(() => {
        async function fetchDetails() {
            if (!id) return

            try {
                const data =
                    normalizedMediaType === "tv"
                        ? await getTvDetails(id)
                        : await getMovieDetails(id)

                setMedia(data)
            } catch (err) {
                console.error(err)
            }
        }

        fetchDetails()
    }, [id, normalizedMediaType])

    useEffect(() => {
        async function loadEntry() {
            if (!isLoggedIn || !id) return

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return

            const { data } = await supabase
                .from("entries")
                .select("*")
                .eq("user_id", user.id)
                .eq("tmdb_id", Number(id))
                .eq("media_type", normalizedMediaType)
                .maybeSingle()

            if (data) {
                setEntryId(data.id)
                setSavedCategory(data.status)

                setRatingInput(
                    data.rating !== null && data.rating !== undefined
                        ? String(data.rating)
                        : ""
                )

                setEpisodesWatched(data.episodes_watched || 0)
            } else {
                setEntryId(null)
                setSavedCategory(null)
                setRatingInput("")
                setEpisodesWatched(0)
            }
        }

        loadEntry()
    }, [isLoggedIn, id, normalizedMediaType])

    useEffect(() => {
        if (!id) return

        async function fetchComments() {
            const { data, error } = await supabase
                .from("comments")
                .select(`
                id,
                content,
                created_at,
                profiles ( username )
            `)
                .eq("tmdb_id", Number(id))
                .eq("media_type", normalizedMediaType)
                .order("created_at", {
                    ascending: false,
                })

            if (!error) {
                setComments(data || [])
            }
        }

        fetchComments()
    }, [id, normalizedMediaType])

    async function handleRemoveRating() {
        setRatingError("")
        setRatingLoading(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase
            .from("entries")
            .update({ rating: null })
            .eq("user_id", user.id)
            .eq("tmdb_id", Number(id))
            .eq("media_type", normalizedMediaType)

        setRatingLoading(false)

        if (error) setRatingError(error.message)
    }

    async function loadFriends() {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase.rpc("get_mutual_follows", {
            user_id_input: user.id,
        })

        setFriends(data || [])
    }
    // ---------------- HELPERS ----------------
    function handleRatingClick(value) {
        const current = Number(ratingInput)

        if (current === value) {
            setRatingInput("")
            handleRemoveRating()
        } else {
            setRatingInput(String(value))
            handleSaveRating(value)
        }
    }

    function parseRating(value) {
        if (!value) return null

        const normalized = value.replace(",", ".")
        const num = parseFloat(normalized)

        if (isNaN(num)) return null

        return Math.min(10, Math.max(0, num))
    }

    function handleRatingChange(value) {
        if (/^[0-9.,]*$/.test(value)) {
            setRatingInput(value)
        }
    }

    function handleEpisodesChange(value) {
        if (value === "") {
            setEpisodesWatched("")
            return
        }

        const num = Number(value)
        if (!isNaN(num) && num >= 0) {
            setEpisodesWatched(Math.floor(num))
        }
    }

    const parsedRating =
        parseRating(ratingInput)

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 3000)
    }

    async function handleRecommend(userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        await supabase.from("recommendations").insert({
            from_user_id: user.id,
            to_user_id: userId,
            tmdb_id: Number(id),
            media_type: normalizedMediaType,
            title: mediaTitle,
            poster_path: media?.poster_path || null,
        })
        console.log("recomendation save ")

        setShowRecommend(false)
        setShowShared(true)
        setTimeout(() => {
            setShowShared(false)
        }, 3000)
    }

    // ---------------- SAVE RATING ----------------
    async function handleSaveRating(value) {
        setRatingError("")
        setRatingLoading(true)

        const rating = Number(value)

        if (!rating || rating < 1 || rating > 10) {
            setRatingError("Invalid rating (1–10)")
            setRatingLoading(false)
            return
        }

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase.from("entries").upsert(
            {
                user_id: user.id,
                tmdb_id: Number(id),
                media_type: normalizedMediaType,
                rating,
                episodes_watched:
                    normalizedMediaType === "tv"
                        ? Number(episodesWatched)
                        : 0,
                title: mediaTitle,
                poster_path: media?.poster_path || null,
            },
            {
                onConflict: "user_id,tmdb_id,media_type",
            }
        )

        setRatingLoading(false)

        if (error) setRatingError(error.message)
    }

    // ---------------- WATCHLIST ----------------
    async function handleSaveToWatchlist(status) {
        setSaveError("")
        setSaveLoading(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
            .from("entries")
            .upsert(
                {
                    user_id: user.id,
                    tmdb_id: Number(id),
                    media_type: normalizedMediaType,
                    status,
                    rating: parseRating(ratingInput),
                    episodes_watched:
                        normalizedMediaType === "tv"
                            ? Number(episodesWatched)
                            : 0,
                    title: mediaTitle,
                    poster_path: media?.poster_path || null,
                },
                {
                    onConflict: "user_id,tmdb_id,media_type",
                }
            )
            .select()
            .single()

        setSaveLoading(false)

        if (error) {
            setSaveError(error.message)
            return
        }

        setEntryId(data.id)
        setSavedCategory(data.status)
        setIsAddOpen(false)
    }

    async function handleRemoveFromWatchlist() {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        await supabase
            .from("entries")
            .delete()
            .eq("user_id", user.id)
            .eq("tmdb_id", Number(id))
            .eq("media_type", normalizedMediaType)

        setEntryId(null)
        setSavedCategory(null)
        setRatingInput("")
        setEpisodesWatched(0)
        setIsAddOpen(false)
    }

    async function handleAddComment() {
        if (!newComment.trim()) return

        setCommentLoading(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            setCommentLoading(false)
            return
        }

        const { error } = await supabase
            .from("comments")
            .insert({
                user_id: user.id,
                tmdb_id: Number(id),
                media_type: normalizedMediaType,
                content: newComment.trim(),
            })

        setCommentLoading(false)

        if (error) return

        setNewComment("")

        const { data } = await supabase
            .from("comments")
            .select(`
            id,
            content,
            created_at,
            profiles ( username )
        `)
            .eq("tmdb_id", Number(id))
            .eq("media_type", normalizedMediaType)
            .order("created_at", {
                ascending: false,
            })

        setComments(data || [])
    }

    if (!media) return <p>Loading...</p>

    return (
        <section className="details">

            <div className="details__main">
                <div className="details__poster-wrapper">
                    <Poster
                        className="details__poster"
                        movie={media?.poster_path}
                        showPlay
                        onPlayClick={() => setIsOverlayOpen(true)}
                    />
                </div>

                <div className="details__info">
                    <h1 className="details__title">
                        {media.title || media.name}
                    </h1>

                    <div className="details__genres">
                        {media.genres?.map((genre) => (
                            <span
                                key={genre.id}
                                className="details__genre"
                            >
                                {genre.name}
                            </span>
                        ))}
                    </div>

                    <div className="details__score">
                        Score: {media.vote_average?.toFixed(1)}
                    </div>

                    <p className="details__overview">
                        {media.overview}
                    </p>

                    <div className="details__widgets">
                        <div className="details__rating-box">
                            <h3>Your Rating</h3>

                            <div className="rating__picker">
                                {Array.from({ length: 10 }, (_, i) => {
                                    const value = i + 1

                                    return (
                                        <button
                                            key={value}
                                            className={`rating__circle ${
                                                Number(ratingInput) === value ? "is-active" : ""
                                            }`}
                                            onClick={() => handleRatingClick(value)}
                                        >
                                            {value}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {normalizedMediaType === "tv" && (
                            <div className="details__episodes">
                                <h3>Episodes watched</h3>

                                <div className="episodes__controls">
                                    {/* DOWN */}
                                    <button
                                        className="episodes__arrow"
                                        onClick={() =>
                                            setEpisodesWatched((prev) =>
                                                Math.max(0, Number(prev || 0) - 1)
                                            )
                                        }
                                    >
                                        ↓
                                    </button>

                                    {/* NUMBER DISPLAY */}
                                    <div className="episodes__count">
                                        {episodesWatched || 0}
                                    </div>

                                    {/* UP */}
                                    <button
                                        className="episodes__arrow"
                                        onClick={() =>
                                            setEpisodesWatched((prev) =>
                                                Number(prev || 0) + 1
                                            )
                                        }
                                    >
                                        ↑
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                    <div className="details__actions">
                        <div className="details__share">
                            <img
                                src={shareIcon}
                                alt="share"
                                onClick={() => {
                                    setShowRecommend(true)
                                    loadFriends()
                                }}
                            />

                            {showCopied && (
                                <span className="details__copied">
                                    Link copied
                                </span>
                            )}

                            {showShared && (
                                <span className="details__shared">
                                    Shared
                                </span>
                            )}
                        </div>

                        <div className="details__share">
                            {isLoggedIn && (
                                <img
                                    src={savedCategory ? savedIcon : addIcon}
                                    alt="save"
                                    onClick={() => setIsAddOpen(true)}
                                />
                            )}
                            {isLoggedIn && savedCategory && (
                                <span className="details__category">
                                    {
                                        WATCHLIST_CATEGORIES.find(
                                            (c) => c.value === savedCategory
                                        )?.label || savedCategory
                                    }
                                </span>
                            )}
                        </div>
                    </div>

                    {showRecommend && (
                        <div className="overlay" onClick={() => setShowRecommend(false)}>
                            <div
                                className="overlay__content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3>Share with a friend</h3>

                                {friends.length === 0 ? (
                                    <p>No mutual friends.</p>
                                ) : (
                                    <div className="recommend__grid">
                                        {friends.map((f) => {
                                            if (!f) return null
                                            return (
                                                <div
                                                    key={f.id}
                                                    className="recommend__item"
                                                    onClick={() => handleRecommend(f.id)}
                                                >
                                                    <div className="recommend__avatar" />

                                                    <span className="recommend__username">
                                                        {f.username || "Unknown user"}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="overlay__actions">
                                    <Button
                                        variant="secondary"
                                        label="Back"
                                        onClick={() => setShowRecommend(false)}
                                    />

                                    <Button
                                        variant="primary"
                                        label="Copy link"
                                        onClick={() => {
                                            handleCopyUrl()
                                            setShowRecommend(false)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
            </div>

            {/* COMMENTS */}
            <div className="details__comments">
                <h3 className="details__section-title">
                    Comments
                </h3>

                {isLoggedIn && (
                    <div className="details__comment-input">
                        <textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) =>
                                setNewComment(e.target.value)
                            }
                        />

                        <button
                            onClick={handleAddComment}
                            disabled={commentLoading}
                        >
                            {commentLoading
                                ? "Posting..."
                                : "Post"}
                        </button>
                    </div>
                )}

                <div className="details__comment-list">
                    {comments.length === 0 && <p>No comments yet.</p>}

                    {comments.map((comment) => (
                        <div key={comment.id} className="details__comment">

                            {/* AVATAR */}
                            <div className="details__comment-avatar" />

                            {/* CONTENT */}
                            <div className="details__comment-body">
                                <div className="details__comment-header">
                    <span className="details__comment-user">
                        {comment.profiles?.username || "User"}
                    </span>

                                    <span className="details__comment-date">
                        {new Date(comment.created_at).toLocaleString()}
                    </span>
                                </div>

                                <p className="details__comment-text">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* WATCHLIST MODAL */}
            {isAddOpen && (
                <div className="overlay" onClick={() => setIsAddOpen(false)}>
                    <div
                        className="overlay__content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Save "{mediaTitle}"</h3>

                        <div className="overlay__buttons">
                            <div className="overlay__categories">
                                {WATCHLIST_CATEGORIES.map((cat) => (
                                    <Button
                                        key={cat.value}
                                        label={cat.label}
                                        variant={
                                            selectedCategory === cat.value
                                                ? "primary"
                                                : "secondary"
                                        }
                                        onClick={() => {
                                            setSelectedCategory(cat.value)
                                            handleSaveToWatchlist(cat.value)
                                        }}
                                    />
                                ))}
                            </div>

                            <Button
                                label="Remove from saved"
                                variant="plain"
                                onClick={handleRemoveFromWatchlist}
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Details