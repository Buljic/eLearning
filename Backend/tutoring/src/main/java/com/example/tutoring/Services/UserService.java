package com.example.tutoring.Services;

import com.example.tutoring.DTOs.StringNumber;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class UserService
{
    private final JdbcTemplate jdbcTemplate;

    public UserService(JdbcTemplate jdbcTemplate)
    {
        this.jdbcTemplate = jdbcTemplate;
    }
//    private final UserRepository userRepository;
//    private final TutorRepository tutorRepository;
//    UserService(JdbcTemplate jdbcTemplate,UserRepository userRepository,TutorRepository tutorRepository)
//    {
//        this.jdbcTemplate=jdbcTemplate;
//        this.userRepository=userRepository;
//        this.tutorRepository=tutorRepository;
//    }

    public List<StringNumber> findMostTutorSubjects()
    {
        String sql = "SELECT Subject.subject_name, COUNT(TutorSubject.id) as brojTutora " +
                "FROM Subject " +
                "LEFT JOIN TutorSubject ON Subject.id = TutorSubject.subject_id " +
                "GROUP BY Subject.subject_name " +
                "ORDER BY brojTutora DESC, Subject.subject_name " +
                "LIMIT 5;";
//        String sql="SELECT Subject.subject_name, COUNT(TutorSubject.id) as brojTutora " +
//                "FROM TutorSubject " +
//                "JOIN Subject ON TutorSubject.subject_id = Subject.id " +
//                "GROUP BY Subject.subject_name  " +
//                "ORDER BY brojTutora DESC " +
//                " LIMIT 5;";
        return jdbcTemplate.query(sql,new BeanPropertyRowMapper<>(StringNumber.class));
    }
    public List<StringNumber> findSearchedSubjects(String searchedText)
    {//koristi se where nakon from i join ali prije npr group by
        String sql="SELECT Subject.subject_name , COUNT(TutorSubject.id) as brojTutora " +
                "FROM TutorSubject " +
                "JOIN Subject ON TutorSubject.subject_id= Subject.id " +
                "WHERE Subject.subject_name LIKE  ? " +
                "GROUP BY Subject.subject_name ;";
                return jdbcTemplate.query(sql,new Object[]{"%"+searchedText+"%"},new BeanPropertyRowMapper<>(StringNumber.class));
    }
}
