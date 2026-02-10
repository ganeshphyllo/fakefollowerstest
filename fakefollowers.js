// Modify this function to incorporate the Stripe payment redirect functionality
function handleUsernameSubmit() {
    const username = document.getElementById('username').value;
    // Assuming we do some validation and processing here before payment
    
    // Redirect to Stripe payment link
    window.location.href = 'https://buy.stripe.com/test_3cI3cvbrE9vWdmJaN85AQ00';
    
    // After successful payment, the user will return to this page to show the report.
    // You can trigger the report display here as needed
}