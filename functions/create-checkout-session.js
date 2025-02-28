export async function onRequestPost(context) {
    const stripe = require('stripe')(context.env.STRIPE_SECRET_KEY);

    const { name, id, image, description, size, color, url, price } = await context.request.json();

    const siteUrl = context.env.SITE_URL;
    const successPath = context.env.STRIPE_SUCCESS_PATH;
    const cancelPath = context.env.STRIPE_CANCEL_PATH;

    const successUrl = `${siteUrl}${successPath}`;
    const cancelUrl = `${siteUrl}${cancelPath}`;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: name,
                            images: [image],
                            description: description,
                            metadata: {
                                size: size,
                                color: color,
                                url: url
                            }
                        },
                        unit_amount: price * 100, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

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