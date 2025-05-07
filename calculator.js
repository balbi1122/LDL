// Update number inputs when sliders change
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        const numberInput = document.getElementById(slider.id + 'Value');
        slider.addEventListener('input', () => {
            numberInput.value = slider.value;
            updateResults();
        });
        numberInput.addEventListener('input', () => {
            slider.value = numberInput.value;
            updateResults();
        });
    });

    // Update results when form changes
    function updateResults() {
        const loanAmount = parseFloat(document.getElementById('loanAmount').value);
        const propertyValue = parseFloat(document.getElementById('propertyValue').value);
        const loanTerm = parseFloat(document.getElementById('loanTerm').value);
        const renovationCost = parseFloat(document.getElementById('renovationCost').value);
        const loanType = document.getElementById('loanType').value;

        // Calculate LTV
        const ltv = ((loanAmount + renovationCost) / propertyValue * 100).toFixed(2);
        document.getElementById('ltv').textContent = ltv + '%';

        // Calculate monthly payment and total interest based on loan type
        let interestRate, monthlyPayment, totalInterest;
        
        switch(loanType) {
            case 'construction':
                interestRate = 0.1199; // 11.99%
                break;
            case 'fix-flip':
                interestRate = 0.1099; // 10.99%
                break;
            case 'bridge':
                interestRate = 0.1199; // 11.99%
                break;
            case 'dscr':
                interestRate = 0.075; // 7.5%
                break;
        }

        // Calculate monthly payment (interest only)
        monthlyPayment = (loanAmount * interestRate / 12).toFixed(2);
        document.getElementById('monthlyPayment').textContent = '$' + monthlyPayment;

        // Calculate total interest
        totalInterest = (loanAmount * interestRate).toFixed(2);
        document.getElementById('totalInterest').textContent = '$' + totalInterest;

        // Calculate traditional loan costs
        const traditionalRate = 0.065; // 6.5% for traditional loans
        const traditionalDownPayment = propertyValue * 0.25; // 25% down payment
        const traditionalMonthlyPayment = (loanAmount * traditionalRate / 12).toFixed(2);
        const traditionalTotalInterest = (loanAmount * traditionalRate).toFixed(2);
        const traditionalClosingTime = 45; // days
        const litedocClosingTime = 5; // days
        const opportunityCostPerDay = (loanAmount * 0.0005); // 0.05% per day

        // Calculate opportunity cost
        const traditionalOpportunityCost = (traditionalClosingTime - litedocClosingTime) * opportunityCostPerDay;
        const traditionalTotalCost = parseFloat(traditionalTotalInterest) + parseFloat(traditionalOpportunityCost);
        const litedocTotalCost = parseFloat(totalInterest);
        const totalSavings = (traditionalTotalCost - litedocTotalCost).toFixed(2);

        // Update comparison table
        const tableBody = document.querySelector('.results-table tbody');
        tableBody.innerHTML = `
            <tr>
                <td>Down Payment Required</td>
                <td>$${traditionalDownPayment.toFixed(2)}</td>
                <td>$${(propertyValue * 0.15).toFixed(2)}</td>
                <td class="positive">$${(traditionalDownPayment - (propertyValue * 0.15)).toFixed(2)} less</td>
            </tr>
            <tr>
                <td>Out-of-Pocket for Renovations</td>
                <td>$${renovationCost.toFixed(2)}</td>
                <td>$0</td>
                <td class="positive">$${renovationCost.toFixed(2)} less</td>
            </tr>
            <tr>
                <td>Total Financing Costs</td>
                <td>$${traditionalTotalCost.toFixed(2)}</td>
                <td>$${litedocTotalCost.toFixed(2)}</td>
                <td class="${litedocTotalCost < traditionalTotalCost ? 'positive' : 'negative'}">$${Math.abs(litedocTotalCost - traditionalTotalCost).toFixed(2)} ${litedocTotalCost < traditionalTotalCost ? 'less' : 'more'}</td>
            </tr>
            <tr>
                <td>Time to Closing</td>
                <td>${traditionalClosingTime} days</td>
                <td>${litedocClosingTime} days</td>
                <td class="positive">${traditionalClosingTime - litedocClosingTime} days faster</td>
            </tr>
            <tr>
                <td>Opportunity Cost of Delayed Closing</td>
                <td>$${traditionalOpportunityCost.toFixed(2)}</td>
                <td>$0</td>
                <td class="positive">$${traditionalOpportunityCost.toFixed(2)} saved</td>
            </tr>
            <tr>
                <td>Capital Required</td>
                <td>$${(traditionalDownPayment + renovationCost).toFixed(2)}</td>
                <td>$${(propertyValue * 0.15).toFixed(2)}</td>
                <td class="positive">$${((traditionalDownPayment + renovationCost) - (propertyValue * 0.15)).toFixed(2)} less</td>
            </tr>
            <tr>
                <td>Potential ROI</td>
                <td>${((propertyValue - loanAmount - traditionalDownPayment - renovationCost) / (traditionalDownPayment + renovationCost) * 100).toFixed(1)}%</td>
                <td>${((propertyValue - loanAmount - (propertyValue * 0.15)) / (propertyValue * 0.15) * 100).toFixed(1)}%</td>
                <td class="positive">${(((propertyValue - loanAmount - (propertyValue * 0.15)) / (propertyValue * 0.15) * 100) - ((propertyValue - loanAmount - traditionalDownPayment - renovationCost) / (traditionalDownPayment + renovationCost) * 100)).toFixed(1)}% higher</td>
            </tr>
        `;

        // Update summary text
        const summaryText = document.querySelector('.highlight-text');
        summaryText.innerHTML = `Using LiteDoc Loans could save you approximately <strong>$${totalSavings}</strong> and help you close <strong>${traditionalClosingTime - litedocClosingTime}</strong> days faster compared to traditional financing.`;
    }

    // Add event listener for loan type change
    document.getElementById('loanType').addEventListener('change', updateResults);

    // Initial calculation
    updateResults();
}); 