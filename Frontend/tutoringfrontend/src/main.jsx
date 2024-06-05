// if (typeof global === 'undefined') {
//     window.global = window;
// }
import 'buffer';
import process from 'process';
import 'timers-browserify';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import './index.css'
import '../src/css/global.css'
// import 'vite-plugin-node-polyfills/polyfills';



ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
        <App />
    // </React.StrictMode>,
)
