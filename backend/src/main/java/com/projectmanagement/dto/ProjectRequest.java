package com.projectmanagement.dto;

import com.projectmanagement.entity.Project.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(min = 1, max = 200, message = "Project name must be between 1 and 200 characters")
    private String name;

    private String description;

    @NotNull(message = "Status is required")
    private ProjectStatus status;

    private LocalDate startDate;

    private LocalDate endDate;
}
