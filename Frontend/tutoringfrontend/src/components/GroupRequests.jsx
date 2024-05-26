import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const GroupRequests = () => {
    const [requests, setRequests] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, [page]);

    const fetchRequests = async () => {
        const response = await fetch(`http://localhost:8080/api/requests?page=${page}&size=10`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Problem s fetchanjem zahtjeva");
            return;
        }
        const data = await response.json();
        setRequests(data.requests);
        setTotalPages(data.totalPages);
    };

    const handleAccept = async (groupId, userId) => {
        const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/accept`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Problem s prihvatanjem zahtjeva");
            return;
        }
        fetchRequests();
    };

    const handleApprove = async (groupId, userId) => {
        const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/approve`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Problem s odobravanjem zahtjeva");
            return;
        }
        fetchRequests();
    };

    const handleReject = async (groupId, userId) => {
        const response = await fetch(`http://localhost:8080/api/requests/${groupId}/${userId}/reject`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Problem s odbijanjem zahtjeva");
            return;
        }
        fetchRequests();
    };

    const openApprovePopup = (request) => {
        setSelectedRequest(request);
        setPopupOpen(true);
    };

    const closeApprovePopup = () => {
        setSelectedRequest(null);
        setPopupOpen(false);
    };

    return (
        <div>
            <h1>Zahtjevi za grupe</h1>
            <ul>
                {requests.map((request, index) => (
                    <li key={index}>
                        <p>Grupa: {request.groupName}</p>
                        <p>Korisnik: {request.username}</p>
                        {request.status === 'REQUESTED' && (
                            <button onClick={() => handleAccept(request.id.groupId, request.id.userId)}>Prihvati</button>
                        )}
                        {request.status === 'PENDING' && (
                            <>
                                <button onClick={() => openApprovePopup(request)}>Odobri</button>
                                <button onClick={() => handleReject(request.id.groupId, request.id.userId)}>Odbij</button>
                            </>
                        )}
                        {request.status === 'ACCEPTED' && (
                            <p>Status: Odobreno</p>
                        )}
                        <button onClick={() => navigate(`/chatTo/${request.id.userId}`)}>DM Korisnik</button>
                    </li>
                ))}
            </ul>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i)} disabled={i === page}>
                        {i + 1}
                    </button>
                ))}
            </div>

            <Popup open={popupOpen} closeOnDocumentClick onClose={closeApprovePopup}>
                <div>
                    <h2>Odobri zahtjev</h2>
                    <p>Da li ste sigurni da želite odobriti ovaj zahtjev?</p>
                    <button onClick={() => handleApprove(selectedRequest.id.groupId, selectedRequest.id.userId)}>Da</button>
                    <button onClick={closeApprovePopup}>Ne</button>
                </div>
            </Popup>
        </div>
    );
};

export default GroupRequests;
