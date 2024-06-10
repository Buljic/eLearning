import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import config from '../config.js';
import { Container, Box, Typography, Button, List, ListItem, CircularProgress, Alert, Pagination } from '@mui/material';

const GroupRequests = () => {
    const [requests, setRequests] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupAction, setPopupAction] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, [page]);

    const fetchRequests = async () => {
        const response = await fetch(`${config.BASE_URL}/api/requests?page=${page}&size=10`, {
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
        setRequests(data.requests.filter(request => request.status !== 'ACCEPTED'));
        setTotalPages(data.totalPages);
    };

    const handleAccept = async (groupId, userId) => {
        const response = await fetch(`${config.BASE_URL}/api/requests/${groupId}/${userId}/accept`, {
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
        const response = await fetch(`${config.BASE_URL}/api/requests/${groupId}/${userId}/approve`, {
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
        closePopup();
        fetchRequests();
    };

    const handleReject = async (groupId, userId) => {
        const response = await fetch(`${config.BASE_URL}/api/requests/${groupId}/${userId}/reject`, {
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
        closePopup();
        fetchRequests();
    };

    const openPopup = (request, action) => {
        setSelectedRequest(request);
        setPopupAction(action);
        setPopupOpen(true);
    };

    const closePopup = () => {
        setSelectedRequest(null);
        setPopupOpen(false);
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">Zahtjevi za grupe</Typography>
                <List>
                    {requests.map((request, index) => (
                        <ListItem key={index}>
                            <Box>
                                <Typography>Grupa: {request.groupName}</Typography>
                                <Typography>Korisnik: {request.username}</Typography>
                                {request.status === 'REQUESTED' && (
                                    <Button onClick={() => handleAccept(request.id.groupId, request.id.userId)}>Prihvati</Button>
                                )}
                                {request.status === 'PENDING' && (
                                    <>
                                        <Button onClick={() => openPopup(request, 'approve')}>Odobri</Button>
                                        <Button onClick={() => openPopup(request, 'reject')}>Odbij</Button>
                                    </>
                                )}
                                {request.status === 'ACCEPTED' && (
                                    <Typography>Status: Odobreno</Typography>
                                )}
                                <Button onClick={() => navigate(`/chatTo/${request.id.userId}`)}>DM Korisnik</Button>
                            </Box>
                        </ListItem>
                    ))}
                </List>
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(event, value) => setPage(value - 1)}
                    sx={{ mt: 2 }}
                />
                <Popup open={popupOpen} closeOnDocumentClick onClose={closePopup}>
                    <div>
                        <Typography variant="h6">{popupAction === 'approve' ? 'Odobri zahtjev' : 'Odbij zahtjev'}</Typography>
                        <Typography>Da li ste sigurni da želite {popupAction === 'approve' ? 'odobriti' : 'odbiti'} ovaj zahtjev?</Typography>
                        {popupAction === 'approve' ? (
                            <Button onClick={() => handleApprove(selectedRequest.id.groupId, selectedRequest.id.userId)}>Da</Button>
                        ) : (
                            <Button onClick={() => handleReject(selectedRequest.id.groupId, selectedRequest.id.userId)}>Da</Button>
                        )}
                        <Button onClick={closePopup}>Ne</Button>
                    </div>
                </Popup>
            </Box>
        </Container>
    );
};

export default GroupRequests;