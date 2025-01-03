const API_URL = 'https://restaurant-backend-ybln.onrender.com/api';

// Fetch menu items
function fetchMenuItems() {
  fetch(`${API_URL}/api/menu`)
      .then(response => response.json())
      .then(data => {
          const menuSection = document.getElementById('menu-items');
          data.forEach(item => {
              const price = parseFloat(item.price); // Convert string to number
              const itemElement = document.createElement('div');
              itemElement.innerHTML = `
                  <h3>${item.name}</h3>
                  <p>${item.description}</p>
                  <p>$${price.toFixed(2)}</p>
              `;
              menuSection.appendChild(itemElement);
          });
      })
      .catch(error => console.error('Error fetching menu items:', error));
}

// Handle reservation form submission
function handleReservation(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const reservationData = Object.fromEntries(formData);
  
  fetch(`${API_URL}/reservations`, {
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
  fetchMenuItems();
  document.getElementById('reservation-form').addEventListener('submit', handleReservation);
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
