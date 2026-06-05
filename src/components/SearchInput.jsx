import "../styles/input.css"

import { useNavigate } from "react-router-dom"
import { useState } from "react"

function SearchInput({ placeholder }) {
    const [value, setValue] = useState("")
    const navigate = useNavigate()

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            navigate(`/search?search=${encodeURIComponent(value)}`)
        }
    }

    return (
        <input
            className="input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
        />
    )
}

export default SearchInput