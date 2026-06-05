import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

import Poster from "../components/Poster.jsx"
import Button from "../components/Button.jsx"
import Input from "../components/Input.jsx"

import "../styles/auth.css"
import "../styles/profile.css"

function Profile() {
    const navigate = useNavigate()

    const [profile, setProfile] = useState(null)

    const [entries, setEntries] = useState([])
    const [topRated, setTopRated] = useState([])

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const [isEditing, setIsEditing] = useState(false)

    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")

    // PASSWORD
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [repeatPassword, setRepeatPassword] =
        useState("")

    const [showPasswordForm, setShowPasswordForm] =
        useState(false)

    const [passwordLoading, setPasswordLoading] =
        useState(false)

    const [passwordError, setPasswordError] =
        useState("")

    const [passwordMessage, setPasswordMessage] =
        useState("")

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            setError("")

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (userError) {
                setError(userError.message)
                setLoading(false)
                return
            }

            if (!user) {
                setError("User not found.")
                setLoading(false)
                return
            }

            // PROFILE
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }

            // RECENT ENTRIES
            const { data: entriesData } = await supabase
                .from("entries")
                .select("*")
                .eq("user_id", user.id)
                .order("updated_at", {
                    ascending: false,
                })
                .limit(6)

            // TOP RATED
            const { data: topRatedData } =
                await supabase
                    .from("entries")
                    .select("*")
                    .eq("user_id", user.id)
                    .not("rating", "is", null)
                    .order("rating", {
                        ascending: false,
                    })
                    .limit(6)

            setProfile(data)

            setUsername(data.username || "")
            setBio(data.bio || "")

            setEntries(entriesData || [])
            setTopRated(topRatedData || [])

            setLoading(false)
        }

        loadProfile()
    }, [])

    async function handleSave() {
        setSaving(true)
        setError("")
        setMessage("")

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setError("User not found.")
            setSaving(false)
            return
        }

        const { data, error } = await supabase
            .from("profiles")
            .update({
                username: username.trim(),
                bio: bio.trim(),
            })
            .eq("id", user.id)
            .select()
            .single()

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setProfile(data)
        setMessage("Profile updated.")
        setIsEditing(false)
        setSaving(false)
    }

    async function handleChangePassword() {
        setPasswordError("")
        setPasswordMessage("")

        if (
            !oldPassword ||
            !newPassword ||
            !repeatPassword
        ) {
            setPasswordError(
                "All fields are required."
            )
            return
        }

        if (newPassword !== repeatPassword) {
            setPasswordError(
                "Passwords do not match."
            )
            return
        }

        setPasswordLoading(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const { error: signInError } =
            await supabase.auth.signInWithPassword({
                email: user.email,
                password: oldPassword,
            })

        if (signInError) {
            setPasswordError(
                "Old password is incorrect."
            )

            setPasswordLoading(false)
            return
        }

        const { error: updateError } =
            await supabase.auth.updateUser({
                password: newPassword,
            })

        setPasswordLoading(false)

        if (updateError) {
            setPasswordError(updateError.message)
            return
        }

        setPasswordMessage(
            "Password updated successfully."
        )

        setOldPassword("")
        setNewPassword("")
        setRepeatPassword("")

        setShowPasswordForm(false)
    }

    if (loading) {
        return (
            <section className="profile">
                <p>Loading profile...</p>
            </section>
        )
    }

    if (error && !profile) {
        return (
            <section className="profile">
                <p>{error}</p>
            </section>
        )
    }

    return (
        <section className="profile">
            <div className="profile__top">
                <div className="profile__avatar" />

                <div className="profile__info">
                    {isEditing ? (
                        <>
                            <Input
                                placeholder="Username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                            />

                            <textarea
                                className="input"
                                placeholder="Bio"
                                value={bio}
                                onChange={(e) =>
                                    setBio(
                                        e.target.value
                                    )
                                }
                                rows={4}
                            />

                            <div className="auth__buttons">
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsEditing(
                                            false
                                        )

                                        setUsername(
                                            profile?.username ||
                                            ""
                                        )

                                        setBio(
                                            profile?.bio ||
                                            ""
                                        )
                                    }}
                                />

                                <Button
                                    label={
                                        saving
                                            ? "Saving..."
                                            : "Save"
                                    }
                                    onClick={handleSave}
                                    disabled={saving}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="profile__username">
                                {profile?.username}
                            </h2>

                            <p className="profile__bio">
                                {profile?.bio ||
                                    "No bio yet."}
                            </p>

                            <div className="auth__buttons">
                                <Button
                                    label="Edit Profile"
                                    onClick={() =>
                                        setIsEditing(
                                            true
                                        )
                                    }
                                />

                                <Button
                                    label="Change Password"
                                    variant="secondary"
                                    onClick={() =>
                                        setShowPasswordForm(
                                            true
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* PASSWORD */}
            {showPasswordForm && (
                <div className="profile__password">
                    <h3>Change Password</h3>

                    <Input
                        type="password"
                        placeholder="Old password"
                        value={oldPassword}
                        onChange={(e) =>
                            setOldPassword(
                                e.target.value
                            )
                        }
                    />

                    <Input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(
                                e.target.value
                            )
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Repeat new password"
                        value={repeatPassword}
                        onChange={(e) =>
                            setRepeatPassword(
                                e.target.value
                            )
                        }
                    />

                    {passwordError && (
                        <p>{passwordError}</p>
                    )}

                    {passwordMessage && (
                        <p>{passwordMessage}</p>
                    )}

                    <div className="auth__buttons">
                        <Button
                            label="Back"
                            variant="secondary"
                            onClick={() => {
                                setShowPasswordForm(
                                    false
                                )

                                setPasswordError("")
                                setPasswordMessage("")

                                setOldPassword("")
                                setNewPassword("")
                                setRepeatPassword("")
                            }}
                        />

                        <Button
                            label={
                                passwordLoading
                                    ? "Updating..."
                                    : "Update Password"
                            }
                            onClick={
                                handleChangePassword
                            }
                            disabled={
                                passwordLoading
                            }
                        />
                    </div>
                </div>
            )}

            {/* TOP RATED */}
            <div className="profile__section">
                <h3 className="profile__section-title">
                    Top Rated
                </h3>

                <div className="profile__grid">
                    {topRated.length === 0 && (
                        <p>No rated entries yet.</p>
                    )}

                    {topRated.map((entry) => (
                        <div
                            key={entry.id}
                            className="profile__card"
                            onClick={() =>
                                navigate(
                                    `/details/${entry.media_type}/${entry.tmdb_id}`
                                )
                            }
                        >
                            <Poster
                                movie={
                                    entry.poster_path
                                }
                            />

                            <div className="profile__card-info">
                                <p className="profile__card-title">
                                    {entry.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RECENT */}
            <div className="profile__section">
                <h3 className="profile__section-title">
                    Recently Watching
                </h3>

                <div className="profile__grid">
                    {entries.length === 0 && (
                        <p>No entries yet.</p>
                    )}

                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="profile__card"
                            onClick={() =>
                                navigate(
                                    `/details/${entry.media_type}/${entry.tmdb_id}`
                                )
                            }
                        >
                            <Poster
                                movie={
                                    entry.poster_path
                                }
                            />

                            <div className="profile__card-info">
                                <p className="profile__card-title">
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

export default Profile