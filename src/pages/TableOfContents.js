import { Link } from 'react-router-dom';

const TableOfContents = (props) => {
    return (
        <div className="flex-container">
            <div className="flex-child" >
                <div className="contents-container" >
                    <div className="title center-self">Assignments</div>
                    {Object.keys(props.assignments).map((option) => (
                        <li key={option} style={{ listStyle: 'none', padding: "5px" }}>
                            <Link to={`/${option}`} className="text-button" onClick={() => props.setPage(option)}>
                                {option}
                            </Link>
                        </li>
                    ))}
                </div>
            </div>
            <div className="flex-child ">
                <div className="contents-container">
                    <div className="title center-self">Examples</div>
                    {Object.keys(props.examples).map((option) => (
                        <li key={option} style={{ listStyle: 'none', padding: "5px" }}>
                            <Link to={`/${option}`} className="text-button" onClick={() => props.setPage(option)}>
                                {option}
                            </Link>
                        </li>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TableOfContents;