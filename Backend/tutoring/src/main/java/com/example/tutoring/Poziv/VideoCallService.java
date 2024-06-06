package com.example.tutoring.Poziv;

import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.*;

import java.util.List;
import java.util.Optional;

@Service
public class VideoCallService {
    @Autowired
    private VideoCallRepository videoCallRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    public VideoCall createVideoCall(String callCode, String hostUsername) {
        VideoCall videoCall = new VideoCall();
        videoCall.setCallCode(callCode);
        videoCall.setHostUsername(hostUsername);
        videoCall.setStatus(CallStatus.ACTIVE);
        return videoCallRepository.save(videoCall);
    }

    public Optional<VideoCall> findVideoCallByCode(String callCode) {
        return Optional.ofNullable(videoCallRepository.findByCallCode(callCode));
    }

    public Participant addParticipant(VideoCall videoCall, String username) {
        Participant participant = new Participant();
        participant.setVideoCall(videoCall);
        participant.setUsername(username);
        return participantRepository.save(participant);
    }

    public List<Participant> getParticipants(VideoCall videoCall) {
        return participantRepository.findByVideoCall(videoCall);
    }

    public void endVideoCall(VideoCall videoCall) {
        videoCall.setStatus(CallStatus.ENDED);
        videoCallRepository.save(videoCall);
    }
}
