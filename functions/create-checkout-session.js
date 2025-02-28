export async function onRequestPost(context) {
    try {
        const data = await context.request.json();

        // Validate required fields
        if (!data.name || !data.image || !data.price) {
            throw new Error("Missing required fields: name, image, or price.");
        }

        // Prepare Stripe API request
        const bodyParams = new URLSearchParams({
            "payment_method_types[]": "card",
            "line_items[0][price_data][currency]": "eur",
            "line_items[0][price_data][product_data][name]": data.name,
            "line_items[0][price_data][product_data][images][]": data.image,
            "line_items[0][price_data][unit_amount]": (data.price * 100).toString(),
            "line_items[0][quantity]": "1",
            "mode": "payment",
            "success_url": `${context.env.SITE_URL}${context.env.STRIPE_SUCCESS_PATH}`,
            "cancel_url": `${context.env.SITE_URL}${context.env.STRIPE_CANCEL_PATH}`
        });

        // Send request to Stripe
        const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${context.env.STRIPE_SECRET_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: bodyParams
        });

        const session = await stripeResponse.json();

        if (!stripeResponse.ok) {
            throw new Error(session.error?.message || "Failed to create checkout session");
        }

        return new Response(JSON.stringify({ id: session.id }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
}