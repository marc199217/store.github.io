export async function onRequestPost(context) {
    try {
        const data = await context.request.json();

        // Validate required fields
        if (!data.name || !data.price) {
            throw new Error("Missing required fields: name or price.");
        }

        // Convert image path to absolute URL
        let imageUrl;
        if (data.image && !data.image.startsWith('http')) {
            // Prepend SITE_URL if image is relative
            imageUrl = new URL(data.image, context.env.SITE_URL).href;
        } else {
            // Use the provided URL or fallback image
            imageUrl = data.image || "https://rivolo-studios.com/brand_logo_black.png";
        }

        // Prepare Stripe API request
        const bodyParams = new URLSearchParams({
            "payment_method_types[]": "card",k
            "line_items[0][price_data][currency]": "usd",
            "line_items[0][price_data][product_data][name]": data.name,
            "line_items[0][price_data][product_data][images][]": imageUrl,
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