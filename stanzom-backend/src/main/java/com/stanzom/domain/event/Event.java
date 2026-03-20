package com.stanzom.domain.event;

import com.stanzom.domain.sport.Sport;
import com.stanzom.domain.sport.Tournament;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id")
    private Sport sport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Builder.Default
    @Column(name = "event_type", length = 30)
    private String eventType = "MATCH";

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "team_home_id")
    private UUID teamHomeId;

    @Column(name = "team_away_id")
    private UUID teamAwayId;

    @Column(name = "event_date", nullable = false)
    private OffsetDateTime eventDate;

    @Column(name = "venue", length = 100)
    private String venue;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "UPCOMING";

    @Column(name = "score_home", length = 20)
    private String scoreHome;

    @Column(name = "score_away", length = 20)
    private String scoreAway;

    @Column(name = "winner_team_id")
    private UUID winnerTeamId;

    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "current_period", length = 50)
    private String currentPeriod;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
