import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UploadLessonFile from "./UploadLessonFile";

const LessonList = () => {
    const { groupId } = useParams();
    const [lessons, setLessons] = useState([]);

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

    return (
        <div>
            <h1>Lessons</h1>
            <ul>
                {lessons.map((lesson) => (
                    <li key={lesson.id}>
                        <h2>{lesson.title}</h2>
                        <p>{lesson.content}</p>
                        <UploadLessonFile lessonId={lesson.id} />
                        {lesson.materials && lesson.materials.map((material, index) => (
                            <div key={index}>
                                <a href={`http://localhost:8080/uploads/${material.fileName}`} target="_blank" rel="noopener noreferrer">{material.fileName}</a>
                            </div>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LessonList;
