import { useEffect, useRef, useState } from "react"
import "../styles/header.css"
import Button from "./Button"
import Logo from "./Logo.jsx"

import iconLight from "../assets/icon-light-mode.svg"
import iconDark from "../assets/icon-dark-mode.svg"
import iconMenu from "../assets/icon-menu.svg"

function Header({
                    isLoggedIn,
                    onLogout,
                    isDarkMode,
                    toggleDarkMode,
                }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const headerRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                headerRef.current &&
                !headerRef.current.contains(event.target)
            ) {
                setMenuOpen(false)
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        )

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            )
        }
    }, [])

    return (
        <header
            className="header"
            ref={headerRef}
        >
            <div className="header__top">
                <Logo />

                <div className="header__right">
                    <button
                        className="header__menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <img
                            src={iconMenu}
                            alt="Menu"
                        />
                    </button>
                </div>
            </div>

            <nav
                className={
                    menuOpen
                        ? "header__nav header__nav--open"
                        : "header__nav"
                }
            >
                <Button
                    label="Home"
                    variant="plain"
                    href="/"
                    onClick={() => setMenuOpen(false)}
                />

                <Button
                    label="Discover"
                    variant="plain"
                    href="/discover"
                    onClick={() => setMenuOpen(false)}
                />

                <Button
                    label="About"
                    variant="plain"
                    href="/about"
                    onClick={() => setMenuOpen(false)}
                />

                {!isLoggedIn && (
                    <>
                        <Button
                            label="Register"
                            variant="secondary"
                            href="/register"
                            onClick={() => setMenuOpen(false)}
                        />

                        <Button
                            label="Login"
                            variant="primary"
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                        />
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <Button
                            label="Friendlist"
                            variant="plain"
                            href="/friendlist"
                            onClick={() => setMenuOpen(false)}
                        />

                        <Button
                            label="Watchlist"
                            variant="plain"
                            href="/watchlist"
                            onClick={() => setMenuOpen(false)}
                        />

                        <Button
                            label="Profile"
                            variant="plain"
                            href="/profile"
                            onClick={() => setMenuOpen(false)}
                        />

                        <Button
                            label="Logout"
                            variant="secondary"
                            href="/"
                            onClick={() => {
                                onLogout()
                                setMenuOpen(false)
                            }}
                        />
                    </>
                )}

                <img
                    className="theme-toggle"
                    src={isDarkMode ? iconLight : iconDark}
                    onClick={toggleDarkMode}
                    alt="Theme Toggle"
                />

            </nav>
        </header>
    )
}

export default Header