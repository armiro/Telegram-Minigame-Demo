import { updateBalance, getBalance } from "./utils.js";

(async() => {
    const counterElement = document.querySelector('.counter');
    const totalCoinsElement = document.querySelector('.total-coins');
    const coinImageElement = document.querySelector('.coin-container img');
    const speedBoosterStatus = window.localStorage.getItem(`booster-speed+1-status`);
    const limitBoosterStatus = window.localStorage.getItem('booster-tapLimit+20-status');
    const tgWebApp = window.Telegram.WebApp;  // import Telegram lib

    let tapLimitMax = limitBoosterStatus? TAP_LIMIT_MAX + 20 : TAP_LIMIT_MAX;
    let tapLimit = parseInt(window.localStorage.getItem('tapLimit'), 10) || tapLimitMax;
    let lastTapTime = null;
    let updateBalanceTimeout = null;
    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10) || 0;
    let speed = speedBoosterStatus? 2 : 1;


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


    function createPlusOneEffect(x, y, escalation, timeout) {
        /**
         * create a new element for "+1" sign which triggers with click, moves upward and disappears
         * @type {HTMLDivElement}
         * @param {number} x - x-coordinates where "+1" effect appears
         * @param {number} y - y-coordinates where "+1" effect appears
         * @param {number} escalation - how high "+1" effect goes (in y-axis pixels)
         * @param {number} timeout - how long "+1" effect stays before fadeout (in milliseconds)
         * @returns {void}
         */
        const plusOneElement = document.createElement('div');
        plusOneElement.textContent = '+1';
        plusOneElement.style.position = 'absolute';
        plusOneElement.style.left = `${x}px`;
        plusOneElement.style.top = `${y}px`;
        plusOneElement.style.fontSize = '24px';
        plusOneElement.style.color = 'white';
        plusOneElement.style.zIndex = '1000';
        plusOneElement.style.pointerEvents = 'none';  // element doesn't interfere with other clicks

        document.body.appendChild(plusOneElement);

        // animate the element to move upwards and fade out
        plusOneElement.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: `translateY(-${escalation}px)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });

        // remove the element after animation completion
        setTimeout(() => {
            plusOneElement.remove();
        }, timeout);
    }


    function coinClickEffect() {
        /**
         * effects on coin element when user taps on it
         *
         * @global {DOMElement} coinImageElement
         * @returns {void}
         */
        createPlusOneEffect(event.clientX, event.clientY, 120, 1000);
        coinImageElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            coinImageElement.style.transform = 'scale(1)';
        }, 100);
    }


    function incrementTapLimit(){
        /**
         * increment user tap balance every `TAP_INCREMENT_INTERVAL` seconds
         * store incremented tap balance & current time in local storage
         *
         * @global {number} tapLimit
         * @global {number} tapLimitMax
         * @global {DOMElement} counterElement
         * @global {number} TAP_INCREMENT_INTERVAL
         * @returns {void}
         */
        setTimeout(() => {
            if (tapLimit < tapLimitMax) {
                tapLimit ++;
                counterElement.textContent = tapLimit.toString();
                window.localStorage.setItem('tapLimit', tapLimit);
                window.localStorage.setItem('lastTapLimitUpdateTime', Date.now().toString());
            }
            incrementTapLimit();  // call again after the timeout
        }, TAP_INCREMENT_INTERVAL);
    }


    function updateTapLimit() {
        /**
         * update tap limit value after user returns to the webapp index page
         *
         * @global {number} TAP_INCREMENT_INTERVAL
         * @global {number} tapLimit
         * @global {number} tapLimitMax
         * @returns {void}
         */
        const lastTapTime = parseInt(window.localStorage.getItem('lastTapLimitUpdateTime'), 10) || Date.now();
        const intervalsElapsed = Math.floor((Date.now() - lastTapTime) / TAP_INCREMENT_INTERVAL);
        if (intervalsElapsed > 0) {
            tapLimit = Math.min(tapLimit + intervalsElapsed, tapLimitMax);
            window.localStorage.setItem('tapLimit', tapLimit);
            window.localStorage.setItem('lastTapLimitUpdateTime', Date.now().toString());
        }
        counterElement.textContent = tapLimit.toString();  // show updated tapLimit immediately after user returns
    }


    updateTapLimit();  // update tapLimit balance from last session (runs once)
    tgWebApp.ready();  // wait to be fully loaded
    tgWebApp.expand();  // fully open window after launch
    await setSecBgColor();
    tgWebApp.onEvent('themeChanged', setSecBgColor);

    // get user unique ID (guid) and store in local storage
    const userID = tgWebApp.initDataUnsafe?.user?.id.toString();
    window.sessionStorage.setItem('userID', userID);

    // check if user returned from other pages (storage access) or started new session (server call)
    if (totalCoins) {
        totalCoinsElement.textContent = totalCoins;
        // speed = speedBoosterStatus? 2 : 1;
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
            window.localStorage.setItem('tapLimit', tapLimit);
            window.localStorage.setItem('lastTapLimitUpdateTime', Date.now().toString())
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

    incrementTapLimit();  // run incrementation function
})();
