// Loan type configurations
const loanConfigs = {
    'construction': {
        interestRate: 0.1199, // 11.99%
        points: 0.02, // 2 points
        closingCosts: 0.02, // 2% of loan amount
        closingTime: 5 // days
    },
    'fix-flip': {
        interestRate: 0.1099, // 10.99%
        points: 0.02, // 2 points
        closingCosts: 0.02, // 2% of loan amount
        closingTime: 5 // days
    },
    'bridge': {
        interestRate: 0.1199, // 11.99%
        points: 0.02, // 2 points
        closingCosts: 0.02, // 2% of loan amount
        closingTime: 5 // days
    },
    'dscr': {
        interestRate: 0.075, // 7.5%
        points: 0.02, // 2 points
        closingCosts: 0.02, // 2% of loan amount
        closingTime: 5 // days
    }
};

// Traditional loan configuration
const traditionalConfig = {
    interestRate: 0.065, // 6.5%
    points: 0.01, // 1 point
    closingCosts: 0.03, // 3% of loan amount
    closingTime: 45, // days
    downPaymentPercent: 0.25 // 25%
};

// Update number inputs when sliders change
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for range inputs
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        const numberInput = document.getElementById(slider.id + 'Value');
        if (!numberInput) return; // Skip if number input doesn't exist
        
        // Update number input when slider changes
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            numberInput.value = formatNumber(value);
            calculateAndDisplayResults();
        });

        // Update slider when number input changes
        numberInput.addEventListener('input', () => {
            const rawValue = numberInput.value.replace(/,/g, '');
            const value = parseFloat(rawValue);
            if (!isNaN(value)) {
                slider.value = value;
                calculateAndDisplayResults();
            }
        });

        // Set initial value
        numberInput.value = formatNumber(slider.value);
    });

    // Add event listener for loan type change
    document.getElementById('loanType').addEventListener('change', calculateAndDisplayResults);

    // Initial calculation
    calculateAndDisplayResults();
});

function calculateAndDisplayResults() {
    // Get values from the range inputs
    const purchasePrice = parseFloat(document.getElementById('loanAmount').value);
    const arv = parseFloat(document.getElementById('propertyValue').value);
    const renovationCost = parseFloat(document.getElementById('renovationCost').value);
    const holdingPeriod = parseInt(document.getElementById('loanTerm').value);
    const loanType = document.getElementById('loanType').value;
    
    const config = loanConfigs[loanType];
    const totalLoanAmount = Math.round(purchasePrice + renovationCost);

    // Calculate traditional loan values
    const traditionalDownPayment = Math.round(purchasePrice * traditionalConfig.downPaymentPercent);
    const traditionalTotalCost = Math.round(totalLoanAmount * (traditionalConfig.interestRate * (holdingPeriod / 12) + traditionalConfig.points + traditionalConfig.closingCosts));
    const traditionalOpportunityCost = Math.round(calculateOpportunityCost(totalLoanAmount, traditionalConfig.closingTime));
    const traditionalCapitalRequired = Math.round(calculateCapitalRequired(purchasePrice, renovationCost, traditionalConfig.downPaymentPercent));
    const traditionalROI = calculateROI(arv, totalLoanAmount, traditionalCapitalRequired);

    // Calculate LiteDoc loan values
    const liteDocDownPayment = Math.round(purchasePrice * 0.15);
    const liteDocTotalCost = Math.round(totalLoanAmount * (config.interestRate * (holdingPeriod / 12) + config.points + config.closingCosts));
    const liteDocOpportunityCost = Math.round(calculateOpportunityCost(totalLoanAmount, config.closingTime));
    const liteDocCapitalRequired = Math.round(calculateCapitalRequired(purchasePrice, 0, 0.15));
    const liteDocROI = calculateROI(arv, totalLoanAmount, liteDocCapitalRequired);

    // Calculate differences
    const downPaymentDifference = Math.round(traditionalDownPayment - liteDocDownPayment);
    const totalCostDifference = Math.round(liteDocTotalCost - traditionalTotalCost);
    const opportunityCostDifference = Math.round(traditionalOpportunityCost - liteDocOpportunityCost);
    const capitalRequiredDifference = Math.round(traditionalCapitalRequired - liteDocCapitalRequired);
    const roiDifference = liteDocROI - traditionalROI;

    // Update summary
    const totalSavings = Math.round(downPaymentDifference + opportunityCostDifference);
    const timeSaved = traditionalConfig.closingTime - config.closingTime;

    // Update summary section
    document.querySelector('.results-summary p').innerHTML = `Using LiteDoc Loans could save you approximately <span id="totalSavings" class="savings-highlight">${formatCurrency(totalSavings)}</span> and help you close <span id="timeSaved" class="savings-highlight">${timeSaved}</span> days faster compared to traditional financing.`;

    // Update comparison table
    document.getElementById('traditionalDownPayment').textContent = formatCurrency(traditionalDownPayment);
    document.getElementById('liteDocDownPayment').textContent = formatCurrency(liteDocDownPayment);
    document.getElementById('downPaymentDifference').textContent = formatCurrency(downPaymentDifference) + ' less';

    document.getElementById('traditionalRenovation').textContent = formatCurrency(renovationCost);
    document.getElementById('liteDocRenovation').textContent = '$0';
    document.getElementById('renovationDifference').textContent = formatCurrency(renovationCost) + ' less';

    document.getElementById('traditionalTotalCost').textContent = formatCurrency(traditionalTotalCost);
    document.getElementById('liteDocTotalCost').textContent = formatCurrency(liteDocTotalCost);
    document.getElementById('totalCostDifference').textContent = formatCurrency(totalCostDifference) + ' more';

    document.getElementById('traditionalClosingTime').textContent = traditionalConfig.closingTime + ' days';
    document.getElementById('liteDocClosingTime').textContent = config.closingTime + ' days';
    document.getElementById('closingTimeDifference').textContent = timeSaved + ' days faster';

    document.getElementById('traditionalOpportunityCost').textContent = formatCurrency(traditionalOpportunityCost);
    document.getElementById('liteDocOpportunityCost').textContent = formatCurrency(liteDocOpportunityCost);
    document.getElementById('opportunityCostDifference').textContent = formatCurrency(opportunityCostDifference) + ' less';

    document.getElementById('traditionalCapitalRequired').textContent = formatCurrency(traditionalCapitalRequired);
    document.getElementById('liteDocCapitalRequired').textContent = formatCurrency(liteDocCapitalRequired);
    document.getElementById('capitalRequiredDifference').textContent = formatCurrency(capitalRequiredDifference) + ' less';

    document.getElementById('traditionalROI').textContent = formatPercentage(traditionalROI);
    document.getElementById('liteDocROI').textContent = formatPercentage(liteDocROI);
    document.getElementById('roiDifference').textContent = formatPercentage(roiDifference) + ' more';
}

// Calculate LTV
function calculateLTV(loanAmount, propertyValue) {
    return Math.round(loanAmount / propertyValue * 100);
}

// Calculate monthly payment (interest only)
function calculateMonthlyPayment(loanAmount, interestRate) {
    return Math.round(loanAmount * interestRate / 12);
}

// Calculate total interest
function calculateTotalInterest(loanAmount, interestRate, term) {
    return Math.round(loanAmount * interestRate * (term / 12));
}

// Calculate opportunity cost
function calculateOpportunityCost(loanAmount, days) {
    const dailyRate = 0.0005; // 0.05% per day
    return Math.round(loanAmount * dailyRate * days);
}

// Calculate capital required
function calculateCapitalRequired(loanAmount, renovationCost, downPaymentPercent) {
    return Math.round(loanAmount * downPaymentPercent + renovationCost);
}

// Calculate potential ROI
function calculateROI(propertyValue, loanAmount, capitalRequired) {
    return ((propertyValue - loanAmount) / capitalRequired) * 100;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(value));
}

function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(value));
}

function formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

// Modal functionality
const modal = document.getElementById('emailModal');
const getReportBtn = document.getElementById('getReportBtn');
const closeBtn = document.querySelector('.close');
const emailForm = document.getElementById('emailForm');

getReportBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Generate detailed report
function generateDetailedReport() {
    const purchasePrice = parseFloat(document.getElementById('loanAmount').value.replace(/,/g, ''));
    const arv = parseFloat(document.getElementById('propertyValue').value.replace(/,/g, ''));
    const renovationCost = parseFloat(document.getElementById('renovationCost').value.replace(/,/g, ''));
    const holdingPeriod = parseInt(document.getElementById('loanTerm').value);
    const loanType = document.getElementById('loanType').value;
    
    const config = loanConfigs[loanType];
    const totalLoanAmount = Math.round(purchasePrice + renovationCost);

    // Calculate traditional loan values
    const traditionalDownPayment = Math.round(purchasePrice * traditionalConfig.downPaymentPercent);
    const traditionalTotalCost = Math.round(totalLoanAmount * (traditionalConfig.interestRate * (holdingPeriod / 12) + traditionalConfig.points + traditionalConfig.closingCosts));
    const traditionalOpportunityCost = Math.round(calculateOpportunityCost(totalLoanAmount, traditionalConfig.closingTime));
    const traditionalCapitalRequired = Math.round(calculateCapitalRequired(purchasePrice, renovationCost, traditionalConfig.downPaymentPercent));
    const traditionalROI = calculateROI(arv, totalLoanAmount, traditionalCapitalRequired);

    const liteDocDownPayment = Math.round(purchasePrice * 0.15);
    const liteDocTotalCost = Math.round(totalLoanAmount * (config.interestRate * (holdingPeriod / 12) + config.points + config.closingCosts));
    const liteDocOpportunityCost = Math.round(calculateOpportunityCost(totalLoanAmount, config.closingTime));
    const liteDocCapitalRequired = Math.round(calculateCapitalRequired(purchasePrice, 0, 0.15));
    const liteDocROI = calculateROI(arv, totalLoanAmount, liteDocCapitalRequired);

    const totalSavings = Math.round(traditionalDownPayment - liteDocDownPayment + traditionalOpportunityCost - liteDocOpportunityCost);

    return `
        <h1>Detailed Financing Comparison Report</h1>
        <h2>Property Details</h2>
        <p>Purchase Price: ${formatCurrency(purchasePrice)}</p>
        <p>After Repair Value: ${formatCurrency(arv)}</p>
        <p>Renovation Budget: ${formatCurrency(renovationCost)}</p>
        <p>Loan Term: ${holdingPeriod} months</p>
        <p>Loan Type: ${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan</p>

        <h2>Traditional Financing</h2>
        <p>Down Payment Required: ${formatCurrency(traditionalDownPayment)}</p>
        <p>Out-of-Pocket Renovation Costs: ${formatCurrency(renovationCost)}</p>
        <p>Total Financing Costs: ${formatCurrency(traditionalTotalCost)}</p>
        <p>Time to Closing: ${traditionalConfig.closingTime} days</p>
        <p>Opportunity Cost: ${formatCurrency(traditionalOpportunityCost)}</p>
        <p>Capital Required: ${formatCurrency(traditionalCapitalRequired)}</p>
        <p>Potential ROI: ${formatPercentage(traditionalROI)}</p>

        <h2>LiteDoc Loans</h2>
        <p>Down Payment Required: ${formatCurrency(liteDocDownPayment)}</p>
        <p>Out-of-Pocket Renovation Costs: $0</p>
        <p>Total Financing Costs: ${formatCurrency(liteDocTotalCost)}</p>
        <p>Time to Closing: ${config.closingTime} days</p>
        <p>Opportunity Cost: ${formatCurrency(liteDocOpportunityCost)}</p>
        <p>Capital Required: ${formatCurrency(liteDocCapitalRequired)}</p>
        <p>Potential ROI: ${formatPercentage(liteDocROI)}</p>

        <h2>Summary</h2>
        <p>Total Savings with LiteDoc: ${formatCurrency(totalSavings)}</p>
        <p>Time Saved: ${traditionalConfig.closingTime - config.closingTime} days</p>
    `;
}

// Handle email form submission
emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const report = generateDetailedReport();

    try {
        const response = await fetch('/send-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                report
            })
        });

        if (response.ok) {
            alert('Your detailed report has been sent to your email address!');
            modal.style.display = 'none';
            emailForm.reset();
        } else {
            throw new Error('Failed to send report');
        }
    } catch (error) {
        alert('Sorry, there was an error sending your report. Please try again later.');
        console.error('Error:', error);
    }
}); 