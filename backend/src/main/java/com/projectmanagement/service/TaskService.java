package com.projectmanagement.service;

import com.projectmanagement.dto.TaskRequest;
import com.projectmanagement.dto.TaskResponse;
import com.projectmanagement.entity.Project;
import com.projectmanagement.entity.Task;
import com.projectmanagement.entity.Task.TaskPriority;
import com.projectmanagement.entity.Task.TaskStatus;
import com.projectmanagement.entity.User;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.exception.UnauthorizedException;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, User owner) {
        Project project = projectRepository.findByIdAndOwnerId(request.getProjectId(), owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Project not found with id: " + request.getProjectId()));

        Task task = Task.builder()
                .name(request.getName())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .project(project)
                .owner(owner)
                .build();

        task = taskRepository.save(task);
        logger.info("Task created: {} in project: {} by user: {}", task.getId(), project.getId(), owner.getEmail());
        return toTaskResponse(task);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(User owner, Long projectId, String status, String priority, String search) {
        List<Task> tasks;

        if (search != null && !search.isBlank()) {
            tasks = taskRepository.findByOwnerIdAndNameContainingIgnoreCaseOrderByCreatedAtDesc(
                    owner.getId(), search.trim());
        } else if (projectId != null) {
            if (status != null && !status.isBlank()) {
                TaskStatus taskStatus = parseTaskStatus(status);
                tasks = taskRepository.findByProjectIdAndOwnerIdAndStatusOrderByCreatedAtDesc(
                        projectId, owner.getId(), taskStatus);
            } else {
                tasks = taskRepository.findByProjectIdAndOwnerIdOrderByCreatedAtDesc(projectId, owner.getId());
            }
        } else if (status != null && !status.isBlank() && priority != null && !priority.isBlank()) {
            tasks = taskRepository.findByOwnerIdAndStatusAndPriorityOrderByCreatedAtDesc(
                    owner.getId(), parseTaskStatus(status), parseTaskPriority(priority));
        } else if (status != null && !status.isBlank()) {
            tasks = taskRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(owner.getId(), parseTaskStatus(status));
        } else if (priority != null && !priority.isBlank()) {
            tasks = taskRepository.findByOwnerIdAndPriorityOrderByCreatedAtDesc(owner.getId(), parseTaskPriority(priority));
        } else {
            tasks = taskRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());
        }

        return tasks.stream().map(this::toTaskResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id, User owner) {
        Task task = taskRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return toTaskResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request, User owner) {
        Task task = taskRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        // Verify project belongs to owner if changing project
        if (!task.getProject().getId().equals(request.getProjectId())) {
            projectRepository.findByIdAndOwnerId(request.getProjectId(), owner.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Project not found with id: " + request.getProjectId()));
        }

        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());

        task = taskRepository.save(task);
        logger.info("Task updated: {} by user: {}", id, owner.getEmail());
        return toTaskResponse(task);
    }

    @Transactional
    public void deleteTask(Long id, User owner) {
        Task task = taskRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
        logger.info("Task deleted: {} by user: {}", id, owner.getEmail());
    }

    private TaskResponse toTaskResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .ownerId(task.getOwner().getId())
                .build();
    }

    private TaskStatus parseTaskStatus(String status) {
        try {
            return TaskStatus.valueOf(status.toUpperCase().replace("-", "_").replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid task status: " + status);
        }
    }

    private TaskPriority parseTaskPriority(String priority) {
        try {
            return TaskPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid task priority: " + priority);
        }
    }
}
