package com.example.tutoring.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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
}

