package com.example.tutoring.Entities;

import jakarta.persistence.*;

@Entity
public class Student// extends  User
{
    @Id
    private Long id;
    @OneToOne(fetch=FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    public User getUser()
    {
        return user;
    }

    public void setUser(User user)
    {
        this.user = user;
    }
}
