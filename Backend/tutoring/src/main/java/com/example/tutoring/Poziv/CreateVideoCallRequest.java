package com.example.tutoring.Poziv;

public class CreateVideoCallRequest {
    private String callCode;
    private String hostUsername;

    public String getCallCode()
    {
        return callCode;
    }

    public void setCallCode(String callCode)
    {
        this.callCode = callCode;
    }

    public String getHostUsername()
    {
        return hostUsername;
    }

    public void setHostUsername(String hostUsername)
    {
        this.hostUsername = hostUsername;
    }
}
