import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import useFetchSubjects from "../customHooks/useFetchSubjects.js";
import MyUserContext from "../minicomponents/Context/MyUserContext.js";
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

    useEffect( ()=>{
        const getPopularSubjects=async() =>{
            //response ovo tj response=await fetch('',{}); je zasebna stvar neovisna o useEffect ali se koristi cesto tu
            const response=await  fetch('http://localhost:8080/api/mostTutorSubjects',{
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
                })
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
        const response=await fetch(`http://localhost:8080/api/subjects/search?searchTerm=${searchTerm}`,{
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
//TODO FIX LOGIKU GDJE VARIJABLA IMA 2 RAZLICITA TIPA
    const handleSubmit=(event) =>
    {
        event.preventDefault();//mora se uvijek stavljati
        setIsSearching(true);
        //setSearchTerm(event.target.value);
        getSearchedSubjectInfo();
    }
    //console.log("KORISNIK JE " + myUser);//TODO context brise podatke na reloadu
//TODO POSTAVI DA SE NE PRIKAZUJE NISTA AKO OPET PRITISNEMO SEARCH I ON BUDE PRAZAN
    return(
        <div>
            <h1>Nas user je {myUser.username}</h1>
            {/*forma je zapravo wrapper za ovo i u njoj stavljamo input field i button i sl*/}
            <form id="searchForm" onSubmit={handleSubmit}>
            <input id="inputField"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                //onBlur={()=>setShowSuggestions(false)}
                onFocus={()=>searchTerm && setShowSuggestions(true)} //na fazon ako smo fokusirani i ako ima nesto da se stavi da je showsuggestion true
                placeholder="Pretrazi predmete"
            />
                <button type="submit" id="subjectsSearch">Pretrazi</button>

        </form>
            {/*TODO POPRAVI onClick funkciju sa handleSuggestionClick*/}
            {showSuggestions && searchTerm && (
                <ul id="suggestions">
                    {filteredSubjects.map((subject, index) => (
                        <li key={index} id={subject}>
                            <button id={subject} onClick={() => handleSuggestionClick(subject) }>
                                {subject}
                            </button>

                        </li>
                    ))}
                </ul>
            )}
            {/*TODO Implmentovati kartice umjesto listi dole , optimizacija , debouncing*/}
            {!isSearching ?(
                <ul>
                {/*//prikaz rezultata pretrage*/}
                    {/*{filteredSubjects.map((subject,index)=>(*/}
                    {/*    <li key={index}>{subject.name}  a broj tutora : {subject.number}</li>*/}
                    {/*))}*/}

                {/*{filteredSubjects.map(subject=>(*/}
                {/*    <li key={subject.name}>{subject.name}</li>*/}
                {/*    ))}*/}

                    {popularSubjects.map(subject=>(
                        <div id="popularSubjectsResult">
                       <Link to={`/tutorsFor/${subject.name}`} key={subject.name}> <li>Ime je "{subject.name}"  Broj tutora {subject.number}</li></Link>
                        </div>
                    ) )}

                </ul>
            ) :( <ul>
                    {searchResults.map(subject=>(
                        <div id="searchSubjectsResult">
                      <Link to={`/tutorsFor/${subject.name}`} key={subject.name}>  <li >Ime je- "{subject.name}"  Broj tutora {subject.number}</li></Link>
                        </div>
                        ) )}
            </ul>


                        ) }

        </div>
    );
};

export default Subjects;