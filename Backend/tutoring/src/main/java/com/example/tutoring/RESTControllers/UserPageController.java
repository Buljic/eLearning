package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.StringNumber;
import com.example.tutoring.Repositories.SubjectRepository;
import com.example.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserPageController
{
    private final SubjectRepository subjectRepository;
    private final UserService userService;
//Mora biti bean kako bi bila injektovana negdje
    UserPageController(SubjectRepository subjectRepository, UserService userService)
    {
        this.subjectRepository=subjectRepository;
        this.userService = userService;
    }
    @GetMapping("/allSubjects")
    public ResponseEntity<?> giveAllSubjects()
    {
        List<String> subjectList=subjectRepository.findAllSubjects();
        for(String i :subjectList)
        {
            System.out.println("ELEMENT SVIH SUBJECTS"+ i);
        }
        return ResponseEntity.status(HttpStatus.OK).body(subjectList);
    }

    @GetMapping("/mostTutorSubjects")
    public ResponseEntity<?> giveSubjectsWithMostTutors(HttpServletRequest request)
    {
        List<StringNumber> list=userService.findMostTutorSubjects();
        for(StringNumber i:list)
        {
            System.out.println("MOSTTUTORSUBJECTS :"+i.getName()+":broj tutora:"+ i.getNumber());
        }
        return ResponseEntity.status(HttpStatus.OK).body(userService.findMostTutorSubjects());
    }
    //NEMOJ HARDCODEAT QUERY PARAMETRE jer je lakse ovako skalirati
    @GetMapping("/subjects/search")/*? term=searchTerm"*/
    public ResponseEntity<?> giveSearchedSubjects(@RequestParam String searchTerm)
    {
        System.out.println("ONO STO SE TRAZI JE :"+searchTerm+":");
        if(searchTerm==null || searchTerm.trim().isEmpty())
        {
            return ResponseEntity.status(HttpStatus.OK).body(subjectRepository.findAllSubjects());//Ako se proslijedi prazan
            //request da samo vrati sve predmete
        }
        List<StringNumber> list=userService.findSearchedSubjects(searchTerm);
        for(int i =0;i<list.size();i++)
        {
            System.out.print("ELEMENT"+ i+". je "+list.get(i).getName());
        }
        if(list.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.OK).body("Prazno je"); //TODO treba nesto drugo vratiti
        }
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }
    @GetMapping("/getTutorsFor")
    public ResponseEntity<?> getTutorsForSubject(@RequestParam String subject)
    {
        if(subject==null)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Prazan subject parameter");
        }
        return null;//todo implementuj

    }

}
