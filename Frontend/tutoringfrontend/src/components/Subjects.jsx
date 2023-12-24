import React, {useEffect, useState} from "react";

//Moze se koristiti i tj
/*
    const ImeKomponente = () => {return };
    a takodjer i
    function ImeKomponente () {return ();};

    i za oba ... export default ImeKomponente

 */
const Subjects = () => {
    //koristi se [] u usestate za nizove
    const[subjects,setSubjects]=useState([]);
    const[searchTerm,setSearchTerm]=useState('');
    const[showSuggestions,setShowSuggestions]=useState(false);
    const[isSearching,setIsSearching]=useState(false);
    const[displayedSubjects,setDisplayedSubjects]=useState([]);

    const[suggestions,setSuggestions]=useState([]);
    const[searchResults,setSearchResults]=useState([]);

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
                setDisplayedSubjects(data);
            }
        }
        getPopularSubjects();
    },[]);

    //ucitavanje svih predmeta za prijedlog
    useEffect( () =>{
        const getAllSubjects= async()=>{
            const response=await fetch('http://localhost:8080/api/allSubjects',{
                method:'GET',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                }
            });
            if(!response.ok)
            {
                console.log("Problem s fetchom");
                throw new Error('Problem with fetch on subjects');
            }else{
                const data=await response.json();
                setSubjects(data);
            }
        }
        getAllSubjects();
    },[]);



    const handleSearchChange=(event )=>{
        setSearchTerm(event.target.value);
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
    const filteredSubjects=searchTerm
        //subject je trenutni element niza subjects  koji se obradjuje
    ? subjects.filter(subject=> subject.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];


    //koristi se da obradjuje se kada se pritisne neki suggested test ovdje
    const handleSuggestionClick = (subject)=>{
        console.log(`pozvalo se ovo  a subject je :${subject}:`);
        setSearchTerm(subject);
        setShowSuggestions(false);
    }//moze bilo koje ime u argument ali bitno je da se ne proslijedjuje event neki


    //za info o searched subjects
    const  getSearchedSubjectInfo=async ()=>
    {//koristi backticks tj `` umjesto navodnika , na podrucju gdje koristis queryje  i template literal za interpolaciju
        const response=await fetch(`http://localhost:8080/api/subjects/search?term=${searchTerm}`,{
            method:'GET',
            credentials:'include',
            headers:{
                'Content-Type':'application/json',
            }
        });
        if(!response.ok)
        {
            throw new Error("problem s dohvatom searched predmeta");
        }
        else{
            const data=await response.json();
            data.forEach(dto=>{
               console.log("Ime predmeta", dto.name, );
               console.log("Broj tutora" , dto.number);
            });
            setDisplayedSubjects(data);
        }
    }
//TODO FIX LOGIKU GDJE VARIJABLA IMA 2 RAZLICITA TIPA
    const handleSubmit=(event) =>
    {
        event.preventDefault();//mora se uvijek stavljati
        setIsSearching(true);
        setSearchTerm(event.target.value);
        getSearchedSubjectInfo();
    }

    return(
        <div>
            {/*forma je zapravo wrapper za ovo i u njoj stavljamo input field i button i sl*/}
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={()=>setShowSuggestions(false)}
                onFocus={()=>searchTerm && setShowSuggestions(true)}
                placeholder="Pretrazi predmete"
            />
                <button type="submit">Pretrazi</button>
        </form>

            {showSuggestions && searchTerm && (
                <ul>
                    {filteredSubjects.map(subject=>(
                        <li key={subject} onClick={()=>handleSuggestionClick(subject)}>{subject}</li>
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
                {filteredSubjects.map(subject=>(
                    <li key={subject.name}>{subject.name}  a broj tutora : {subject.number}</li>
                    ))}
                </ul>
            ) :( <ul>
                    {displayedSubjects.map(subject=>(
                        <li key={subject}>{subject}</li>

                        ) )}
            </ul>


                        ) }
        </div>
    );
};

export default Subjects