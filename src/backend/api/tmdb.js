import axios from "axios";
import {supabase} from "../../lib/supabase.jsx";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const searchMovies = async (query) => {
    // console.log(query);
    const response = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
            api_key: API_KEY,
            query,
            include_adult: false,
            language: "en-US",
        },
    });
    return response.data.results;
};

export const getPopularMovies = async () => {
    const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
            api_key: API_KEY,
            language: "en-US",
            sort_by: "popularity.desc",
            without_genres: 27, // ❌ removes horror
            include_adult: false,
            page: 1,
        },
    })

    return response.data.results
}

export const getMovieDetails = async (movieId) => {
    // console.log(movieId);
    const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
        params: {
            api_key: API_KEY,
            language: "en-US",
        },
    })
    //console.log(response.data)
    return response.data
}

export const getTvDetails = async (movieId) => {
    // console.log(movieId);
    const response = await axios.get(`${BASE_URL}/tv/${movieId}`, {
        params: {
            api_key: API_KEY,
            language: "en-US",
        },
    })
    //console.log(response.data)
    return response.data
}


// 🎬 Discover Movies
export const getDiscoverMovies = async () => {
    const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
            api_key: API_KEY,
            language: "en-US",
            sort_by: "popularity.desc",
            include_adult: false,
            page: 1,
        },
    })

    return response.data.results.slice(0, 10)
}

// 📺 Discover TV
export const getDiscoverTv = async () => {
    const response = await axios.get(`${BASE_URL}/discover/tv`, {
        params: {
            api_key: API_KEY,
            language: "en-US",
            sort_by: "popularity.desc",
            page: 1,
        },
    })

    return response.data.results.slice(0, 10)
}

// 🎭 Discover by Genre
export const getMoviesByGenre = async (genreId) => {
    const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
            api_key: API_KEY,
            language: "en-US",
            with_genres: genreId,
            sort_by: "popularity.desc",
            page: 1,
        },
    })

    return response.data.results.slice(0, 10)
}


export const getRecommended = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    // 1. get user's liked entries
    const { data: entries } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("rating", 7)

    if (!entries || entries.length === 0) return []

    // 2. fetch genres from TMDB
    const genreCount = {}
    const watchedIds = []

    for (const entry of entries) {
        try {
            const url =
                entry.media_type === "tv"
                    ? `${BASE_URL}/tv/${entry.tmdb_id}`
                    : `${BASE_URL}/movie/${entry.tmdb_id}`

            const res = await axios.get(url, {
                params: { api_key: API_KEY },
            })

            watchedIds.push(entry.tmdb_id)

            const genres = res.data.genres || []

            genres.forEach((g) => {
                genreCount[g.id] =
                    (genreCount[g.id] || 0) + (entry.rating || 1)
            })
        } catch (err) {
            console.error("TMDB error:", err)
        }
    }

    // 3. top genres
    const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([id]) => id)

    if (topGenres.length === 0) return []

    // 4. fetch recommendations
    const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
            api_key: API_KEY,
            with_genres: topGenres.join(","),
            sort_by: "popularity.desc",
        },
    })

    // 5. filter already watched
    return response.data.results
        .filter((m) => !watchedIds.includes(m.id))
        .slice(0, 10)
}


export const getRecommendedTv = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    // 1. get liked TV entries
    const { data: entries } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("media_type", "tv") // ⭐ ONLY TV
        .gte("rating", 7)

    if (!entries || entries.length === 0) return []

    const genreCount = {}
    const watchedIds = []

    // 2. fetch genres
    for (const entry of entries) {
        try {
            const res = await axios.get(`${BASE_URL}/tv/${entry.tmdb_id}`, {
                params: { api_key: API_KEY },
            })

            watchedIds.push(entry.tmdb_id)

            const genres = res.data.genres || []

            genres.forEach((g) => {
                genreCount[g.id] =
                    (genreCount[g.id] || 0) + (entry.rating || 1)
            })
        } catch (err) {
            console.error(err)
        }
    }

    // 3. top genres
    const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([id]) => id)

    if (topGenres.length === 0) return []

    // 4. discover TV
    const response = await axios.get(`${BASE_URL}/discover/tv`, {
        params: {
            api_key: API_KEY,
            with_genres: topGenres.join(","),
            sort_by: "popularity.desc",
        },
    })

    // 5. filter watched
    return response.data.results
        .filter((tv) => !watchedIds.includes(tv.id))
        .slice(0, 10)
}

export const searchMulti = async (query, mediaType) => {
    if (!query) return []

    const response = await axios.get(`${BASE_URL}/search/${mediaType}`, {
        params: {
            api_key: API_KEY,
            query,
            include_adult: false,
            language: "en-US",
        },
    })

    const results = response.data?.results ?? []
    const now = new Date()

    const scoredResults =
        results.filter(item =>
            mediaType === "movie" ? item.release_date : item.first_air_date
        ).map(item => {
            const dateString =
                mediaType === "movie" ? item.release_date : item.first_air_date
            const releaseDate = new Date(dateString)
            const ageInDays = Math.max(
                1,
                (now - releaseDate) / (1000 * 60 * 60 * 24)
            )
            const popularity = item.popularity ?? 0
            const score = popularity * 0.7 + (1 / Math.log(ageInDays + 10)) * 30
            return {...item, _score: score,}
        })

    scoredResults.sort((a, b) => b._score - a._score)

    return scoredResults.slice(0, 10)
}
