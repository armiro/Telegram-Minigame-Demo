document.addEventListener('DOMContentLoaded', () => {
    const boosterContainers = document.querySelectorAll('.booster-container');
    const remainingBalance = document.querySelector('.balance-display .user-balance');
    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10);
    remainingBalance.textContent = totalCoins.toString();

    boosterContainers.forEach(container => {
        const boosterCostElement = container.querySelector('.booster-cost');
        const boosterID = boosterCostElement.id;
        const boosterCost = parseInt(boosterCostElement.textContent, 10);
        const boosterStatus = window.sessionStorage.getItem(`booster-${boosterID}-status`);

        if (boosterStatus === 'max') {
            boosterCostElement.textContent = 'max';
        }

        boosterCostElement.addEventListener('click', () => {
            if (boosterCostElement.textContent !== 'max' && totalCoins >= boosterCost) {
                // update totalCoins value & remaining balance
                totalCoins -= boosterCost;
                window.sessionStorage.setItem('totalCoins', totalCoins);
                remainingBalance.textContent = totalCoins.toString();
                // replace boosterCost value with 'max' (no higher speeds available)
                boosterCostElement.textContent = 'max';
                window.sessionStorage.setItem(`booster-${boosterID}-status`, 'max')
            } else if (boosterCostElement.textContent !== 'max'){
                alert('Not enough coins!');
            }
        })
    })
})