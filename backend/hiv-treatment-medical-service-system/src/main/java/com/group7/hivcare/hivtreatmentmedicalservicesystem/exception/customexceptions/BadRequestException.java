package com.group7.hivcare.hivtreatmentmedicalservicesystem.exception.customexceptions;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
