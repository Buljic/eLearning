import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import config from '../config.js';
const SearchUsers=()=>{

    const[isSearching,setIsSearching]=useState(false);
    const[searchedUsers,setSearchedUsers]=useState([]);
    const[searchTerm,setSearchTerm]=useState('');
    const navigate=useNavigate();

    const handleSuggestionClick=(username)=>{
        navigate(`/userInfoFor/${username}`);
    }
    const handleSubmit=(event)=>{
        event.preventDefault();
        setIsSearching(true);
        getSearchedUsers();
    }
    const getSearchedUsers=async ()=>{
        const response = await fetch(`${config.BASE_URL}/api/getUsers?searchTerm=${searchTerm}`, {
            method:'GET',
            credentials:'include',
            headers:{
                'Content-Type':'application/json',
            }
        });
        if(!response.ok)
        {
            console.log("Problem s fetchanjem usera");
            return;
        }
        const data=await response.json();
        setSearchedUsers(data);
        searchedUsers.forEach(user=>{
           console.log("KORISNIK JE"+user.username);
        });

    }
    return (
        <div>
            <h1>Pretraži korisnike</h1>

            <form onSubmit={handleSubmit}>
                <input  id="inputField"
                        type="text"
                        value={searchTerm}
                        placeholder="Pretraži user-e"
                        onChange={(e)=>setSearchTerm(e.target.value)}
                       />
                    <button type="submit" id="submit">Pretrazi</button>
            </form>

            {isSearching &&(
                <ul id="suggestions">
                    {searchedUsers.map((user,index)=>(
                        <li key={index}>
                            <button id={user.username} onClick={()=>handleSuggestionClick(user.username)}>
                                {user.username}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default SearchUsers;

