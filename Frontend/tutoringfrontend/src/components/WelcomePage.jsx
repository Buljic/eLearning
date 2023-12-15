// components/WelcomePage.jsx
import React from 'react';

const WelcomePage = () => {
    // Preuzmite JWT iz localStorage ili slično
    const token = localStorage.getItem('token');

    return (
        <div>
            <h1>Dobrodošli</h1>
            <p>Vaš JWT: {token}</p>
        </div>
    );
};

export default WelcomePage;
