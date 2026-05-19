package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.dto.request.RoomRequest;
import com.example.ThangLongUniversityWeb.dto.response.RoomResponse;
import com.example.ThangLongUniversityWeb.entity.Room;
import com.example.ThangLongUniversityWeb.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Tên phòng không được để trống");
        }
        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new RuntimeException("Sức chứa phòng phải lớn hơn 0");
        }
        roomRepository.findByName(request.getName().trim()).ifPresent(existing -> {
            throw new RuntimeException("Phòng " + request.getName() + " đã tồn tại");
        });

        Room room = new Room();
        room.setName(request.getName().trim());
        room.setCapacity(request.getCapacity());

        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng học!"));

        if (request.getName() != null && !request.getName().isBlank()) {
            roomRepository.findByName(request.getName().trim()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Phòng " + request.getName() + " đã tồn tại");
                }
            });
            room.setName(request.getName().trim());
        }

        if (request.getCapacity() != null) {
            if (request.getCapacity() <= 0) {
                throw new RuntimeException("Sức chứa phòng phải lớn hơn 0");
            }
            room.setCapacity(request.getCapacity());
        }

        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    private RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .capacity(room.getCapacity())
                .build();
    }
}
