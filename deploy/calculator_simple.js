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

// Initialize the calculator when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing calculator...");
    
    // Set initial values for all inputs
    setInitialValues();
    
    // Set up event listeners for all sliders and number inputs
    setupInputListeners();
    
    // Add event listener for loan type change
    document.getElementById('loanType').addEventListener('change', calculateAndDisplayResults);
    
    // Perform initial calculation
    calculateAndDisplayResults();
});

// Set initial values for all inputs
function setInitialValues() {
    console.log("Setting initial values...");
    
    // Set initial values for range inputs
    const loanAmountSlider = document.getElementById('loanAmount');
    const propertyValueSlider = document.getElementById('propertyValue');
    const renovationCostSlider = document.getElementById('renovationCost');
    const loanTermSlider = document.getElementById('loanTerm');
    
    // Set slider values
    loanAmountSlider.value = 150000;
    propertyValueSlider.value = 200000;
    renovationCostSlider.value = 50000;
    loanTermSlider.value = 12;
    
    // Set number input values directly
    const loanAmountValue = document.getElementById('loanAmountValue');
    const propertyValueValue = document.getElementById('propertyValueValue');
    const renovationCostValue = document.getElementById('renovationCostValue');
    const loanTermValue = document.getElementById('loanTermValue');
    
    if (loanAmountValue) loanAmountValue.value = formatNumber(150000);
    if (propertyValueValue) propertyValueValue.value = formatNumber(200000);
    if (renovationCostValue) renovationCostValue.value = formatNumber(50000);
    if (loanTermValue) loanTermValue.value = formatNumber(12);
    
    console.log("Initial values set:", {
        loanAmount: loanAmountValue ? loanAmountValue.value : 'not found',
        propertyValue: propertyValueValue ? propertyValueValue.value : 'not found',
        renovationCost: renovationCostValue ? renovationCostValue.value : 'not found',
        loanTerm: loanTermValue ? loanTermValue.value : 'not found'
    });
}

// Initialize number inputs with their default values
function initializeNumberInputs() {
    // Get all range inputs
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    
    rangeInputs.forEach(function(slider) {
        // Find the corresponding number input
        const numberInput = document.getElementById(slider.id + 'Value');
        if (!numberInput) {
            console.log("Number input not found for slider:", slider.id);
            return; // Skip if number input doesn't exist
        }
        
        // Set initial value for the number input
        const value = parseFloat(slider.value);
        numberInput.value = formatNumber(value);
        console.log("Set number input value:", slider.id, numberInput.value);
    });
}

// Set up event listeners for all sliders and number inputs
function setupInputListeners() {
    // Get all range inputs
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    
    rangeInputs.forEach(function(slider) {
        // Find the corresponding number input
        const numberInput = document.getElementById(slider.id + 'Value');
        if (!numberInput) {
            console.log("Number input not found for slider:", slider.id);
            return; // Skip if number input doesn't exist
        }
        
        // Set initial value for the number input
        const value = parseFloat(slider.value);
        numberInput.value = formatNumber(value);
        console.log("Set initial value for", slider.id, ":", numberInput.value);
        
        // Update number input when slider changes
        slider.addEventListener('input', function() {
            const value = parseFloat(slider.value);
            numberInput.value = formatNumber(value);
            console.log("Slider value changed for", slider.id, ":", numberInput.value);
            calculateAndDisplayResults();
        });
    });
}

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