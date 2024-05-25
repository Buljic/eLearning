import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GroupRequestList = () => {
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

            if (response.status === 403) {
                console.log("Access denied");
                return;
            }

            if (!response.ok) {
                console.log("Problem s fetchanjem zahtjeva");
                return;
            }

            const data = await response.json();
            setRequests(data.requests);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Greška prilikom fetchanja zahtjeva:", error);
        }
    };

    const handleAccept = async (groupId, userId) => {
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
            console.log("Problem s prihvaćanjem zahtjeva");
        }
    };

    const handleReject = async (groupId, userId) => {
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
            console.log("Problem s odbijanjem zahtjeva");
        }
    };

    return (
        <div>
            <h1>Lista Zahtjeva</h1>
            <ul>
                {requests.map((request, index) => (
                    <li key={index}>
                        <p>Ime Grupe: {request.groupName}</p>
                        <p>Korisnik: {request.username}</p>
                        <p>Datum Zahtjeva: {request.requestDate}</p>
                        <p>Status: {request.status}</p>
                        <button onClick={() => handleAccept(request.id.groupId, request.id.userId)}>Prihvati</button>
                        <button onClick={() => handleReject(request.id.groupId, request.id.userId)}>Odbij</button>
                        <button onClick={() => navigate(`/chatTo/${request.id.userId}`)}>DM Korisnik</button>
                    </li>
                ))}
            </ul>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button key={index} onClick={() => setPage(index)} disabled={index === page}>
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GroupRequestList;