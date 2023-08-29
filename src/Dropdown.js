import { useState } from 'react';
import { Link } from 'react-router-dom';

function Dropdown(props) {
    const [dropDown, setDropDown] = useState(false);

    const toggleDropdown = () => {
        setDropDown(!dropDown);
    }

    return (
        <span className="dropdown">
            <button className="text-button" onClick={toggleDropdown}>
                {props.title}
            </button>
            {dropDown && (
                <ul className="dropdown-menu">
                    {props.options.map((option) => (
                        <li key={option}>
                            <button className="button-container" onClick={() => props.setAssignment(option)}>
                                {option}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </span>
    );
}
export default Dropdown;