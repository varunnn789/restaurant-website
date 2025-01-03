const API_URL = 'https://restaurant-backend-ybln.onrender.com';
let currentUser = null;

// Auth Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');
    const myReservations = document.getElementById('my-reservations');
    const reservationForm = document.getElementById('reservation-form');
    const authMessage = document.querySelector('.auth-message');

    if (currentUser) {
        loginBtn.classList.add('hidden');
        signupBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userName.textContent = `Welcome, ${currentUser.name}`;
        myReservations.classList.remove('hidden');
        reservationForm.classList.remove('hidden');
        if (authMessage) authMessage.classList.add('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        signupBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
        myReservations.classList.add('hidden');
        reservationForm.classList.add('hidden');
        if (authMessage) authMessage.classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthUI();
}

// Fetch Functions
async function fetchMenuItems() {
    try {
        const response = await fetch(`${API_URL}/api/menu`);
        const data = await response.json();
        
        const menuSection = document.getElementById('menu-items');
        if (!menuSection) return;

        menuSection.innerHTML = '';
        
        data.forEach(item => {
            const price = parseFloat(item.price);
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');
            itemElement.innerHTML = `
                <div class="menu-item-content">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <p class="menu-item-description">${item.description}</p>
                    <p class="menu-item-price">$${price.toFixed(2)}</p>
                </div>
            `;
            menuSection.appendChild(itemElement);
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        const menuSection = document.getElementById('menu-items');
        if (menuSection) {
            menuSection.innerHTML = '<p class="error">Failed to load menu items. Please try again later.</p>';
        }
    }
}

async function fetchUserReservations() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/api/my-reservations`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch reservations');

        const reservations = await response.json();
        displayUserReservations(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
    }
}

function displayUserReservations(reservations) {
    const container = document.getElementById('user-reservations');
    if (!container) return;

    if (reservations.length === 0) {
        container.innerHTML = '<p>No reservations found.</p>';
        return;
    }

    container.innerHTML = reservations.map(reservation => `
        <div class="reservation-card">
            <p><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${reservation.time}</p>
            <p><strong>Party Size:</strong> ${reservation.party_size}</p>
            <p><strong>Booking Name:</strong> ${reservation.customer_name}</p>
        </div>
    `).join('');
}

// Event Handlers
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const loginData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        
        hideModal('login-modal');
        updateAuthUI();
        fetchUserReservations();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const signupData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        if (!response.ok) throw new Error('Signup failed');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        
        hideModal('signup-modal');
        updateAuthUI();
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
}

async function handleReservation(event) {
    event.preventDefault();
    if (!currentUser) {
        alert('Please login to make a reservation');
        return;
    }

    const formData = new FormData(event.target);
    const reservationData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/api/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reservationData)
        });

        if (!response.ok) throw new Error('Failed to make reservation');

        alert('Reservation submitted successfully!');
        event.target.reset();
        fetchUserReservations();
    } catch (error) {
        console.error('Error submitting reservation:', error);
        alert('An error occurred while submitting your reservation. Please try again.');
    }
}

// Initialize
function init() {
    fetchMenuItems();
    
    // Set up event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('reservation-form').addEventListener('submit', handleReservation);

    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
        fetchUserReservations();
    }

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

document.addEventListener('DOMContentLoaded', init);
