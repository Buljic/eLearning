import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

const LessonList = () => {
    const { groupId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: "", content: "" });

    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);

    useEffect(() => {
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
                setLessons(data);
            } else {
                console.error("Failed to fetch lessons");
            }
        };

        fetchLessons();
    }, [groupId]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLesson({ ...newLesson, [name]: value });
    };

    const handleCreateLesson = async () => {
        const response = await fetch(`http://localhost:8080/api/${groupId}/lessons`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newLesson)
        });

        if (response.ok) {
            const createdLesson = await response.json();
            setLessons([...lessons, createdLesson]);
            setNewLesson({ title: "", content: "" });
            closeModal();
        } else {
            console.error("Failed to create lesson");
        }
    };

    return (
        <div>
            <h1>Lessons</h1>
            <ul>
                {lessons.map((lesson) => (
                    <li key={lesson.id}>
                        <h2>{lesson.title}</h2>
                        <p>{lesson.content}</p>
                        {lesson.materials && lesson.materials.map((material, index) => (
                            <div key={index}>
                                <a href={`http://localhost:8080/uploads/${material.fileName}`} target="_blank" rel="noopener noreferrer">{material.fileName}</a>
                            </div>
                        ))}
                    </li>
                ))}
            </ul>
            {myUser.accountType === 'PROFESOR' && (
                <>
                    <button onClick={openModal}>Add Lesson</button>
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="Create Lesson"
                    >
                        <h2>Create Lesson</h2>
                        <form>
                            <label>
                                Title:
                                <input type="text" name="title" value={newLesson.title} onChange={handleInputChange} />
                            </label>
                            <label>
                                Content:
                                <textarea name="content" value={newLesson.content} onChange={handleInputChange} />
                            </label>
                            <button type="button" onClick={handleCreateLesson}>Create</button>
                            <button type="button" onClick={closeModal}>Cancel</button>
                        </form>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default LessonList;
