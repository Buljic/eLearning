import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
import MyUserContext from "../minicomponents/Context/MyUserContext.js";
import config from '../config.js';
//Moze se koristiti i tj
/*
    const ImeKomponente = () => {return };
    a takodjer i
    function ImeKomponente () {return ();};

    i za oba ... export default ImeKomponente

 */
const Subjects = () => {
    //koristi se [] u usestate za nizove
  //  const[subjects,setSubjects]=useState([]);       //STRING LIST SA SVIM SUBJECTS
    const{subjects,error,loading}=useFetchSubjects();

   // const{myUser,setMyUser}=useContext(MyUserContext);
    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);

    const[searchTerm,setSearchTerm]=useState('');
    const[showSuggestions,setShowSuggestions]=useState(false);
    const[isSearching,setIsSearching]=useState(false);

    const[displayedSubjects,setDisplayedSubjects]=useState([]);//prikazani predmeti u listi


    const[popularSubjects,setPopularSubjects]=useState([]);

    const[searchResults,setSearchResults]=useState([]);

     const[suggestions,setSuggestions]=useState([]);
    // const[searchResults,setSearchResults]=useState([]);

    console.log("JEDANPUT");

    useEffect( ()=>{
        const getPopularSubjects=async() =>{
            //response ovo tj response=await fetch('',{}); je zasebna stvar neovisna o useEffect ali se koristi cesto tu
            const response = await fetch(`${config.BASE_URL}/api/mostTutorSubjects`, {
                method:'GET',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                }
            });
            if(!response.ok)
            {
                console.log("Error u fetchanju popular predmeta");
                throw new Error("Error u fetchangu predmeta popularnih");
            }else{
                const data=await response.json();

                //setDisplayedSubjects(data);     //POSTAVI SAMO ONE POPULARNE PREDMETE TJ S NAJVISE TUTORA
                setPopularSubjects(data);
                popularSubjects.forEach(subject=>{
                    console.log(`Ime predmeta: ${subject.name} a broj tutora ${subject.number}`);
                });
            }
        }
        getPopularSubjects();
    },[]);



    const handleSearchChange=(event )=>{
        setSearchTerm(event.target.value || ''); //moze se u JSu koristiti sa ne boolean kao shortcircuit  koja vraca prvu truthy vrijednost tj samo da nije undefined null ili false 0
        setShowSuggestions(true);
        //
        setSuggestions(subjects.filter(subject =>
            subject.toLowerCase().includes(event.target.value.toLowerCase())
        ));
    };


    //ternarni operator ide sintaksa condition ? expressionIfTrue : ...ifFalse
    //filter kreira novi niz iz originalnog koji zadovoljavaju neki uvjet
    //array.filter(element=>{});
    //filter prolazi kroz svaki element u ovom nad kojim se poziva isto foreach
    // const filteredSubjects=searchTerm
    //     //subject je trenutni element niza subjects  koji se obradjuje
    // ? subjects.filter(subject=> subject.toLowerCase().includes(searchTerm.toLowerCase()))
    //     : [];
    const filteredSubjects = searchTerm && typeof searchTerm === 'string'
        ? subjects.filter(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];



    //koristi se da obradjuje se kada se pritisne neki suggested test ovdje
    const handleSuggestionClick = (subject)=>{
        //console.log(`pozvalo se ovo  a subject je :${subject}:`);
        //e.stopPropagation();
        console.log("nesto");
        setSearchTerm(subject);
        setShowSuggestions(false);
    }//moze bilo koje ime u argument ali bitno je da se ne proslijedjuje event neki


    //za info o searched subjects
    const  getSearchedSubjectInfo=async ()=>
    {//koristi backticks tj `` umjesto navodnika , na podrucju gdje koristis queryje  i template literal za interpolaciju
        const response = await fetch(`${config.BASE_URL}/api/subjects/search?searchTerm=${searchTerm}`, {
                                                        //ovaj prije ? mora biti zapravo ime koje se na backendu trazi
            method:'GET',
            credentials:'include',
            headers:{
                'Content-Type':'application/json',
            }
        });
        if(!response.ok)
        {
            setIsSearching(false);
            throw new Error("problem s dohvatom searched predmeta");
        }
        else{
            const data=await response.json();
            data.forEach(dto=>{
               console.log("Ime predmeta", dto.name, );
               console.log("Broj tutora" , dto.number);
            });
            //setDisplayedSubjects(data);
            setSearchResults(data);
            setIsSearching(false);

        }
    }
    const handleSubmit=(event) =>
    {
        event.preventDefault();//mora se uvijek stavljati
        setIsSearching(true);
        //setSearchTerm(event.target.value);
        getSearchedSubjectInfo();
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Profesori s specijalizacijom za predmete</p>
            <form id="searchForm" onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
                <input
                    id="inputField"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm && setShowSuggestions(true)}
                    placeholder="Pretrazi predmete"
                    style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit" id="subjectsSearch" style={{ padding: '0.5rem 1rem', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>Pretrazi</button>
            </form>
            {showSuggestions && searchTerm && (
                <ul id="suggestions" style={{ listStyleType: 'none', padding: 0 }}>
                    {filteredSubjects.map((subject, index) => (
                        <li key={index} id={subject} style={{ marginBottom: '0.5rem' }}>
                            <button id={subject} onClick={() => handleSuggestionClick(subject)} style={{ padding: '0.3rem 0.5rem', borderRadius: '5px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
                                {subject}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!isSearching ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {popularSubjects.map(subject => (
                        <li key={subject.name} id="popularSubjectsResult" style={{ marginBottom: '0.5rem' }}>
                            <Link to={`/tutorsFor/${subject.name}`} key={subject.name} style={{ textDecoration: 'none', color: '#000' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f0f0f0', maxWidth: '300px', margin: 'auto' }}>Ime je "{subject.name}"  Broj tutora {subject.number}</div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {searchResults.map(subject => (
                        <li key={subject.name} id="searchSubjectsResult" style={{ marginBottom: '0.5rem' }}>
                            <Link to={`/tutorsFor/${subject.name}`} key={subject.name} style={{ textDecoration: 'none', color: '#000' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f0f0f0', maxWidth: '300px', margin: 'auto' }}>Ime je- "{subject.name}"  Broj tutora {subject.number}</div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Subjects;