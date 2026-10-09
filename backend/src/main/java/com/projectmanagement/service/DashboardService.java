package com.projectmanagement.service;

import com.projectmanagement.dto.DashboardResponse;
import com.projectmanagement.entity.Project.ProjectStatus;
import com.projectmanagement.entity.Task.TaskStatus;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DashboardService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(User owner) {
        long totalProjects = projectRepository.countByOwnerId(owner.getId());
        long totalTasks = taskRepository.countByOwnerId(owner.getId());
        long completedTasks = taskRepository.countByOwnerIdAndStatus(owner.getId(), TaskStatus.COMPLETED);
        long pendingTasks = taskRepository.countByOwnerIdAndStatus(owner.getId(), TaskStatus.PENDING);
        long inProgressTasks = taskRepository.countByOwnerIdAndStatus(owner.getId(), TaskStatus.IN_PROGRESS);
        long projectsNotStarted = projectRepository.countByOwnerIdAndStatus(owner.getId(), ProjectStatus.NOT_STARTED);
        long projectsInProgress = projectRepository.countByOwnerIdAndStatus(owner.getId(), ProjectStatus.IN_PROGRESS);
        long projectsCompleted = projectRepository.countByOwnerIdAndStatus(owner.getId(), ProjectStatus.COMPLETED);

        return DashboardResponse.builder()
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .projectsNotStarted(projectsNotStarted)
                .projectsInProgress(projectsInProgress)
                .projectsCompleted(projectsCompleted)
                .build();
    }
}
