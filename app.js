// Application state - stored in memory (no localStorage/sessionStorage due to sandbox restrictions)
let appState = {
    employees: [], // Will store API data
    submittedEmployees: [], // Will store form submissions
    currentView: 'table',
    isLoading: false
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadEmployees();
    
    // Set initial page
    navigateTo('dashboard');
}

function setupEventListeners() {
    // View mode toggle listeners
    const viewModeInputs = document.querySelectorAll('input[name="viewMode"]');
    viewModeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked) {
                switchView(this.value);
            }
        });
    });
    
    // Form submission listener
    const employeeForm = document.getElementById('employeeForm');
    employeeForm.addEventListener('submit', handleFormSubmission);
    
    // Form validation listeners
    const formInputs = employeeForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearValidation);
    });
}

// Navigation functions
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(page + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation active states
    updateNavigationActive(page);
}

function updateNavigationActive(currentPage) {
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
        }
    });
}

// API functions
async function loadEmployees() {
    setLoading(true);
    hideError();
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const employees = await response.json();
        
        // Store in application state
        appState.employees = employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email
        }));
        
        // Display employees in current view
        displayEmployees();
        
    } catch (error) {
        console.error('Error fetching employees:', error);
        showError('Failed to load employee data. Please check your internet connection and try again.');
    } finally {
        setLoading(false);
    }
}

function displayEmployees() {
    if (appState.employees.length === 0) {
        return;
    }
    
    // Display based on current view
    switch (appState.currentView) {
        case 'table':
            displayTableView();
            break;
        case 'cards':
            displayCardsView();
            break;
        case 'list':
            displayListView();
            break;
    }
}

// View switching functions
function switchView(viewType) {
    appState.currentView = viewType;
    
    // Hide all view containers
    document.querySelectorAll('.view-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Show selected view container
    const targetContainer = document.getElementById(viewType + 'ViewContainer');
    if (targetContainer) {
        targetContainer.style.display = 'block';
    }
    
    // Re-display employees in new view
    displayEmployees();
}

// Table view functions
function displayTableView() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    appState.employees.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.className = 'animate-slide-in';
        row.style.animationDelay = `${index * 0.05}s`;
        
        row.innerHTML = `
            <td><strong>#${employee.id}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="employee-list-avatar me-2">
                        ${getInitials(employee.name)}
                    </div>
                    <span>${escapeHtml(employee.name)}</span>
                </div>
            </td>
            <td>
                <i class="fas fa-envelope me-1 text-muted"></i>
                <span>${escapeHtml(employee.email)}</span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Cards view functions
function displayCardsView() {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';
    
    appState.employees.forEach((employee, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
        
        const card = document.createElement('div');
        card.className = 'employee-card animate-fade-in position-relative';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="employee-id">#${employee.id}</div>
            <div class="employee-avatar">
                ${getInitials(employee.name)}
            </div>
            <div class="employee-name">${escapeHtml(employee.name)}</div>
            <div class="employee-email">
                <i class="fas fa-envelope me-1"></i>
                ${escapeHtml(employee.email)}
            </div>
        `;
        
        col.appendChild(card);
        cardsGrid.appendChild(col);
    });
}

// List view functions
function displayListView() {
    const listGroup = document.getElementById('listGroup');
    listGroup.innerHTML = '';
    
    appState.employees.forEach((employee, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item list-group-item-action animate-slide-in';
        listItem.style.animationDelay = `${index * 0.05}s`;
        
        listItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="employee-list-avatar me-3">
                        ${getInitials(employee.name)}
                    </div>
                    <div>
                        <h6 class="mb-1">${escapeHtml(employee.name)}</h6>
                        <p class="mb-0 text-muted">
                            <i class="fas fa-envelope me-1"></i>
                            ${escapeHtml(employee.email)}
                        </p>
                    </div>
                </div>
                <span class="badge bg-primary rounded-pill">#${employee.id}</span>
            </div>
        `;
        
        listGroup.appendChild(listItem);
    });
}

// Form handling functions
function handleFormSubmission(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = {
        name: document.getElementById('employeeName').value.trim(),
        designation: document.getElementById('employeeDesignation').value,
        location: document.getElementById('employeeLocation').value.trim(),
        salary: parseInt(document.getElementById('employeeSalary').value)
    };
    
    // Add to submitted employees array
    appState.submittedEmployees.push({
        ...formData,
        id: Date.now(), // Simple ID generation
        submittedAt: new Date().toISOString()
    });
    
    // Show success message
    showSuccessMessage(`Employee "${formData.name}" has been added successfully!`);
    
    // Clear form
    clearForm();
    
    // Update submitted employees display
    displaySubmittedEmployees();
}

function validateForm() {
    const form = document.getElementById('employeeForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    
    // Specific validations
    if (value) {
        switch (input.type) {
            case 'text':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Must be at least 2 characters long.';
                }
                break;
            case 'number':
                const numValue = parseInt(value);
                if (numValue <= 0) {
                    isValid = false;
                    errorMessage = 'Must be a positive number.';
                }
                break;
        }
    }
    
    // Update UI based on validation
    if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        
        // Update error message
        const feedback = input.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = errorMessage;
        }
    }
    
    return isValid;
}

function clearValidation(event) {
    const input = event.target;
    input.classList.remove('is-valid', 'is-invalid');
}

function clearForm() {
    const form = document.getElementById('employeeForm');
    form.reset();
    
    // Remove validation classes
    form.querySelectorAll('input, select').forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
    
    // Hide success message
    document.getElementById('successMessage').style.display = 'none';
}

function displaySubmittedEmployees() {
    const section = document.getElementById('submittedEmployeesSection');
    const tbody = document.getElementById('submittedEmployeesBody');
    
    if (appState.submittedEmployees.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    tbody.innerHTML = '';
    
    // Show most recent submissions first
    const recentEmployees = [...appState.submittedEmployees].reverse().slice(0, 5);
    
    recentEmployees.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        row.style.animationDelay = `${index * 0.1}s`;
        
        row.innerHTML = `
            <td>
                <strong>${escapeHtml(employee.name)}</strong>
            </td>
            <td>
                <span class="badge bg-info">${escapeHtml(employee.designation)}</span>
            </td>
            <td>
                <i class="fas fa-map-marker-alt me-1 text-muted"></i>
                ${escapeHtml(employee.location)}
            </td>
            <td>
                <strong class="text-success">$${employee.salary.toLocaleString()}</strong>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Utility functions
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setLoading(isLoading) {
    appState.isLoading = isLoading;
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (isLoading) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    
    // Scroll error into view
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

function showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    successText.textContent = message;
    successDiv.style.display = 'block';
    
    // Scroll success message into view
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

// Handle browser navigation
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash && (hash === 'dashboard' || hash === 'employee-form')) {
        navigateTo(hash);
    }
});

// Initialize page based on URL hash
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && (hash === 'dashboard' || hash === 'employee-form')) {
        navigateTo(hash);
    }
});

// Add smooth scrolling for better UX
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Handle responsive behavior
function handleResponsive() {
    const navbar = document.querySelector('.navbar-collapse');
    
    // Close mobile menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (navbar.classList.contains('show')) {
                navbar.classList.remove('show');
            }
        });
    });
}

// Initialize responsive behavior
document.addEventListener('DOMContentLoaded', handleResponsive);

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        // Handle any resize-specific logic here if needed
        console.log('Window resized');
    }, 250);
});

// Add keyboard accessibility
document.addEventListener('keydown', function(e) {
    // ESC key to close modals or clear forms
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) {
            // Handle modal close if we had modals
        } else if (document.getElementById('employee-form-page').classList.contains('active')) {
            // Clear form when ESC is pressed on form page
            if (confirm('Are you sure you want to clear the form?')) {
                clearForm();
            }
        }
    }
    
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeForm = document.querySelector('.page-container.active form');
        if (activeForm) {
            activeForm.requestSubmit();
        }
    }
});

// Export functions for global access (if needed)
window.employeeDashboard = {
    navigateTo,
    loadEmployees,
    clearForm,
    switchView
};