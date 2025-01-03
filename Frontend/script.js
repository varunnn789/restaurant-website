const API_URL = 'https://restaurant-backend-ybln.onrender.com'; // Removed extra /api

// Fetch menu items
function fetchMenuItems() {
    console.log('Fetching menu items...');
    fetch(`${API_URL}/api/menu`)
        .then(response => {
            console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Menu data received:', data);
            const menuSection = document.getElementById('menu-items');
            
            if (!menuSection) {
                console.error('Menu section not found!');
                return;
            }

            menuSection.innerHTML = ''; // Clear existing content
            
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
                console.log('Added menu item:', item.name);
            });
        })
        .catch(error => {
            console.error('Error fetching menu items:', error);
            const menuSection = document.getElementById('menu-items');
            if (menuSection) {
                menuSection.innerHTML = '<p class="error">Failed to load menu items. Please try again later.</p>';
            }
        });
}

// Handle reservation form submission
function handleReservation(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reservationData = Object.fromEntries(formData);
    
    fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
    })
        .then(response => response.json())
        .then(data => {
            alert('Reservation submitted successfully!');
            event.target.reset();
        })
        .catch(error => {
            console.error('Error submitting reservation:', error);
            alert('An error occurred while submitting your reservation. Please try again.');
        });
}

// Initialize the application
function init() {
    console.log('Initializing application...');
    fetchMenuItems();
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservation);
    } else {
        console.error('Reservation form not found!');
    }
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
