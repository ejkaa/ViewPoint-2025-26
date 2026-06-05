import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"

import "./components/componentsMedia.css"
import "./pages/pagesMedia.css"
import "./app.css"

import { supabase } from "./lib/supabase"

import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register"
import Profile from "./pages/Profile.jsx"
import Details from "./pages/Details.jsx"
import Friendlist from "./pages/Friendlist.jsx"
import Watchlist from "./pages/Watchlist.jsx"
import ScrollToTop from "./backend/ScrollToTop.jsx"
import SearchResults from "./pages/SearchResults.jsx"
import ProtectedRoute from "./backend/ProtectedRoute.jsx"
import FriendDetail from "./pages/FriendDetail.jsx";
import About from "./pages/About.jsx";
import Discover from "./pages/Discover.jsx";

function App() {
    const [session, setSession] = useState(null)
    const [loadingAuth, setLoadingAuth] = useState(true)

    const [isDarkMode, setIsDarkMode] = useState(true)

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev)
    }

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            isDarkMode ? "dark" : "light"
        )
    }, [isDarkMode])

    useEffect(() => {
        async function loadSession() {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error("Session load error:", error.message)
            } else {
                setSession(data.session)
            }

            setLoadingAuth(false)
        }

        loadSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    async function handleLogout() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error("Logout error:", error.message)
        }
    }

    const isLoggedIn = !!session

    if (loadingAuth) {
        return <div className="page">Loading...</div>
    }

    return (
        <BrowserRouter>
            <ScrollToTop />

            <Header
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />

            <div className="page">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<About/>}/>
                    <Route path="/discover" element={<Discover/>}/>

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute session={session}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/watchlist"
                        element={
                            <ProtectedRoute session={session}>
                                <Watchlist />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/friendlist"
                        element={
                            <ProtectedRoute session={session}>
                                <Friendlist />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/friend/:id" element={<FriendDetail />} />

                    <Route
                        path="/details/:mediaType/:id"
                        element={<Details isLoggedIn={isLoggedIn} />}
                    />

                    <Route path="/search" element={<SearchResults />} />
                </Routes>
            </div>

            <Footer />
        </BrowserRouter>
    )
}

export default App