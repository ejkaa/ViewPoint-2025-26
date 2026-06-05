import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

import Input from "../components/Input"
import Button from "../components/Button"
import "../styles/auth.css"

function Register() {
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setError(null)
        setLoading(true)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
            },
        })

        if (error) {
            console.log(error)
            setError(error.message)
            setLoading(false)
            return
        }

        // success
        console.log("User created:", data)

        setLoading(false)

        // presmerovanie (môžeš zmeniť)
        navigate("/profile")
    }

    return (
        <section className="auth">
            <div className="auth__card">
                <h2 className="auth__title">Register</h2>

                <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    placeholder="Password"
                    type="password"
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
                        label={loading ? "Loading..." : "Register"}
                        onClick={handleRegister}
                    />
                </div>
            </div>
        </section>
    )
}

export default Register