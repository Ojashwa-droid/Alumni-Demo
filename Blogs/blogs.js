 // Global variables for pagination and search state
 let currentPage = 1;
 const postsPerPage = 6;
 let totalPosts = 0;
 let totalPages = 0;
 let currentCategory = 'all';
 let currentSearchTerm = '';

 // Wait for the DOM to load
 document.addEventListener('DOMContentLoaded', function() {
     // Initial load of blog posts
     fetchBlogPosts();

     // Set up search functionality
     const searchInput = document.getElementById('blog-search');
     const searchButton = document.getElementById('search-button');

     searchButton.addEventListener('click', function() {
         currentSearchTerm = searchInput.value.trim();
         currentPage = 1; // Reset to first page when searching
         fetchBlogPosts();
     });

     searchInput.addEventListener('keypress', function(e) {
         if (e.key === 'Enter') {
             currentSearchTerm = searchInput.value.trim();
             currentPage = 1; // Reset to first page when searching
             fetchBlogPosts();
         }
     });

     // Set up category filters
     const filterChips = document.querySelectorAll('.filter-chip');
     filterChips.forEach(chip => {
         chip.addEventListener('click', function() {
             // Remove active class from all chips
             filterChips.forEach(c => c.classList.remove('active'));
             
             // Add active class to clicked chip
             this.classList.add('active');
             
             // Update current category
             currentCategory = this.getAttribute('data-category');
             currentPage = 1; // Reset to first page when changing category
             fetchBlogPosts();
         });
     });
 });

 // Function to fetch blog posts from the API
 function fetchBlogPosts() {
     showLoading(true);
     
     // Build API URL with query parameters
     let apiUrl = 'http://51.20.139.242/blog/posts/?page=' + currentPage + '&limit=' + postsPerPage;
     
     if (currentSearchTerm) {
         apiUrl += '&search=' + encodeURIComponent(currentSearchTerm);
     }
     
     if (currentCategory !== 'all') {
         apiUrl += '&category=' + encodeURIComponent(currentCategory);
     }
     
     // Order by published date (newest first)
     apiUrl += '&ordering=-published_at';
     
     // Fetch data from API
     fetch(apiUrl)
         .then(response => {
             if (!response.ok) {
                 throw new Error('Network response was not ok');
             }
             return response.json();
         })
         .then(data => {
             processApiResponse(data);
         })
         .catch(error => {
             console.error('Error fetching blog posts:', error);
             showError('Failed to load blog posts. Please try again later.');
         })
         .finally(() => {
             showLoading(false);
         });
 }

 // Function to process API response and render blog posts
 function processApiResponse(data) {
     const blogsContainer = document.getElementById('blogs-container');
     const noResultsElement = document.getElementById('no-results');
     
     // Clear existing blog posts
     blogsContainer.innerHTML = '';
     
     // If we have posts data and total count
     if (data && Array.isArray(data.results)) {
         totalPosts = data.count || data.results.length;
         totalPages = Math.ceil(totalPosts / postsPerPage);
         
         if (data.results.length === 0) {
             noResultsElement.style.display = 'block';
             updatePagination(0);
         } else {
             noResultsElement.style.display = 'none';
             renderBlogPosts(data.results);
             updatePagination(totalPages);
         }
     } else {
         // Handle case where data is in a different format (like the API example provided)
         if (Array.isArray(data)) {
             if (data.length === 0) {
                 noResultsElement.style.display = 'block';
                 updatePagination(0);
             } else {
                 noResultsElement.style.display = 'none';
                 renderBlogPosts(data);
                 // We don't have total count in this format, so we estimate
                 totalPosts = data.length;
                 totalPages = Math.ceil(totalPosts / postsPerPage);
                 updatePagination(totalPages);
             }
         } else {
             showError('Invalid data format received from the server.');
         }
     }
 }

 // Function to render blog posts to the DOM
 function renderBlogPosts(posts) {
     const blogsContainer = document.getElementById('blogs-container');
     
     // Generate placeholder image URLs based on category
     const categoryImages = {
         'career': 'https://via.placeholder.com/300x180?text=Career',
         'education': 'https://via.placeholder.com/300x180?text=Education',
         'technology': 'https://via.placeholder.com/300x180?text=Technology',
         'campus': 'https://via.placeholder.com/300x180?text=Campus+Life',
         'reunion': 'https://via.placeholder.com/300x180?text=Reunion',
         'default': 'https://via.placeholder.com/300x180?text=SRM+Alumni'
     };
     
     // Process each blog post
     posts.forEach((post, index) => {
         // Extract category from category_name or use default
         const category = post.category_name ? post.category_name.toLowerCase() : 'default';
         const imageUrl = categoryImages[category] || categoryImages.default;
         
         // Calculate animation delay based on index
         const animationDelay = (index % postsPerPage) * 0.1;
         
         // Format date if available
         let formattedDate = 'Draft';
         if (post.published_at) {
             const date = new Date(post.published_at);
             formattedDate = date.toLocaleDateString('en-US', { 
                 day: 'numeric', 
                 month: 'short', 
                 year: 'numeric' 
             });
         }
         
         // Create blog card element
         const blogCard = document.createElement('div');
         blogCard.className = 'blog-card';
         blogCard.style.animationDelay = `${animationDelay}s`;
         
         // Set HTML content for the blog card
         blogCard.innerHTML = `
             <div class="blog-content">
                 <span class="blog-category">${post.category_name || 'Uncategorized'}</span>
                 <h3 class="blog-title">${post.title}</h3>
                 <div class="blog-meta">
                     <span><i class="far fa-user"></i> ${post.author?.name || 'Anonymous'}</span>
                     <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                 </div>
                 <p class="blog-description">
                     ${post.excerpt || 'Click to read this interesting article by an SRM alumnus.'}
                 </p>
                 <a href="/blog/${post.id}" class="blog-read-more">
                     Read More <i class="fas fa-arrow-right"></i>
                 </a>
             </div>
         `;
         
         // Add to container
         blogsContainer.appendChild(blogCard);
         
         // Trigger animation after a small delay
         setTimeout(() => {
             blogCard.classList.add('animated');
         }, 50);
     });
 }

 // Function to update pagination controls
 function updatePagination(totalPages) {
     const paginationElement = document.getElementById('pagination');
     paginationElement.innerHTML = '';
     
     if (totalPages <= 1) {
         paginationElement.style.display = 'none';
         return;
     }
     
     paginationElement.style.display = 'flex';
     
     // Add previous button
     const prevButton = document.createElement('button');
     prevButton.className = 'page-btn';
     prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
     prevButton.disabled = currentPage === 1;
     prevButton.addEventListener('click', function() {
         if (currentPage > 1) {
             currentPage--;
             fetchBlogPosts();
             scrollToTop();
         }
     });
     paginationElement.appendChild(prevButton);
     
     // Determine which page buttons to show
     let startPage = Math.max(1, currentPage - 2);
     let endPage = Math.min(totalPages, currentPage + 2);
     
     // Ensure we always show 5 pages if available
     if (endPage - startPage < 4 && totalPages > 4) {
         if (currentPage < totalPages - 2) {
             endPage = Math.min(startPage + 4, totalPages);
         } else {
             startPage = Math.max(endPage - 4, 1);
         }
     }
     
     // Add first page button if needed
     if (startPage > 1) {
         addPageButton(1);
         if (startPage > 2) {
             addEllipsis();
         }
     }
     
     // Add page buttons
     for (let i = startPage; i <= endPage; i++) {
         addPageButton(i);
     }
     
     // Add last page button if needed
     if (endPage < totalPages) {
         if (endPage < totalPages - 1) {
             addEllipsis();
         }
         addPageButton(totalPages);
     }
     
     // Add next button
     const nextButton = document.createElement('button');
     nextButton.className = 'page-btn';
     nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
     nextButton.disabled = currentPage === totalPages;
     nextButton.addEventListener('click', function() {
         if (currentPage < totalPages) {
             currentPage++;
             fetchBlogPosts();
             scrollToTop();
         }
     });
     paginationElement.appendChild(nextButton);
     
     // Helper function to add page button
     function addPageButton(pageNum) {
         const button = document.createElement('button');
         button.className = 'page-btn' + (pageNum === currentPage ? ' active' : '');
         button.textContent = pageNum;
         button.addEventListener('click', function() {
             if (pageNum !== currentPage) {
                 currentPage = pageNum;
                 fetchBlogPosts();
                 scrollToTop();
             }
         });
         paginationElement.appendChild(button);
     }
     
     // Helper function to add ellipsis
     function addEllipsis() {
         const ellipsis = document.createElement('span');
         ellipsis.className = 'page-btn';
         ellipsis.textContent = '...';
         ellipsis.style.cursor = 'default';
         paginationElement.appendChild(ellipsis);
     }
 }

 // Helper function to show/hide loading spinner
 function showLoading(isLoading) {
     const loadingElement = document.getElementById('loading');
     const blogsContainer = document.getElementById('blogs-container');
     
     if (isLoading) {
         loadingElement.style.display = 'block';
         blogsContainer.style.display = 'none';
     } else {
         loadingElement.style.display = 'none';
         blogsContainer.style.display = 'grid';
     }
 }

 // Helper function to show error message
 function showError(message) {
     const blogsContainer = document.getElementById('blogs-container');
     blogsContainer.innerHTML = `
         <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 30px; color: #f44336;">
             <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 15px;"></i>
             <p>${message}</p>
         </div>
     `;
 }

 // Helper function to scroll to top of blogs section
 function scrollToTop() {
     const searchSection = document.querySelector('.search-section');
     searchSection.scrollIntoView({ behavior: 'smooth' });
 }

 // Add animation to blog cards when they come into view
 function handleIntersection(entries, observer) {
     entries.forEach(entry => {
         if (entry.isIntersecting) {
             entry.target.classList.add('animated');
             observer.unobserve(entry.target);
         }
     });
 }

 // Create intersection observer
 const observer = new IntersectionObserver(handleIntersection, {
     root: null,
     threshold: 0.1
 });

 // Apply animation to all elements with fade-in class
 document.querySelectorAll('.blog-card').forEach(card => {
     observer.observe(card);
 });