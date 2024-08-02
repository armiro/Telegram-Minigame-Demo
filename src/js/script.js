(async() => {
    let tapLimit = TAP_LIMIT_MAX;
    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10) || 0;
    let speed = 1;

    const counterElement = document.querySelector('.counter');
    const totalCoinsElement = document.querySelector('.total-coins');
    const coinImageElement = document.querySelector('.coin-container img');
    const boosterStatus = window.localStorage.getItem(`booster-speed2xCost-status`);
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


    async function getBalance() {
        /**
         * retrieve user data record from database, based on Telegram User ID
         *
         * @global {string} BASE_URL
         * @global {string} userID
         * @returns {Promise<object|null>}
         */
        try {
            const response = await fetch(`${BASE_URL}/get_balance?guid=` + encodeURIComponent(userID), {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({'guid': userID})
        });
            if (!response.ok) {
                console.log('server responded with an error: ' + response.statusText);
                return null;
            }
            const data = await response.json();
            if (typeof data.balance === 'undefined') {
                console.log('invalid response data');
                return null;
            }
            return data;
        } catch(error) {
            console.error('Error fetching user balance:', error);
            alert('Our server is down! Try again later.');
            return null;
        }
    }


    async function updateBalance() {
        /**
         * Send AJAX request to update user balance & tap speed on the server
         * Also update `totalCoins` value in session storage
         *
         * @global {string} BASE_URL
         * @global {string} userID
         * @global {number} totalCoins
         * @global {number} speed
         * @returns {Promise<void>}
         * @throws {Error} if server request fails
         */
        try {
            const response = await fetch(`${BASE_URL}/tap`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({guid: userID, balance: totalCoins.toString(), speed: speed.toString()})
            });
            if (!response.ok) {
                console.error('server responded with an error:', response.statusText);
            } else {
                console.log('user balance updated successfully!');
            }
        } catch(error) {
            console.error('error:', error);
            alert('Failed updating coin balance! Try again later.')
        }
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
        const data = await getBalance();
        if (data) {
            totalCoins = parseInt(data.balance, 10);
            totalCoinsElement.textContent = totalCoins.toString();
            window.localStorage.setItem('referralCode', data.ref_code);  // store to access via referral script
            window.sessionStorage.setItem('totalCoins', totalCoins);  // store to access via boosters script
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
            window.sessionStorage.setItem('totalCoins', totalCoins);  // update totalCoins in session storage
        }
    });


    window.addEventListener('beforeunload', async (event) => {
        event.preventDefault();
        event.returnValue = '';
        await updateBalance();
    });

    checkAndIncrement();  // run incrementation function
})();