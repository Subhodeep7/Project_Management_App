package com.projectmanagement.service;

import com.projectmanagement.dto.ProjectRequest;
import com.projectmanagement.dto.ProjectResponse;
import com.projectmanagement.entity.Project;
import com.projectmanagement.entity.Project.ProjectStatus;
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
public class ProjectService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public ProjectService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, User owner) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .owner(owner)
                .build();

        project = projectRepository.save(project);
        logger.info("Project created: {} by user: {}", project.getId(), owner.getEmail());
        return toProjectResponse(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects(User owner, String status, String search) {
        List<Project> projects;

        if (search != null && !search.isBlank()) {
            projects = projectRepository.findByOwnerIdAndNameContainingIgnoreCaseOrderByCreatedAtDesc(
                    owner.getId(), search.trim());
        } else if (status != null && !status.isBlank()) {
            ProjectStatus projectStatus = parseProjectStatus(status);
            projects = projectRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(owner.getId(), projectStatus);
        } else {
            projects = projectRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());
        }

        return projects.stream().map(this::toProjectResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id, User owner) {
        Project project = projectRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return toProjectResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, User owner) {
        Project project = projectRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        project = projectRepository.save(project);
        logger.info("Project updated: {} by user: {}", project.getId(), owner.getEmail());
        return toProjectResponse(project);
    }

    @Transactional
    public void deleteProject(Long id, User owner) {
        Project project = projectRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        projectRepository.delete(project);
        logger.info("Project deleted: {} by user: {}", id, owner.getEmail());
    }

    private ProjectResponse toProjectResponse(Project project) {
        long taskCount = project.getTasks() != null ? project.getTasks().size() : 0;
        long completedTaskCount = project.getTasks() != null
                ? project.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count()
                : 0;

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getFullName())
                .taskCount((int) taskCount)
                .completedTaskCount((int) completedTaskCount)
                .build();
    }

    private ProjectStatus parseProjectStatus(String status) {
        try {
            return ProjectStatus.valueOf(status.toUpperCase().replace("-", "_").replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid project status: " + status);
        }
    }
}
