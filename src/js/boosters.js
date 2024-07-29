document.addEventListener('DOMContentLoaded', () => {
    const boosterContainers = document.querySelectorAll('.booster-container');
    const userID = window.localStorage.getItem('userID');
    let totalCoins = parseInt(window.localStorage.getItem('totalCoins'), 10);
    console.log('total user coins:', totalCoins);

    boosterContainers.forEach(container => {
        const boosterCostElement = container.querySelector('.booster-cost');
        const boosterCost = parseInt(boosterCostElement.textContent, 10);
        boosterCostElement.addEventListener('click', () => {
            if (totalCoins > boosterCost) {
                // update totalCoins value
                totalCoins -= boosterCost;
                // replace boosterCost value with 'done'
                boosterCostElement.textContent = 'done';
                // update user balance on the server
                fetch(`${BASE_URL}/tap`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: new URLSearchParams({guid: userID, balance: totalCoins.toString()})
                })
            } else {
                alert('Not enough coins!');
            }
        })
    })

})