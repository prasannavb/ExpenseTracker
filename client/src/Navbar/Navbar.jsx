// Dependencies
import { useLocation, useNavigate } from "react-router-dom";

// CSS
import './Navbar.css';


const Navbar = () => {
    const navigate = useNavigate();

    const Logout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    return (
        <div className="Navbar">
            <div className="Navbar-Logo-div">
                
                <h2 className="Navbar-Logo-title">Expense Tracker</h2>
            </div>
            <div className="Navbar-items">
                <button onClick={Logout}>Logout</button>
            </div>
        </div>
    );
};

export default Navbar;