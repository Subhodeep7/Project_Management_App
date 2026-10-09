package com.projectmanagement.dto;

import com.projectmanagement.entity.Task.TaskPriority;
import com.projectmanagement.entity.Task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Task name is required")
    @Size(min = 1, max = 200, message = "Task name must be between 1 and 200 characters")
    private String name;

    private String description;

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    private LocalDate dueDate;

    @NotNull(message = "Project ID is required")
    private Long projectId;
}
