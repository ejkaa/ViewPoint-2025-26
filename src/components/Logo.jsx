import "../styles/logo.css"

import {Link} from "react-router-dom";

function Logo() {
    return (
        <Link to="/" className="logo">ViewPoint</Link>
    )
}

export default Logo