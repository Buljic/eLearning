package com.example.tutoring.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class StorageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "png", "jpg", "jpeg", "gif", "webp",
            "pdf", "txt", "csv", "md", "rtf", "doc", "docx", "odt",
            "ppt", "pptx", "odp", "xls", "xlsx", "ods",
            "mp4", "mp3", "wav", "m4a",
            "zip", "rar", "7z"
    );

    private static final Map<String, Set<String>> EXTENSION_TO_MIME = Map.ofEntries(
            Map.entry("png", Set.of("image/png")),
            Map.entry("jpg", Set.of("image/jpeg")),
            Map.entry("jpeg", Set.of("image/jpeg")),
            Map.entry("gif", Set.of("image/gif")),
            Map.entry("webp", Set.of("image/webp")),
            Map.entry("pdf", Set.of("application/pdf")),
            Map.entry("txt", Set.of("text/plain")),
            Map.entry("csv", Set.of("text/csv", "text/plain", "application/csv")),
            Map.entry("doc", Set.of("application/msword")),
            Map.entry("docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            Map.entry("ppt", Set.of("application/vnd.ms-powerpoint")),
            Map.entry("pptx", Set.of("application/vnd.openxmlformats-officedocument.presentationml.presentation")),
            Map.entry("xls", Set.of("application/vnd.ms-excel")),
            Map.entry("xlsx", Set.of("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
            Map.entry("mp4", Set.of("video/mp4")),
            Map.entry("mp3", Set.of("audio/mpeg")),
            Map.entry("wav", Set.of("audio/wav", "audio/x-wav")),
            Map.entry("m4a", Set.of("audio/mp4", "audio/x-m4a")),
            Map.entry("zip", Set.of("application/zip", "application/x-zip-compressed")),
            Map.entry("rar", Set.of("application/x-rar-compressed", "application/vnd.rar")),
            Map.entry("7z", Set.of("application/x-7z-compressed"))
    );

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String store(MultipartFile file) {
        return storeInSubdirectory(file, "");
    }

    public void delete(String filename) {
        try {
            if (filename == null || filename.isBlank()) {
                return;
            }
            Path root = ensureDirectory(Paths.get(uploadDir));
            Path fileToDelete = root.resolve(filename).normalize();
            if (!fileToDelete.startsWith(root)) {
                throw new RuntimeException("Neispravna putanja fajla.");
            }
            Files.deleteIfExists(fileToDelete);
        } catch (IOException e) {
            throw new RuntimeException("Neuspjelo brisanje slike!", e);
        }
    }

    public String storeAssignment(MultipartFile file) {
        return storeInSubdirectory(file, "assignments");
    }

    public String storeAssignmentSubmission(MultipartFile file) {
        return storeInSubdirectory(file, "assignmentsubmits");
    }

    private String storeInSubdirectory(MultipartFile file, String subdirectory) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("Fajl je prazan ili ne postoji.");
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
            if (originalFilename.isBlank()) {
                throw new RuntimeException("Naziv fajla nije validan.");
            }

            String extension = extractSafeExtension(originalFilename);
            validateMimeType(file, extension);
            String generatedFilename = UUID.randomUUID() + "." + extension;

            Path root = ensureDirectory(Paths.get(uploadDir));
            Path targetDir = subdirectory == null || subdirectory.isBlank()
                    ? root
                    : ensureDirectory(root.resolve(subdirectory));
            Path targetFile = targetDir.resolve(generatedFilename).normalize();
            if (!targetFile.startsWith(targetDir)) {
                throw new RuntimeException("Neispravna putanja fajla.");
            }

            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
            return generatedFilename;
        } catch (Exception e) {
            throw new RuntimeException("Neuspjelo spremanje fajla.", e);
        }
    }

    private Path ensureDirectory(Path path) throws IOException {
        Path normalized = path.toAbsolutePath().normalize();
        Files.createDirectories(normalized);
        return normalized;
    }

    private void validateMimeType(MultipartFile file, String extension) {
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            return;
        }
        Set<String> allowedMimes = EXTENSION_TO_MIME.get(extension);
        if (allowedMimes != null && !allowedMimes.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new RuntimeException("MIME tip fajla ne odgovara ekstenziji.");
        }
    }

    private String extractSafeExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            throw new RuntimeException("Ekstenzija fajla nije podrzana.");
        }
        String extension = filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("Ekstenzija fajla nije podrzana.");
        }
        return extension;
    }
}

