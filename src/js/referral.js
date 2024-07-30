function shareReferral() {
    const shareText = `Join me on playing Mustachio and receive 200 coins as your welcome bonus!\n` +
        `https://t.me/mustachio_bot?start=${window.sessionStorage.getItem('referralCode')}`;
    if (navigator.share) {
        navigator.share({
            title: 'Mustachio Referral',
            text: shareText,
            // url: window.location.href // url of current page
        })
            .then(() => console.log('ref link was successfully shared!'))
            .catch((error) => console.error('Error sharing:', error))
    } else {
        alert(shareText);  // show text in alert as fallback
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const inviteButton = document.querySelector('.invite-button');
    inviteButton.addEventListener('click', shareReferral)
})
