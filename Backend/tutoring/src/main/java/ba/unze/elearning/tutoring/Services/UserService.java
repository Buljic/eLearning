package ba.unze.elearning.tutoring.Services;

import ba.unze.elearning.tutoring.Entities.User;
import ba.unze.elearning.tutoring.Repositories.TutorRepository;
import ba.unze.elearning.tutoring.Repositories.UserRepository;

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
