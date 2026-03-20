package com.stanzom.domain.prize;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "prize_delivery_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrizeDeliveryAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "prize_id", nullable = false)
    private UUID prizeId;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "mobile_number", length = 15)
    private String mobileNumber;

    @Column(name = "street_address", columnDefinition = "TEXT")
    private String streetAddress;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "amazon_order_id", length = 100)
    private String amazonOrderId;

    @Column(name = "dispatched_at")
    private OffsetDateTime dispatchedAt;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
