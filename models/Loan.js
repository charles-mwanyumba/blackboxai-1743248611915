const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoanSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  term: {
    type: Number,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  monthlyPayment: {
    type: Number
  },
  totalInterest: {
    type: Number
  },
  totalPayment: {
    type: Number
  }
});

module.exports = mongoose.model('Loan', LoanSchema);