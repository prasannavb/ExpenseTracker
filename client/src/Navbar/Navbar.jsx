// Dependencies
import { useNavigate } from "react-router-dom";

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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"  
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            role="img"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
