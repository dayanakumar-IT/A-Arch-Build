import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import introvideo from './assets/introvideo.mp4';
import logo from './assets/logo.png'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        console.log("Logging in with:", { trimmedUsername, trimmedPassword });

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username: trimmedUsername,
                password: trimmedPassword,
            });

            if (response.status === 200) {
                const role = response.data.role;
                console.log("Login successful, user role:", role);

                switch (role) {
                    case 'project-manager':
                        navigate('/project-manager');
                        break;
                    case 'financial-manager':
                        navigate('/financial-manager');
                        break;
                    case 'architect':
                        navigate('/architect');
                        break;
                    case 'crm':
                        navigate('/crm');
                        break;
                    case 'quality-assurance':
                        navigate('/quality-assurance');
                        break;
                    case 'site-manager':
                        navigate('/site-manager');
                        break;
                    default:
                        setError('Invalid user role');
                }
            }
        } catch (error) {
            console.error('Error response:', error.response);
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(180deg, #EFF396, #59B4C3)',
    };

    const contentStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '600px',
        width: '1200px',
    };

    const videoWrapperStyle = {
        flex: 1,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '15px 0px 0px 15px',
    };

    const videoStyle = {
        height: '100%',
        width: '100%',
        objectFit: 'cover',
    };

    const cardStyle = {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'linear-gradient(180deg, #EFF396, #59B4C3)',
    };

    const cardInnerStyle = {
        width: '100%',
        height: '100%',
        padding: '2rem',
        borderRadius: '0px 15px 15px 0px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        background: 'linear-gradient(250deg, #211C6A, #4137D0)',
        color: 'white',
    };

    const logoStyle = {
        display: 'block',
        margin: '0 auto 10px',
        width: '150px',
        height: 'auto',
    };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <div style={videoWrapperStyle}>
                    <video style={videoStyle} autoPlay muted loop>
                        <source src={introvideo} type="video/mp4" />
                        Your browser does not support HTML5 video.
                    </video>
                </div>
                <div style={cardStyle}>
                    <div style={cardInnerStyle}>
                        <img src={logo} alt="Logo" style={logoStyle} />
                        <h3 className="card-title text-center mb-4">Welcome Back</h3>
                        
                        {error && <div className="alert alert-danger">{error}</div>} 

                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <label htmlFor="username">
                                    <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                                    Username
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="username" 
                                    placeholder="Enter username" 
                                    autoComplete='off' 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="password">
                                    <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                                    Password
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    id="password" 
                                    placeholder="Password" 
                                    autoComplete='off'  
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100" style={{ background: 'linear-gradient(180deg, #EFF396, #59B4C3)', color: 'black' }}>Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
