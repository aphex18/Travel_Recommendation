// Function to fetch travel data from JSON file
async function fetchTravelData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log('Data fetched successfully:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading travel data. Please make sure travel_recommendation_api.json exists.');
        return null;
    }
}

// Function to normalize search keywords (handles variations)
function normalizeKeyword(keyword) {
    const normalized = keyword.toLowerCase().trim();
    
    // Map variations to standard categories
    const keywordMap = {
        'beach': 'beaches',
        'beaches': 'beaches',
        'temple': 'temples',
        'temples': 'temples',
        'country': 'countries',
        'countries': 'countries'
    };
    
    return keywordMap[normalized] || normalized;
}

// Function to create recommendation card HTML
function createRecommendationCard(item) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/350x220?text=No+Image'">
        </div>
        <div class="card-content">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <button class="visit-btn" onclick="alert('Visiting ${item.name}')">Visit</button>
        </div>
    `;
    
    return card;
}

// Function to display recommendations
function displayRecommendations(results, keyword) {
    const resultsContainer = document.getElementById('results-container');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Check if results exist
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h2>No recommendations found for "${keyword}"</h2>
                <p>Try searching for: <strong>beaches</strong>, <strong>temples</strong>, or <strong>countries</strong></p>
            </div>
        `;
        return;
    }
    
    // Create header
    const header = document.createElement('div');
    header.className = 'results-header';
    header.innerHTML = `<h2>Recommendations for "${keyword}"</h2>`;
    resultsContainer.appendChild(header);
    
    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    // Create cards for each result
    results.forEach(item => {
        const card = createRecommendationCard(item);
        cardsContainer.appendChild(card);
    });
    
    resultsContainer.appendChild(cardsContainer);
}

// Main search function
async function searchRecommendations() {
    const searchInput = document.getElementById('search-input');
    const keyword = searchInput.value.trim();
    
    // Validate input
    if (!keyword) {
        alert('Please enter a search term (e.g., beach, temple, or country)');
        return;
    }
    
    // Show loading state
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
    
    // Normalize the keyword
    const normalizedKeyword = normalizeKeyword(keyword);
    
    // Fetch data from API
    const data = await fetchTravelData();
    
    if (!data) {
        resultsContainer.innerHTML = '<div class="no-results"><h2>Error loading data</h2></div>';
        return;
    }
    
    let results = [];
    let displayKeyword = keyword;
    
    // Search based on normalized keyword
    if (normalizedKeyword === 'beaches') {
        results = data.beaches || [];
        displayKeyword = 'Beaches';
    } else if (normalizedKeyword === 'temples') {
        results = data.temples || [];
        displayKeyword = 'Temples';
    } else if (normalizedKeyword === 'countries') {
        // Flatten all cities from all countries
        results = data.countries ? data.countries.flatMap(country => country.cities) : [];
        displayKeyword = 'Countries';
    } else {
        // Try partial matching across all categories
        const allItems = [
            ...(data.beaches || []),
            ...(data.temples || []),
            ...(data.countries ? data.countries.flatMap(country => country.cities) : [])
        ];
        
        results = allItems.filter(item => 
            item.name.toLowerCase().includes(keyword.toLowerCase()) ||
            item.description.toLowerCase().includes(keyword.toLowerCase())
        );
        displayKeyword = keyword;
    }
    
    // Display results
    displayRecommendations(results, displayKeyword);
}

// Function to clear search results and input
function clearResults() {
    const resultsContainer = document.getElementById('results-container');
    const searchInput = document.getElementById('search-input');
    
    // Clear the results with animation
    resultsContainer.style.opacity = '0';
    setTimeout(() => {
        resultsContainer.innerHTML = '';
        resultsContainer.style.opacity = '1';
    }, 300);
    
    // Clear the search input
    searchInput.value = '';
    searchInput.focus();
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.querySelector('.btn-search');
    const clearBtn = document.querySelector('.btn-clear');
    const searchInput = document.getElementById('search-input');
    
    // Search button click event
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            searchRecommendations();
        });
    }
    
    // Clear button click event
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearResults();
        });
    }
    
    // Allow Enter key to trigger search
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchRecommendations();
            }
        });
    }
    
    // Test: Fetch data on page load to check API
    console.log('Testing API connection...');
    fetchTravelData();
});
