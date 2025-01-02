// Fetch menu items (to be implemented later)
function fetchMenuItems() {
    // Placeholder for API call
    const menuItems = [
        { name: 'Pasta', description: 'Delicious pasta dish', price: 12.99 },
        { name: 'Pizza', description: 'Authentic Italian pizza', price: 14.99 },
        { name: 'Salad', description: 'Fresh garden salad', price: 8.99 }
    ];

    const menuSection = document.getElementById('menu-items');
    menuItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p><p>$${item.price.toFixed(2)}</p>`;
        menuSection.appendChild(itemElement);
    });
}

// Handle reservation form submission
function handleReservation(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reservationData = Object.fromEntries(formData);
    
    // Placeholder for API call
    console.log('Reservation data:', reservationData);
    alert('Reservation submitted successfully!');
    event.target.reset();
}

// Initialize the application
function init() {
    fetchMenuItems();
    document.getElementById('reservation-form').addEventListener('submit', handleReservation);
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
