// Variables
let tripData = [];
let currentTrip = {};
let page = 1;
const perPage = 10;
let map = null;

// Function: objectToTableRow
const objectToTableRow = (trip) => {
  return `
    <tr>
      <td>${trip.name}</td>
      <td>${trip.date}</td>
      <td>${trip.location}</td>
      <td>${trip.distance}</td>
    </tr>
  `;
};
// Function: loadTripData
const loadTripData = () => {
    const apiUrl = 'https://long-plum-fly-boot.cyclic.app/api/trips?page=' + page + '&perPage=' + perPage;
  
    // Fetch trip data from the backend API
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        tripData = data;
        // Call a function to populate the UI with the trip data
        populateTripData();
      })
      .catch(error => {
        console.log('Error loading trip data:', error);
      });
  };
  
  // Function: populateTripData
  const populateTripData = () => {
    const tableRows = tripData.map(objectToTableRow).join('');
    const tbody = document.querySelector('#trips-table tbody');
    tbody.innerHTML = tableRows;
  
    const rows = document.querySelectorAll('#trips-table tbody tr');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const tripId = row.getAttribute('data-id');
        currentTrip = tripData.find(trip => trip._id === tripId);
  
        // Update modal content
        const modalTitle = document.querySelector('.modal-title');
        modalTitle.textContent = `Trip Details (Bike: ${currentTrip.bikeid})`;
  
        const mapDetails = document.querySelector('#map-details');
        mapDetails.innerHTML = `
          <p>Start Station Name: ${currentTrip["start station name"]}</p>
          <p>End Station Name: ${currentTrip["end station name"]}</p>
          <p>Trip Duration: ${(currentTrip.tripduration / 60).toFixed(2)} minutes</p>
        `;
  
        // Open the trip modal
        const tripModal = document.querySelector('#trip-modal');
        tripModal.classList.add('show');
      });
    });
  
    // Update current page
    const currentPage = document.querySelector('.current-page');
    currentPage.innerHTML = page;
  };
  document.addEventListener('DOMContentLoaded', function() {
    // Invoke loadTripData() to populate the table with data and set the current working page
    loadTripData();
  
    // Wire up events
    document.querySelector('#previous-page').addEventListener('click', function() {
      if (page > 1) {
        page--;
        loadTripData();
      }
    });
  
    document.querySelector('#next-page').addEventListener('click', function() {
      page++;
      loadTripData();
    });
  
    document.querySelector('#trip-modal').addEventListener('shown.bs.modal', function() {
      // Render map using Leaflet library
      map = new L.Map('leaflet', {
        layers: [
          new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        ]
      });
  
      const start = L.marker([currentTrip["start station location"][1], currentTrip["start station location"][0]])
        .bindTooltip(currentTrip["start station name"], {
          permanent: true,
          direction: 'right'
        }).addTo(map);
  
      const end = L.marker([currentTrip["end station location"][1], currentTrip["end station location"][0]])
        .bindTooltip(currentTrip["end station name"], {
          permanent: true,
          direction: 'right'
        }).addTo(map);
  
      const group = new L.featureGroup([start, end]);
  
      map.fitBounds(group.getBounds(), { padding: [60, 60] });
    });
  
    document.querySelector('#trip-modal').addEventListener('hidden.bs.modal', function() {
      // Remove the map
      map.remove();
    });
  });
    
  