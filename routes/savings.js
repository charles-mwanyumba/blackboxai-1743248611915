const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Saving = require('../models/Saving');
const User = require('../models/User');

// @route    POST api/savings
// @desc     Create a new savings goal
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('goalName', 'Goal name is required').not().isEmpty(),
      check('targetAmount', 'Target amount is required').not().isEmpty(),
      check('targetDate', 'Target date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newSaving = new Saving({
        user: req.user.id,
        goalName: req.body.goalName,
        targetAmount: req.body.targetAmount,
        targetDate: req.body.targetDate
      });

      const saving = await newSaving.save();
      res.json(saving);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/savings
// @desc     Get all savings goals for current user
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const savings = await Saving.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(savings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/savings/:id
// @desc     Get savings goal by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const saving = await Saving.findById(req.params.id);

    if (!saving) {
      return res.status(404).json({ msg: 'Saving goal not found' });
    }

    // Check user owns the saving goal
    if (saving.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(saving);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Saving goal not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/savings/:id
// @desc     Update savings goal
// @access   Private
router.put('/:id', auth, async (req, res) => {
  const { goalName, targetAmount, targetDate } = req.body;

  const savingsFields = {};
  if (goalName) savingsFields.goalName = goalName;
  if (targetAmount) savingsFields.targetAmount = targetAmount;
  if (targetDate) savingsFields.targetDate = targetDate;

  try {
    let saving = await Saving.findById(req.params.id);

    if (!saving) {
      return res.status(404).json({ msg: 'Saving goal not found' });
    }

    // Check user owns the saving goal
    if (saving.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    saving = await Saving.findByIdAndUpdate(
      req.params.id,
      { $set: savingsFields },
      { new: true }
    );

    res.json(saving);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/savings/:id
// @desc     Delete savings goal
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const saving = await Saving.findById(req.params.id);

    if (!saving) {
      return res.status(404).json({ msg: 'Saving goal not found' });
    }

    // Check user owns the saving goal
    if (saving.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await saving.remove();
    res.json({ msg: 'Saving goal removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;