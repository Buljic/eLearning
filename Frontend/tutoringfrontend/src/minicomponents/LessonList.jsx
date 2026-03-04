import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import CreateLessonModal from "./CreateLessonModal";
import config from '../config.js';
import { Container, Box, Typography, Button, List, ListItem, Card, CardContent } from '@mui/material';
import { canActAsProfessor } from '../utils/userRoles.js';
import { getSessionUser } from '../utils/sessionUser.js';

const LessonList = ({ groupId: groupIdProp }) => {
    const params = useParams();
    const groupId = groupIdProp ?? params.groupId;
    const myUser = getSessionUser();
    const [lessons, setLessons] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchLessons();
    }, [groupId]);

    const fetchLessons = async () => {
        const response = await fetch(`${config.BASE_URL}/api/${groupId}/lessons`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            setLessons(data || []);
        } else {
            console.error("Failed to fetch lessons");
            setLessons([]);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">Lessons</Typography>
                {canActAsProfessor(myUser) && (
                    <Button variant="contained" color="primary" onClick={handleOpenModal}>Add Lesson</Button>
                )}
                <CreateLessonModal show={showModal} handleClose={handleCloseModal} groupId={groupId} />
                <List>
                    {lessons.length > 0 ? (
                        lessons.map((lesson) => (
                            <ListItem key={lesson.id}>
                                <Card sx={{ width: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h5">{lesson.title}</Typography>
                                        <Typography variant="body1">{lesson.content}</Typography>
                                        {lesson.materials && lesson.materials.map((material, index) => (
                                            <Box key={index} sx={{ my: 2 }}>
                                                {material.fileType.startsWith("image/") ? (
                                                    <img src={`${config.BASE_URL}${material.fileUrl}`} alt={material.fileName} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                                ) : (
                                                    <Button href={`${config.BASE_URL}${material.fileUrl}`} target="_blank" rel="noopener noreferrer">{material.fileName}</Button>
                                                )}
                                            </Box>
                                        ))}
                                    </CardContent>
                                </Card>
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body1">No lessons available.</Typography>
                    )}
                </List>
            </Box>
        </Container>
    );
};

export default LessonList;
