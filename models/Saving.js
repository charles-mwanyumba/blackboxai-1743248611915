const mongoose = require('mongoose');

const SavingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  goalName: {
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true,
    maxlength: [50, 'Goal name cannot exceed 50 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount'],
    min: [100, 'Minimum target amount is 100']
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0.5,
    min: [0, 'Interest rate cannot be negative'],
    max: [10, 'Maximum interest rate is 10%']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please add a target date']
  },
  transactions: [{
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['Deposit', 'Withdrawal', 'Interest'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate interest before saving
SavingSchema.pre('save', function(next) {
  if (this.isModified('currentAmount') && this.currentAmount > 0) {
    const interest = this.currentAmount * (this.interestRate / 100 / 12);
    this.transactions.push({
      amount: interest,
      type: 'Interest',
      description: 'Monthly interest'
    });
    this.currentAmount += interest;
  }
  next();
});

module.exports = mongoose.model('Saving', SavingSchema);