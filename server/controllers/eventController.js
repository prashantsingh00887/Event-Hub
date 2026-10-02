const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get all events with search, filters, sorting and pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      dateFilter,
      sort,
      page = 1,
      limit = 12,
      all = false // for admin or internal fetching
    } = req.query;

    const query = {};

    // For public views, only show active events unless 'all' is requested
    if (all !== 'true') {
      query.status = 'active';
    }

    // Search query across title, description, city, venue
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { venue: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // City filter
    if (city && city !== 'All') {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (dateFilter === 'this_weekend') {
      const todayDay = now.getDay();
      const distToSaturday = (6 - todayDay + 7) % 7;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + distToSaturday);
      saturday.setHours(0, 0, 0, 0);

      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);

      query.date = { $gte: saturday, $lte: sunday };
    } else if (dateFilter === 'upcoming') {
      query.date = { $gte: new Date() };
    }

    // Sorting
    let sortOptions = { date: 1 }; // Default sort by date ascending
    if (sort === 'price_asc') {
      sortOptions = { ticketPrice: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { ticketPrice: -1 };
    } else if (sort === 'date_desc') {
      sortOptions = { date: -1 };
    } else if (sort === 'date_asc') {
      sortOptions = { date: 1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    // Extract unique cities for filter dropdown
    const cities = await Event.distinct('city', { status: 'active' });

    res.status(200).json({
      success: true,
      count: events.length,
      totalEvents,
      totalPages: Math.ceil(totalEvents / limitNum),
      currentPage: pageNum,
      cities,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private / Admin
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      image,
      venue,
      address,
      city,
      date,
      startTime,
      endTime,
      ticketPrice,
      totalSeats,
      status
    } = req.body;

    // Required fields check
    if (
      !title ||
      !description ||
      !category ||
      !image ||
      !venue ||
      !address ||
      !city ||
      !date ||
      !startTime ||
      !endTime ||
      ticketPrice === undefined ||
      totalSeats === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    if (Number(ticketPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Ticket price cannot be negative.'
      });
    }

    if (Number(totalSeats) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total seats must be greater than 0.'
      });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid event date.'
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      image: image.trim(),
      venue: venue.trim(),
      address: address.trim(),
      city: city.trim(),
      date: eventDate,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      ticketPrice: Number(ticketPrice),
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats), // Automatically initialize with total seats
      status: status || 'active',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Private / Admin
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const {
      title,
      description,
      category,
      image,
      venue,
      address,
      city,
      date,
      startTime,
      endTime,
      ticketPrice,
      totalSeats,
      availableSeats,
      status
    } = req.body;

    if (ticketPrice !== undefined && Number(ticketPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Ticket price cannot be negative.'
      });
    }

    if (totalSeats !== undefined && Number(totalSeats) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total seats must be greater than 0.'
      });
    }

    // If total seats changed, adjust availableSeats appropriately
    let calculatedAvailableSeats = availableSeats !== undefined ? Number(availableSeats) : event.availableSeats;
    if (totalSeats !== undefined && Number(totalSeats) !== event.totalSeats) {
      const seatsDelta = Number(totalSeats) - event.totalSeats;
      calculatedAvailableSeats = Math.max(0, event.availableSeats + seatsDelta);
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(category && { category }),
        ...(image && { image: image.trim() }),
        ...(venue && { venue: venue.trim() }),
        ...(address && { address: address.trim() }),
        ...(city && { city: city.trim() }),
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime: startTime.trim() }),
        ...(endTime && { endTime: endTime.trim() }),
        ...(ticketPrice !== undefined && { ticketPrice: Number(ticketPrice) }),
        ...(totalSeats !== undefined && { totalSeats: Number(totalSeats) }),
        availableSeats: calculatedAvailableSeats,
        ...(status && { status })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private / Admin
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Check if there are confirmed bookings for this event
    const confirmedBookingsCount = await Booking.countDocuments({
      event: req.params.id,
      bookingStatus: 'Confirmed'
    });

    if (confirmedBookingsCount > 0) {
      // Instead of hard-deleting an event with active bookings, mark it cancelled to preserve integrity
      event.status = 'cancelled';
      await event.save();

      return res.status(200).json({
        success: true,
        message: `Event has ${confirmedBookingsCount} active bookings. It has been marked as 'cancelled' to protect historical records.`
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
