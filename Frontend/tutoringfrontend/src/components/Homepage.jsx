import React from "react";
import {Link} from "react-router-dom";

const Homepage= ()=>{
    return (
        <div>
            <h1>Dobrodosli u centar za Tutoring</h1>
            <Link to="/login" >Prijava</Link>
            <Link to="/createAccount">Napravi racun</Link>
        </div>
    );
};

export default Homepage;