import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateLessonModal from "./CreateLessonModal";

const LessonList = () => {
    const { groupId } = useParams();
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);
    const [lessons, setLessons] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        const response = await fetch(`http://localhost:8080/api/${groupId}/lessons`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log("Fetched lessons: ", data);
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
        <div>
            <h1>Lessons</h1>
            {myUser.accountType === 'PROFESOR' && (
                <button onClick={handleOpenModal}>Add Lesson</button>
            )}
            <CreateLessonModal show={showModal} handleClose={handleCloseModal} groupId={groupId} />
            <ul>
                {lessons.length > 0 ? (
                    lessons.map((lesson) => (
                        <li key={lesson.id}>
                            <h2>{lesson.title}</h2>
                            <p>{lesson.content}</p>
                            {lesson.materials && lesson.materials.map((material, index) => (
                                <div key={index}>
                                    {material.fileType.startsWith("image/") ? (
                                        <img src={`http://localhost:8080${material.fileUrl}`} alt={material.fileName} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                    ) : (
                                        <a href={`http://localhost:8080${material.fileUrl}`} target="_blank" rel="noopener noreferrer">{material.fileName}</a>
                                    )}
                                </div>
                            ))}
                        </li>
                    ))
                ) : (
                    <p>No lessons available.</p>
                )}
            </ul>
        </div>
    );
};

export default LessonList;
