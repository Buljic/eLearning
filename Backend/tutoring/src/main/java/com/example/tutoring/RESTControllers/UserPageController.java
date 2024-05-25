package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.StringNumber;
import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.SubjectRepository;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class UserPageController
{
    private final SubjectRepository subjectRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final GroupService groupService;

    //Mora biti bean kako bi bila injektovana negdje
    UserPageController(SubjectRepository subjectRepository, UserService userService, JwtUtil jwtUtil,
                       GroupService groupService)
    {
        this.subjectRepository = subjectRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.groupService = groupService;
    }

    @GetMapping ("/allSubjects")
    public ResponseEntity<?> giveAllSubjects()
    {
        List<String> subjectList = subjectRepository.findAllSubjects();
        for (String i : subjectList)
        {
            System.out.println("ELEMENT SVIH SUBJECTS" + i);
        }
        return ResponseEntity.status(HttpStatus.OK).body(subjectList);
    }

    @GetMapping ("/mostTutorSubjects")
    public ResponseEntity<?> giveSubjectsWithMostTutors(HttpServletRequest request)
    {
        List<StringNumber> list = userService.findMostTutorSubjects();
        for (StringNumber i : list)
        {
            System.out.println("MOSTTUTORSUBJECTS :" + i.getName() + ":broj tutora:" + i.getNumber());
        }
        return ResponseEntity.status(HttpStatus.OK).body(userService.findMostTutorSubjects());
    }

    //NEMOJ HARDCODEAT QUERY PARAMETRE jer je lakse ovako skalirati
    @GetMapping ("/subjects/search")/*? term=searchTerm"*/
    public ResponseEntity<?> giveSearchedSubjects(@RequestParam String searchTerm)
    {
        System.out.println("ONO STO SE TRAZI JE :" + searchTerm + ":");
        if (searchTerm == null || searchTerm.trim().isEmpty())
        {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(subjectRepository.findAllSubjects());//Ako se proslijedi prazan
            //request da samo vrati sve predmete
        }
        List<StringNumber> list = userService.findSearchedSubjects(searchTerm);
        for (int i = 0; i < list.size(); i++)
        {
            System.out.print("ELEMENT" + i + ". je " + list.get(i).getName());
        }
        if (list.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.OK).body("Prazno je"); //TODO treba nesto drugo vratiti
        }
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping ("/getTutorsFor")
    public ResponseEntity<?> getTutorsForSubject(@RequestParam String subject)
    {
        if (subject == null)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Prazan subject parameter");
        }
        List<GenericDTO> lista=userService.getTutorsForSubjectWithInfo(subject);
        System.out.println(lista);
        return ResponseEntity.status(HttpStatus.OK).body(lista);
    }

    @PostMapping ("/registerForSubjectAsTutor")
    public ResponseEntity<?> requestASubject(HttpServletRequest request,
                                             @RequestBody GenericDTO genericDTO)/*(HttpServletRequest request)*///@RequestBody GenericDTO genericDTO)
    {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null)//mslm ovo se ne moze desiti ali opet  TODO catch nacin obradi uradi za return za ovu metodu u userService
        {
//        String jsonData = request.getReader().lines().collect(Collectors.joining());
//        System.out.println(jsonData);
            String username = jwtUtil.getUsernameFromToken(token);
            System.out.println(genericDTO);
            userService.insertIntoTutorSubjectRequest((String)genericDTO.getProperty("inputSubject"),
                    username, (String)genericDTO.getProperty("comment"));
            return ResponseEntity.status(HttpStatus.OK).body("Racun kreiran");
        }
        else
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nepostojuc User");
        }
    }
    @GetMapping("/getUser/{username}")
    public ResponseEntity<?> getCertainUserInfo(@PathVariable String username)
    {
        System.out.println("NJEGOV USERNAME JE:"+username+":");
        GenericDTO user=userService.getUserInfoExtended(username);
        System.out.println(user.getProperty("account_type"));
        Object type=user.getProperty("account_type");
        System.out.println(type.getClass()+"|||");
        if(type instanceof AccountType)
        {
            System.out.println("jesteWWWWWW");
        }
        if(((String)user.getProperty("account_type")) .equals(/*AccountType.*/"PROFESOR"))
        {
            //TODO moze se implementovati kao recenzije za neki predmet npr i badges ili nesto slicno a za to se treba napraviti nova baza
             //TODO IMPLEMENTUJ PRIKAZIVANJE I SUBJECTA KAO <String<String,Object>> struktura
            List< GenericDTO> subjects=userService.findTutorsSubjectsWithInfo((Long)user.getProperty("id"));
            user.addProperty("subjects",subjects);
            System.out.println("ISPISANI PREDMETI"+ subjects);
            return ResponseEntity.status(HttpStatus.OK).body(user);
        }
        System.out.println("Trazeni user je "+ user);
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @GetMapping("/getAttendedGroups")
    public ResponseEntity<?> getAttendedCourses(@RequestParam Long userId){
        System.out.println(userId+"OVO JE NAS USER");
        List<GenericDTO> dto= userService.findAttendedCourses(userId);
        for (GenericDTO dto1:dto)
        {
            System.out.println(dto1+"Ovo je attended kurs");
        }
       return ResponseEntity.status(HttpStatus.OK).body( userService.findAttendedCourses(userId));
    }
    @GetMapping("/getUsers")
    public ResponseEntity<?> getSearchedUsers(@RequestParam String searchTerm)
    {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getSearchedUsers(searchTerm));
    }

    @PostMapping("/createGroup")
    public ResponseEntity<?> createGroup(@RequestBody GenericDTO request)
    {
        System.out.println("Doslo je do njega");
        try {
            System.out.println("Request data: " + request.getProperties());
            userService.createGroup(request);
            return ResponseEntity.status(HttpStatus.OK).body("Grupa uspješno kreirana");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/getGroups")
    public ResponseEntity<?> getGroups(@RequestParam Map<String, String> filters,
                                       @RequestParam int page,
                                       @RequestParam int size) {
        try {
            Map<String, Object> convertedFilters = new HashMap<>();
            for (Map.Entry<String, String> entry : filters.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();

                if (key.equals("subjects")) {
                    if (value.isEmpty()) {
                        convertedFilters.put(key, Collections.emptyList());
                    } else {
                        List<String> subjects = Arrays.asList(value.split(","));
                        convertedFilters.put(key, subjects);
                    }
                } else if (key.endsWith("_from") || key.endsWith("_to") || key.equals("start_date") || key.equals("end_date")) {
                    convertedFilters.put(key, value);
                } else if (key.equals("price") || key.equals("price_from") || key.equals("price_to")) {
                    convertedFilters.put(key, Double.parseDouble(value));
                } else if (key.equals("max_students") || key.equals("max_students_from") || key.equals("max_students_to") ||
                        key.equals("hours_per_week") || key.equals("hours_per_week_from") || key.equals("hours_per_week_to")) {
                    convertedFilters.put(key, Integer.parseInt(value));
                } else {
                    convertedFilters.put(key, value);
                }
            }

            GenericDTO filterDTO = new GenericDTO(convertedFilters);
            List<GenericDTO> groups = userService.getFilteredGroups(filterDTO, page, size);
            int totalCount = userService.getTotalCount(filterDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("groups", groups);
            response.put("totalCount", totalCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching groups");
        }
    }

    @PostMapping("/groups/{groupId}/request-access")
    public ResponseEntity<?> requestAccess(@PathVariable Long groupId, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String role = jwtUtil.getRoleFromToken(token);
        if (!"STUDENT".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only students can request access to groups");
        }
        User user = userService.getCurrentUser(request);
        Group group = groupService.findGroupById(groupId);
        if (group.getStartDate().before(new Date())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot request access to past groups");
        }
        groupService.requestAccess(group, user);
        return ResponseEntity.ok("Access requested successfully");
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<?> getGroupDetails(@PathVariable Long groupId, HttpServletRequest request) {
        try {
            String token = jwtUtil.extractJwtFromCookie(request);
            if (token == null) {
                System.out.println("JWT token not found in the request.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }
            String role = jwtUtil.getRoleFromToken(token);
            if (role == null || role.isEmpty()) {
                System.out.println("Invalid JWT token.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid JWT token");
            }
            Group group = groupService.findGroupById(groupId);
            if (group == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
            }
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
        }
    }

}
