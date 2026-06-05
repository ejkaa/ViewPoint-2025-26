import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function CommentSection({ tmdbId, mediaType }) {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(false)

    // ---------------- LOAD COMMENTS ----------------
    useEffect(() => {
        if (!tmdbId) return

        async function fetchComments() {
            const { data, error } = await supabase
                .from("comments")
                .select(`
                    id,
                    content,
                    created_at,
                    profiles ( username )
                `)
                .eq("tmdb_id", Number(tmdbId))
                .eq("media_type", mediaType)
                .order("created_at", { ascending: false })

            if (!error) setComments(data)
        }

        fetchComments()
    }, [tmdbId, mediaType])

    // ---------------- ADD COMMENT ----------------
    async function handleAddComment() {
        if (!newComment.trim()) return

        setLoading(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase.from("comments").insert({
            user_id: user.id,
            tmdb_id: Number(tmdbId),
            media_type: mediaType,
            content: newComment.trim(),
        })

        setLoading(false)

        if (!error) {
            setNewComment("")

            // reload
            const { data } = await supabase
                .from("comments")
                .select(`
                    id,
                    content,
                    created_at,
                    profiles ( username )
                `)
                .eq("tmdb_id", Number(tmdbId))
                .eq("media_type", mediaType)
                .order("created_at", { ascending: false })

            setComments(data)
        }
    }

    return (
        <div className="comments">
            {/* INPUT */}
            <div className="comments__input">
                <textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />

                <button onClick={handleAddComment} disabled={loading}>
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>

            {/* COMMENTS */}
            <div className="comments__list">
                {comments.map((c) => (
                    <div key={c.id} className="comment">
                        <div className="comment__header">
                            <strong>
                                {c.profiles?.username || "User"}
                            </strong>
                            <span>
                                {new Date(c.created_at).toLocaleString()}
                            </span>
                        </div>

                        <p>{c.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CommentSection