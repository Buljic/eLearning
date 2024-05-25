import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GroupRequests = () => {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests, page]);

    const fetchRequests = async () => {
        const response = await fetch(`http://localhost:8080/api/requests?page=${page}&size=10`);
        const data = await response.json();
        setRequests(data.requests);
        setTotalPages(data.totalPages);
    };

    const handleAccept = async (groupId, userId) => {
        const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/accept`, {
            method: 'POST',
        });
        if (response.ok) {
            fetchRequests(); // Refresh the requests list
        }
    };

    const handleReject = async (groupId, userId) => {
        const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/reject`, {
            method: 'POST',
        });
        if (response.ok) {
            fetchRequests(); // Refresh the requests list
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div>
            <h1>Pregled zahtjeva</h1>
            <ul>
                {requests.map(request => (
                    <li key={`${request.groupId}-${request.userId}`}>
                        <p>Grupa: {request.groupName}</p>
                        <p>Korisnik: {request.userName}</p>
                        <Link to={`/chatTo/${request.userId}`}>DM korisnika</Link>
                        <button onClick={() => handleAccept(request.groupId, request.userId)}>Prihvati</button>
                        <button onClick={() => handleReject(request.groupId, request.userId)}>Odbij</button>
                    </li>
                ))}
            </ul>
            <div className="pagination">
                {[...Array(totalPages).keys()].map(pageNumber => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={pageNumber === page}
                    >
                        {pageNumber + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GroupRequests;