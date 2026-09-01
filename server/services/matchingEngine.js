/**
 * Smart Worker Matching Engine
 * SIH26089 - Cooperative Gig Services Platform
 * 
 * Transparent scoring factors:
 * - Skill Match: 35%
 * - Distance: 20%
 * - Availability: 15%
 * - Rating: 10%
 * - Experience: 10%
 * - Workload: 10%
 */

// Haversine Distance Formula in Kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0; // fallback approx
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Score and rank candidate workers for a customer request
 * @param {Array} workers - List of candidate workers with skills and profile
 * @param {Object} request - Request details { customerLat, customerLng, categoryId, serviceId, isEmergency, customerId, previousWorkerIds }
 * @returns {Array} Ranked workers with score and human-readable match factors
 */
function rankWorkersForJob(workers, request) {
  const { customerLat, customerLng, categoryId, isEmergency, previousWorkerIds = [] } = request;

  const scoredWorkers = workers.map((worker) => {
    const factors = [];
    let score = 0;

    // 1. Skill Match (Max 35 points)
    let skillScore = 0;
    const hasCategorySkill = worker.skills && worker.skills.some((s) => s.category_id === categoryId);
    const isSkillVerified = worker.is_skill_verified === 1;

    if (hasCategorySkill) {
      skillScore = 30;
      if (isSkillVerified) {
        skillScore += 5;
        factors.push('Cooperative-verified skill expertise');
      } else {
        factors.push('Exact skill match');
      }
    } else {
      skillScore = 15; // secondary match
      factors.push('Allied category proficiency');
    }
    score += skillScore;

    // 2. Distance Calculation (Max 20 points)
    const distanceKm = calculateDistance(
      customerLat || 11.0168,
      customerLng || 76.9558,
      worker.current_lat || 11.0168,
      worker.current_lng || 76.9558
    );

    let distanceScore = 0;
    const maxRadius = worker.service_radius_km || 10.0;

    if (distanceKm <= 2.0) {
      distanceScore = 20;
      factors.push(`${distanceKm} km away (Est. 5-10 mins travel)`);
    } else if (distanceKm <= 5.0) {
      distanceScore = 16;
      factors.push(`${distanceKm} km away (Est. 15 mins travel)`);
    } else if (distanceKm <= 10.0) {
      distanceScore = 11;
      factors.push(`${distanceKm} km away (Within service radius)`);
    } else if (distanceKm <= maxRadius) {
      distanceScore = 7;
      factors.push(`${distanceKm} km away (Service boundary)`);
    } else {
      distanceScore = 2;
      factors.push(`${distanceKm} km away (Outlying response)`);
    }
    score += distanceScore;

    // 3. Availability (Max 15 points)
    let availabilityScore = 0;
    if (worker.is_available === 1 && worker.active_workload < 3) {
      availabilityScore = 15;
      factors.push('Available immediately for dispatch');
    } else if (worker.is_available === 1) {
      availabilityScore = 9;
      factors.push('Available for scheduling');
    } else {
      availabilityScore = 0;
      factors.push('Currently on active engagement');
    }
    score += availabilityScore;

    // 4. Rating & Reputation (Max 10 points)
    const rating = worker.rating || 4.5;
    const ratingScore = Math.min(10, Math.round((rating / 5.0) * 10));
    score += ratingScore;
    if (rating >= 4.8) {
      factors.push(`⭐ ${rating.toFixed(1)} community rating (${worker.total_jobs || 0} jobs completed)`);
    } else {
      factors.push(`⭐ ${rating.toFixed(1)} rating (${worker.review_count || 0} reviews)`);
    }

    // 5. Experience & Cooperative Standing (Max 10 points)
    let expScore = 0;
    const exp = worker.experience_years || 2;
    if (exp >= 7) {
      expScore = 10;
      factors.push(`${exp}+ years seasoned cooperative craftsman`);
    } else if (exp >= 4) {
      expScore = 8;
      factors.push(`${exp} years trade experience`);
    } else {
      expScore = 5;
      factors.push(`${exp} years experience`);
    }
    score += expScore;

    // 6. Current Workload Balance (Max 10 points)
    const workload = worker.active_workload || 0;
    let workloadScore = 0;
    if (workload === 0) {
      workloadScore = 10;
      factors.push('Zero active queue — 100% focused attention');
    } else if (workload === 1) {
      workloadScore = 7;
      factors.push('Low workload (1 ongoing task)');
    } else {
      workloadScore = 3;
      factors.push(`Moderate workload (${workload} tasks in progress)`);
    }
    score += workloadScore;

    // Emergency adjustments
    if (isEmergency) {
      if (worker.is_emergency_ready === 1) {
        score += 15; // Bonus for emergency ready
        factors.unshift('⚡ Certified Rapid-Response Emergency Worker');
      } else {
        score -= 20; // Penalty if not emergency certified
      }
      if (distanceKm <= 3.0) {
        score += 10;
      }
    }

    // Previous Customer Relationship Bonus
    if (previousWorkerIds.includes(worker.id)) {
      score += 8;
      factors.unshift('🔁 Previously hired by you with high rating');
    }

    // Cooperative verification badge trust factor
    if (worker.is_membership_verified === 1) {
      factors.push(`🛡️ Verified Member of ${worker.cooperative_name || 'Labour Cooperative'}`);
    }

    const normalizedScore = Math.min(100, Math.max(10, Math.round(score)));

    return {
      ...worker,
      match_score: normalizedScore,
      match_factors: factors,
      distance_km: distanceKm,
      estimated_travel_mins: Math.max(5, Math.round(distanceKm * 3)),
    };
  });

  // Sort by highest match score first, then lowest distance
  return scoredWorkers.sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score;
    }
    return a.distance_km - b.distance_km;
  });
}

module.exports = {
  calculateDistance,
  rankWorkersForJob,
};
