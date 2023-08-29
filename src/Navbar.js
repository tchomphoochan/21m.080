import { useState } from 'react';
import { Link } from 'react-router-dom';
import Dropdown from "./Dropdown.js";

function Navbar(props) {
    const [assignments, setAssignments] = useState([]);
    const [examples, setExamples] = useState([]);

    return (
        <span className="span-container" >
            <div>{props.page === "Home" ? "21M.080" : "21M.080 | ${props.page}"}</div>
            <span className="span-container">
                {props.page !== "Home" &&
                    <Link to="/" className="NavBar-link">
                        Home
                    </Link>
                }
                <Dropdown title={"Assignments"} options={assignments} page={props.page} setPage={props.setPage} />
                <Dropdown title={"Examples"} options={examples} page={props.page} setPage={props.setPage} />
            </span>
        </span>
    );
}
export default Navbar;
