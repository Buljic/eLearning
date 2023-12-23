package com.example.tutoring.RESTControllers;

import com.example.tutoring.Entities.Subject;
import com.example.tutoring.Repositories.SubjectRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserPageController
{
    private final SubjectRepository subjectRepository;

    UserPageController(SubjectRepository subjectRepository)
    {
        this.subjectRepository=subjectRepository;
    }
    @GetMapping("/allSubjects")
    public ResponseEntity<?> giveAllSubjects(HttpServletRequest request)
    {
        List<String> subjectList=subjectRepository.findAllSubjects();
        return ResponseEntity.status(HttpStatus.OK).body(subjectList);
    }

    @GetMapping("/mostTutorSubjects")
    public ResponseEntity<?> giveSubjectsWithMostTutors(HttpServletRequest request)
    {
        return null;
    }
}
