// DOM Elements
const loanForm = document.getElementById('loan-calculator');
const loanAmount = document.getElementById('loan-amount');
const interestRate = document.getElementById('interest-rate');
const loanTerm = document.getElementById('loan-term');
const loanResults = document.getElementById('loan-results');
const savingsForm = document.getElementById('savings-form');
const goalName = document.getElementById('goal-name');
const targetAmount = document.getElementById('target-amount');
const targetDate = document.getElementById('target-date');
const savingsGoals = document.getElementById('savings-goals');

// Loan Calculator
loanForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const amount = parseFloat(loanAmount.value);
  const rate = parseFloat(interestRate.value) / 100 / 12;
  const term = parseInt(loanTerm.value);
  
  if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
    loanResults.innerHTML = '<p class="text-red-500">Please enter valid numbers</p>';
    return;
  }

  const monthlyPayment = (amount * rate) / (1 - Math.pow(1 + rate, -term));
  const totalPayment = monthlyPayment * term;
  const totalInterest = totalPayment - amount;

  loanResults.innerHTML = `
    <div class="space-y-2">
      <p class="font-semibold">Monthly Payment: <span class="text-blue-600">$${monthlyPayment.toFixed(2)}</span></p>
      <p>Total Payment: $${totalPayment.toFixed(2)}</p>
      <p>Total Interest: $${totalInterest.toFixed(2)}</p>
      <p>Loan Amount: $${amount.toFixed(2)}</p>
    </div>
  `;
});

// Savings Goals
let goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];

function renderGoals() {
  if (goals.length === 0) {
    savingsGoals.innerHTML = '<p class="text-gray-700">No savings goals yet</p>';
    return;
  }

  savingsGoals.innerHTML = goals.map(goal => `
    <div class="bg-gray-100 p-4 rounded">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold">${goal.name}</h4>
        <span class="text-sm text-gray-600">Target: $${goal.amount}</span>
      </div>
      <div class="w-full bg-gray-300 rounded-full h-2.5 mb-2">
        <div class="bg-green-600 h-2.5 rounded-full" style="width: ${Math.min(100, (goal.saved / goal.amount) * 100)}%"></div>
      </div>
      <div class="flex justify-between text-sm">
        <span>Saved: $${goal.saved}</span>
        <span>Target Date: ${new Date(goal.date).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');
}

savingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const goal = {
    name: goalName.value,
    amount: parseFloat(targetAmount.value),
    saved: 0,
    date: targetDate.value
  };

  if (!goal.name || isNaN(goal.amount) || !goal.date) {
    alert('Please fill all fields with valid values');
    return;
  }

  goals.push(goal);
  localStorage.setItem('savingsGoals', JSON.stringify(goals));
  renderGoals();
  
  // Reset form
  goalName.value = '';
  targetAmount.value = '';
  targetDate.value = '';
});

// Initialize
renderGoals();

// API Integration Functions
const API_BASE_URL = 'http://localhost:8000/api';

// Auth Functions
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.msg || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function register(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.msg || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Loan Functions
async function applyForLoan(amount, interestRate, term, purpose) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ amount, interestRate, term, purpose })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.msg || 'Loan application failed');
    }

    return data;
  } catch (error) {
    console.error('Loan application error:', error);
    throw error;
  }
}

async function getUserLoans() {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/loans`, {
      headers: {
        'x-auth-token': token
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch loans');
    }

    return data;
  } catch (error) {
    console.error('Get loans error:', error);
    throw error;
  }
}

// Savings Functions
async function createSavingsGoal(goalName, targetAmount, targetDate) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/savings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ goalName, targetAmount, targetDate })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.msg || 'Failed to create savings goal');
    }

    return data;
  } catch (error) {
    console.error('Create savings goal error:', error);
    throw error;
  }
}

async function getUserSavingsGoals() {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/savings`, {
      headers: {
        'x-auth-token': token
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch savings goals');
    }

    return data;
  } catch (error) {
    console.error('Get savings goals error:', error);
    throw error;
  }
}

// Initialize with real data
async function initApp() {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Load user data
      const [loans, savings] = await Promise.all([
        getUserLoans(),
        getUserSavingsGoals()
      ]);
      
      // Update UI with real data
      updateLoanUI(loans);
      updateSavingsUI(savings);
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Form Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        await login(email, password);
        window.location.href = 'index.html';
      } catch (error) {
        showAlert(error.message, 'error');
      }
    });
  }

  // Registration Form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm').value;
      
      if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
      }

      try {
        await register(name, email, password);
        window.location.href = 'index.html';
      } catch (error) {
        showAlert(error.message, 'error');
      }
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // Call initialization for main app
  if (window.location.pathname.endsWith('index.html') || 
      window.location.pathname === '/') {
    initApp();
  }
});

// Show alert message
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `fixed top-4 right-4 p-4 rounded-md shadow-md text-white ${
    type === 'error' ? 'bg-red-500' : 'bg-green-500'
  } alert`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Admin Functions
async function getAdminData() {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin`, {
      headers: {
        'x-auth-token': token
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch admin data');
    }

    return data;
  } catch (error) {
    console.error('Admin data error:', error);
    throw error;
  }
}

async function approveLoan(loanId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/approve`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve loan');
    }

    showAlert('Loan approved successfully');
    loadAdminData();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function rejectLoan(loanId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/reject`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject loan');
    }

    showAlert('Loan rejected successfully');
    loadAdminData();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function loadAdminData() {
  try {
    const data = await getAdminData();
    renderAdminDashboard(data);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function renderAdminDashboard(data) {
  // Users
  document.getElementById('total-users').textContent = data.users.length;
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = data.users.map(user => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-2">${user.name}</td>
      <td class="py-2">${user.email}</td>
      <td class="py-2">
        <span class="${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full text-xs">
          ${user.role}
        </span>
      </td>
    </tr>
  `).join('');

  // Loans
  const pendingLoans = data.loans.filter(loan => loan.status === 'Pending');
  document.getElementById('pending-loans').textContent = pendingLoans.length;
  const loansList = document.getElementById('loans-list');
  loansList.innerHTML = data.loans.map(loan => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-2">${loan.user.name}</td>
      <td class="py-2">$${loan.amount.toFixed(2)}</td>
      <td class="py-2">
        <span class="${loan.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                     loan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                     'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded-full text-xs">
          ${loan.status}
        </span>
      </td>
      <td class="py-2">
        ${loan.status === 'Pending' ? `
          <button onclick="approveLoan('${loan._id}')" class="text-green-600 hover:text-green-800 mr-2">
            <i class="fas fa-check"></i>
          </button>
          <button onclick="rejectLoan('${loan._id}')" class="text-red-600 hover:text-red-800">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      </td>
    </tr>
  `).join('');

  // Savings
  const totalSavings = data.savings.reduce((sum, saving) => sum + saving.currentAmount, 0);
  document.getElementById('total-savings').textContent = `$${totalSavings.toFixed(2)}`;
  const savingsList = document.getElementById('savings-list');
  savingsList.innerHTML = data.savings.map(saving => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-2">${saving.goalName}</td>
      <td class="py-2">$${saving.currentAmount.toFixed(2)}</td>
      <td class="py-2">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full" 
               style="width: ${(saving.currentAmount / saving.targetAmount) * 100}%"></div>
        </div>
      </td>
    </tr>
  `).join('');

  // Set admin greeting
  const adminGreeting = document.getElementById('admin-greeting');
  if (adminGreeting) {
    adminGreeting.textContent = `Welcome, ${data.admin.name}`;
  }
}

// Check authentication state
function checkAuth() {
  const token = localStorage.getItem('token');
  const authPages = ['login.html', 'register.html'];
  const currentPage = window.location.pathname.split('/').pop();

  if (token && authPages.includes(currentPage)) {
    window.location.href = 'index.html';
  } else if (!token && !authPages.includes(currentPage)) {
    window.location.href = 'login.html';
  }

  // Initialize admin dashboard if on admin page
  if (currentPage === 'admin.html') {
    loadAdminData();
  }
}

// Initial checks
checkAuth();
