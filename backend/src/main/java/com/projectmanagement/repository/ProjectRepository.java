package com.projectmanagement.repository;

import com.projectmanagement.entity.Project;
import com.projectmanagement.entity.Project.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Project> findByIdAndOwnerId(Long id, Long ownerId);

    List<Project> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, ProjectStatus status);

    List<Project> findByOwnerIdAndNameContainingIgnoreCaseOrderByCreatedAtDesc(Long ownerId, String name);

    long countByOwnerId(Long ownerId);

    long countByOwnerIdAndStatus(Long ownerId, ProjectStatus status);
}
