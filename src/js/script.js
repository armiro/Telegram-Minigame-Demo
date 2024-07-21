let tapLimit = 100;
let totalCoins = 0;
let lastTapTime = null;
let updateBalanceTimeout = null;

const counterElement = document.querySelector('.counter');
const totalCoinsElement = document.querySelector('.total-coins');
const tgWebApp = window.Telegram.WebApp;  // import Telegram lib

tgWebApp.ready();  // wait to be fully loaded
tgWebApp.expand();  // fully open window after launch

// // change secondary bg color based on theme
// function setSecBgColor() {
//     const theme = tgWebApp.colorScheme;
//     if (theme === 'dark') {
//         document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', 'rgb(12, 36, 97)');
//     } else if (theme === 'light') {
//         document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', 'rgb(74, 105, 189)');
//     }
// }
// setSecBgColor();
// tgWebApp.onEvent('themeChanged', setSecBgColor);


// get user unique ID (guid) and construct custom url
const userID = tgWebApp.initDataUnsafe?.user?.id.toString();
const url = 'https://pheasant-creative-goldfish.ngrok-free.app/get_balance?guid=' + encodeURIComponent(userID)

// retrieve user's total coins balance from database
fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({'guid': userID})
})
.then(response => response.json())
.then(data => {
    if (data.balance) {
        totalCoins = data.balance;
        totalCoinsElement.textContent = totalCoins.toString();
    } else {
        console.error('Error:', data.error);
    }
})

// increment balance every 5 secs
function checkAndIncrement(){
    if (tapLimit < 100) {
        tapLimit ++;
        counterElement.textContent = tapLimit.toString();
    }
    setTimeout(checkAndIncrement, 5000);
}

document.querySelector('.coin-container').addEventListener('click', () => {
    const img = document.querySelector('.coin-container img');
    img.style.transform = 'translate(-50%, -50%) scale(0.95)';
    setTimeout(() => {
        img.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    // decrement limit with each tap & increment total coins, unless it is 0
    if (tapLimit > 0) {
        tapLimit--;
        counterElement.textContent = tapLimit.toString();
        totalCoins++;
        totalCoinsElement.textContent = totalCoins.toString();
    }

    // update last tap time
    lastTapTime = new Date().getTime();

    // clear previous timeout and set a new one
    clearTimeout(updateBalanceTimeout);
    updateBalanceTimeout = setTimeout(() => {

        // send AJAX request to update balance on the server
        fetch('https://pheasant-creative-goldfish.ngrok-free.app/tap', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({guid: userID, balance: totalCoins.toString()})
        });
    }, 1000);  // update coin balance after 1 second of inactivity
});

// run incrementation function
checkAndIncrement();
