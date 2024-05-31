package com.example.tutoring.Entities;

import jakarta.persistence.*;

@Entity
public class AssignmentSubmission {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileUrl;
    private String feedback;
    private Integer grade;

    @ManyToOne
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne
    @JoinColumn (name = "user_id")
    private User student;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public String getFileUrl()
    {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl)
    {
        this.fileUrl = fileUrl;
    }

    public String getFeedback()
    {
        return feedback;
    }

    public void setFeedback(String feedback)
    {
        this.feedback = feedback;
    }

    public Integer getGrade()
    {
        return grade;
    }

    public void setGrade(Integer grade)
    {
        this.grade = grade;
    }

    public Assignment getAssignment()
    {
        return assignment;
    }

    public void setAssignment(Assignment assignment)
    {
        this.assignment = assignment;
    }

    public User getStudent()
    {
        return student;
    }

    public void setStudent(User student)
    {
        this.student = student;
    }
}
