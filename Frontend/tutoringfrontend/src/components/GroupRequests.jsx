import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GroupRequests = () => {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, [page]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests?page=${page}&size=10`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests);
                setTotalPages(data.totalPages);
            } else {
                console.log('Problem s fetchanjem zahtjeva');
            }
        } catch (error) {
            console.log('Problem s fetchanjem zahtjeva:', error);
        }
    };

    const handleAccept = async (groupId, userId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/accept`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                fetchRequests();
            } else {
                console.log('Problem s prihvatanjem zahtjeva');
            }
        } catch (error) {
            console.log('Problem s prihvatanjem zahtjeva:', error);
        }
    };

    const handleReject = async (groupId, userId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/reject`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                fetchRequests();
            } else {
                console.log('Problem s odbijanjem zahtjeva');
            }
        } catch (error) {
            console.log('Problem s odbijanjem zahtjeva:', error);
        }
    };

    const handleApprove = async (groupId, userId) => {
        const confirmApprove = window.confirm("Da li ste sigurni da želite odobriti ovaj zahtjev? Ovo je konačna odluka.");
        if (!confirmApprove) return;

        try {
            const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/approve`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                fetchRequests();
            } else {
                console.log('Problem s odobravanjem zahtjeva');
            }
        } catch (error) {
            console.log('Problem s odobravanjem zahtjeva:', error);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    return (
        <div>
            <h1>Zahtjevi za pristup grupama</h1>
            {requests.length === 0 ? (
                <p>Nema zahtjeva za prikazivanje</p>
            ) : (
                <ul>
                    {requests.map((request) => (
                        <li key={`${request.id.userId}-${request.id.groupId}`}>
                            <p>Ime grupe: {request.groupName}</p>
                            <p>Korisničko ime: {request.username}</p>
                            <p>Status: {request.status}</p>
                            <button onClick={() => handleAccept(request.id.groupId, request.id.userId)}>Prihvati</button>
                            <button onClick={() => handleReject(request.id.groupId, request.id.userId)}>Odbij</button>
                            {request.status === 'PENDING' && (
                                <button onClick={() => handleApprove(request.id.groupId, request.id.userId)}>Odobri</button>
                            )}
                            <button onClick={() => navigate(`/chatTo/${request.id.userId}`)}>DM Korisnik</button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={page === 0}>Previous</button>
                {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i)} className={i === page ? 'active' : ''}>{i + 1}</button>
                ))}
                <button onClick={handleNextPage} disabled={page === totalPages - 1}>Next</button>
            </div>
        </div>
    );
};

export default GroupRequests;
