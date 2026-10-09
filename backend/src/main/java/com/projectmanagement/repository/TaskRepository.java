package com.projectmanagement.repository;

import com.projectmanagement.entity.Task;
import com.projectmanagement.entity.Task.TaskPriority;
import com.projectmanagement.entity.Task.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectIdAndOwnerIdOrderByCreatedAtDesc(Long projectId, Long ownerId);

    Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);

    List<Task> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<Task> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, TaskStatus status);

    List<Task> findByOwnerIdAndPriorityOrderByCreatedAtDesc(Long ownerId, TaskPriority priority);

    List<Task> findByOwnerIdAndStatusAndPriorityOrderByCreatedAtDesc(Long ownerId, TaskStatus status, TaskPriority priority);

    List<Task> findByOwnerIdAndNameContainingIgnoreCaseOrderByCreatedAtDesc(Long ownerId, String name);

    List<Task> findByProjectIdAndOwnerIdAndStatusOrderByCreatedAtDesc(Long projectId, Long ownerId, TaskStatus status);

    long countByOwnerId(Long ownerId);

    long countByOwnerIdAndStatus(Long ownerId, TaskStatus status);

    boolean existsByIdAndOwnerId(Long id, Long ownerId);
}
