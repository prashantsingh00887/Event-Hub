const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE E2E VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details) => {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ->`, details || '');
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.status === 'online', '1. System Health Check', health);

    // 2. User Registration
    const testEmail = `tester_${Date.now()}@example.com`;
    const regRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Test Customer',
        email: testEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '+91 9988776655'
      }
    );
    assert(regRes.status === 201 && regRes.data.success && regRes.data.token, '2. User Registration Success', regRes.data);
    const userToken = regRes.data?.token;

    // 3. Duplicate Email Prevention
    const dupRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Duplicate Guy',
        email: testEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '+91 9988776655'
      }
    );
    assert(
      dupRes.status === 409 &&
      dupRes.data.message === 'An account with this email already exists.',
      '3. Duplicate Email Prevention & Exact Message',
      dupRes.data
    );

    // 4. Invalid Password Login
    const invalidLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: testEmail, password: 'WrongPassword' }
    );
    assert(invalidLogin.status === 401, '4. Invalid Credentials Rejection', invalidLogin.data);

    // 5. User Login Success
    const userLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: testEmail, password: 'Password@123' }
    );
    assert(userLogin.status === 200 && userLogin.data.success, '5. User Login Authentication', userLogin.data);

    // 6. Admin Login with Default Credentials
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/admin/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'admin@eventhub.com', password: 'Admin@12345' }
    );
    assert(
      adminLogin.status === 200 && adminLogin.data.user?.role === 'admin',
      '6. Admin Authentication & Role Enforcement',
      adminLogin.data
    );
    const adminToken = adminLogin.data?.token;

    // 7. Non-admin attempting Admin Login
    const fakeAdmin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/admin/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: testEmail, password: 'Password@123' }
    );
    assert(fakeAdmin.status === 403, '7. Unauthorized User Blocked from Admin Portal', fakeAdmin.data);

    // 8. Admin Dashboard Access Control
    const userAccessAdmin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(userAccessAdmin.status === 403, '8. Normal User Blocked from Admin APIs', userAccessAdmin.data);

    const adminAccessDashboard = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      adminAccessDashboard.status === 200 &&
      adminAccessDashboard.data.data?.stats !== undefined,
      '9. Admin Dashboard Metrics Data Retrieval',
      adminAccessDashboard.data
    );

    // 10. Admin Event Creation
    const newEventRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/events',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        }
      },
      {
        title: `Test Cyber Rock Night ${Date.now()}`,
        description: 'An exclusive test rock concert performance.',
        category: 'Concert',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        venue: 'Grand Arena Hall',
        address: 'Sector 5 MG Road',
        city: 'Bengaluru',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        startTime: '19:00',
        endTime: '23:00',
        ticketPrice: 999,
        totalSeats: 50,
        status: 'active'
      }
    );
    assert(
      newEventRes.status === 201 &&
      newEventRes.data.data?.availableSeats === 50,
      '10. Admin Event Creation & Auto-Seat Initialization',
      newEventRes.data
    );
    const createdEventId = newEventRes.data?.data?._id;

    // 11. Event Search & Filters
    const searchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/events?category=Concert&city=Bengaluru',
      method: 'GET'
    });
    assert(searchRes.status === 200 && searchRes.data.data?.length > 0, '11. Public Event Filtering & Search', searchRes.data);

    // 12. Booking Creation
    const bookRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        }
      },
      {
        eventId: createdEventId,
        tickets: 2
      }
    );
    assert(
      bookRes.status === 201 &&
      bookRes.data.data?.bookingStatus === 'Pending' &&
      bookRes.data.data?.bookingId.startsWith('EH-'),
      '12. User Booking Creation & Unique Booking ID Generation',
      bookRes.data
    );
    const booking = bookRes.data?.data;

    // 13. Payment Order Creation
    const orderRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/create-order',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        }
      },
      {
        bookingId: booking._id
      }
    );
    assert(orderRes.status === 200 && orderRes.data.data?.orderId, '13. Razorpay Order Generation', orderRes.data);
    const orderData = orderRes.data?.data;

    // 14. Payment Cryptographic Verification & Seat Decrement
    const verifyRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/verify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        }
      },
      {
        bookingId: booking._id,
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'test_sig',
        isSimulated: true
      }
    );
    assert(
      verifyRes.status === 200 &&
      verifyRes.data.data?.booking?.bookingStatus === 'Confirmed' &&
      verifyRes.data.data?.booking?.paymentStatus === 'Paid',
      '14. Payment Verification & Booking Confirmation',
      verifyRes.data
    );

    // Verify seats were decremented
    const eventAfterBooking = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/events/${createdEventId}`,
      method: 'GET'
    });
    assert(
      eventAfterBooking.data.data?.availableSeats === 48,
      '15. Atomic Seat Decrement Verification (50 -> 48)',
      eventAfterBooking.data
    );

    // 15. User My Bookings
    const myBookings = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/bookings/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(
      myBookings.status === 200 &&
      myBookings.data.data?.some((b) => b._id === booking._id),
      '16. User My Bookings History List',
      myBookings.data
    );

    // 16. Booking Cancellation & Seat Restoration
    const cancelRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/bookings/${booking._id}/cancel`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    assert(
      cancelRes.status === 200 &&
      cancelRes.data.data?.bookingStatus === 'Cancelled',
      '17. User Booking Cancellation & Status Update',
      cancelRes.data
    );

    // Verify seats were restored back to 50
    const eventAfterCancel = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/events/${createdEventId}`,
      method: 'GET'
    });
    assert(
      eventAfterCancel.data.data?.availableSeats === 50,
      '18. Seat Restoration Upon Cancellation (48 -> 50)',
      eventAfterCancel.data
    );

    console.log('\n======================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runAllTests();
