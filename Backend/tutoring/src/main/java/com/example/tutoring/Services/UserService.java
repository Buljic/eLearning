package com.example.tutoring.Services;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Repositories.TutorRepository;
import com.example.tutoring.Repositories.UserRepository;

public class UserService
{
    private final UserRepository userRepository;
    private final TutorRepository tutorRepository;
    UserService(UserRepository userRepository,TutorRepository tutorRepository)
    {
        this.userRepository=userRepository;
        this.tutorRepository=tutorRepository;
    }
}
