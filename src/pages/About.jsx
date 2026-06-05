import React from "react"
import "../styles/about.css"

function About() {
    return (
        <section className="about">
            <div className="about__container">
                <h1 className="about__title">About</h1>

                <p className="about__text">
                    This is a simple web app designed to help you keep track of
                    movies and TV shows you watch.
                </p>

                <h2 className="about__subtitle">What you can do</h2>
                <ul className="about__list">
                    <li>Save movies and TV shows to your watchlist</li>
                    <li>Organize them into categories</li>
                    <li>Rate what you’ve watched</li>
                    <li>Track episodes for TV shows</li>
                </ul>

                <h2 className="about__subtitle">Why this app exists</h2>
                <p className="about__text">
                    It’s easy to forget what you’ve watched or what you planned
                    to watch. This app gives you one place to manage everything
                    simply and clearly.
                </p>

                <h2 className="about__subtitle">Tech</h2>
                <p className="about__text">
                    Built with React, Supabase, and TMDB API.
                </p>

                <h2 className="about__subtitle">Goal</h2>
                <p className="about__text">
                    The goal is to provide a simple and fast way to track your
                    watching experience without unnecessary complexity.
                </p>
            </div>
        </section>
    )
}

export default About