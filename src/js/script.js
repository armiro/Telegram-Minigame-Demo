let tapLimit = TAP_LIMIT_MAX;
let totalCoins = 0;
let lastTapTime = null;
let updateBalanceTimeout;
let speed = 1;

const counterElement = document.querySelector('.counter');
const totalCoinsElement = document.querySelector('.total-coins');
const coinImageElement = document.querySelector('.coin-container img');

const tgWebApp = window.Telegram.WebApp;  // import Telegram lib

tgWebApp.ready();  // wait to be fully loaded
tgWebApp.expand();  // fully open window after launch


function setSecBgColor() {
    /**
     * Change secondary background color based on the current theme
     *
     * @global {object} tgWebApp
     * @returns {void}
     */
    const theme = tgWebApp.colorScheme;
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', 'rgb(12, 36, 97)');
    } else if (theme === 'light') {
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', 'rgb(74, 105, 189)');
    }
}


function checkAndIncrement(){
    /**
     * increment user tap balance every `TAP_INCREMENT_INTERVAL` seconds
     *
     * @global {number} tapLimit
     * @global {number} TAP_LIMIT_MAX
     * @global {HTMLElement} counterElement
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
                throw new Error('Server responded with an error');
            }
            console.log('user balance updated successfully!');
            window.sessionStorage.setItem('totalCoins', totalCoins);  // update totalCoins in session storage
        })
        .catch(error => {
            console.error('error:', error);
            alert('Failed updating coin balance! Try again later.')
        })
}


setSecBgColor();
tgWebApp.onEvent('themeChanged', setSecBgColor);

// get user unique ID (guid) and store in local storage
// const userID = tgWebApp.initDataUnsafe?.user?.id.toString();
const userID = '55662009';
window.sessionStorage.setItem('userID', userID);

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
        window.sessionStorage.setItem('referralCode', data.ref_code);  // store ref_code to access via referral script
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

coinImageElement.addEventListener('click', () => {
    coinImageElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
    setTimeout(() => {
        coinImageElement.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    // decrement limit with each tap & increment total coins, unless it is 0
    if (tapLimit > (speed - 1)) {
        tapLimit = tapLimit - speed;
        counterElement.textContent = tapLimit.toString();
        totalCoins = totalCoins + speed;
        totalCoinsElement.textContent = totalCoins.toString();
    }
});

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
    updateBalance();
});

// window.addEventListener('visibilitychange', () => {
//     if (document.hidden) {
//         updateBalance();
//     }
// })

// tgWebApp.onEvent('viewportChanged', updateBalance);


// run incrementation function
checkAndIncrement();
