package com.stanzom.domain.fanroom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FanRoomRepository extends JpaRepository<FanRoom, UUID> {

    Optional<FanRoom> findByInviteCode(String inviteCode);

    @Query("SELECT fr FROM FanRoom fr JOIN FanRoomMember frm ON frm.roomId = fr.id WHERE frm.userId = :userId")
    List<FanRoom> findByMembership(@Param("userId") UUID userId);
}
