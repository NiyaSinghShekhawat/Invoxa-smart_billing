# README.md for Invoxa
# Invoxa — Smart Billing & GST Invoice Manager

Invoxa is a modern smart billing and invoice management application built for businesses, freelancers, and shop owners who need fast GST-compliant invoice generation, inventory management, payment tracking, and professional billing workflows.

Built with a modern React + Supabase stack, Invoxa focuses on simplicity, speed, and real-world usability.
[Try Invoxa](https://invoxa-one.vercel.app/)
---

## ✨ Features

### 🧾 Smart Invoice Generation
- GST-compliant invoice creation
- CGST / SGST / IGST support
- Automatic subtotal + tax calculations
- Invoice history management
- Printable invoices
- Payment status tracking

### 📦 Inventory & Stock Management
- Product catalog
- HSN code support
- GST percentage per product
- Quantity tracking
- Cost & selling price management

### 💳 Payment Tracking
- Paid / Partial / Unpaid invoice states
- Due amount calculation
- Received payment updates
- Payment notes support

### 🏢 Business Settings
- Business profile management
- GSTIN support
- Bank details storage
- UPI support
- Logo uploads

### 🔐 Authentication & Security
- Supabase Authentication
- Row Level Security (RLS)
- User-isolated data access

### ☁️ Cloud Powered
- Supabase PostgreSQL database
- Supabase Storage integration
- Real-time scalable backend

---

# 🛠️ Tech Stack

## Frontend
- React
- Vite
- JavaScript
- Tailwind CSS

## Backend / Database
- Supabase
- PostgreSQL

## Storage
- Supabase Storage

---

# 📂 Project Structure

```bash
src/
│
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── pages/           # Application pages
├── services/        # Supabase configs/services
├── utils/           # Helper utilities
└── styles/          # Styling
````

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/NiyaSinghShekhawat/Invoxa-smart_billing.git
cd Invoxa-smart_billing
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Supabase

Create a project on Supabase:

👉 [https://supabase.com](https://supabase.com)

Run the provided `schema.sql` inside:

```txt
Supabase Dashboard → SQL Editor
```

---

## 4. Configure Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 5. Start Development Server

```bash
npm run dev
```

---

# 🔒 Database Features

The application includes:

* UUID-based primary keys
* Cascading deletes
* Row Level Security policies
* Storage bucket policies
* Automatic timestamps
* Secure per-user data isolation

---

# 📸 Planned Features

* PDF export
* Thermal printer support
* Analytics dashboard
* Customer management
* WhatsApp invoice sharing
* Barcode scanning
* Desktop app (Electron)
* Offline mode
* Multi-user roles

---

# 🧠 Why Invoxa?

Invoxa is designed to bridge the gap between:

* complex enterprise billing software
* and overly simplistic invoice generators.

The goal is to provide:

* modern UI
* real business workflows
* GST-ready billing
* inventory management
* scalable cloud architecture

all inside one lightweight platform.

---

# 📦 Deployment

You can deploy easily on:

* Vercel
* Netlify
* Render

Supabase handles:

* authentication
* database
* storage
* security

---

# 🧪 Development Notes

Recommended line endings:

```txt
LF (\n)
```

Recommended Node version:

```txt
18+
```

---

# 🤝 Contributing

Contributions, ideas, and feature suggestions are welcome.

Fork the repository and create a pull request.

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Developed by:

## Niya Singh

GitHub:
[NiyaSinghShekhawat](https://github.com/NiyaSinghShekhawat?utm_source=chatgpt.com)

---

# ⭐ Support

If you like this project, consider starring the repository.

```
::contentReference[oaicite:1]{index=1}
```
