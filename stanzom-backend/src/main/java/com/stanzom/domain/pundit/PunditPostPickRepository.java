package com.stanzom.domain.pundit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PunditPostPickRepository extends JpaRepository<PunditPostPick, UUID> {

    List<PunditPostPick> findByPostId(UUID postId);
}
