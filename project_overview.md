# Majisa Jewellers - Digital Transformation Platform

## Executive Summary
**Majisa Jewellers** is a comprehensive B2B2C (Business-to-Business-to-Consumer) platform designed to digitize the traditional jewelry supply chain. The system bridges the gap between the central administration, wholesale vendors, manufacturing goldsmiths, and end customers through a secure, role-based ecosystem.

By implementing strict access controls (Referral Gating) and streamlined workflows, the platform ensures exclusivity for the brand while empowering vendors to manage their orders efficiently.

---

##  System Architecture & Portals
The application is divided into four distinct portals, each tailored to a specific stakeholder's needs:

### 1.  Admin Command Center
*The central nervous system for business owners. Full control over the entire ecosystem.*
- **Vendor Management**:
    - **Create & Onboard**: Admins have exclusive rights to create new Vendor accounts (Public registration is disabled for security).
    - **Credential Control**: Reset passwords and manage access rights.
    - **Referral Oversight**: View and regenerate unique Referral Codes for each vendor.
- **Product Catalog**:
    - **Inventory Control**: Add/Edit products with high-res images, categories, and specific attributes (Weight, Purity).
    - **Wastage Management**: Set wastage percentages visible only to Vendors.
- **Order Oversight**:
    - **Workflow Management**: View all incoming orders, track status (Pending -> In Progress -> Completed -> Delivered).
    - **Goldsmith Assignment**: Assign specific orders to specific Goldsmiths for manufacturing.
    - **Invoice Generation**: One-click generation of professional invoices/job cards for printing.
- **System Settings**: Configure global variables like Gold Rates and notification preferences.

### 2.  Vendor Portal
*Empowering wholesale partners to grow their business.*
- **Exclusive Access**: Secure login via a dedicated "Diamond" portal using admin-provided credentials.
- **Smart Ordering**:
    - **Custom Orders**: Place bulk orders with precise requirements (Size, Purity: 18K, 22K, 24K, 92.5 Silver).
    - **Dynamic Pricing**: View "Wastage" details that are hidden from regular customers.
- **Referral System**:
    - **Customer Network**: Access a unique **Referral Code** on the dashboard to share with their customers.
    - **Network Gating**: Only customers with this code can access the product catalog.
- **Order Tracking**: Real-time status updates on their placed orders.
- **Business Dashboard**: View profile details and order history.

### 3.  Goldsmith Portal
*Streamlining the manufacturing workflow.*
- **Job Queue**: Dedicated dashboard to view jobs (orders) assigned specifically to them by the Admin.
- **Digital Job Cards**: Access detailed specifications (Design, Weight, Size, Purity) needed for manufacturing, eliminating paper errors.
- **Status Updates**: Mark jobs as "In Progress" or "Completed" to instantly notify the Admin and Vendor.

### 4.  Customer Experience (The "Referral Gate")
*A curated, exclusive shopping experience.*
- **Referral Gating**: The public homepage is protected. New visitors **cannot** view products without a valid **Vendor Referral Code**.
    - **Verification Flow**: New users must enter Name, Phone, and Code.
    - **Validation**: The system instantly verifies the code against the Vendor database.
- **Modern UI**: "Instagram-Story" style category browsing and a premium, responsive design.
- **Catalog Browsing**: Once verified, customers can browse the full catalog with high-quality images and details.
    - **Price Privacy**: Wholesale pricing and wastage details are **hidden** from customers to protect Vendor margins.

---

##  Key Features & Innovations

###  Security & Exclusivity
- **Referral Gatekeeper**: A custom-built security layer that verifies customer access against valid vendor codes before rendering any product data.
- **Role-Based Access Control (RBAC)**: Strict separation of data. Vendors cannot see Admin data; Customers cannot see wholesale pricing.
- **Secure Authentication**: JWT (JSON Web Token) based sessions with encrypted passwords.
- **Admin-Only Onboarding**: Eliminates spam/unauthorized registrations by restricting Vendor creation to Admins.

###  Smart Order Management
- **Dynamic Forms**: Order forms that adapt based on the product category (e.g., asking for "Ring Size" for rings but "Chain Length" for necklaces).
- **Purity Selection**: Precise control over gold purity standards (92.5 Silver, 14K, 18K, 22K, 24K).
- **Wastage Calculation**: Automatic visibility of wastage percentages for Vendors to calculate true costs.

###  Premium User Experience
- **Visual Storytelling**: Category navigation designed like social media stories for intuitive mobile browsing.
- **Gold-Themed UI**: A consistent, brand-aligned aesthetic using a custom Gold & Charcoal color palette.
- **Responsive Design**: Fully optimized for Tablets and Mobile devices, allowing vendors to place orders on the go.

---

##  Technical Stack
- **Frontend**: React.js, Tailwind CSS (for premium styling), Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Scalable, flexible schema for complex product attributes).
- **Storage**: Cloudinary (High-performance image optimization and delivery).
- **Security**: BCrypt (Password Hashing), JWT, Custom Middleware.

---

##  Value Proposition
1.  **Operational Efficiency**: Eliminates manual phone/WhatsApp orders by centralizing everything on the platform.
2.  **Brand Exclusivity**: The Referral Gate ensures that prices and designs are only visible to trusted clients.
3.  **Scalability**: The "Admin creates Vendor" model allows the business to scale its network controllably without opening the floodgates to the public.
4.  **Transparency**: Vendors and Goldsmiths have real-time visibility into their respective tasks and orders.
