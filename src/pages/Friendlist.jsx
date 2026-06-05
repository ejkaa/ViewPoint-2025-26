import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Button from "../components/Button.jsx"

import {
    getMyFriends,
    getFollowing,
    getFollowers,
    addFriendByEmail,
} from "../lib/friends"

import "../styles/friendlist.css"

function Friendlist() {
    const navigate = useNavigate()

    const [activeTab, setActiveTab] =
        useState("following")

    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)

    const [overlayOpen, setOverlayOpen] =
        useState(false)

    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [activeTab])

    async function loadUsers() {
        try {
            setLoading(true)

            let data = []

            if (activeTab === "following") {
                data = await getFollowing()
            } else if (
                activeTab === "followers"
            ) {
                data = await getFollowers()
            } else {
                data = await getMyFriends()
            }

            setFriends(data || [])
        } catch (err) {
            console.error(
                "Load users error:",
                err.message
            )
        } finally {
            setLoading(false)
        }
    }

    async function handleAddFriend() {
        try {
            setAdding(true)
            setError("")

            if (!email) {
                throw new Error(
                    "Email is required"
                )
            }

            await addFriendByEmail(email)

            setEmail("")
            setOverlayOpen(false)

            await loadUsers()
        } catch (err) {
            setError(err.message)
        } finally {
            setAdding(false)
        }
    }

    return (
        <section className="friendlist">
            <div className="friendlist__header">
                <h2>Friendlist</h2>

                <Button
                    label="Add Follow"
                    onClick={() => {
                        setError("")
                        setOverlayOpen(true)
                    }}
                />
            </div>

            <div className="friendlist__main">

                {/* SIDEBAR TABS */}
                <div className="friendlist__sidebar">

                    <div
                        className={`friendlist__category ${
                            activeTab === "following"
                                ? "friendlist__category--active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab(
                                "following"
                            )
                        }
                    >
                        Following
                    </div>

                    <div
                        className={`friendlist__category ${
                            activeTab === "followers"
                                ? "friendlist__category--active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab(
                                "followers"
                            )
                        }
                    >
                        Followers
                    </div>

                    <div
                        className={`friendlist__category ${
                            activeTab === "mutuals"
                                ? "friendlist__category--active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab(
                                "mutuals"
                            )
                        }
                    >
                        Mutuals
                    </div>

                </div>

                {/* CONTENT */}
                <div className="friendlist__content">

                    {loading && <p>Loading...</p>}

                    {!loading &&
                        friends.length === 0 && (
                            <p>No users found.</p>
                        )}

                    <div className="friendlist__grid">
                        {friends.map((user) => {
                            if (!user) return null

                            return (
                                <div
                                    key={user.id}
                                    className="friendlist__item"
                                    onClick={() =>
                                        navigate(
                                            `/friend/${user.id}`
                                        )
                                    }
                                >
                                    <div className="friendlist__avatar" />

                                    <span className="friendlist__username">
                                        {user.username ||
                                            "Unknown user"}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                </div>
            </div>

            {/* OVERLAY */}
            {overlayOpen && (
                <div className="friendlist__overlay">
                    <div className="friendlist__overlay-content">
                        <h3>Add Follow</h3>

                        <input
                            className="input"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />

                        {error && (
                            <p className="error">
                                {error}
                            </p>
                        )}

                        <div className="friendlist__actions">
                            <Button
                                label={
                                    adding
                                        ? "Adding..."
                                        : "Follow"
                                }
                                onClick={
                                    handleAddFriend
                                }
                                disabled={adding}
                            />

                            <Button
                                label="Close"
                                onClick={() =>
                                    setOverlayOpen(
                                        false
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Friendlist