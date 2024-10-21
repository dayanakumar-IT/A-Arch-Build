import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './components/sidebar.css'; // Correct path if the CSS file is in the same directory as sidebar.js



ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
