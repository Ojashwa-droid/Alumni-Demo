   // Alumni Statistics Feature
// This script aggregates alumni data and displays statistics similar to LinkedIn

// DOM Elements
const alumniStatsContainer = document.getElementById('alumni-stats');

// API endpoint to fetch all alumni (you may want to create a specific statistics endpoint)
const STATS_API_ENDPOINT = '/alumni/stats/';

// Load alumni statistics when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only load stats if the container exists
    if (alumniStatsContainer) {
        fetchAlumniStatistics();
    }
});

// Function to fetch alumni statistics from API
async function fetchAlumniStatistics() {
    try {
        // Show loading state
        alumniStatsContainer.innerHTML = '<div class="loading">Loading alumni statistics...</div>';
        
        // Fetch data from API
        const response = await fetch(STATS_API_ENDPOINT);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update UI with the response data
        renderAlumniStatistics(data);
        
    } catch (error) {
        console.error('Failed to fetch alumni statistics:', error);
        alumniStatsContainer.innerHTML = `
            <div class="error-message">
                <h3>Unable to load alumni statistics</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Function to render alumni statistics
function renderAlumniStatistics(data) {
    // Check if we have the required data
    if (!data || !data.total_alumni) {
        alumniStatsContainer.innerHTML = '<div class="error-message">No statistics data available</div>';
        return;
    }
    
    // Create the statistics overview
    const statsOverview = document.createElement('div');
    statsOverview.className = 'alumni-stats-overview';
    statsOverview.innerHTML = `
        <h2>${data.total_alumni.toLocaleString()} alumni</h2>
        <div class="stats-period">
            <span>Start year</span>
            <input type="number" id="stats-start-year" value="${data.start_year || 2000}" min="1950" max="${new Date().getFullYear()}">
            <span>End year</span>
            <input type="number" id="stats-end-year" value="${data.end_year || new Date().getFullYear()}" min="1950" max="${new Date().getFullYear()}">
        </div>
    `;
    
    // Create the statistics sections
    const statsSections = document.createElement('div');
    statsSections.className = 'alumni-stats-sections';
    
    // Where they work section
    const whereTheyWorkSection = createStatsSection(
        'Where they work',
        data.companies || [],
        'company_name',
        'alumni_count'
    );
    
    // Where they live section
    const whereTheyLiveSection = createStatsSection(
        'Where they live',
        data.locations || [],
        'location_name',
        'alumni_count'
    );
    
    // What they studied section
    const whatTheyStudiedSection = createStatsSection(
        'What they studied',
        data.programs || [],
        'program_name',
        'alumni_count'
    );
    
    // Add sections to the container
    statsSections.appendChild(whereTheyWorkSection);
    statsSections.appendChild(whereTheyLiveSection);
    statsSections.appendChild(whatTheyStudiedSection);
    
    // Clear the container and add the new content
    alumniStatsContainer.innerHTML = '';
    alumniStatsContainer.appendChild(statsOverview);
    alumniStatsContainer.appendChild(statsSections);
    
    // Add event listeners to the year inputs
    setupYearFilterEvents();
}

// Function to create a statistics section
function createStatsSection(title, items, labelField, countField) {
    const section = document.createElement('div');
    section.className = 'stats-section';
    
    const header = document.createElement('div');
    header.className = 'stats-section-header';
    header.innerHTML = `
        <h3>${title}</h3>
        <button class="add-filter-btn">+ Add</button>
    `;
    
    const list = document.createElement('div');
    list.className = 'stats-list';
    
    // Sort items by count (descending)
    const sortedItems = [...items].sort((a, b) => b[countField] - a[countField]);
    
    // Create list items
    sortedItems.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'stats-list-item';
        
        // Calculate percentage for the progress bar
        const percentage = items.length > 0 
            ? (item[countField] / items.reduce((sum, current) => sum + current[countField], 0)) * 100
            : 0;
        
        listItem.innerHTML = `
            <div class="stats-item-info">
                <span class="stats-item-count">${item[countField]}</span>
                <span class="stats-item-label">${item[labelField]}</span>
            </div>
            <div class="stats-item-bar">
                <div class="stats-item-progress" style="width: ${percentage}%"></div>
            </div>
        `;
        
        list.appendChild(listItem);
    });
    
    section.appendChild(header);
    section.appendChild(list);
    
    return section;
}

// Function to setup event listeners for year filters
function setupYearFilterEvents() {
    const startYearInput = document.getElementById('stats-start-year');
    const endYearInput = document.getElementById('stats-end-year');
    
    if (startYearInput && endYearInput) {
        startYearInput.addEventListener('change', () => {
            // Ensure start year is not after end year
            if (parseInt(startYearInput.value) > parseInt(endYearInput.value)) {
                startYearInput.value = endYearInput.value;
            }
            fetchAlumniStatistics();
        });
        
        endYearInput.addEventListener('change', () => {
            // Ensure end year is not before start year
            if (parseInt(endYearInput.value) < parseInt(startYearInput.value)) {
                endYearInput.value = startYearInput.value;
            }
            fetchAlumniStatistics();
        });
    }
}