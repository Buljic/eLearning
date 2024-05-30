import React, { useState } from "react";

const UploadLessonFile = ({ lessonId }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`http://localhost:8080/api/lessons/${lessonId}/upload`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (response.ok) {
            alert("File uploaded successfully");
        } else {
            alert("Failed to upload file");
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload File</button>
        </div>
    );
};

export default UploadLessonFile;
