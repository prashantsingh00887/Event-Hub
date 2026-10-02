const express = require('express');
const router = express.Router();
const { upload, uploadStream } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    const folder = req.body.folder || 'eventhub_events';
    const result = await uploadStream(req.file.buffer, { folder });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary.',
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes
    });
  } catch (error) {
    console.error('Cloudinary upload failure:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to Cloudinary.'
    });
  }
});

module.exports = router;
