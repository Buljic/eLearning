package com.example.tutoring.Services;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.GenericDTOMapper;
import com.example.tutoring.DTOs.StringNumber;
import com.example.tutoring.DTOs.UserDTO;
import com.example.tutoring.Entities.Tutor;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.EncryptionUtility;
import com.example.tutoring.Security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.*;

@Service
public class UserService
{
    private final JdbcTemplate jdbcTemplate;
    private final EncryptionUtility encryptionUtility;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    public UserService(JdbcTemplate jdbcTemplate, EncryptionUtility encryptionUtility, UserRepository userRepository,
                       JwtUtil jwtUtil)
    {
        this.jdbcTemplate = jdbcTemplate;
        this.encryptionUtility = encryptionUtility;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public Long getUserIdFromToken(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        String userIdSql = "SELECT id FROM user WHERE username = ?;";
        return jdbcTemplate.queryForObject(userIdSql, Long.class, username);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<StringNumber> findMostTutorSubjects()
    {
        String sql = "SELECT Subject.subject_name AS name, " +
                "COUNT(DISTINCT CONCAT(tutorsubject.subject_id,'-',tutorsubject.tutor_id)) AS number " +
                "FROM Subject " +
                "LEFT JOIN tutorsubject ON Subject.id = tutorsubject.subject_id " +
                "GROUP BY Subject.subject_name " +
                "ORDER BY number DESC, Subject.subject_name " +
                "LIMIT 5;";
        return jdbcTemplate.query(sql,new BeanPropertyRowMapper<>(StringNumber.class));
    }

    public List<StringNumber> findSearchedSubjects(String searchedText)
    {
        String sql = "SELECT Subject.subject_name AS name, COUNT(DISTINCT CONCAT(tutorsubject.subject_id,'-',tutorsubject.tutor_id)) as number " +
                "FROM Subject " +
                "LEFT JOIN tutorsubject ON Subject.id = tutorsubject.subject_id " +
                "WHERE LOWER(Subject.subject_name) LIKE LOWER(?) " +
                "GROUP BY Subject.subject_name;";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(StringNumber.class), "%" + searchedText + "%");
    }

    public List<Tutor> findTutorsBySubjectName(String subject_name){
        String sql="SELECT * FROM (SELECT Subject.id AS sid FROM Subject WHERE Subject.subject_name LIKE ?) sub " +
                "LEFT JOIN tutorsubject ON sub.sid = tutorsubject.subject_id";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Tutor.class), subject_name);
    }

    public GenericDTO getUserInfoExtended(String username)
    {
        String sql = "SELECT user.id, user.name, user.surname, user.username, user.account_type, user.phone_number, user.email " +
                " FROM user where LOWER(user.username) = LOWER(?) ; ";
        GenericDTO genericDTO = jdbcTemplate.queryForObject(sql, new GenericDTOMapper(), username);

        // Dekripcija emaila
        String email = (String)genericDTO.getProperty("email");
        if (email != null) {
            genericDTO.setProperty("email",encryptionUtility.decrypt(email));
        }

        // Dekripcija broja telefona
        String phoneNumber = (String)genericDTO.getProperty("phone_number");
        if (phoneNumber != null) {
            genericDTO.setProperty("phone_number",encryptionUtility.decrypt(phoneNumber));
        }

        userRepository.findByUsername(username).ifPresent(user ->
                genericDTO.setProperty(
                        "roles",
                        user.getEffectiveRoles().stream().map(Enum::name).toList()
                )
        );

        return genericDTO;
    }

    public UserDTO getUserInfo(String username)
    {
        String sql="SELECT user.id, user.name , user.surname, user.username, user.account_type " +
                ",user.email,user.phone_number FROM user where LOWER(user.username) = LOWER (?) ; ";
        UserDTO userDTO = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(UserDTO.class), username);
        userDTO.setEmail(encryptionUtility.decrypt(userDTO.getEmail()));
        if(userDTO.getPhoneNumber()!=null) userDTO.setPhoneNumber(encryptionUtility.decrypt(userDTO.getPhoneNumber()));
        userRepository.findByUsername(username).ifPresent(user -> userDTO.setRoles(user.getEffectiveRoles()));

        return userDTO;
    }

    public List<GenericDTO> getTutorsForSubjectWithInfo(String subjectName)
    {
        String sql="SELECT user.name,user.surname, user.username, tutorsubject.teaching_grade" +
                " from tutorsubject JOIN tutor ON tutorsubject.tutor_id = tutor.id " +
                " JOIN user ON tutor.id=user.id " +
                " where  tutorsubject.subject_id = (SELECT subject.id AS sid FROM subject where subject.subject_name = ? ); ";
        return jdbcTemplate.query(sql, new GenericDTOMapper(), subjectName);

    }

    @Transactional
    public void insertIntoTutorSubjectRequest(String subject,String tutorUsername,String comment)
    {
        // TODO: When a dedicated approval workflow is added, replace this coarse duplicate check
        // with request status transitions (PENDING/APPROVED/REJECTED).
        Integer subjectCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM subject WHERE subject_name = ?",
                Integer.class, subject
        );
        if (subjectCount == null || subjectCount == 0) {
            throw new IllegalArgumentException("Nepostojeci predmet.");
        }

        Long tutorId = jdbcTemplate.queryForObject(
                "SELECT id FROM user WHERE username = ?",
                Long.class, tutorUsername
        );
        if (tutorId == null) {
            throw new IllegalArgumentException("Nepostojeci tutor.");
        }

        Integer alreadyTutor = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tutorsubject ts JOIN subject s ON s.id = ts.subject_id WHERE ts.tutor_id = ? AND s.subject_name = ?",
                Integer.class, tutorId, subject
        );
        if (alreadyTutor != null && alreadyTutor > 0) {
            throw new IllegalStateException("Vec ste registrovani kao tutor za ovaj predmet.");
        }

        Integer existingRequests = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tutorsubjectrequest tsr JOIN subject s ON s.id = tsr.subject_id WHERE tsr.tutor_id = ? AND s.subject_name = ?",
                Integer.class, tutorId, subject
        );
        if (existingRequests != null && existingRequests > 0) {
            throw new IllegalStateException("Zahtjev za ovaj predmet je vec poslan.");
        }

        String sql="INSERT INTO tutorsubjectrequest  (request_date,subject_id,tutor_id,comment) " +
                "values (?,(SELECT id FROM subject where subject.subject_name=?) , (SELECT id FROM user WHERE user.username=?) ,?);";
        jdbcTemplate.update(sql, LocalDate.now(), subject, tutorUsername, comment);
    }
    public List<GenericDTO> findTutorsSubjectsWithInfo(Long id)
    {
        String sql="select subject.subject_name , tutorsubject.teaching_grade from\n" +
                "tutorsubject JOIN subject on tutorsubject.subject_id=subject.id \n" +
                "where tutorsubject.tutor_id = ?;";
        return jdbcTemplate.query(sql, new GenericDTOMapper(), id);
    }

    public List<GenericDTO> findAttendedCourses(Long userId) {
        String sql = "SELECT group_table.* FROM group_table " +
                "JOIN user_group ON group_table.group_id = user_group.group_id " +
                "WHERE user_group.user_id = ?";
        return jdbcTemplate.query(sql, new GenericDTOMapper(), userId);
    }

    public List<GenericDTO> getSearchedUsers(String username)
    {
        String sql = "SELECT id, name, surname, username, account_type FROM user WHERE username LIKE ?;";
        return jdbcTemplate.query(sql, new GenericDTOMapper(), "%" + username + "%");
    }

    @Transactional
    public void createGroup(GenericDTO request, Long tutorId) throws Exception {
        try {
            String groupName = request.getString("groupName");
            String topic = request.getString("topic");
            String description = request.getString("description");
            LocalDate startDate = LocalDate.parse(request.getString("startDate"));
            LocalDate endDate = LocalDate.parse(request.getString("endDate"));
            Integer hoursPerWeek = request.getInt("hoursPerWeek");
            Double price = request.getDouble("price");
            Integer maxStudents = request.getInt("maxStudents");
            List<String> subjects = (List<String>) request.getProperties().get("chosenSubjects");

            if (groupName == null || groupName.isBlank()) {
                throw new IllegalArgumentException("Naziv grupe je obavezan.");
            }
            if (topic == null || topic.isBlank()) {
                throw new IllegalArgumentException("Tema grupe je obavezna.");
            }
            if (description == null || description.isBlank()) {
                throw new IllegalArgumentException("Opis grupe je obavezan.");
            }
            if (hoursPerWeek == null || hoursPerWeek <= 0 || price == null || price <= 0 || maxStudents == null || maxStudents <= 0) {
                throw new IllegalArgumentException("Numericka polja moraju biti pozitivna.");
            }
            if (subjects == null || subjects.isEmpty() || subjects.stream().anyMatch(subject -> subject == null || subject.isBlank())) {
                throw new IllegalArgumentException("Morate izabrati barem jedan validan predmet.");
            }
            if (startDate.isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Datum pocetka ne moze biti u proslosti.");
            }
            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("Datum zavrsetka mora biti nakon datuma pocetka.");
            }

            String normalizedGroupName = groupName.trim();
            String normalizedTopic = topic.trim();
            String normalizedDescription = description.trim();
            List<String> normalizedSubjects = subjects.stream()
                    .map(String::trim)
                    .filter(subject -> !subject.isEmpty())
                    .distinct()
                    .toList();

            String checkDuplicateSql = "SELECT COUNT(*) FROM group_table WHERE group_name = ? AND headtutor_id = ?;";
            int count = jdbcTemplate.queryForObject(checkDuplicateSql, Integer.class, normalizedGroupName, tutorId);
            if (count > 0) {
                throw new IllegalStateException("Tutor vec ima grupu s istim imenom.");
            }

            // TODO: Migrate from single headtutor_id to group_tutor mapping when co-professor support per group is introduced.
            String insertGroupSql = "INSERT INTO group_table (group_name, topic, description, start_date, end_date, hours_per_week, price, max_students, creation_date, headtutor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            KeyHolder groupKeyHolder = new GeneratedKeyHolder();
            int groupInsertResult = jdbcTemplate.update(connection -> {
                PreparedStatement preparedStatement = connection.prepareStatement(insertGroupSql, Statement.RETURN_GENERATED_KEYS);
                preparedStatement.setString(1, normalizedGroupName);
                preparedStatement.setString(2, normalizedTopic);
                preparedStatement.setString(3, normalizedDescription);
                preparedStatement.setObject(4, startDate);
                preparedStatement.setObject(5, endDate);
                preparedStatement.setInt(6, hoursPerWeek);
                preparedStatement.setDouble(7, price);
                preparedStatement.setInt(8, maxStudents);
                preparedStatement.setObject(9, LocalDate.now());
                preparedStatement.setLong(10, tutorId);
                return preparedStatement;
            }, groupKeyHolder);
            if (groupInsertResult != 1 || groupKeyHolder.getKey() == null) {
                throw new Exception("Failed to insert group.");
            }
            Long groupId = groupKeyHolder.getKey().longValue();

            String insertGroupSubjectSql = "INSERT INTO group_subject (group_id, subject_id) VALUES (?, ?);";
            for (String subject : normalizedSubjects) {
                Long subjectId;
                try {
                    subjectId = jdbcTemplate.queryForObject(
                            "SELECT id FROM subject WHERE subject_name = ?",
                            Long.class, subject
                    );
                } catch (EmptyResultDataAccessException e) {
                    throw new IllegalArgumentException("Nepostojeci predmet: " + subject);
                }
                if (subjectId == null) {
                    throw new IllegalArgumentException("Nepostojeci predmet: " + subject);
                }

                int groupSubjectInsertResult = jdbcTemplate.update(insertGroupSubjectSql, groupId, subjectId);
                if (groupSubjectInsertResult != 1) {
                    throw new Exception("Failed to insert group subject for: " + subject);
                }
            }

            String insertUserGroupSql = "INSERT INTO user_group (date_joined, group_id, user_id) VALUES (?, ?, ?);";
            int userGroupInsertResult = jdbcTemplate.update(insertUserGroupSql, LocalDate.now(), groupId, tutorId);
            if (userGroupInsertResult != 1) {
                throw new Exception("Failed to insert tutor into user_group");
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (DataAccessException e) {
            throw new Exception("Greska pri pristupu bazi podataka.");
        } catch (Exception e) {
            throw new Exception("Greska pri kreiranju grupe.");
        }
    }

    public List<GenericDTO> getFilteredGroups(GenericDTO filters, int page, int size) {
        StringBuilder sql = new StringBuilder("SELECT * FROM group_table WHERE 1=1");
        List<Object> params = new ArrayList<>();
        appendGroupFilters(filters, sql, params);

        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return jdbcTemplate.query(sql.toString(), new GenericDTOMapper(), params.toArray());
    }

    public int getTotalCount(GenericDTO filters) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM group_table WHERE 1=1");
        List<Object> params = new ArrayList<>();
        appendGroupFilters(filters, sql, params);

        return jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
    }

    private void appendGroupFilters(GenericDTO filters, StringBuilder sql, List<Object> params) {
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
    }

    public User findUserByUsername(String username) {
        return getUserByUsername(username);
    }

    public User getCurrentUser(HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            throw new RuntimeException("Token not found");
        }
        String username = jwtUtil.getUsernameFromToken(token);
        return findUserByUsername(username);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public Optional<User> getUserFromToken(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        return userRepository.findByUsername(username);
    }

}

