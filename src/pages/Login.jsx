import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

import Button from "../components/Button"
import "../styles/auth.css"

function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        console.log("submit bezi")
        e.preventDefault()

        setError("")
        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            setError(error.message)
            return
        }

        console.log("Logged in:", data)
        navigate("/profile")
    }

    return (
        <form className="auth" onSubmit={handleSubmit}>
            <div className="auth__card">
                <h2 className="auth__title">Login</h2>

                <input
                    className="input"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <div className="auth__buttons">
                    <Button
                        label="Back"
                        variant="secondary"
                        href="/"
                    />

                    <Button
                        type="submit"
                        label={loading ? "Logging in..." : "Login"}
                        disabled={loading}
                    />
                </div>
            </div>
        </form>
    )
}

export default Login