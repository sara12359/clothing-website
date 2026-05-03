import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="AURELIA Luxury Fashion")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (we will put CSS, JS, and HTML in the root or a static folder)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve HTML files directly from root folder
@app.get("/", response_class=HTMLResponse)
async def get_index():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/about.html", response_class=HTMLResponse)
async def get_about():
    with open("about.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/contact.html", response_class=HTMLResponse)
async def get_contact():
    with open("contact.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/checkout.html", response_class=HTMLResponse)
async def get_checkout():
    with open("checkout.html", "r", encoding="utf-8") as f:
        return f.read()


# --- Pydantic Models ---

class CartItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

class PaymentRequest(BaseModel):
    items: List[CartItem]
    total: float
    # In a real app we'd have payment details here

class ChatRequest(BaseModel):
    message: str

class ContactRequest(BaseModel):
    name: str
    email: str
    inquiry: str

# --- Endpoints ---

@app.get("/products")
async def get_products():
    return [
        {
            "id": 1,
            "name": "Obsidian Silk Gown",
            "price": 2450.00,
            "imageURL": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            "id": 2,
            "name": "Champagne Threaded Blazer",
            "price": 1850.00,
            "imageURL": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            "id": 3,
            "name": "Cashmere Wrap Coat",
            "price": 3200.00,
            "imageURL": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            "id": 4,
            "name": "Aurelia Signature Handbag",
            "price": 4100.00,
            "imageURL": "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    ]

@app.post("/process-payment")
async def process_payment(request: PaymentRequest):
    # Simulate a 2-second payment processing delay
    await asyncio.sleep(2)
    return {"status": "success", "message": "Payment Successful. Thank you for your purchase."}

@app.post("/chat")
async def chat(request: ChatRequest):
    message = request.message.lower()
    
    # Dummy Agent Logic
    if "material" in message or "fabric" in message:
        reply = "Our garments are crafted from the finest Italian silk and hand-sourced cashmere, ensuring unparalleled elegance and comfort."
    elif "price" in message or "cost" in message:
        reply = "Our collections represent the pinnacle of luxury, with prices reflecting the exquisite craftsmanship and exclusive materials."
    elif "shipping" in message or "delivery" in message:
        reply = "We offer complimentary white-glove delivery worldwide for all our esteemed clients."
    else:
        reply = "Welcome to AURELIA. I am your personal concierge. How may I assist you with our luxury collection today?"
        
    return {"reply": reply}

@app.post("/contact-submit")
async def contact_submit(request: ContactRequest):
    # In a real app we'd save this or send an email
    return {"status": "success", "message": "Your inquiry has been received. Our concierge will contact you shortly."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
