
<img width="1820" height="1080" alt="image" src="https://github.com/user-attachments/assets/749e9529-6a82-4ef4-8d7f-b056bd88c738" />
<img width="1820" height="1080" alt="image" src="https://github.com/user-attachments/assets/e691dd81-9e49-4987-b8d5-fce7ecb153be" />
<img width="1820" height="1080" alt="image" src="https://github.com/user-attachments/assets/fa9af6f1-e242-4763-af3a-b7c1ebecaa48" />
<img width="1820" height="1080" alt="image" src="https://github.com/user-attachments/assets/0dcc7f6f-7ff6-4c13-853d-dc33bdbc501f" />
<img width="1820" height="1080" alt="image" src="https://github.com/user-attachments/assets/6097a909-f7b5-4876-bfe9-b1f285a79402" />

Level 0 — Context Diagram

                  ┌──────────────────┐
                  │     STUDENT      │
                  └────────┬─────────┘
                           │
                Login / Browse Food /
                Place Order / Payment
                           │
                           ▼
              ┌─────────────────────────┐
              │                         │
              │  COLLEGE CANTEEN        │
              │  MANAGEMENT SYSTEM      │
              │                         │
              └─────────────────────────┘
                           │
                Order Status / Receipt /
                Food Details / Feedback
                           │
                           ▼
                  ┌──────────────────┐
                  │     STUDENT      │
                  └──────────────────┘


                  ┌──────────────────┐
                  │      ADMIN       │
                  └────────┬─────────┘
                           │
                 Manage Food / Orders /
                 Inventory / Users
                           │
                           ▼
              ┌─────────────────────────┐
              │  COLLEGE CANTEEN        │
              │  MANAGEMENT SYSTEM      │
              └───────────┬─────────────┘
                          │
                  Reports / Order Data /
                  Inventory Information
                          │
                          ▼
                  ┌──────────────────┐
                  │      ADMIN       │
                  └──────────────────┘


              ┌──────────────────────┐
              │  PAYMENT GATEWAY     │
              └──────────┬───────────┘
                         │
                 Payment Request /
                 Payment Response
                         │
                         ▼
              ┌─────────────────────────┐
              │  CANTEEN MANAGEMENT     │
              │       SYSTEM            │
              └─────────────────────────┘
              
**🍽️ College Canteen Management System**

The College Canteen Management System is a software application designed to streamline and automate the operations of a college canteen. It helps manage food items, orders, payments, and inventory while improving efficiency for both canteen staff and students.

The system provides an easy-to-use interface where students can view menus and place orders, while administrators can manage food items, track sales, and monitor inventory.

🎯 Objectives

To automate the manual process of managing canteen operations.

To reduce waiting time for students while ordering food.

To provide an organized system for order management.

To maintain proper records of sales and inventory.

**✨ Key Features**

1️⃣ User Management

Student login and registration

Admin login for canteen staff

Role-based access control

2️⃣ Menu Management

Add, update, or remove food items

Categorize items (snacks, beverages, meals, etc.)

Display available items with prices

3️⃣ Order Management

Students can place orders online

Real-time order tracking

Order history for users

4️⃣ Payment System

Supports online payment options

Order confirmation after successful payment

Payment record management

5️⃣ Inventory Management

Track stock of food ingredients

Alerts for low stock items

Update inventory automatically after orders

6️⃣ Admin Dashboard

View daily sales reports

Manage menu and inventory

Monitor orders and transactions

**🛠️ Technologies Used**

Frontend: react.js

Backend: Node.js 

Database: MongoDB

Version Control: Git & GitHub

**🏗️ System Architecture**

The system follows a client-server architecture where:

The frontend provides the user interface.

The backend handles business logic and request processing.

The database stores user data, menu items, and orders.

**📊 Advantages**

Reduces manual paperwork

Faster order processing

Improved accuracy in billing

Better management of inventory

Easy monitoring of sales and orders

**🚀 Future Enhancements**

Mobile application integration

QR code-based ordering

AI-based food demand prediction

Digital token system for order pickup

**👨‍💻 Author**

Shikha Agrahari
College Project – Canteen Management System
Project Name - Allen Eatery
