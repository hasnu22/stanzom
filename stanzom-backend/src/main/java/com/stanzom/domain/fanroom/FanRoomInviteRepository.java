package com.stanzom.domain.fanroom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FanRoomInviteRepository extends JpaRepository<FanRoomInvite, UUID> {

    Optional<FanRoomInvite> findByRoomIdAndInvitedUserIdAndStatus(UUID roomId, UUID userId, String status);

    List<FanRoomInvite> findByInvitedUserIdAndStatus(UUID userId, String status);

    List<FanRoomInvite> findByRoomId(UUID roomId);
}
