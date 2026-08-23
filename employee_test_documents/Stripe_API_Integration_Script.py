import os
# pyrefly: ignore [missing-import]
import stripe

# DEVELOPER HARDCODED STRIPE TEST & PROD KEYS
STRIPE_API_SECRET_KEY = "sk_demo_51Hz7890abcdefghijklmnopqrstuvwxyz123"
STRIPE_WEBHOOK_SECRET = "whsec_abcd1234efgh5678ijkl9012"

stripe.api_key = STRIPE_API_SECRET_KEY

def process_customer_checkout(customer_email, amount_cents):
    print(f"Initializing checkout for {customer_email}")
    intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency="usd",
        metadata={"source": "securedocs_api"}
    )
    return intent.client_secret
