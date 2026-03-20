package com.stanzom.domain.team;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sport_id", nullable = false)
    private UUID sportId;

    @Column(name = "tournament_id")
    private UUID tournamentId;

    @Column(name = "short_name", length = 10)
    private String shortName;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "home_ground", length = 100)
    private String homeGround;

    @Column(name = "primary_color", length = 10)
    private String primaryColor;

    @Column(name = "secondary_color", length = 10)
    private String secondaryColor;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Builder.Default
    @Column(name = "followers_count")
    private int followersCount = 0;

    @Builder.Default
    @Column(name = "overall_rating")
    private BigDecimal overallRating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "rating_count")
    private int ratingCount = 0;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Builder.Default
    @Column(name = "titles")
    private int titles = 0;
}
