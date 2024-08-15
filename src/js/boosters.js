import { updateBalance } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const boosterContainers = document.querySelectorAll('.boosters-box#boostersBox .booster-container');
    const questContainers = document.querySelectorAll('.boosters-box#questsBox .booster-container');

    const remainingBalance = document.querySelector('.balance-display .user-balance');
    const numHuntedBoxes = document.querySelector('.num-box-display .num-user-boxes');

    const buyOneBoxButton = document.querySelector('#buyOneBox');
    const buyMaxBoxButton = document.querySelector('#buyMaxBox');
    const buyMaxBoxCount = document.querySelector('.num-max-boxes');

    const userID = window.sessionStorage.getItem('userID');
    document.querySelector('.box-price').textContent = BOX_PRICE.toString();

    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10) || 0;
    remainingBalance.textContent = totalCoins.toString();

    let totalBoxes = parseInt(window.localStorage.getItem('totalBoxes'), 10) || 0;
    numHuntedBoxes.textContent = totalBoxes.toString();

    const updateMaxAvailBoxes = () => {
        const maxAvailBoxes = Math.floor(totalCoins / BOX_PRICE);
        buyMaxBoxCount.textContent = maxAvailBoxes.toString();
    };


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
                updateMaxAvailBoxes();
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
                    if (questValueElement.textContent !== 'done') {
                        window.open('https://twitter.com/musk_tap', '_blank');  // open twitter (X) link
                        setTimeout(async () => {
                            // notice the user about the earning
                            alert(`Quest completed! You earned ${questValue} points.`);
                            // update totalCoins value & remaining balance
                            totalCoins += questValue;
                            window.sessionStorage.setItem('totalCoins', totalCoins);
                            remainingBalance.textContent = totalCoins.toString();
                            // update coin balance on the server-side
                            await updateBalance(BASE_URL, userID, totalCoins, 2);
                            // replace questValue with 'done' (single task completed)
                            questValueElement.textContent = 'done';
                            window.localStorage.setItem(`quest-${questID}-status`, 'done');
                            updateMaxAvailBoxes();
                        }, 3000);
                    }
                    break;
            }
        });
    });

    // handle random box items
    const handleBoxPurchase = async (event) => {
        const maxBoxesToBuy = parseInt(buyMaxBoxCount.textContent);

        if (event.target === buyOneBoxButton && totalCoins >= BOX_PRICE) {
            totalCoins -= BOX_PRICE;
            totalBoxes += 1;
        } else if (event.target === buyMaxBoxButton && maxBoxesToBuy > 0) {
            totalCoins -= maxBoxesToBuy * BOX_PRICE;
            totalBoxes += maxBoxesToBuy;
        } else {
            alert('Not enough coins!');
            return;  // stop execution if user's points is not sufficient
        }

        // update remaining coins & number of user boxes
        remainingBalance.textContent = totalCoins.toString();
        numHuntedBoxes.textContent = totalBoxes.toString();

        // update storage
        window.sessionStorage.setItem('totalCoins', totalCoins);
        window.localStorage.setItem('totalBoxes', totalBoxes);

        // update coin balance on the server-side
        await updateBalance(BASE_URL, userID, totalCoins, 2);
        updateMaxAvailBoxes();
    };

    buyOneBoxButton.addEventListener('click', handleBoxPurchase);
    buyMaxBoxButton.addEventListener('click', handleBoxPurchase);
    updateMaxAvailBoxes();

});
