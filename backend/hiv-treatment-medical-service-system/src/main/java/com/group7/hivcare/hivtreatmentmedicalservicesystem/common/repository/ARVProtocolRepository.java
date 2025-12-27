package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocol;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TargetGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ARVProtocolRepository extends JpaRepository<ARVProtocol, Integer> {
    List<ARVProtocol> findByActiveTrue();

    @Query("SELECT p FROM ARVProtocol p WHERE p.targetGroup = :group")
    List<ARVProtocol> getAllByTargetGroup(TargetGroup group);
}
