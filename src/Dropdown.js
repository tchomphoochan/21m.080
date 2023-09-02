import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dropdown(props) {
    const [dropDown, setDropDown] = useState(false);

    const toggleDropdown = () => {
        setDropDown(!dropDown);
    }

    return (
        <span className="dropdown">
            <button id="dropdown-button" className="text-button" onClick={toggleDropdown}>
                {props.title}
            </button>
            {dropDown && (
                <ul id="dropdown-menu" className="dropdown-menu">
                    {Object.keys(props.options).map((option) => (
                        <li key={option}>
                            <Link to={`/${option}`} className="text-button" onClick={() => props.setPage(option)}>
                                {option}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </span>
    );
}
export default Dropdown;