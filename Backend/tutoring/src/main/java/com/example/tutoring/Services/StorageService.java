package com.example.tutoring.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class StorageService {
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String store(MultipartFile file) {
        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            Path destination = Paths.get(uploadDir, file.getOriginalFilename());
            file.transferTo(destination);

            return file.getOriginalFilename();
        } catch (Exception e) {
            throw new RuntimeException("Neuspjelo spremanje slike!", e);
        }
    }

    public void delete(String filename) {
        try {
            Path fileToDelete = Paths.get(uploadDir, filename);
            Files.deleteIfExists(fileToDelete);
        } catch (IOException e) {
            throw new RuntimeException("Neuspjelo brisanje slike!", e);
        }
    }

    public String storeAssignment(MultipartFile file) {
        try {
            Path copyLocation = Paths.get(uploadDir + "/assignments/" + StringUtils.cleanPath(file.getOriginalFilename()));
            Files.copy(file.getInputStream(), copyLocation, StandardCopyOption.REPLACE_EXISTING);
            return file.getOriginalFilename();
        } catch (Exception e) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", e);
        }
    }

    public String storeAssignmentSubmission(MultipartFile file) {
        try {
            Path copyLocation = Paths.get(uploadDir + "/assignmentsubmits/" + StringUtils.cleanPath(file.getOriginalFilename()));
            Files.copy(file.getInputStream(), copyLocation, StandardCopyOption.REPLACE_EXISTING);
            return file.getOriginalFilename();
        } catch (Exception e) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", e);
        }
    }
}

