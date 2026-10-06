# Nomi

Nomi is a web platform for cafés and restaurants to create, manage, and publish digital menus.

Restaurant owners can create an account and business workspace, manage categories and products, update prices and descriptions, upload images, control product visibility, and add translations.

Customers can access a business's public menu through a link or QR code on a phone, tablet, or screen. The menu is responsive and supports multiple languages.

Nomi also includes separate access for restaurant owners and platform administrators, with account management, dashboard PIN protection, password recovery, and business workspace management.

## Current Features

- Restaurant owner registration and business workspace creation
- Private owner dashboard
- Product and category management
- Product images
- Prices and descriptions
- Product visibility controls
- Multilingual menus
- Right-to-left language support, including Arabic
- Public menu pages
- Public menu links and QR codes
- Dashboard PIN protection
- Forgot-password recovery
- Forgotten PIN recovery using the owner's account password
- Platform administrator dashboard
- Business activation and suspension
- Menu view counts
- Role-based access control
- Password hashing and signed sessions

## Not Implemented Yet

The following features are not currently implemented:

- Online ordering
- Online payments
- Kitchen/order management integration
- Dedicated kiosk or full-screen mode

The public menu can already be opened on a tablet, phone, monitor, or computer through a web browser, but there is currently no dedicated kiosk mode.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- MySQL

### Authentication

- Password hashing
- Signed sessions
- Role-based access control
- Dashboard PIN protection
- Password-reset tokens

## Local Development

### Requirements

- Node.js
- MySQL Server running locally

> MySQL Workbench is a database management application. It does not include or start the MySQL Server.

### Database Setup

Start your local MySQL Server and create a database/schema named `nomi`.

In MySQL Workbench, you can run:

```sql
CREATE DATABASE nomi;
```

Then configure `backend/.env` with your MySQL connection:

```env
DATABASE_URL="mysql://root:your-password@localhost:3306/nomi"
```

Also configure a private `JWT_SECRET`.

**Do not share or commit your `.env` file.**

### Password Recovery / SMTP

Password recovery can send reset links through any SMTP provider.

Configure these values in `backend/.env`:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Use `SMTP_SECURE=true` with port `465`; use `false` with port `587`.

For local development, SMTP is optional. If SMTP is not configured, the password-reset link is printed in the backend terminal.

Password-reset links:

- Expire after 30 minutes
- Can only be used once
- Invalidate existing sessions after the password is changed

Owners can also recover a forgotten dashboard PIN by verifying their account password.

### Run the Backend

From the project root:

```sh
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed-admin
npm run dev
```

Before running `prisma:seed-admin`, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `backend/.env`. These credentials create the platform administrator used to sign in at `/platform`.

The API runs at:

```text
http://localhost:4000
```

### Run the Frontend

Open a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite, usually:

```text
http://localhost:5173
```

## Database Migrations

Prisma manages the MySQL database schema.

After pulling new changes that contain a migration, run:

```sh
cd backend
npm run prisma:migrate
```

For the current recovery features, make sure the latest Prisma migration has been applied to your local MySQL database.

## Development Notes

Nomi is currently focused on digital menu management and customer-facing menu browsing.

The same public menu can be opened from different devices because it is served online. A restaurant can use a tablet or screen at a table while the owner manages the business from another device.

A public link or QR code can also be used to let customers open the same menu on their own phones.