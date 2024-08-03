import { updateBalance } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const boosterContainers = document.querySelectorAll('.booster-container');
    const remainingBalance = document.querySelector('.balance-display .user-balance');
    const userID = window.sessionStorage.getItem('userID');
    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10);
    remainingBalance.textContent = totalCoins.toString();

    boosterContainers.forEach(container => {
        const boosterCostElement = container.querySelector('.booster-cost');
        const boosterID = boosterCostElement.id;
        const boosterCost = parseInt(boosterCostElement.textContent, 10);
        const boosterStatus = window.localStorage.getItem(`booster-${boosterID}-status`);

        if (boosterStatus === 'max') {
            boosterCostElement.textContent = 'max';
        }

        boosterCostElement.addEventListener('click', async () => {
            if (boosterCostElement.textContent !== 'max' && totalCoins >= boosterCost) {
                // update coin balance on the server-side
                await updateBalance(BASE_URL, userID, totalCoins, 2);
                // update totalCoins value & remaining balance
                totalCoins -= boosterCost;
                window.sessionStorage.setItem('totalCoins', totalCoins);
                remainingBalance.textContent = totalCoins.toString();
                // replace boosterCost value with 'max' (no higher speeds available)
                boosterCostElement.textContent = 'max';
                window.localStorage.setItem(`booster-${boosterID}-status`, 'max')
            } else if (boosterCostElement.textContent !== 'max'){
                alert('Not enough coins!');
            }
        })
    })
})