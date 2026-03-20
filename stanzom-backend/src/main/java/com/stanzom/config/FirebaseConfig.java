package com.stanzom.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = getServiceAccountStream();

                if (serviceAccount != null) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();

                    FirebaseApp.initializeApp(options);
                    log.info("Firebase initialized successfully");
                } else {
                    log.warn("Firebase service account not found. Push notifications will not be available.");
                }
            }
        } catch (IOException e) {
            log.warn("Failed to initialize Firebase: {}. Push notifications will not be available.", e.getMessage());
        }
    }

    private InputStream getServiceAccountStream() {
        // Try environment variable path first
        String envPath = System.getenv("FIREBASE_SERVICE_ACCOUNT_PATH");
        if (envPath != null && !envPath.isBlank()) {
            try {
                return new FileInputStream(envPath);
            } catch (IOException e) {
                log.debug("Firebase service account not found at env path: {}", envPath);
            }
        }

        // Fall back to classpath
        try {
            ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
            if (resource.exists()) {
                return resource.getInputStream();
            }
        } catch (IOException e) {
            log.debug("Firebase service account not found on classpath");
        }

        return null;
    }
}
