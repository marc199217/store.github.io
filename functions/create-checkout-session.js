export async function onRequestPost(context) {
    try {
        // Parse request body
        const { name, id, image, description, size, color, url, price } = await context.request.json();

        const siteUrl = context.env.SITE_URL;
        const successPath = context.env.STRIPE_SUCCESS_PATH;
        const cancelPath = context.env.STRIPE_CANCEL_PATH;

        const successUrl = `${siteUrl}${successPath}`;
        const cancelUrl = `${siteUrl}${cancelPath}`;

        // Make request to Stripe API
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${context.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'payment_method_types[]': 'card',
                'line_items[0][price_data][currency]': 'eur',
                'line_items[0][price_data][product_data][name]': name,
                'line_items[0][price_data][product_data][images][]': image,
                'line_items[0][price_data][product_data][description]': description,
                'line_items[0][price_data][product_data][metadata][size]': size,
                'line_items[0][price_data][product_data][metadata][color]': color,
                'line_items[0][price_data][product_data][metadata][url]': url,
                'line_items[0][price_data][unit_amount]': (price * 100).toString(), // Convert to cents
                'line_items[0][quantity]': '1',
                'mode': 'payment',
                'success_url': successUrl,
                'cancel_url': cancelUrl
            })
        });

        const session = await response.json();

        if (!response.ok) {
            throw new Error(session.error?.message || 'Failed to create checkout session');
        }

        return new Response(JSON.stringify({ id: session.id }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}