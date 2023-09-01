import { useState } from 'react';
import { Link } from 'react-router-dom';
import Dropdown from "./Dropdown.js";

function Navbar(props) {
    return (
        <span className="span-container" >
            <div>21M.080</div>
            <span className="span-container">
                {props.page !== "Home" &&
                    <Link to="/" className="text-button home-link" onClick={() => props.setPage('Home')}>
                        Home
                    </Link>
                }
                <Dropdown title={"Assignments"} options={props.assignments} page={props.page} setPage={props.setPage} />
                <Dropdown title={"Examples"} options={props.examples} page={props.page} setPage={props.setPage} />
            </span>
        </span>
    );
}
export default Navbar;
