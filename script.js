// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const gratuityForm = document.getElementById('gratuityForm');
const resultCard = document.getElementById('resultCard');
const includeAllowancesCheckbox = document.getElementById('includeAllowances');
const allowancesGroup = document.getElementById('allowancesGroup');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Toggle allowances input field
includeAllowancesCheckbox.addEventListener('change', function() {
    if (this.checked) {
        allowancesGroup.style.display = 'block';
        allowancesGroup.classList.add('fadeIn');
    } else {
        allowancesGroup.style.display = 'none';
        document.getElementById('allowances').value = '';
    }
});

// Form submission handler
gratuityForm.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateGratuity();
});

// Input validation and formatting
document.getElementById('basicSalary').addEventListener('input', function(e) {
    if (e.target.value < 0) e.target.value = 0;
});

document.getElementById('yearsWorked').addEventListener('input', function(e) {
    if (e.target.value < 0) e.target.value = 0;
});

document.getElementById('monthsWorked').addEventListener('input', function(e) {
    if (e.target.value < 0) e.target.value = 0;
    if (e.target.value > 11) e.target.value = 11;
});

document.getElementById('allowances').addEventListener('input', function(e) {
    if (e.target.value < 0) e.target.value = 0;
});

function calculateGratuity() {
    // Get form values
    const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    const yearsWorked = parseFloat(document.getElementById('yearsWorked').value) || 0;
    const monthsWorked = parseInt(document.getElementById('monthsWorked').value) || 0;
    const includeAllowances = document.getElementById('includeAllowances').checked;
    const allowances = includeAllowances ? (parseFloat(document.getElementById('allowances').value) || 0) : 0;

    // Validation
    if (basicSalary <= 0) {
        alert('Please enter a valid basic salary amount.');
        return;
    }

    if (yearsWorked < 0 || monthsWorked < 0) {
        alert('Please enter valid service period.');
        return;
    }

    // Calculate total service period in years
    const totalServiceYears = yearsWorked + (monthsWorked / 12);
    
    // Calculate monthly salary (basic + allowances if included)
    const monthlySalary = basicSalary + allowances;
    
    // Calculate annual salary
    const annualSalary = monthlySalary * 12;

    let gratuityAmount = 0;
    let calculationBreakdown = [];

    if (totalServiceYears < 1) {
        // No gratuity for less than 1 year
        gratuityAmount = 0;
        calculationBreakdown.push({
            description: "Service period less than 1 year",
            calculation: "No gratuity eligible",
            amount: 0
        });
    } else {
        // Calculate gratuity based on UAE Labor Law
        if (totalServiceYears <= 5) {
            // First 5 years: 21 days salary for each year
            const eligibleYears = totalServiceYears;
            const dailySalary = monthlySalary / 30;
            gratuityAmount = eligibleYears * 21 * dailySalary;
            
            calculationBreakdown.push({
                description: `Service period: ${eligibleYears.toFixed(2)} years (≤5 years)`,
                calculation: `${eligibleYears.toFixed(2)} years × 21 days × AED ${dailySalary.toFixed(2)} (daily salary)`,
                amount: gratuityAmount
            });
        } else {
            // First 5 years: 21 days salary per year
            // Additional years: 30 days salary per year
            const dailySalary = monthlySalary / 30;
            
            // First 5 years calculation
            const first5YearsGratuity = 5 * 21 * dailySalary;
            calculationBreakdown.push({
                description: "First 5 years of service",
                calculation: `5 years × 21 days × AED ${dailySalary.toFixed(2)} (daily salary)`,
                amount: first5YearsGratuity
            });
            
            // Additional years calculation
            const additionalYears = totalServiceYears - 5;
            const additionalYearsGratuity = additionalYears * 30 * dailySalary;
            calculationBreakdown.push({
                description: `Additional ${additionalYears.toFixed(2)} years of service`,
                calculation: `${additionalYears.toFixed(2)} years × 30 days × AED ${dailySalary.toFixed(2)} (daily salary)`,
                amount: additionalYearsGratuity
            });
            
            gratuityAmount = first5YearsGratuity + additionalYearsGratuity;
        }
    }

    // Apply maximum limit (2 years salary)
    const maxGratuity = annualSalary * 2;
    const isLimited = gratuityAmount > maxGratuity;
    
    if (isLimited) {
        calculationBreakdown.push({
            description: "Maximum limit applied",
            calculation: `Limited to 2 years' salary (AED ${maxGratuity.toFixed(2)})`,
            amount: maxGratuity - gratuityAmount
        });
        gratuityAmount = maxGratuity;
    }

    // Display results
    displayResults({
        totalGratuity: gratuityAmount,
        serviceYears: totalServiceYears,
        monthlySalary: monthlySalary,
        calculationBreakdown: calculationBreakdown,
        isLimited: isLimited,
        maxGratuity: maxGratuity
    });
}

function displayResults(results) {
    // Update result values
    document.getElementById('totalGratuity').textContent = `AED ${results.totalGratuity.toLocaleString('en-AE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('serviceYears').textContent = `${results.serviceYears.toFixed(2)} years`;
    document.getElementById('monthlySalary').textContent = `AED ${results.monthlySalary.toLocaleString('en-AE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    // Build calculation breakdown
    const breakdownContainer = document.getElementById('calculationBreakdown');
    breakdownContainer.innerHTML = '<h4>Calculation Breakdown:</h4>';
    
    let runningTotal = 0;
    results.calculationBreakdown.forEach((item, index) => {
        const breakdownDiv = document.createElement('div');
        breakdownDiv.className = 'breakdown-item';
        
        if (index === results.calculationBreakdown.length - 1 && results.isLimited) {
            // This is the maximum limit adjustment
            breakdownDiv.innerHTML = `
                <div>
                    <strong>${item.description}</strong><br>
                    <small>${item.calculation}</small>
                </div>
                <div style="color: var(--warning-color);">AED ${item.amount.toLocaleString('en-AE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            `;
        } else {
            runningTotal += item.amount;
            breakdownDiv.innerHTML = `
                <div>
                    <strong>${item.description}</strong><br>
                    <small>${item.calculation}</small>
                </div>
                <div>AED ${item.amount.toLocaleString('en-AE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            `;
        }
        
        breakdownContainer.appendChild(breakdownDiv);
    });

    // Add total row
    const totalDiv = document.createElement('div');
    totalDiv.className = 'breakdown-item';
    totalDiv.innerHTML = `
        <div><strong>Total Gratuity Amount:</strong></div>
        <div style="color: var(--success-color); font-size: 1.2em;"><strong>AED ${results.totalGratuity.toLocaleString('en-AE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></div>
    `;
    breakdownContainer.appendChild(totalDiv);

    // Show result card with animation
    resultCard.style.display = 'block';
    resultCard.classList.add('fadeIn');
    
    // Scroll to results
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation to calculate button
const calculateBtn = document.querySelector('.calculate-btn');
const originalBtnText = calculateBtn.textContent;

calculateBtn.addEventListener('click', function() {
    calculateBtn.innerHTML = '<span>Calculating...</span>';
    calculateBtn.disabled = true;
    
    setTimeout(() => {
        calculateBtn.innerHTML = originalBtnText;
        calculateBtn.disabled = false;
    }, 1000);
});

// Add form field animations
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Preload check for filled fields
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.form-group input').forEach(input => {
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
});

// Add copy result functionality
function addCopyFunctionality() {
    const resultSummary = document.querySelector('.result-summary');
    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = '📋 Copy Results';
    copyBtn.className = 'copy-btn';
    copyBtn.style.cssText = `
        background: var(--accent-color);
        color: var(--dark-color);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
        font-weight: 600;
        transition: var(--transition);
    `;
    
    copyBtn.addEventListener('click', function() {
        const totalGratuity = document.getElementById('totalGratuity').textContent;
        const serviceYears = document.getElementById('serviceYears').textContent;
        const monthlySalary = document.getElementById('monthlySalary').textContent;
        
        const resultText = `UAE Gratuity Calculation Results:
Total Gratuity: ${totalGratuity}
Service Period: ${serviceYears}
Monthly Salary: ${monthlySalary}

Calculated using UAE Labor Law regulations
Source: UAE Gratuity Calculator`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(resultText).then(() => {
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy Results';
                }, 2000);
            });
        }
    });
    
    resultSummary.appendChild(copyBtn);
}

// Add copy functionality after results are displayed
const originalDisplayResults = displayResults;
displayResults = function(results) {
    originalDisplayResults(results);
    setTimeout(addCopyFunctionality, 500);
};

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (document.getElementById('basicSalary').value && document.getElementById('yearsWorked').value) {
            calculateGratuity();
        }
    }
});

// Add tooltips for better UX
const tooltips = {
    'basicSalary': 'Enter your basic monthly salary in AED (excluding allowances unless checked below)',
    'yearsWorked': 'Enter the number of years you have worked (can include decimal for partial years)',
    'monthsWorked': 'Enter any additional months beyond the years (0-11 months)',
    'allowances': 'Include housing, transport, and other regular monthly allowances in AED'
};

Object.keys(tooltips).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.title = tooltips[fieldId];
        field.addEventListener('mouseenter', function() {
            // Could add custom tooltip implementation here
        });
    }
});