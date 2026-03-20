package com.stanzom.domain.sport;

import com.stanzom.domain.sport.dto.SportDto;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
@Tag(name = "Sports", description = "Sport management endpoints")
public class SportController {

    private final SportService sportService;

    @GetMapping
    @Operation(summary = "List all active sports", description = "Returns all active sports ordered by display order")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Sports retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<SportDto>>> getAllSports() {
        return ResponseEntity.ok(ApiResponse.success(sportService.getAllSports()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get sport by slug", description = "Returns a sport by its slug identifier")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Sport retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Sport not found")
    })
    public ResponseEntity<ApiResponse<SportDto>> getSportBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(sportService.getSportBySlug(slug)));
    }
}
