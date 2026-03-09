package com.example.tutoring.Entities;

import jakarta.persistence.*;

import java.util.Date;
import java.util.List;
@Entity
@Table (name = "group_table")
public class Group
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long group_id;

    private Date creation_date;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    //mi proizvoljno ime dajemo
    @ManyToOne
    @JoinColumn(name = "headtutor_id")
    private Tutor tutor;

    private String group_name;

    private String topic;

    private String description;

    private Date startDate;

    private Date endDate;

    private int hoursPerWeek;

    private double price;

    private int maxStudents;
    //da utjecu promjene groupa na groupsubject
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupSubject> groupSubjects;

    public Group()
    {
    }

    public Group(Long groupId)
    {
        this.group_id=groupId;
    }

    public Long getGroup_id()
    {
        return group_id;
    }

    public void setGroup_id(Long group_id)
    {
        this.group_id = group_id;
    }

    public Date getCreation_date()
    {
        return creation_date;
    }

    public void setCreation_date(Date creation_date)
    {
        this.creation_date = creation_date;
    }

    public Subject getSubject()
    {
        return subject;
    }

    public void setSubject(Subject subject)
    {
        this.subject = subject;
    }

    public Tutor getTutor()
    {
        return tutor;
    }

    public void setTutor(Tutor tutor)
    {
        this.tutor = tutor;
    }

    public String getTopic()
    {
        return topic;
    }

    public void setTopic(String topic)
    {
        this.topic = topic;
    }

    public String getDescription()
    {
        return description;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public Date getStartDate()
    {
        return startDate;
    }

    public void setStartDate(Date startDate)
    {
        this.startDate = startDate;
    }

    public Date getEndDate()
    {
        return endDate;
    }

    public void setEndDate(Date endDate)
    {
        this.endDate = endDate;
    }

    public int getHoursPerWeek()
    {
        return hoursPerWeek;
    }

    public void setHoursPerWeek(int hoursPerWeek)
    {
        this.hoursPerWeek = hoursPerWeek;
    }

    public double getPrice()
    {
        return price;
    }

    public void setPrice(double price)
    {
        this.price = price;
    }

    public int getMaxStudents()
    {
        return maxStudents;
    }

    public void setMaxStudents(int maxStudents)
    {
        this.maxStudents = maxStudents;
    }

    public List<GroupSubject> getGroupSubjects()
    {
        return groupSubjects;
    }

    public void setGroupSubjects(List<GroupSubject> groupSubjects)
    {
        this.groupSubjects = groupSubjects;
    }

    public String getGroup_name()
    {
        return group_name;
    }

    public void setGroup_name(String group_name)
    {
        this.group_name = group_name;
    }
}
