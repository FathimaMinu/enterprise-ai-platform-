package com.enterpriseai.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    private String name;

    @Size(max = 30, message = "Phone must be at most 30 characters")
    private String phone;

    private String location;
    private String company;
    private String department;

    @Size(max = 500, message = "Bio must be at most 500 characters")
    private String bio;
}
