const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Saving = require('../models/Saving');

// @route    GET api/admin
// @desc     Get admin dashboard data
// @access   Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    // Get all users
    const users = await User.find().select('-password');

    // Get all loans with user data
    const loans = await Loan.find().populate('user', 'name email');

    // Get all savings with user data
    const savings = await Saving.find().populate('user', 'name email');

    res.json({
      admin: req.user,
      users,
      loans,
      savings
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/admin/loans/:id/approve
// @desc     Approve a loan
// @access   Private (Admin)
router.put('/loans/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    loan.status = 'Approved';
    await loan.save();

    res.json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/admin/loans/:id/reject
// @desc     Reject a loan
// @access   Private (Admin)
router.put('/loans/:id/reject', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    loan.status = 'Rejected';
    await loan.save();

    res.json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;