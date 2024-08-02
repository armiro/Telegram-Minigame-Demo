(() => {
    let tapLimit = TAP_LIMIT_MAX;
    let totalCoins = parseInt(window.sessionStorage.getItem('totalCoins'), 10) || 0;
    let speed = 1;

    const counterElement = document.querySelector('.counter');
    const totalCoinsElement = document.querySelector('.total-coins');
    const coinImageElement = document.querySelector('.coin-container img');
    const boosterStatus = window.localStorage.getItem(`booster-speed2xCost-status`);
    const tgWebApp = window.Telegram.WebApp;  // import Telegram lib


    function setSecBgColor() {
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


    function updateBalance() {
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
        fetch(`${BASE_URL}/tap`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({guid: userID, balance: totalCoins.toString(), speed: speed.toString()})
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('server responded with an error');
                }
                console.log('user balance updated successfully!');
            })
            .catch(error => {
                console.error('error:', error);
                alert('Failed updating coin balance! Try again later.')
            })
    }


    tgWebApp.ready();  // wait to be fully loaded
    tgWebApp.expand();  // fully open window after launch
    setSecBgColor();
    tgWebApp.onEvent('themeChanged', setSecBgColor);

    // get user unique ID (guid) and store in local storage
    const userID = tgWebApp.initDataUnsafe?.user?.id.toString();
    window.sessionStorage.setItem('userID', userID);

    if (totalCoins && boosterStatus) {  // when user goes
        totalCoinsElement.textContent = totalCoins;
        speed = 2;
    } else {
        // retrieve user's total coins balance from database
        fetch(`${BASE_URL}/get_balance?guid=` + encodeURIComponent(userID), {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({'guid': userID})
        })
        .then(response => response.json())
        .then(data => {
            if (typeof data.balance !== 'undefined') {
                totalCoins = parseInt(data.balance, 10);
                totalCoinsElement.textContent = totalCoins.toString();
                window.localStorage.setItem('referralCode', data.ref_code);  // store ref_code to access via referral script
                window.sessionStorage.setItem('totalCoins', totalCoins);  // store totalCoins to access via boosters script
                speed = parseInt(data.speed, 10);
            } else {
                console.error('Error:', data.error);
            }
        })
            .catch(error => {
                console.error('Error:', error);
                alert('Our server is down! Try again later.');
            })
    }

    coinImageElement.addEventListener('click', () => {
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

    // window.addEventListener('pagehide', () => {
    //     updateBalance();
    // })

    // tgWebApp.onEvent('close', () => {updateBalance();});
    // window.addEventListener('beforeunload', () => {updateBalance();});

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            updateBalance();
        }
    });

    checkAndIncrement();  // run incrementation function
})();