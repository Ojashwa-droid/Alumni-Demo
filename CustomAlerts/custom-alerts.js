function showCustomAlert(message, type = "error", duration = 5000) { // Increased default duration to 5 seconds
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('custom-alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'custom-alert-container';
        document.body.appendChild(alertContainer);
        
        // Add styles to the alert container
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '9999';
        alertContainer.style.display = 'flex';
        alertContainer.style.flexDirection = 'column';
        alertContainer.style.alignItems = 'flex-end';
        alertContainer.style.gap = '10px';
    }
    
    // Create the alert element
    const alertEl = document.createElement('div');
    alertEl.className = `custom-alert ${type}`;
    
    // Set alert styles
    alertEl.style.padding = '15px 20px'; // Slightly larger padding
    alertEl.style.borderRadius = '6px'; // Slightly rounder corners
    alertEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; // More prominent shadow
    alertEl.style.display = 'flex';
    alertEl.style.alignItems = 'center';
    alertEl.style.minWidth = '300px';
    alertEl.style.maxWidth = '450px';
    alertEl.style.animation = 'slideIn 0.4s ease-out forwards'; // Slightly slower animation
    alertEl.style.position = 'relative';
    alertEl.style.cursor = 'pointer';
    alertEl.style.fontSize = '15px'; // Slightly larger text
    alertEl.style.fontWeight = '500'; // Semi-bold text
    
    // Set color based on alert type
    if (type === 'error') {
        alertEl.style.backgroundColor = '#f8d7da';
        alertEl.style.color = '#721c24';
        alertEl.style.borderLeft = '5px solid #dc3545';
    } else if (type === 'success') {
        alertEl.style.backgroundColor = '#d4edda';
        alertEl.style.color = '#155724';
        alertEl.style.borderLeft = '5px solid #28a745';
    } else if (type === 'warning') {
        alertEl.style.backgroundColor = '#fff3cd';
        alertEl.style.color = '#856404';
        alertEl.style.borderLeft = '5px solid #ffc107';
    } else if (type === 'info') {
        alertEl.style.backgroundColor = '#d1ecf1';
        alertEl.style.color = '#0c5460';
        alertEl.style.borderLeft = '5px solid #17a2b8';
    }
    
    // Create icon based on type
    const icons = {
        error: '✕',
        success: '✓',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const iconSpan = document.createElement('span');
    iconSpan.style.marginRight = '12px';
    iconSpan.style.fontWeight = 'bold';
    iconSpan.style.fontSize = '18px'; // Larger icon
    iconSpan.textContent = icons[type] || 'ℹ';
    
    // Create message element
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    messageEl.style.flex = '1';
    
    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.marginLeft = '12px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.fontSize = '22px'; // Larger close button
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.opacity = '0.7';
    closeBtn.style.transition = 'opacity 0.2s';
    
    // Add hover effect to close button
    closeBtn.onmouseover = function() {
        this.style.opacity = '1';
    };
    closeBtn.onmouseout = function() {
        this.style.opacity = '0.7';
    };
    
    // Append elements to alert
    alertEl.appendChild(iconSpan);
    alertEl.appendChild(messageEl);
    alertEl.appendChild(closeBtn);
    
    // Append alert to container
    alertContainer.appendChild(alertEl);
    
    // Create a function to remove the alert
    const removeAlert = () => {
        alertEl.style.animation = 'slideOut 0.4s ease-in forwards';
        setTimeout(() => {
            if (alertContainer.contains(alertEl)) {
                alertContainer.removeChild(alertEl);
            }
            
            // Remove container if no more alerts
            if (alertContainer.children.length === 0) {
                document.body.removeChild(alertContainer);
            }
        }, 400); // Match this to animation duration
    };
    
    // Set click handlers
    closeBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent the alert's click handler from firing
        removeAlert();
    };
    
    alertEl.onclick = removeAlert;
    
    // Add visual cue for duration
    if (duration > 0) {
        // Create progress bar for visual indication of timeout
        const progressBar = document.createElement('div');
        progressBar.style.position = 'absolute';
        progressBar.style.bottom = '0';
        progressBar.style.left = '0';
        progressBar.style.height = '3px';
        progressBar.style.width = '100%';
        progressBar.style.borderRadius = '0 0 6px 6px';
        
        // Set progress bar color based on type
        if (type === 'error') {
            progressBar.style.backgroundColor = '#dc3545';
        } else if (type === 'success') {
            progressBar.style.backgroundColor = '#28a745';
        } else if (type === 'warning') {
            progressBar.style.backgroundColor = '#ffc107';
        } else if (type === 'info') {
            progressBar.style.backgroundColor = '#17a2b8';
        }
        
        alertEl.appendChild(progressBar);
        
        // Animate the progress bar
        progressBar.style.transition = `width ${duration}ms linear`;
        
        // Force a reflow to make sure the transition works
        progressBar.getBoundingClientRect();
        
        progressBar.style.width = '0';
        
        // Auto-dismiss after duration
        setTimeout(removeAlert, duration);
    }
    
    return alertEl;
}

// Add CSS animations to the document
function addAnimationStyles() {
    // Check if styles have already been added
    if (document.getElementById('custom-alert-styles')) {
        return;
    }
    
    const styleEl = document.createElement('style');
    styleEl.id = 'custom-alert-styles';
    styleEl.innerHTML = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .custom-alert {
            transition: all 0.3s ease;
        }
        
        .custom-alert:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(styleEl);
}

// Call this function once when the page loads
addAnimationStyles();