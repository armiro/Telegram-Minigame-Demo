import { updateBalance } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const boosterContainers = document.querySelectorAll('.boosters-box#boostersBox .booster-container');
    const questContainers = document.querySelectorAll('.boosters-box#questsBox .booster-container');

    const remainingBalance = document.querySelector('.balance-display .user-balance');
    const numHuntedBoxes = document.querySelector('.num-box-display .num-user-boxes');
    // const numMaxBoxes = document.querySelector('.num-max-boxes');
    const userID = window.sessionStorage.getItem('userID');

    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10) || 0;
    remainingBalance.textContent = totalCoins.toString();

    let totalBoxes = parseInt(window.localStorage.getItem('totalBoxes'), 10) || 0;
    numHuntedBoxes.textContent = totalBoxes.toString();

    // let maxAvailBoxes = Math.floor(totalCoins / 100);
    // numMaxBoxes.textContent = maxAvailBoxes.toString();

    // handle booster items
    boosterContainers.forEach(container => {
        const boosterCostElement = container.querySelector('.booster-cost');
        const boosterID = boosterCostElement.id;
        const boosterCost = parseInt(boosterCostElement.textContent, 10);
        const boosterStatus = window.localStorage.getItem(`booster-${boosterID}-status`);

        if (boosterStatus === 'max') {
            boosterCostElement.textContent = 'max';
        }

        boosterCostElement.addEventListener('click', async () => {
            if (boosterCostElement.textContent !== 'max' && totalCoins >= Math.abs(boosterCost)) {
                // update coin balance on the server-side
                await updateBalance(BASE_URL, userID, totalCoins, 2);
                // update totalCoins value & remaining balance
                totalCoins += boosterCost;
                window.sessionStorage.setItem('totalCoins', totalCoins);
                remainingBalance.textContent = totalCoins.toString();
                // replace boosterCost value with 'max' (no higher speeds available)
                boosterCostElement.textContent = 'max';
                window.localStorage.setItem(`booster-${boosterID}-status`, 'max')
            } else if (boosterCostElement.textContent !== 'max'){
                alert('Not enough coins!');
            }
        });
    });

    // handle quest items
    questContainers.forEach(container => {
        const questValueElement = container.querySelector('.booster-cost');
        const questID = questValueElement.id;
        const questValue = parseInt(questValueElement.textContent, 10);
        const questStatus = window.localStorage.getItem(`quest-${questID}-status`);

        if (questStatus === 'done') {
            questValueElement.textContent = 'done';
        }

        questValueElement.addEventListener('click', async () => {
            switch (questID) {
                case 'followX':
                    window.open('https://twitter.com/musk_tap', '_blank');
                    setTimeout(async () => {
                        alert(`Quest completed! You earned ${questValue} points.`);
                        totalCoins += questValue;
                        window.sessionStorage.setItem('totalCoins', totalCoins);
                        remainingBalance.textContent = totalCoins.toString();
                        await updateBalance(BASE_URL, userID, totalCoins, 2);
                        questValueElement.textContent = 'done';
                        window.localStorage.setItem(`quest-${questID}-status`, 'done');
                    }, 3000);
                    break;
            }
        });
    });
})