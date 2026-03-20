package com.stanzom.domain.fanroom;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FanRoomMessageRepository extends JpaRepository<FanRoomMessage, UUID> {

    Page<FanRoomMessage> findByRoomIdOrderByCreatedAtDesc(UUID roomId, Pageable pageable);
}
