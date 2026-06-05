import "../styles/button.css"
import { useNavigate } from "react-router-dom"

function Button({
    variant = "primary",
    disabled = false,
    href,
    label,
    onClick,
    type = "button",
}) {
    const navigate = useNavigate()

    const className = `
        button
        button__${variant}
        ${disabled ? "button__disabled" : ""}
    `

    function handleClick(e) {
        if (disabled) return

        if (onClick) onClick(e)

        if (href) {
            e.preventDefault()
            navigate(href)
        }
    }

    return (
        <button
            type={type}
            className={className}
            disabled={disabled}
            onClick={handleClick}
        >
            {label}
        </button>
    )
}

export default Button