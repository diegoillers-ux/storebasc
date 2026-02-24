import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configure MercadoPago with an Access Token (this should be in .env.local)
// We use a mock token here; the user will replace it with their real one.
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-mock-token' });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, priceNumber, quantity } = body;

        // Create preference
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'item-ID-1234',
                        title: title || 'Servicio Holístico',
                        quantity: quantity || 1,
                        unit_price: priceNumber || 150000,
                        currency_id: 'COP',
                    }
                ],
                back_urls: {
                    success: "http://localhost:3000/success",
                    failure: "http://localhost:3000/failure",
                    pending: "http://localhost:3000/pending",
                },
                auto_return: "approved",
            }
        });

        return NextResponse.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error("Error creating preference:", error);
        return NextResponse.json({ error: "Failed to create payment reference" }, { status: 500 });
    }
}
