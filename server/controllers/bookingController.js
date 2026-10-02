const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Payment = require('../models/Payment');

// Generate unique human-readable booking ID
const generateBookingId = () => {
  const prefix = 'EH';
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomSuffix}`;
};

// @desc    Initiate / Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { eventId, tickets } = req.body;

    if (!eventId || !tickets) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and number of tickets are required.'
      });
    }

    const ticketCount = parseInt(tickets, 10);
    if (isNaN(ticketCount) || ticketCount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Number of tickets must be at least 1.'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot book tickets for this event. Event status is ${event.status}.`
      });
    }

    // Check date
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book past events.'
      });
    }

    // Check available seats
    if (event.availableSeats < ticketCount) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seat${event.availableSeats === 1 ? '' : 's'} available. You requested ${ticketCount}.`
      });
    }

    const totalAmount = event.ticketPrice * ticketCount;
    const bookingId = generateBookingId();

    // If event is free ($0), auto-confirm immediately
    if (totalAmount === 0) {
      const booking = await Booking.create({
        bookingId,
        user: req.user._id,
        event: event._id,
        tickets: ticketCount,
        ticketPrice: 0,
        totalAmount: 0,
        bookingStatus: 'Confirmed',
        paymentStatus: 'Paid'
      });

      // Reduce available seats
      await Event.findByIdAndUpdate(event._id, {
        $inc: { availableSeats: -ticketCount }
      });

      await booking.populate('event');
      await booking.populate('user', 'name email phone');

      return res.status(201).json({
        success: true,
        message: 'Free event booked successfully!',
        data: booking
      });
    }

    // For paid events, create pending booking
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      event: event._id,
      tickets: ticketCount,
      ticketPrice: event.ticketPrice,
      totalAmount,
      bookingStatus: 'Pending',
      paymentStatus: 'Pending'
    });

    await booking.populate('event');
    await booking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking initiated. Please complete payment to confirm.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Authorization check: User can only see their own booking unless admin
    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Authorization check
    if (
      req.user.role !== 'admin' &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.'
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.'
      });
    }

    // Check cancellation eligibility based on event date
    const eventDate = new Date(booking.event.date);
    const now = new Date();
    if (eventDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking for an event that has already occurred or started.'
      });
    }

    // Restore available seats if it was confirmed
    if (booking.bookingStatus === 'Confirmed') {
      await Event.findByIdAndUpdate(booking.event._id, {
        $inc: { availableSeats: booking.tickets }
      });
    }

    booking.bookingStatus = 'Cancelled';
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Refunded';
    }
    await booking.save();

    // Update payment record if exists
    await Payment.updateMany(
      { booking: booking._id },
      { status: 'Refunded' }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been restored.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};
