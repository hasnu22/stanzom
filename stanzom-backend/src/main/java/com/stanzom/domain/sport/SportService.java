package com.stanzom.domain.sport;

import com.stanzom.domain.sport.dto.SportDto;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SportService {

    private final SportRepository sportRepository;
    private final SportMapper sportMapper;

    @Cacheable("sports")
    public List<SportDto> getAllSports() {
        return sportMapper.toDtoList(sportRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    public SportDto getSportBySlug(String slug) {
        Sport sport = sportRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Sport", "slug", slug));
        return sportMapper.toDto(sport);
    }
}
