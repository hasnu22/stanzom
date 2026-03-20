package com.stanzom.domain.prize;

import com.stanzom.domain.prize.dto.DailyPrizeDto;
import com.stanzom.domain.prize.dto.SubmitAddressRequest;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/prizes")
@RequiredArgsConstructor
@Tag(name = "Daily Prize", description = "Daily prize information and delivery address submission")
public class PrizeController {

    private final PrizeService prizeService;

    @GetMapping("/daily")
    @Operation(summary = "Get daily prize", description = "Returns the daily prize for a given date and sport")
    public ResponseEntity<ApiResponse<DailyPrizeDto>> getDailyPrize(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String sportSlug) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(ApiResponse.success(prizeService.getDailyPrize(date, sportSlug)));
    }

    @PostMapping("/{prizeId}/address")
    @Operation(summary = "Submit delivery address", description = "Submit delivery address for a won prize (winner only)")
    public ResponseEntity<ApiResponse<Void>> submitAddress(
            @PathVariable UUID prizeId,
            @RequestBody SubmitAddressRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        prizeService.submitAddress(prizeId, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery address submitted successfully", null));
    }
}
