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
                <button 
                onClick={Logout}
                  className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
            </div>
        </div>
    );
};

export default Navbar;