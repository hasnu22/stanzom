package com.stanzom.domain.sport;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "sports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "slug", length = 30, unique = true, nullable = false)
    private String slug;

    @Column(name = "icon_url", columnDefinition = "TEXT")
    private String iconUrl;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;

    @Builder.Default
    @Column(name = "display_order")
    private int displayOrder = 0;
}
