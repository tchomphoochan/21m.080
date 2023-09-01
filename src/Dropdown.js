import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dropdown(props) {
    const [dropDown, setDropDown] = useState(false);

    // useEffect(() => {
    //     Object.keys(props.options).map((option) => {
    //         console.log(`/${option}`);
    //     })
    // }, []);

    const toggleDropdown = () => {
        setDropDown(!dropDown);
    }

    // document.addEventListener('click', function (event) {
    //     const dropdownButton = document.getElementById('dropdown-button');
    //     const dropdownMenu = document.getElementById('dropdown-menu');
    //     if ((dropdownMenu !== null && !dropdownMenu.contains(event.target)) && event.target !== dropdownButton) {
    //         if(dropDown){

    //         }
    //         setDropDown(false);
    //     }
    // });

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