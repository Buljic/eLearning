package com.example.tutoring.Services;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.GenericDTOMapper;
import com.example.tutoring.DTOs.StringNumber;
import com.example.tutoring.DTOs.UserDTO;
import com.example.tutoring.Entities.Tutor;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.EncriptionUtility;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class UserService
{
    private final JdbcTemplate jdbcTemplate;
    private final EncriptionUtility encriptionUtility;
    //named parameter jos mozda
    public UserService(JdbcTemplate jdbcTemplate, EncriptionUtility encriptionUtility)
    {
        this.jdbcTemplate = jdbcTemplate;
        this.encriptionUtility = encriptionUtility;
    }


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

    public GenericDTO getUserInfoExtended(String username)
    {
        String sql = "SELECT user.id, user.name, user.surname, user.username, user.account_type, user.phone_number, user.email " +
                " FROM user where LOWER(user.username) = LOWER(?) ; ";
        GenericDTO genericDTO = jdbcTemplate.queryForObject(sql, new Object[]{username}, new GenericDTOMapper());

        // Dekripcija emaila
        String email = (String)genericDTO.getProperty("email");
        if (email != null) {
            genericDTO.setProperty("email",encriptionUtility.decrypt(email));
        }

        // Dekripcija broja telefona
        String phoneNumber = (String)genericDTO.getProperty("phone_number");
        if (phoneNumber != null) {
            genericDTO.setProperty("phone_number",encriptionUtility.decrypt(phoneNumber));
        }

        return genericDTO;
    }

    public UserDTO getUserInfo(String username)
    {
        String sql="SELECT user.id, user.name , user.surname, user.username, user.account_type " +
                ",user.email,user.phone_number FROM user where LOWER(user.username) = LOWER (?) ; ";
        UserDTO userDTO= jdbcTemplate.queryForObject(sql,new Object[]{username},new BeanPropertyRowMapper<>(UserDTO.class));
        userDTO.setEmail(encriptionUtility.decrypt(userDTO.getEmail()));
        if(userDTO.getPhoneNumber()!=null) userDTO.setPhoneNumber(encriptionUtility.decrypt(userDTO.getPhoneNumber()));

        return userDTO;
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
    public List<GenericDTO> findTutorsSubjectsWithInfo(Long id)
    {
        String sql="select subject.subject_name , tutorsubject.teaching_grade from\n" +
                "tutorsubject JOIN subject on tutorsubject.subject_id=subject.id \n" +
                "where tutorsubject.tutor_id = ?;";
        return jdbcTemplate.query(sql,new Object[]{id},new GenericDTOMapper());
    }

    public List<GenericDTO> findAttendedCourses(Long userId)
    {
        String sql="SELECT * From group_table where (select group_id from user_group where user_id=?);";
        return jdbcTemplate.query(sql,new Object[]{userId},new GenericDTOMapper());
    }

    public List<GenericDTO> getSearchedUsers(String username)
    {
        String sql="SELECT * FROM USER WHERE username LIKE ?;";
        return jdbcTemplate.query(sql,new Object[]{"%"+username+"%"},new GenericDTOMapper());
    }

    @Transactional
    public void createGroup(GenericDTO request) throws Exception {
        try {

            String groupName = request.getString("groupName");
            System.out.println("groupName: " + groupName);

            String topic = request.getString("topic");
            System.out.println("topic: " + topic);

            String description = request.getString("description");
            System.out.println("description: " + description);

            LocalDate startDate = LocalDate.parse(request.getString("startDate"));
            System.out.println("startDate: " + startDate);

            LocalDate endDate = LocalDate.parse(request.getString("endDate"));
            System.out.println("endDate: " + endDate);

            int hoursPerWeek = Integer.parseInt(request.getString("hoursPerWeek"));
            System.out.println("hoursPerWeek: " + hoursPerWeek);

            double price = Double.parseDouble(request.getString("price"));
            System.out.println("price: " + price);

            int maxStudents = Integer.parseInt(request.getString("maxStudents"));
            System.out.println("maxStudents: " + maxStudents);

            List<String> subjects = (List<String>) request.getProperties().get("chosenSubjects");
            System.out.println("subjects: " + subjects);

            Long tutorId = Long.parseLong(request.getString("tutorId"));
            System.out.println("tutorId: " + tutorId);

            // Provjera duplikata grupe
            String checkDuplicateSql = "SELECT COUNT(*) FROM group_table WHERE group_name = ? AND headtutor_id = ?;";
            int count = jdbcTemplate.queryForObject(checkDuplicateSql, new Object[]{groupName, tutorId}, Integer.class);
            System.out.println("duplicate check count: " + count);

            if (count > 0) {
                throw new Exception("Tutor već ima grupu s istim imenom.");
            }

            // Query za umetanje nove grupe
            String insertGroupSql = "INSERT INTO group_table (group_name, topic, description, start_date, end_date, hours_per_week, price, max_students, creation_date, headtutor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            int groupInsertResult = jdbcTemplate.update(insertGroupSql, groupName, topic, description, startDate, endDate, hoursPerWeek, price, maxStudents, LocalDate.now(), tutorId);
            System.out.println("Group inserted, result: " + groupInsertResult);

            if (groupInsertResult != 1) {
                throw new Exception("Failed to insert group");
            }

            //  Query za povezivanje grupe sa predmetima
            String insertGroupSubjectSql = "INSERT INTO group_subject (group_id, subject_id) VALUES ((SELECT group_id FROM group_table WHERE group_name = ? AND headtutor_id = ?), (SELECT id FROM subject WHERE subject_name = ?));";
            for (String subject : subjects) {
                System.out.println("Povezivanje predmeta: " + subject);
                int groupSubjectInsertResult = jdbcTemplate.update(insertGroupSubjectSql, groupName, tutorId, subject);
                System.out.println("Group subject inserted, result: " + groupSubjectInsertResult);

                if (groupSubjectInsertResult != 1) {
                    throw new Exception("Failed to insert group subject for: " + subject);
                }
            }
            System.out.println("Subjects linked to group");

            //TODO BITNO! PROVJERI DA LI CEMO KORISTITI OVAJ NACIN RADA DA TUTOR BUDE U TABELI OVOJ JER MOZE ZEZNUTI NEKE STVARI
            // SQL upit za dodavanje tutora u user_group tabelu
            String insertUserGroupSql = "INSERT INTO user_group (date_joined, group_id, user_id) VALUES (?, (SELECT group_id FROM group_table WHERE group_name = ? AND headtutor_id = ?), ?);";
            int userGroupInsertResult = jdbcTemplate.update(insertUserGroupSql, LocalDate.now(), groupName, tutorId, tutorId);
            System.out.println("Tutor added to user_group, result: " + userGroupInsertResult);

            if (userGroupInsertResult != 1) {
                throw new Exception("Failed to insert tutor into user_group");
            }

        } catch (DataAccessException e) {
            throw new Exception("Greška pri pristupu bazi podataka: " + e.getMessage());
        } catch (NumberFormatException e) {
            throw new Exception("Greška pri parsiranju numeričkih vrijednosti: " + e.getMessage());
        } catch (Exception e) {
            throw new Exception("Greška pri kreiranju grupe: " + e.getMessage());
        }
    }

//    public List<GenericDTO> getFilteredGroups(Map<String, String> filters)
//    {
//        StringBuilder sql = new StringBuilder("SELECT * FROM group_table WHERE 1=1");
//
//        List<Object> params = new ArrayList<>();
//
//        if (filters.containsKey("group_name")) {
//            sql.append(" AND group_name LIKE ?");
//            params.add("%" + filters.get("group_name") + "%");
//        }
//
//        if (filters.containsKey("topic")) {
//            sql.append(" AND topic LIKE ?");
//            params.add("%" + filters.get("topic") + "%");
//        }
//
//        if (filters.containsKey("start_date")) {
//            sql.append(" AND start_date >= ?");
//            params.add(filters.get("start_date"));
//        }
//
//        if (filters.containsKey("end_date")) {
//            sql.append(" AND end_date <= ?");
//            params.add(filters.get("end_date"));
//        }
//
//        if (filters.containsKey("hours_per_week")) {
//            sql.append(" AND hours_per_week = ?");
//            params.add(Integer.parseInt(filters.get("hours_per_week")));
//        }
//
//        if (filters.containsKey("price")) {
//            sql.append(" AND price <= ?");
//            params.add(Double.parseDouble(filters.get("price")));
//        }
//
//        if (filters.containsKey("max_students")) {
//            sql.append(" AND max_students = ?");
//            params.add(Integer.parseInt(filters.get("max_students")));
//        }
//
//        // Handle subjects
//        if (filters.containsKey("subjects")) {
//            String[] subjects = filters.get("subjects").split(",");
//            sql.append(" AND group_id IN (SELECT group_id FROM group_subject WHERE subject_id IN (SELECT id FROM subject WHERE subject_name IN (");
//            for (int i = 0; i < subjects.length; i++) {
//                sql.append("?");
//                if (i < subjects.length - 1) {
//                    sql.append(",");
//                }
//                params.add(subjects[i]);
//            }
//            sql.append(")))");
//        }
//
//        return jdbcTemplate.query(sql.toString(), params.toArray(), new GenericDTOMapper());
//    }
public List<GenericDTO> getFilteredGroups(GenericDTO filters, int page, int size) {
    StringBuilder sql = new StringBuilder("SELECT * FROM group_table WHERE 1=1");
    List<Object> params = new ArrayList<>();

    // Dodavanje filtera
    if (filters.getString("group_name") != null && !filters.getString("group_name").isEmpty()) {
        sql.append(" AND group_name LIKE ?");
        params.add("%" + filters.getString("group_name") + "%");
    }
    if (filters.getString("topic") != null && !filters.getString("topic").isEmpty()) {
        sql.append(" AND topic LIKE ?");
        params.add("%" + filters.getString("topic") + "%");
    }
    if (filters.getString("start_date_from") != null && !filters.getString("start_date_from").isEmpty()) {
        sql.append(" AND start_date >= ?");
        params.add(LocalDate.parse(filters.getString("start_date_from")));
    }
    if (filters.getString("start_date_to") != null && !filters.getString("start_date_to").isEmpty()) {
        sql.append(" AND start_date <= ?");
        params.add(LocalDate.parse(filters.getString("start_date_to")));
    }
    if (filters.getString("end_date_from") != null && !filters.getString("end_date_from").isEmpty()) {
        sql.append(" AND end_date >= ?");
        params.add(LocalDate.parse(filters.getString("end_date_from")));
    }
    if (filters.getString("end_date_to") != null && !filters.getString("end_date_to").isEmpty()) {
        sql.append(" AND end_date <= ?");
        params.add(LocalDate.parse(filters.getString("end_date_to")));
    }
    if (filters.getInt("hours_per_week_from") != null) {
        sql.append(" AND hours_per_week >= ?");
        params.add(filters.getInt("hours_per_week_from"));
    }
    if (filters.getInt("hours_per_week_to") != null) {
        sql.append(" AND hours_per_week <= ?");
        params.add(filters.getInt("hours_per_week_to"));
    }
    if (filters.getDouble("price_from") != null) {
        sql.append(" AND price >= ?");
        params.add(filters.getDouble("price_from"));
    }
    if (filters.getDouble("price_to") != null) {
        sql.append(" AND price <= ?");
        params.add(filters.getDouble("price_to"));
    }
    if (filters.getInt("max_students_from") != null) {
        sql.append(" AND max_students >= ?");
        params.add(filters.getInt("max_students_from"));
    }
    if (filters.getInt("max_students_to") != null) {
        sql.append(" AND max_students <= ?");
        params.add(filters.getInt("max_students_to"));
    }
    if (filters.getProperties().containsKey("subjects")) {
        List<String> subjects = filters.getList("subjects");
        if (!subjects.isEmpty() && subjects.stream().noneMatch(String::isEmpty)) {
            sql.append(" AND group_id IN (SELECT group_id FROM group_subject WHERE subject_id IN (SELECT id FROM subject WHERE subject_name IN (");
            String placeholders = String.join(",", Collections.nCopies(subjects.size(), "?"));
            sql.append(placeholders);
            sql.append(")))");
            params.addAll(subjects);
        }
    }

    sql.append(" LIMIT ? OFFSET ?");
    params.add(size);
    params.add(page * size);

    System.out.println("Executing query: " + sql.toString());
    System.out.println("With params: " + params);

    return jdbcTemplate.query(sql.toString(), params.toArray(), new GenericDTOMapper());
}

    public int getTotalCount(GenericDTO filters) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM group_table WHERE 1=1");
        List<Object> params = new ArrayList<>();

        // Dodavanje filtera
        if (filters.getString("group_name") != null && !filters.getString("group_name").isEmpty()) {
            sql.append(" AND group_name LIKE ?");
            params.add("%" + filters.getString("group_name") + "%");
        }
        if (filters.getString("topic") != null && !filters.getString("topic").isEmpty()) {
            sql.append(" AND topic LIKE ?");
            params.add("%" + filters.getString("topic") + "%");
        }
        if (filters.getString("start_date_from") != null && !filters.getString("start_date_from").isEmpty()) {
            sql.append(" AND start_date >= ?");
            params.add(LocalDate.parse(filters.getString("start_date_from")));
        }
        if (filters.getString("start_date_to") != null && !filters.getString("start_date_to").isEmpty()) {
            sql.append(" AND start_date <= ?");
            params.add(LocalDate.parse(filters.getString("start_date_to")));
        }
        if (filters.getString("end_date_from") != null && !filters.getString("end_date_from").isEmpty()) {
            sql.append(" AND end_date >= ?");
            params.add(LocalDate.parse(filters.getString("end_date_from")));
        }
        if (filters.getString("end_date_to") != null && !filters.getString("end_date_to").isEmpty()) {
            sql.append(" AND end_date <= ?");
            params.add(LocalDate.parse(filters.getString("end_date_to")));
        }
        if (filters.getInt("hours_per_week_from") != null) {
            sql.append(" AND hours_per_week >= ?");
            params.add(filters.getInt("hours_per_week_from"));
        }
        if (filters.getInt("hours_per_week_to") != null) {
            sql.append(" AND hours_per_week <= ?");
            params.add(filters.getInt("hours_per_week_to"));
        }
        if (filters.getDouble("price_from") != null) {
            sql.append(" AND price >= ?");
            params.add(filters.getDouble("price_from"));
        }
        if (filters.getDouble("price_to") != null) {
            sql.append(" AND price <= ?");
            params.add(filters.getDouble("price_to"));
        }
        if (filters.getInt("max_students_from") != null) {
            sql.append(" AND max_students >= ?");
            params.add(filters.getInt("max_students_from"));
        }
        if (filters.getInt("max_students_to") != null) {
            sql.append(" AND max_students <= ?");
            params.add(filters.getInt("max_students_to"));
        }
        if (filters.getProperties().containsKey("subjects")) {
            List<String> subjects = filters.getList("subjects");
            if (!subjects.isEmpty()) {
                sql.append(" AND group_id IN (SELECT group_id FROM group_subject WHERE subject_id IN (SELECT id FROM subject WHERE subject_name IN (");
                String placeholders = String.join(",", Collections.nCopies(subjects.size(), "?"));
                sql.append(placeholders);
                sql.append(")))");
                params.addAll(subjects);
            }
        }

        return jdbcTemplate.queryForObject(sql.toString(), params.toArray(), Integer.class);
    }

}
