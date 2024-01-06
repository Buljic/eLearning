package com.example.tutoring.Services;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.GenericDTOMapper;
import com.example.tutoring.DTOs.StringNumber;
import com.example.tutoring.DTOs.UserDTO;
import com.example.tutoring.Entities.Tutor;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    {//'-' se koristi da bi se izbjeglo ono 12 i 3 moze biti 1 i 23 ili 12 i 3 i slicno
        String sql = "SELECT Subject.subject_name AS name, " +
                "COUNT(DISTINCT CONCAT (tutorsubject.subject_id,'-',tutorsubject.tutor_id)) AS number " +  //NIJE BITNO KADA BROJIMO SVE RECORDE A NE SPECIFICNE , IAKO JE COMPOSITE KEY
                "FROM Subject " +
                "LEFT JOIN tutorsubject ON Subject.id = tutorsubject.subject_id " +
                "GROUP BY Subject.subject_name " +
                "ORDER BY number DESC, Subject.subject_name " +
                "LIMIT 5;";
//        String sql = "SELECT Subject.subject_name, " +
//                "COALESCE(COUNT(TutorSubject.id), 0) as brojTutora " +
//                "FROM Subject " +
//                "LEFT JOIN TutorSubject ON Subject.id = TutorSubject.subject_id " +
//                "GROUP BY Subject.subject_name " +
//                "ORDER BY COUNT(TutorSubject.id) DESC, Subject.subject_name " +
//                "LIMIT 5;";
//        String sql = "SELECT Subject.subject_name, COUNT(TutorSubject.id) as brojTutora " +
//                "FROM Subject " +
//                "LEFT JOIN TutorSubject ON Subject.id = TutorSubject.subject_id " +
//                "GROUP BY Subject.subject_name " +
//                "ORDER BY brojTutora DESC, Subject.subject_name " +
//                "LIMIT 5;";
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
//        String sql="SELECT Subject.subject_name , COUNT(TutorSubject.id) as brojTutora " +
//                "FROM TutorSubject " +
//                "JOIN Subject ON TutorSubject.subject_id= Subject.id " +
//                "WHERE LOWER(Subject.subject_name) LIKE  LOWER(?) " +
//                "GROUP BY Subject.subject_name ;";
            //COALESCE sE KORISTI da vrati element prvi koji nije null a ako su svi null onda vraca null
        String sql = "SELECT Subject.subject_name AS name, COUNT(DISTINCT  CONCAT(tutorsubject.subject_id,'-',tutorsubject.tutor_id)) as number " +//moras AS koristiti ono sto ce dto-u lakse bit skontat
                "FROM Subject " +
                "LEFT JOIN tutorsubject ON Subject.id = tutorsubject.subject_id " +
                "WHERE LOWER(Subject.subject_name) LIKE LOWER(?) " +
                "GROUP BY Subject.subject_name;";
                return jdbcTemplate.query(sql,new Object[]{"%"+searchedText+"%"},new BeanPropertyRowMapper<>(StringNumber.class));
    }
    public List<Tutor> findTutorsBySubjectName(String subject_name){
        String sql="SELECT * from (SELECT Subject.id AS sid FROM Subject WHERE Subject LIKE ? ) " +
                " LEFT JOIN  tutorsubject  ON sid=tutorsubject.subject_id";
        return jdbcTemplate.query(sql,new Object[]{subject_name},new BeanPropertyRowMapper<>(Tutor.class));
    }

    public GenericDTO getUserInfo2(String username)
    {
        String sql="SELECT user.name , user.surname, user.username, user.account_type " +
                " FROM user where LOWER(user.username) = LOWER(?) ; ";
        return jdbcTemplate.queryForObject(sql,new Object[]{username},new GenericDTOMapper());
    }
    public UserDTO getUserInfo(String username)
    {
        String sql="SELECT user.id, user.name , user.surname, user.username, user.account_type " +
                " FROM user where LOWER(user.username) = LOWER (?) ; ";
        return jdbcTemplate.queryForObject(sql,new Object[]{username},new BeanPropertyRowMapper<>(UserDTO.class));
    }

    public List<GenericDTO> getTutorsForSubjectWithInfo(String subjectName)
    {
        String sql="SELECT user.name,user.surname, user.username, tutorsubject.teaching_grade" +
                " from tutorsubject JOIN tutor ON tutorsubject.tutor_id = tutor.id " +
                " JOIN user ON tutor.id=user.id " +
                " where  tutorsubject.subject_id = (SELECT subject.id AS sid FROM subject where subject.subject_name = ? ); ";
        return jdbcTemplate.query(sql,new Object[]{subjectName},new GenericDTOMapper());
    }

    public void insertIntoTutorSubjectRequest(String subject,String tutorUsername,String comment)
    {
        String sql="INSERT INTO tutorsubjectrequest  (request_date,subject_id,tutor_id,comment) " +
                "values (?,(SELECT id FROM subject where subject.subject_name=?) , (SELECT id FROM user WHERE user.username=?) ,?);";
        jdbcTemplate.update(sql,new Object[]{LocalDate.now(),subject,tutorUsername,comment});
    }
}
