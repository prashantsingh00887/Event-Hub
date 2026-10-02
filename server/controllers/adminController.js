const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get Admin Dashboard Stats and Metrics
// @route   GET /api/admin/dashboard
// @access  Private / Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalEvents,
      totalUsers,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      paidBookingsAgg,
      categoryStats,
      recentBookings
    ] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'Confirmed' }),
      Booking.countDocuments({ bookingStatus: 'Pending' }),
      Booking.countDocuments({ bookingStatus: 'Cancelled' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Event.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Booking.find()
        .populate('user', 'name email')
        .populate('event', 'title date venue ticketPrice')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    const totalRevenue = paidBookingsAgg.length > 0 ? paidBookingsAgg[0].totalRevenue : 0;

    // Monthly revenue aggregation for chart
    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const formattedMonthlyRevenue = monthlyRevenue.map((item) => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
        bookings: item.bookingsCount
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEvents,
          totalUsers,
          totalBookings,
          confirmedBookings,
          pendingBookings,
          cancelledBookings,
          totalRevenue
        },
        categoryStats: categoryStats.map((c) => ({
          category: c._id,
          count: c.count
        })),
        monthlyRevenue: formattedMonthlyRevenue,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private / Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.isActive = status === 'active';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active / Disabled)
// @route   PUT /api/admin/users/:id/status
// @access  Private / Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings across the platform
// @route   GET /api/admin/bookings
// @access  Private / Admin
const getAllBookings = async (req, res, next) => {
  try {
    const {
      search,
      bookingStatus,
      paymentStatus,
      eventId,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (bookingStatus && bookingStatus !== 'All') {
      query.bookingStatus = bookingStatus;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (eventId && eventId !== 'All') {
      query.event = eventId;
    }

    if (search && search.trim() !== '') {
      query.bookingId = new RegExp(search.trim(), 'i');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalBookings = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('event', 'title date venue ticketPrice city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      totalBookings,
      totalPages: Math.ceil(totalBookings / limitNum),
      currentPage: pageNum,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status by admin
// @route   PUT /api/admin/bookings/:id/status
// @access  Private / Admin
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    const booking = await Booking.findById(id).populate('event');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const oldStatus = booking.bookingStatus;

    if (bookingStatus) {
      // If changing to Cancelled from Confirmed, restore seats
      if (oldStatus === 'Confirmed' && bookingStatus === 'Cancelled') {
        await Event.findByIdAndUpdate(booking.event._id, {
          $inc: { availableSeats: booking.tickets }
        });
      }
      // If changing to Confirmed from Cancelled, re-decrement seats
      if (oldStatus === 'Cancelled' && bookingStatus === 'Confirmed') {
        if (booking.event.availableSeats < booking.tickets) {
          return res.status(400).json({
            success: false,
            message: 'Cannot confirm booking: Insufficient seats available.'
          });
        }
        await Event.findByIdAndUpdate(booking.event._id, {
          $inc: { availableSeats: -booking.tickets }
        });
      }
      booking.bookingStatus = bookingStatus;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private / Admin
const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalPayments = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate('event', 'title date venue city')
      .populate('booking', 'bookingId tickets totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      totalPayments,
      totalPages: Math.ceil(totalPayments / limitNum),
      currentPage: pageNum,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllBookings,
  updateBookingStatus,
  getAllPayments
};
