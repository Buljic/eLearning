package com.example.tutoring.Entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table (name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    private String title;
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();
    @Transient
    private List<String> fileNames;

    public Lesson()
    {
    }

    public Lesson(Long lessonId)
    {
        this.id = lessonId;
    }

    public List<String> getFileNames()
    {
        return fileNames;
    }

    public void setFileNames(List<String> fileNames)
    {
        this.fileNames = fileNames;
    }

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Group getGroup()
    {
        return group;
    }

    public void setGroup(Group group)
    {
        this.group = group;
    }

    public String getTitle()
    {
        return title;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public LocalDateTime getCreatedAt()
    {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt)
    {
        this.createdAt = createdAt;
    }

    public String getContent()
    {
        return content;
    }

    public void setContent(String content)
    {
        this.content = content;
    }
}
