const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');

// Load environment variables
dotenv.config();

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');

const sampleMovies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: ['English', 'Hindi'],
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    rating: 8.8,
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    director: 'Denis Villeneuve',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    status: 'now_showing',
    featured: true
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and geopolitical complexities of his creation.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    genre: ['Biography', 'Drama', 'History'],
    language: ['English'],
    duration: 180,
    releaseDate: new Date('2023-07-21'),
    rating: 8.9,
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    director: 'Christopher Nolan',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    status: 'now_showing',
    featured: true
  },
  {
    title: 'Interstellar: 10th Anniversary IMAX',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: ['English', 'Hindi'],
    duration: 169,
    releaseDate: new Date('2024-11-05'),
    rating: 8.7,
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    status: 'now_showing',
    featured: false
  },
  {
    title: 'Spider-Man: Beyond the Spider-Verse',
    description: 'Miles Morales journeys across the Multiverse to unite with Gwen Stacy and a team of Spider-People to confront a villain more powerful than anything they have ever encountered.',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    genre: ['Animation', 'Action', 'Adventure'],
    language: ['English', 'Hindi', 'Tamil'],
    duration: 140,
    releaseDate: new Date('2025-06-20'),
    rating: 9.0,
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
    director: 'Joaquim Dos Santos',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    status: 'coming_soon',
    featured: false
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home.',
    poster: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Drama', 'History'],
    language: ['English', 'Hindi'],
    duration: 148,
    releaseDate: new Date('2024-11-22'),
    rating: 8.1,
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
    director: 'Ridley Scott',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    status: 'now_showing',
    featured: false
  },
  {
    title: 'The Batman: Part II',
    description: 'The Dark Knight delves deeper into the corruption of Gotham City as an enigmatic syndicate begins targeting the city’s high echelon, forcing Bruce Wayne to confront his family legacy.',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Crime', 'Drama'],
    language: ['English'],
    duration: 175,
    releaseDate: new Date('2026-10-02'),
    rating: 8.5,
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Colin Farrell', 'Andy Serkis'],
    director: 'Matt Reeves',
    trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    status: 'coming_soon',
    featured: false
  },
  {
    title: 'Deadpool & Wolverine',
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy in an action-packed multiversal spectacle.',
    poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    language: ['English', 'Hindi', 'Telugu'],
    duration: 128,
    releaseDate: new Date('2024-07-26'),
    rating: 8.2,
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
    director: 'Shawn Levy',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    status: 'now_showing',
    featured: false
  },
  {
    title: 'Avatar: Fire and Ash',
    description: 'Jake Sully and Neytiri encounter the Ash People, an aggressive and fiery Na\'vi clan residing near volcanic regions of Pandora, testing their family cohesion to the absolute limit.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Adventure', 'Fantasy'],
    language: ['English', 'Hindi', 'Tamil', 'Telugu'],
    duration: 190,
    releaseDate: new Date('2025-12-19'),
    rating: 8.6,
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
    director: 'James Cameron',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    status: 'coming_soon',
    featured: false
  },
  {
    title: 'Inception (Remastered 4K)',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    language: ['English'],
    duration: 148,
    releaseDate: new Date('2024-09-15'),
    rating: 8.8,
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    director: 'Christopher Nolan',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    status: 'now_showing',
    featured: false
  },
  {
    title: 'Kalki 2898 AD',
    description: 'Set in a post-apocalyptic world in the year 2898 AD, a modern avatar of Vishnu descends to Earth to protect the world from evil forces in an epic futuristic mythological saga.',
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    genre: ['Action', 'Sci-Fi', 'Fantasy'],
    language: ['Telugu', 'Hindi', 'Tamil', 'English'],
    duration: 181,
    releaseDate: new Date('2024-06-27'),
    rating: 8.3,
    cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
    director: 'Nag Ashwin',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    status: 'now_showing',
    featured: false
  }
];

const sampleTheatres = [
  {
    name: 'iMovies PVR Icon – Phoenix Palladium',
    location: 'Lower Parel',
    city: 'Mumbai',
    address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
    phone: '+91 22 4333 9999',
    amenities: ['IMAX Laser with Commercial 12-Channel Sound', 'Dolby Atmos', 'Recliner Seats', 'Gourmet Food Hall', 'Valet Parking']
  },
  {
    name: 'iMovies INOX Megaplex – Inorbit Mall',
    location: 'Malad West',
    city: 'Mumbai',
    address: 'Link Road, Malad West, Mumbai, Maharashtra 400064',
    phone: '+91 22 2878 1234',
    amenities: ['Dolby Atmos', '4DX Motion Technology', 'Kiddles Play Area', 'Live Kitchen', 'Wheelchair Friendly']
  },
  {
    name: 'iMovies Cinepolis – Viviana Mall',
    location: 'Thane West',
    city: 'Mumbai',
    address: 'Eastern Express Hwy, Thane West, Maharashtra 400606',
    phone: '+91 22 6170 1200',
    amenities: ['VIP Lounge Service', 'RealD 3D', 'Dolby 7.1 Surround', 'Coffee Lounge', 'Express Check-In']
  }
];

const seedData = async (shouldExit = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Screen.deleteMany({});
    await Showtime.deleteMany({});
    await Booking.deleteMany({});
    await SeatLock.deleteMany({});

    console.log('[Seeder] Creating admin and demo users...');
    // Demo admin
    const adminUser = await User.create({
      name: 'iMovies Administrator',
      email: 'admin@imovies.com',
      phone: '+91 9876543210',
      password: 'Admin@123',
      role: 'admin'
    });

    // Demo regular user
    const regularUser = await User.create({
      name: 'Aditya Sharma',
      email: 'user@imovies.com',
      phone: '+91 9820012345',
      password: 'User@123',
      role: 'user'
    });

    console.log(`[Seeder] Created Admin: admin@imovies.com | User: user@imovies.com`);

    console.log('[Seeder] Inserting sample movies...');
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seeder] Inserted ${createdMovies.length} movies.`);

    console.log('[Seeder] Creating theatres and screens...');
    const createdTheatres = [];
    const createdScreens = [];

    for (let i = 0; i < sampleTheatres.length; i++) {
      const thData = sampleTheatres[i];
      const theatre = await Theatre.create(thData);
      createdTheatres.push(theatre);

      // Create 2 screens per theatre
      const screen1 = await Screen.create({
        theatreId: theatre._id,
        screenName: 'Screen 1 – IMAX 4K',
        screenType: 'IMAX 4K',
        totalSeats: 68,
        rowsConfig: [
          { rowLetter: 'A', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'B', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'C', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'D', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'E', tier: 'Platinum', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'F', tier: 'VIP', seatsCount: 8, aisleAfter: [2, 6] }
        ]
      });

      const screen2 = await Screen.create({
        theatreId: theatre._id,
        screenName: 'Screen 2 – Dolby Atmos',
        screenType: 'Dolby Atmos',
        totalSeats: 68,
        rowsConfig: [
          { rowLetter: 'A', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'B', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'C', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'D', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'E', tier: 'Platinum', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'F', tier: 'VIP', seatsCount: 8, aisleAfter: [2, 6] }
        ]
      });

      createdScreens.push(screen1, screen2);
    }
    console.log(`[Seeder] Inserted ${createdTheatres.length} theatres and ${createdScreens.length} screens.`);

    console.log('[Seeder] Creating showtimes for the next 4 days...');
    const nowShowingMovies = createdMovies.filter(m => m.status === 'now_showing');
    const today = new Date();
    const createdShowtimes = [];

    const times = ['10:15 AM', '01:45 PM', '05:30 PM', '09:15 PM'];

    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
      const showDateObj = new Date(today);
      showDateObj.setDate(today.getDate() + dayOffset);
      const dateStr = showDateObj.toISOString().split('T')[0];

      for (let sIdx = 0; sIdx < createdScreens.length; sIdx++) {
        const screen = createdScreens[sIdx];
        const theatre = createdTheatres.find(t => t._id.toString() === screen.theatreId.toString());

        // Assign a movie to this screen for this day
        const movie = nowShowingMovies[(sIdx + dayOffset) % nowShowingMovies.length];

        // Create 2 showtimes per screen per day
        for (let tIdx = 0; tIdx < 2; tIdx++) {
          const startTime = times[(sIdx + tIdx * 2) % times.length];
          const showtime = await Showtime.create({
            movieId: movie._id,
            theatreId: theatre._id,
            screenId: screen._id,
            showDate: dateStr,
            startTime,
            endTime: 'Approx 3 hrs',
            seatPricing: {
              Silver: 190,
              Gold: 280,
              Platinum: 390,
              VIP: 580
            }
          });
          createdShowtimes.push(showtime);
        }
      }
    }
    console.log(`[Seeder] Inserted ${createdShowtimes.length} showtimes.`);

    console.log('[Seeder] Generating sample bookings...');
    const QRCode = require('qrcode');
    const firstShowtime = createdShowtimes[0];

    const sampleSeats = [
      { seatNumber: 'C5', tier: 'Gold', price: 280 },
      { seatNumber: 'C6', tier: 'Gold', price: 280 }
    ];
    const subtotal = 560;
    const fee = 35;
    const tax = Math.round(fee * 0.18);
    const total = subtotal + fee + tax;

    const qrData = JSON.stringify({
      bookingId: 'IMV-DEMO01',
      showtimeId: firstShowtime._id,
      seats: ['C5', 'C6']
    });
    const qrCode = await QRCode.toDataURL(qrData);

    await Booking.create({
      bookingId: 'IMV-DEMO01',
      userId: regularUser._id,
      showtimeId: firstShowtime._id,
      selectedSeats: sampleSeats,
      ticketSubtotal: subtotal,
      convenienceFee: fee,
      taxAmount: tax,
      totalAmount: total,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      paymentReference: 'PAY-DEMO-998811',
      qrCode,
      bookingDate: new Date()
    });

    console.log('[Seeder] Database successfully seeded with rich cinematic content!');
    if (shouldExit) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seeder] Seeding error:', err);
    if (shouldExit) {
      await disconnectDB();
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
