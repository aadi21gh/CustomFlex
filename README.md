# CustomFlex 🎨

CustomFlex is a premium C2B (Customer-to-Business) and C2C (Customer-to-Customer) e-commerce marketplace that empowers creators to design custom products using a professional design studio, purchase them securely, and earn full refunds by sharing their creations and achieving viral community engagement.

Built with a modern, futuristic look inspired by Apple, Linear, Framer, and Figma, this full-stack application features custom glassmorphism styling, smooth animations, and high interactivity.

---

## Key Features

1. **Professional Design Studio (Fabric.js)**:
   - Layer manager (visibility, lock/unlock, delete, bring to front/send to back).
   - Rich shape library, color swatches, linear gradients, and quick typography styling.
   - Text editing, image uploads, and filter processing (grayscale, sepia, invert, blur, sharpen).
   - Flat 2D real-time product preview mockups (Artwork, Clothing, Accessories).
   - **Stability AI integration** for generating unique image assets from text prompts directly in the canvas.
2. **Dynamic Cost Calculator**:
   - Calculates production cost based on design complexity, material type (premium, luxury, etc.), and quantity.
3. **Stripe Payments**:
   - Fully secure payments with Stripe Checkout session creation.
   - Webhook endpoint for confirming order payment state and updating stats automatically.
4. **Social Sharing & Viral Refund Engine**:
   - Ordered designs can be shared to the public explore feed.
   - Users can like, comment, share, and bookmark designs.
   - **Refund System**: A background cron checker runs hourly. If a shared purchase receives likes >= product price AND results in 2+ other users purchasing the same design, the order becomes eligible for a full refund.
5. **Interactive Dashboard**:
   - Track active order fulfillment states (Pending, Paid, Processing, Shipped, Delivered).
   - Manage created designs (edit, duplicate, delete, toggle public/private).
   - View follow/unfollow community stats and saved bookmarks/wishlist.
6. **Robust Admin Panel**:
   - View analytics (revenue, orders, category breakdown).
   - Control user states (deactivate/activate users).
   - Order fulfillment system (update states to Shipped with tracking number, Delivered).
   - Review and process refund requests (automates Stripe refund API calls).

---

## Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Fabric.js, Axios, React Hot Toast
* **Backend**: Node.js, Express, MongoDB (Mongoose), JWT authentication (Passport.js), Cloudinary API, Stripe SDK, Stability AI API, Node-Cron

---

## Directory Structure

```
CustomFlex/
├── client/                 # Frontend React Application (Vite)
│   ├── src/
│   │   ├── components/     # UI, layout, studio, and explore components
│   │   ├── context/        # AuthContext and StudioContext
│   │   ├── lib/            # Axios instance and Stripe loaders
│   │   ├── pages/          # Landing, Auth, Studio, Checkout, Dashboard, and Admin pages
│   │   ├── App.jsx         # Client routing
│   │   └── main.jsx        # Mount point
│   ├── tailwind.config.js  # Premium glassmorphism styles and animations config
│   └── package.json
│
└── server/                 # Backend Node/Express API
    ├── config/             # DB, Passport, and Cloudinary configuration
    ├── controllers/        # Express request controllers
    ├── middleware/         # Auth, admin, upload, and error middleware
    ├── models/             # Mongoose schemas (User, Design, Order, Refund, etc.)
    ├── routes/             # API routes (auth, users, designs, orders, posts, refunds, upload)
    ├── utils/              # Email, token generator, price calculator, refund cron check
    ├── index.js            # Server entry point
    └── package.json
```

---

## Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB database (local or Atlas)
* Cloudinary account (for file uploads)
* Stripe developer account
* Stability AI API Key (optional, for AI generation)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd CustomFlex
   ```

2. **Configure Backend Environment**:
   Create a `.env` file in the `server` directory using the provided `server/.env.example` as a template:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/customflex
   JWT_SECRET=your_jwt_secret_key
   SESSION_SECRET=your_session_secret_key

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   STABILITY_API_KEY=your_stability_api_key

   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_smtp_user
   EMAIL_PASS=your_smtp_password
   EMAIL_FROM=noreply@customflex.com

   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLIENT_URL=http://localhost:5173
   ```

3. **Configure Frontend Environment**:
   Create a `.env` file in the `client` directory:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Install Dependencies**:
   * Install server dependencies:
     ```bash
     cd server
     npm install
     ```
   * Install client dependencies:
     ```bash
     cd ../client
     npm install
     ```

### Running the Application

1. **Start the Backend API Server**:
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

2. **Start the Frontend Development Server**:
   ```bash
   cd client
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## License

This project is licensed under the MIT License.
