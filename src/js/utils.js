export async function getBalance(url, id) {
    /**
     * retrieve user data record from database, based on Telegram User ID
     *
     * @param {string} url - server url address
     * @param {string} id - user unique Telegram ID
     * @returns {promise<object|null>}
     * @throws {error} if server request fails
     */
    try {
        const response = await fetch(`${url}/get_balance?guid=` + encodeURIComponent(id), {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({'guid': id})
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


export async function updateBalance(url, id, balance, speed) {
    /**
     * Send AJAX request to update user balance & tap speed on the server
     *
     * @param {string} url - server url address
     * @param {string} id - user unique Telegram ID
     * @param {number} balance - user total coins
     * @param {number} speed - user tap speed
     * @returns {promise<void>}
     * @throws {error} if server request fails
     */
    try {
        const response = await fetch(`${url}/tap`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({guid: id, balance: balance, speed: speed})
        });
        if (!response.ok) {
            console.error('server responded with an error:', response.statusText);
        } else {
            console.log('user balance updated successfully!');
        }
    } catch (error) {
        console.error('error:', error);
        alert('Failed updating coin balance! Try again later.');
    }
}


export async function activateMenuItemEffect() {
    /**
     * On each page, replace black page menu icon with a gradient-colored version
     * @type {string}
     * @returns {void}
     */
    const currentPage = window.location.pathname.split('/').pop();
    const menuIconDir = '../../assets/menu_icons'
    let currentElement;

    switch (currentPage) {
        case 'index.html':
            currentElement = document.getElementById('wallet');
            currentElement.style.setProperty('--mask-url', `url("${menuIconDir}/wallet.png")`);
            break;
        case 'boosters.html':
            currentElement = document.getElementById('boosters');
            currentElement.style.setProperty('--mask-url', `url("${menuIconDir}/earn.png")`);
            break;
        case 'ranking.html':
            currentElement = document.getElementById('ranking');
            currentElement.style.setProperty('--mask-url', `url("${menuIconDir}/ranking.png")`);
            break;
        case 'referral.html':
            currentElement = document.getElementById('referral');
            currentElement.style.setProperty('--mask-url', `url("${menuIconDir}/refer.png")`);
            break;
    }

    if (currentElement) {
        currentElement.querySelector('img').style.display = 'none';
        currentElement.classList.add('gradient-color-item');
    }
}
