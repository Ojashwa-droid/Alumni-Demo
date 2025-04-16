// DOM Elements
const filterForm = document.querySelector('.filter-section');
const batchSelect = document.getElementById('batch');
const programSelect = document.getElementById('program');
const industrySelect = document.getElementById('industry');
const locationSelect = document.getElementById('location');
const searchInput = document.getElementById('searchKeyword');
const resetBtn = document.querySelector('.reset-btn');
const applyBtn = document.querySelector('.apply-btn');
const alumniGrid = document.querySelector('.alumni-grid');
const paginationContainer = document.querySelector('.pagination');

// API endpoint
const API_ENDPOINT = 'http://51.20.139.242/alumni/list/';

// Current state
let currentPage = 1;
const itemsPerPage = 6; // Same as current display count

// Load alumni data when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAlumni();
    
    // Add event listeners
    applyBtn.addEventListener('click', () => {
        currentPage = 1;
        fetchAlumni();
    });
    
    resetBtn.addEventListener('click', resetFilters);
    
    // Setup pagination event delegation
    paginationContainer.addEventListener('click', handlePaginationClick);
});

// Function to fetch alumni data from API
async function fetchAlumni() {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add search term if provided
        if (searchInput.value.trim()) {
            params.append('search', searchInput.value.trim());
        }
        
        // Add ordering by graduation year (newest first)
        params.append('ordering', '-graduation_year');
        
        // Add filters if selected
        if (batchSelect.value) {
            params.append('graduation_year', batchSelect.value);
        }
        
        // Convert other filters to appropriate API parameters
        // Note: This is assuming your API supports these filters
        // You may need to adjust these based on your actual API implementation
        
        // Construct the API URL with parameters
        const url = `${API_ENDPOINT}?${params.toString()}`;
        
        // Show loading state
        alumniGrid.innerHTML = '<div class="loading">Loading alumni data...</div>';
        
        // Fetch data from API
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update UI with the response data
        updateAlumniGrid(data);
        updatePagination(data.length);
        
    } catch (error) {
        console.error('Failed to fetch alumni data:', error);
        alumniGrid.innerHTML = `
            <div class="error-message">
                <h3>Unable to load alumni data</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function updateAlumniGrid(alumniData) {
    // Clear the current grid
    alumniGrid.innerHTML = '';
    
    // If no results, display a message
    if (alumniData.length === 0) {
        alumniGrid.innerHTML = `
            <div class="no-results">
                <h3>No alumni found</h3>
                <p>Try adjusting your filters or search term.</p>
            </div>
        `;
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = alumniData.slice(startIndex, endIndex);
    
    // Create alumni cards for each item in the data
    paginatedData.forEach(alumni => {
        // Extract graduation year from the API response
        const graduationYear = new Date(alumni.graduation_year * 1000).getFullYear();
        
        // Create the alumni card
        const alumniCard = document.createElement('div');
        alumniCard.className = 'alumni-card';
        
        // Determine program type based on job title or other fields
        let programType = 'B.Tech'; // Default
        
        alumniCard.innerHTML = `
            <div class="alumni-image">
                <img src="${alumni.profile_picture || 'https://avatar.iran.liara.run/public'}" 
                     alt="${alumni.user || 'Alumni'}" 
                     onerror="this.src='/api/placeholder/400/320';">
            </div>
            <div class="alumni-info">
                <h3 class="alumni-name">${alumni.user || 'Alumni'}</h3>
                <div class="alumni-batch">Batch of ${graduationYear} | ${programType}</div>
                <div class="alumni-role">${alumni.job_title || 'Not specified'}</div>
                <div class="alumni-company">${alumni.current_company || 'Not specified'}</div>
                <div class="alumni-social">
                    ${alumni.linkedin_url ? `<a href="${alumni.linkedin_url}" class="social-icon" target="_blank">in</a>` : ''}
                    <a href="#" class="social-icon">tw</a>
                    <a href="#" class="social-icon">em</a>
                </div>
            </div>
        `;
        
        alumniGrid.appendChild(alumniCard);
    });
}

// Function to update the alumni grid with API data
// function updateAlumniGrid(alumniData) {
//     // Clear the current grid
//     alumniGrid.innerHTML = '';
    
//     // If no results, display a message
//     if (alumniData.length === 0) {
//         alumniGrid.innerHTML = `
//             <div class="no-results">
//                 <h3>No alumni found</h3>
//                 <p>Try adjusting your filters or search term.</p>
//             </div>
//         `;
//         return;
//     }
    
//     // Calculate pagination
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const paginatedData = alumniData.slice(startIndex, endIndex);
    
//     // Create alumni cards for each item in the data
//     paginatedData.forEach(alumni => {
//         // Extract graduation year from the API response
//         const graduationYear = new Date(alumni.graduation_year * 1000).getFullYear();
        
//         // Create the alumni card
//         const alumniCard = document.createElement('div');
//         alumniCard.className = 'alumni-card';
        
//         // Determine program type based on job title or other fields
//         // This is a placeholder - you may need to adjust based on your actual data
//         let programType = 'B.Tech'; // Default
        
//         alumniCard.innerHTML = `
//             <div class="alumni-image">
//                 <img src="${alumni.profile_picture || '/api/placeholder/400/320'}" alt="${alumni.user || 'Alumni'}">
//             </div>
//             <div class="alumni-info">
//                 <h3 class="alumni-name">${alumni.user || 'Alumni'}</h3>
//                 <div class="alumni-batch">Batch of ${graduationYear} | ${programType}</div>
//                 <div class="alumni-role">${alumni.job_title || 'Not specified'}</div>
//                 <div class="alumni-company">${alumni.current_company || 'Not specified'}</div>
//                 <div class="alumni-social">
//                     ${alumni.linkedin_url ? `<a href="${alumni.linkedin_url}" class="social-icon" target="_blank">in</a>` : ''}
//                     <a href="#" class="social-icon">tw</a>
//                     <a href="#" class="social-icon">em</a>
//                 </div>
//             </div>
//         `;
        
//         alumniGrid.appendChild(alumniCard);
//     });
// }

// Function to update pagination based on total results
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Clear current pagination
    paginationContainer.innerHTML = '';
    
    // Don't show pagination if only one page
    if (totalPages <= 1) {
        return;
    }
    
    // Create pagination items
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        if (i === currentPage) {
            pageItem.classList.add('active');
        }
        pageItem.textContent = i;
        pageItem.dataset.page = i;
        paginationContainer.appendChild(pageItem);
    }
    
    // Add next button if needed
    if (totalPages > 5) {
        const nextButton = document.createElement('div');
        nextButton.className = 'page-item';
        nextButton.textContent = '>';
        nextButton.dataset.page = 'next';
        paginationContainer.appendChild(nextButton);
    }
}

// Handle pagination clicks
function handlePaginationClick(e) {
    if (!e.target.classList.contains('page-item')) {
        return;
    }
    
    const pageData = e.target.dataset.page;
    
    if (pageData === 'next') {
        if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
            currentPage++;
        }
    } else {
        currentPage = parseInt(pageData);
    }
    
    // Fetch alumni with the new page
    fetchAlumni();
    
    // Scroll to top of results
    window.scrollTo({
        top: filterForm.offsetTop,
        behavior: 'smooth'
    });
}

// Reset all filters and search
function resetFilters() {
    batchSelect.value = '';
    programSelect.value = '';
    industrySelect.value = '';
    locationSelect.value = '';
    searchInput.value = '';
    
    currentPage = 1;
    fetchAlumni();
}

// Helper function to format API data to display format
function formatApiData(apiData) {
    // This function can be expanded to convert API data format to display format
    // For example, converting graduation_year to a readable year format
    return apiData.map(item => {
        return {
            ...item,
            // Add any formatted fields here
        };
    });
}