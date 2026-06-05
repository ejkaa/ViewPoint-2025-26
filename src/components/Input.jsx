import "../styles/input.css"
import { useNavigate } from "react-router-dom"

function Input({
    placeholder,
    value,
    onChange,
    type = "text",
    searchOnEnter = false,
}) {
    const navigate = useNavigate()

    const handleKeyDown = (e) => {
        if (searchOnEnter && e.key === "Enter") {
            navigate(`/search?search=${encodeURIComponent(value || "")}`)
        }
    }

    return (
        <input
            className="input"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
        />
    )
}

export default Input