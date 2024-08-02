import { updateBalance, getBalance } from "./utils.js";

(async() => {
    let tapLimit = TAP_LIMIT_MAX;
    let lastTapTime = null;
    let updateBalanceTimeout = null;
    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10) || 0;
    let speed = 1;

    const counterElement = document.querySelector('.counter');
    const totalCoinsElement = document.querySelector('.total-coins');
    const coinImageElement = document.querySelector('.coin-container img');
    const boosterStatus = window.sessionStorage.getItem(`booster-speed2xCost-status`);
    const tgWebApp = window.Telegram.WebApp;  // import Telegram lib


    async function setSecBgColor() {
        /**
         * Change secondary background color based on the current theme
         *
         * @global {object} tgWebApp
         * @returns {void}
         */
        const theme = tgWebApp.colorScheme;
        let color = theme === 'dark' ? 'rgb(12, 36, 97)' : 'rgb(74, 105, 189)';
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', color);
    }


    function coinClickEffect() {
        /**
         * effects on coin element when user taps on it
         *
         * @global {DOMElement} coinImageElement
         * @returns {void}
         */
        coinImageElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
            coinImageElement.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
    }


    function checkAndIncrement(){
        /**
         * increment user tap balance every `TAP_INCREMENT_INTERVAL` seconds
         *
         * @global {number} tapLimit
         * @global {number} TAP_LIMIT_MAX
         * @global {DOMElement} counterElement
         * @returns {void}
         */
        if (tapLimit < TAP_LIMIT_MAX) {
            tapLimit ++;
            counterElement.textContent = tapLimit.toString();
        }
        setTimeout(checkAndIncrement, TAP_INCREMENT_INTERVAL);
    }


    tgWebApp.ready();  // wait to be fully loaded
    tgWebApp.expand();  // fully open window after launch
    await setSecBgColor();
    tgWebApp.onEvent('themeChanged', setSecBgColor);

    // get user unique ID (guid) and store in local storage
    const userID = tgWebApp.initDataUnsafe?.user?.id.toString();
    window.sessionStorage.setItem('userID', userID);

    if (totalCoins && boosterStatus) {
        totalCoinsElement.textContent = totalCoins;
        speed = 2;
    } else {
        const data = await getBalance(BASE_URL, userID);
        if (data) {
            totalCoins = parseInt(data.balance, 10);
            totalCoinsElement.textContent = totalCoins.toString();
            window.sessionStorage.setItem('referralCode', data.ref_code);  // store to access via referral.js
            window.sessionStorage.setItem('totalCoins', totalCoins);  // store to access via boosters.js
            speed = parseInt(data.speed, 10);
        }
    }

    coinImageElement.addEventListener('click', async () => {
        coinClickEffect();
        // decrement limit & increment total coins, unless it is 0
        if (tapLimit > (speed - 1)) {
            tapLimit = tapLimit - speed;
            counterElement.textContent = tapLimit.toString();
            totalCoins = totalCoins + speed;
            totalCoinsElement.textContent = totalCoins.toString();
        }

        lastTapTime = Date.now();  // update last tap time
        clearTimeout(updateBalanceTimeout);  // clear previous timeout
        updateBalanceTimeout = setTimeout(async () => {
            if (Date.now() - lastTapTime >= BALANCE_UPDATE_DELAY) {
                await updateBalance(BASE_URL, userID, totalCoins, speed);
                window.sessionStorage.setItem('totalCoins', totalCoins);  // update totalCoins in session storage
            }
        }, BALANCE_UPDATE_DELAY);  // update balance after BALANCE_UPDATE_DELAY msecs of inactivity
    });



    checkAndIncrement();  // run incrementation function
})();