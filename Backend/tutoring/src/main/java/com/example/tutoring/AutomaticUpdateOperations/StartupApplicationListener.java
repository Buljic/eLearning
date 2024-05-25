package com.example.tutoring.AutomaticUpdateOperations;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class StartupApplicationListener {

    private final GroupRequestService groupRequestService;

    public StartupApplicationListener(GroupRequestService groupRequestService) {
        this.groupRequestService = groupRequestService;
    }

    @PostConstruct
    public void onStartup() {
        groupRequestService.updateRequestStatuses();
    }
}
