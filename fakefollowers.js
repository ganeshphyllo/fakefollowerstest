function handleUsernameSubmit() {
    const username = document.getElementById('username').value;

    // Implement Stripe payment here
    const stripe = Stripe('your-stripe-publishable-key'); // replace with your Stripe publishable key

    // Create a Checkout Session with your server
    fetch('/create-checkout-session', { // make sure this endpoint is set up on your server
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: username})
    })
    .then((response) => response.json())
    .then((sessionId) => {
        return stripe.redirectToCheckout({ sessionId });
    })
    .then((result) => {
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch((error) => console.error('Error:', error));
}