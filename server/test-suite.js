/**
 * Automated End-to-End System Test Suite
 * SIH26089: Cooperative Gig Services Platform
 */

const http = require('http');

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
    };

    const req = http.request(
      {
        host: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resBody });
          }
        });
      }
    );

    req.on('error', (e) => reject(e));
    if (body) req.write(dataString);
    req.end();
  });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING SIH26089 END-TO-END VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Health Check
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.data.status === 'HEALTHY', 'API Health Check returns 200 OK');

    // 2. Demo Persona Logins
    const priyaAuth = await makeRequest('/api/auth/demo-login/priya');
    assert(priyaAuth.status === 200 && priyaAuth.data.user.email === 'priya@example.com', 'Customer Persona Login: Priya Raman');

    const raviAuth = await makeRequest('/api/auth/demo-login/ravi');
    assert(raviAuth.status === 200 && raviAuth.data.user.email === 'ravi@example.com' && raviAuth.data.worker !== null, 'Worker Persona Login: Ravi Kumar with Worker Profile');

    const meenaAuth = await makeRequest('/api/auth/demo-login/meena');
    assert(meenaAuth.status === 200 && meenaAuth.data.user.role === 'cooperative_admin', 'Coop Admin Persona Login: Meena Sundaram');

    const arumugamAuth = await makeRequest('/api/auth/demo-login/arumugam');
    assert(arumugamAuth.status === 200 && arumugamAuth.data.user.role === 'federation_admin', 'Federation Admin Persona Login: Arumugam P.');

    // 3. Service Categories
    const categoriesRes = await makeRequest('/api/services/categories');
    assert(categoriesRes.status === 200 && categoriesRes.data.categories.length >= 15, `Fetched ${categoriesRes.data.categories.length} Service Categories with sub-services`);

    // 4. Smart Worker Matching Engine
    const matchRes = await makeRequest(
      '/api/bookings/match-workers',
      'POST',
      {
        categoryId: 'cat-plumbing',
        serviceId: 'srv-plumb-2',
        isEmergency: true,
        customerLat: 11.0264,
        customerLng: 76.9984,
      },
      priyaAuth.data.token
    );
    assert(
      matchRes.status === 200 &&
      matchRes.data.workers.length > 0 &&
      matchRes.data.workers[0].match_score >= 80 &&
      matchRes.data.workers[0].match_factors.length > 0,
      `Smart Matching Engine Ranked ${matchRes.data.workers.length} Workers with Match Score ${matchRes.data.workers[0]?.match_score}% and Transparent Reasons`
    );

    const topWorker = matchRes.data.workers[0];

    // 5. Worker Detailed Trust Profile
    const trustRes = await makeRequest(`/api/workers/${topWorker.id}/trust-profile`);
    assert(
      trustRes.status === 200 &&
      trustRes.data.trustVerification.isMembershipVerified === true &&
      trustRes.data.trustVerification.isSkillVerified === true &&
      trustRes.data.welfareRecords.length > 0,
      `Worker Trust Profile Verified (Cooperative Reg: ${trustRes.data.trustVerification.registrationNo}, ${trustRes.data.welfareRecords.length} Active Welfare Schemes)`
    );

    // 6. Create Service Booking
    const bookingRes = await makeRequest(
      '/api/bookings/create',
      'POST',
      {
        workerId: topWorker.id,
        serviceId: 'srv-plumb-2',
        categoryId: 'cat-plumbing',
        cooperativeId: topWorker.cooperative_id,
        isEmergency: true,
        problemTitle: 'Emergency Burst Pipe Leak in Master Bathroom',
        description: 'Water leaking heavily. Instant shutoff and replacement required.',
        customerAddress: 'Flat 304, Green Palms Enclave, Peelamedu, Coimbatore',
        customerPhone: '+91 98421 77301',
        customerLat: 11.0264,
        customerLng: 76.9984,
        matchScore: topWorker.match_score,
        matchFactors: topWorker.match_factors,
      },
      priyaAuth.data.token
    );
    assert(bookingRes.status === 201 && bookingRes.data.booking.booking_code.startsWith('SG-EMG-'), `Created Booking #${bookingRes.data.booking?.booking_code} (Worker Payout: ₹${bookingRes.data.booking?.worker_payout}, Coop Fee: ₹${bookingRes.data.booking?.cooperative_fee})`);

    const newBookingId = bookingRes.data.booking.id;

    // 7. Worker State Machine Transitions: ACCEPTED -> ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
    const acceptRes = await makeRequest(`/api/bookings/${newBookingId}/status`, 'PATCH', { status: 'ACCEPTED' }, raviAuth.data.token);
    assert(acceptRes.status === 200 && acceptRes.data.booking.status === 'ACCEPTED', 'Booking Transition: ACCEPTED');

    const onTheWayRes = await makeRequest(`/api/bookings/${newBookingId}/status`, 'PATCH', { status: 'ON_THE_WAY' }, raviAuth.data.token);
    assert(onTheWayRes.status === 200 && onTheWayRes.data.booking.status === 'ON_THE_WAY', 'Booking Transition: ON_THE_WAY');

    const arrivedRes = await makeRequest(`/api/bookings/${newBookingId}/status`, 'PATCH', { status: 'ARRIVED' }, raviAuth.data.token);
    assert(arrivedRes.status === 200 && arrivedRes.data.booking.status === 'ARRIVED', 'Booking Transition: ARRIVED');

    const inProgressRes = await makeRequest(`/api/bookings/${newBookingId}/status`, 'PATCH', { status: 'IN_PROGRESS' }, raviAuth.data.token);
    assert(inProgressRes.status === 200 && inProgressRes.data.booking.status === 'IN_PROGRESS', 'Booking Transition: IN_PROGRESS');

    const completedRes = await makeRequest(`/api/bookings/${newBookingId}/status`, 'PATCH', { status: 'COMPLETED' }, raviAuth.data.token);
    assert(completedRes.status === 200 && completedRes.data.booking.status === 'COMPLETED', 'Booking Transition: COMPLETED');

    // 8. Payment Settlement & Digital Invoice Generation
    const paymentRes = await makeRequest(
      '/api/payments/process',
      'POST',
      {
        bookingId: newBookingId,
        paymentMethod: 'UPI_SANDBOX',
      },
      priyaAuth.data.token
    );
    assert(
      paymentRes.status === 200 &&
      paymentRes.data.payment.status === 'COMPLETED' &&
      paymentRes.data.invoice.invoice_no.startsWith('INV-2026-'),
      `Digital Invoice Generated: #${paymentRes.data.invoice?.invoice_no} (Worker 88% Direct Payout: ₹${paymentRes.data.payment?.worker_payout})`
    );

    // 9. Customer Star Review & Rating Submission
    const reviewRes = await makeRequest(
      '/api/reviews/submit',
      'POST',
      {
        bookingId: newBookingId,
        rating: 5,
        comment: 'Outstanding emergency service! Master plumber arrived in 12 mins with proper tools.',
        punctualityRating: 5,
        qualityRating: 5,
        behaviorRating: 5,
        markAsFavorite: true,
      },
      priyaAuth.data.token
    );
    assert(reviewRes.status === 201 && reviewRes.data.review.rating === 5, 'Customer Review & 5-Star Rating Submitted Successfully');

    // 10. Cooperative Admin Dashboard Analytics
    const coopStats = await makeRequest('/api/cooperatives/coop-cbe-1/stats');
    assert(
      coopStats.status === 200 &&
      coopStats.data.kpis.totalWorkers > 0 &&
      coopStats.data.charts.jobsByCategory.length > 0,
      `Cooperative Admin Dashboard: ${coopStats.data.kpis.totalWorkers} Members, ₹${coopStats.data.kpis.grossVolume} Gross Volume, ${coopStats.data.charts.jobsByCategory.length} Trade Categories`
    );

    // 11. Cooperative Admin Worker Verification
    const verifyRes = await makeRequest(
      '/api/cooperatives/verify-worker',
      'POST',
      {
        workerId: 'wrk-gen-5',
        isIdentityVerified: true,
        isMembershipVerified: true,
        isSkillVerified: true,
        isCertVerified: true,
        isEmergencyReady: true,
      },
      meenaAuth.data.token
    );
    assert(verifyRes.status === 200 && verifyRes.data.worker.is_skill_verified === 1, 'Cooperative Admin Verified Worker Credentials & Emergency Readiness');

    // 12. AI Demand Forecasting
    const forecastRes = await makeRequest('/api/forecast/demand');
    assert(
      forecastRes.status === 200 &&
      forecastRes.data.forecasts.length > 0 &&
      forecastRes.data.summary.overallGrowthRatePct > 0,
      `AI Demand Forecasting: ${forecastRes.data.forecasts.length} Community Forecasts (Fastest Growing: ${forecastRes.data.summary.fastestGrowingService})`
    );

    // 13. AI Workforce Allocation & Federation Rebalancing Approval
    const recsRes = await makeRequest('/api/federation/recommendations', 'GET', null, arumugamAuth.data.token);
    assert(recsRes.status === 200 && recsRes.data.recommendations.length > 0, `Federation AI Workforce Recommendations Found: ${recsRes.data.recommendations.length}`);

    const targetRec = recsRes.data.recommendations[0];
    const recActionRes = await makeRequest(
      `/api/federation/recommendations/${targetRec.id}/action`,
      'POST',
      { action: 'APPROVED' },
      arumugamAuth.data.token
    );
    assert(recActionRes.status === 200 && recActionRes.data.result.status === 'APPROVED', `Federation Admin Authorized Workforce Rebalancing: +${targetRec.recommended_deployment_count} Workers to ${targetRec.target_community_name}`);

    // 14. Customer Complaint & Dispute Resolution
    const complaintRes = await makeRequest(
      '/api/complaints/create',
      'POST',
      {
        bookingId: newBookingId,
        title: 'Minor billing enquiry regarding additional fitting valve',
        description: 'Customer requested invoice clarification for extra brass valve.',
        category: 'OVERCHARGING',
        priority: 'LOW',
      },
      priyaAuth.data.token
    );
    assert(complaintRes.status === 201 && complaintRes.data.complaint.ticket_no.startsWith('CMP-2026-'), `Customer Filed Complaint Ticket: #${complaintRes.data.complaint?.ticket_no}`);

    const resolveRes = await makeRequest(
      `/api/complaints/${complaintRes.data.complaint.id}/status`,
      'PATCH',
      {
        status: 'RESOLVED',
        resolution_notes: 'Cooperative mediator reviewed valve price. Standard rate confirmed and explained to customer.',
      },
      meenaAuth.data.token
    );
    assert(resolveRes.status === 200 && resolveRes.data.complaint.status === 'RESOLVED', 'Cooperative Mediator Resolved Dispute Ticket with Resolution Notes');

    // 15. Geo Spatial Nearby Workers with Privacy Jitter
    const geoRes = await makeRequest('/api/geo/nearby-workers?lat=11.0168&lng=76.9558&radius_km=15');
    assert(geoRes.status === 200 && geoRes.data.workers.length > 0, `Geo-Spatial Service: ${geoRes.data.workers.length} Nearby Cooperative Workers Discovered`);

    console.log('\n================================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}% SUCCESS)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Test suite runtime failure:', err);
  }
}

runTestSuite();
