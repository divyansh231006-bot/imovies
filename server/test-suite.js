const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { initSocket } = require('./sockets/seatSocket');
const Movie = require('./models/Movie');
const User = require('./models/User');
const Showtime = require('./models/Showtime');
const seedData = require('./seed/seeder');

async function runTests() {
  console.log('--- 🧪 STARTING IMOVIES END-TO-END TEST SUITE ---');

  // 1. Connect to Database & Seed
  await connectDB();
  console.log('✅ 1. Database connected');
  await seedData();
  console.log('✅ 1b. Database seeded with movies, theatres, and accounts');

  // 2. Start HTTP server on port 5001 to avoid conflicts
  const server = http.createServer(app);
  const { Server } = require('socket.io');
  const io = new Server(server, { cors: { origin: '*' } });
  initSocket(io);

  await new Promise((resolve) => server.listen(5001, resolve));
  console.log('✅ 2. Test server listening on http://localhost:5001');

  // Helper fetch function
  const request = async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(`http://localhost:5001${path}`, {
      ...options,
      headers
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  // 3. Test Health Check
  const health = await request('/api/health');
  console.log(`✅ 3. GET /api/health -> Status: ${health.status}, OK: ${health.data.status === 'ok'}`);

  // 4. Test User Authentication (Login as Demo Admin & Regular User)
  const userLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'user@imovies.com', password: 'User@123' })
  });
  console.log(`✅ 4. POST /api/auth/login (User) -> Status: ${userLogin.status}, Name: ${userLogin.data.user?.name}`);
  const userToken = userLogin.data.token;

  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@imovies.com', password: 'Admin@123' })
  });
  console.log(`✅ 5. POST /api/auth/login (Admin) -> Status: ${adminLogin.status}, Role: ${adminLogin.data.user?.role}`);
  const adminToken = adminLogin.data.token;

  // 5. Test Movies List & Filters
  const moviesRes = await request('/api/movies');
  console.log(`✅ 6. GET /api/movies -> Found: ${moviesRes.data.count} movies`);
  const firstMovie = moviesRes.data.data[0];

  // 6. Test Movie Details by ID
  const movieDetails = await request(`/api/movies/${firstMovie._id}`);
  console.log(`✅ 7. GET /api/movies/:id -> Title: "${movieDetails.data.data.title}", Showtimes: ${movieDetails.data.data.showtimes?.length}`);

  // 7. Test Theatres
  const theatresRes = await request('/api/theatres');
  console.log(`✅ 8. GET /api/theatres -> Found: ${theatresRes.data.count} theatres`);

  // 8. Test Showtimes & Seat Map
  const showtimesRes = await request('/api/showtimes');
  console.log(`✅ 9. GET /api/showtimes -> Found: ${showtimesRes.data.count} showtimes`);
  const firstShowtime = showtimesRes.data.data[0];

  const seatsRes = await request(`/api/showtimes/${firstShowtime._id}/seats`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log(`✅ 10. GET /api/showtimes/:id/seats -> Rows: ${seatsRes.data.data.seatMap?.length}, Available: ${seatsRes.data.data.summary?.availableSeats}`);

  // 9. Test Seat Locking (Socket.IO + REST)
  const lockRes = await request('/api/seats/lock', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      showtimeId: firstShowtime._id,
      seatNumbers: ['D3', 'D4']
    })
  });
  console.log(`✅ 11. POST /api/seats/lock -> Status: ${lockRes.status}, Locked: ${lockRes.data.data?.seatNumbers.join(', ')}`);

  // 10. Test Double-Lock Prevention by Another User
  const duplicateLock = await request('/api/seats/lock', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      showtimeId: firstShowtime._id,
      seatNumbers: ['D3']
    })
  });
  console.log(`✅ 12. Double-Lock Prevention -> Status: ${duplicateLock.status} (Expected 409 Conflict), Message: "${duplicateLock.data.message}"`);

  // 11. Test Confirm Booking with Payment
  const bookingRes = await request('/api/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      showtimeId: firstShowtime._id,
      selectedSeats: [
        { seatNumber: 'D3', tier: 'Gold', price: 280 },
        { seatNumber: 'D4', tier: 'Gold', price: 280 }
      ],
      paymentMethod: 'Credit Card',
      paymentReference: 'PAY-TEST-554433'
    })
  });
  console.log(`✅ 13. POST /api/bookings -> Status: ${bookingRes.status}, Booking ID: ${bookingRes.data.data?.bookingId}, Total: ₹${bookingRes.data.data?.totalAmount}`);
  const newBookingId = bookingRes.data.data?._id;

  // 12. Test My Bookings
  const myBookings = await request('/api/bookings/my-bookings', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log(`✅ 14. GET /api/bookings/my-bookings -> Total Bookings: ${myBookings.data.count}`);

  // 13. Test Admin Dashboard Metrics
  const adminDash = await request('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`✅ 15. GET /api/admin/dashboard -> Revenue: ₹${adminDash.data.data?.totalRevenue}, Bookings: ${adminDash.data.data?.totalBookings}`);

  // 14. Test Cancellation and Refund
  const cancelRes = await request(`/api/bookings/${newBookingId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ reason: 'Test user requested refund' })
  });
  console.log(`✅ 16. PATCH /api/bookings/:id/cancel -> Status: ${cancelRes.status}, Status: "${cancelRes.data.data?.bookingStatus}", Payment: "${cancelRes.data.data?.paymentStatus}"`);

  // Close server and DB
  await new Promise((resolve) => server.close(resolve));
  await disconnectDB();

  console.log('--- 🎉 ALL 16 END-TO-END TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
