document.addEventListener('DOMContentLoaded', () => {
    const boosterContainers = document.querySelectorAll('.booster-container');
    const remainingBalance = document.querySelector('.balance-display .user-balance');
    const userID = window.localStorage.getItem('userID');
    let totalCoins = parseInt(window.localStorage.getItem('totalCoins'), 10);
    remainingBalance.textContent = totalCoins.toString();

    boosterContainers.forEach(container => {
        const boosterCostElement = container.querySelector('.booster-cost');
        const boosterID = boosterCostElement.id;
        const boosterCost = parseInt(boosterCostElement.textContent, 10);
        const boosterStatus = window.localStorage.getItem(`booster-${boosterID}-status`);

        if (boosterStatus === 'max') {
            boosterCostElement.textContent = 'max';
        }

        boosterCostElement.addEventListener('click', () => {
            if (boosterCostElement.textContent !== 'max' && totalCoins >= boosterCost) {
                // update totalCoins value & remaining balance
                totalCoins -= boosterCost;
                remainingBalance.textContent = totalCoins.toString();
                // update totalCoins value in local storage (required when buying multiple boosters)
                window.localStorage.setItem('totalCoins', totalCoins);
                // replace boosterCost value with 'max' (no higher speeds available)
                boosterCostElement.textContent = 'max';
                window.localStorage.setItem(`booster-${boosterID}-status`, 'max')
                // update user balance & speed on the server
                fetch(`${BASE_URL}/tap`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: new URLSearchParams({guid: userID, balance: totalCoins.toString(), speed: '2.0'})
                })
            } else if (boosterCostElement.textContent !== 'max'){
                alert('Not enough coins!');
            }
        })
    })
})