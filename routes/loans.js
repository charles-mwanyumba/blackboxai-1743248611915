const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Loan = require('../models/Loan');
const User = require('../models/User');

// @route    POST api/loans
// @desc     Create a new loan application
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required').not().isEmpty(),
      check('interestRate', 'Interest rate is required').not().isEmpty(),
      check('term', 'Term is required').not().isEmpty(),
      check('purpose', 'Purpose is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newLoan = new Loan({
        user: req.user.id,
        amount: req.body.amount,
        interestRate: req.body.interestRate,
        term: req.body.term,
        purpose: req.body.purpose
      });

      const loan = await newLoan.save();
      res.json(loan);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/loans
// @desc     Get all loans for current user
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/loans/:id
// @desc     Get loan by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    // Check user owns the loan
    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(loan);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Loan not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/loans/:id/pay
// @desc     Make a loan payment
// @access   Private
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    // Check user owns the loan
    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Find the next pending payment
    const payment = loan.payments.find(p => p.status === 'Pending');
    if (!payment) {
      return res.status(400).json({ msg: 'No pending payments' });
    }

    // Update payment status
    payment.status = 'Paid';
    payment.paidDate = new Date();

    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;