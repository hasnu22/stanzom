package com.stanzom.domain.fanroom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FanRoomMemberRepository extends JpaRepository<FanRoomMember, UUID> {

    List<FanRoomMember> findByRoomId(UUID roomId);

    Optional<FanRoomMember> findByRoomIdAndUserId(UUID roomId, UUID userId);

    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);
}
