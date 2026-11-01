let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client joins a specific showtime room to receive real-time seat lock and booking events
    socket.on('join_showtime', (showtimeId) => {
      if (showtimeId) {
        socket.join(`showtime_${showtimeId}`);
      }
    });

    socket.on('leave_showtime', (showtimeId) => {
      if (showtimeId) {
        socket.leave(`showtime_${showtimeId}`);
      }
    });

    socket.on('disconnect', () => {
      // Handled cleanly
    });
  });

  return io;
};

const getIO = () => ioInstance;

const broadcastSeatLock = (showtimeId, { seatNumbers, userId, expiresAt }) => {
  if (ioInstance) {
    ioInstance.to(`showtime_${showtimeId}`).emit('seats_locked', {
      showtimeId,
      seatNumbers,
      userId,
      expiresAt
    });
  }
};

const broadcastSeatUnlock = (showtimeId, { seatNumbers }) => {
  if (ioInstance) {
    ioInstance.to(`showtime_${showtimeId}`).emit('seats_unlocked', {
      showtimeId,
      seatNumbers
    });
  }
};

const broadcastSeatsBooked = (showtimeId, { seatNumbers }) => {
  if (ioInstance) {
    ioInstance.to(`showtime_${showtimeId}`).emit('seats_booked', {
      showtimeId,
      seatNumbers
    });
  }
};

module.exports = {
  initSocket,
  getIO,
  broadcastSeatLock,
  broadcastSeatUnlock,
  broadcastSeatsBooked
};
