import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate=useNavigate()

  const LoginInDetails=async()=>
  {
    try {
        const response = await axios.post('http://localhost:8080/login', { email, password });
        console.log('Login successful:', response.data);
        sessionStorage.setItem('uid',response.data.uid)
        navigate('/')
      } catch (error) {
        alert(error.response.data.message)
      } finally {
      }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Please enter your email';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
        LoginInDetails();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-header">
          <h2 className="login-card-title">Login to ExpenseTracker</h2>
          <p className="login-card-description">Enter your credentials to access your account</p>
        </div>
        <div className="login-card-content">
          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <div className="login-form-control">
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="login-form-control">
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
            </div>
            <div className="login-card-footer">
              <button
                type="submit"
                className="bg-custom-black text-white py-2 px-4 rounded login-btn"
              >
                Login
              </button>
              <div className="signup-link">
                Don't have an account?{' '}
                <Link to="/signup" className="link">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
