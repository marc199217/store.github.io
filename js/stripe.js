const stripe = Stripe('{{ site.stripe_publishable_key }}');

async function startCheckout(button) {
  const product = {
    name: button.dataset.itemName,
    price: button.dataset.itemPrice,
    id: button.dataset.itemId
  };

  try {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    });
    
    const { sessionId } = await response.json();
    
    const result = await stripe.redirectToCheckout({
      sessionId: sessionId
    });

    if (result.error) {
      console.error(result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}