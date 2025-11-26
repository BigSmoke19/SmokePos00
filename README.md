SmokePOS - Point of Sale Application
===================================

Description
-----------
SmokePOS is a desktop Point of Sale (POS) application built using Electron, React, Node.js, and MariaDB. 
It is designed for small businesses to manage products, sales, invoices, and users efficiently.

Features
--------
- Add, edit, and delete items with name, category, price, and barcode
- Manage categories and users
- Record sale invoices with item details
- User authentication with encrypted passwords
- Interactive POS interface
- Works offline as a desktop app
- Customizable barcode input and keyboard navigation
- Preview Statistics of sales

Technologies Used
-----------------
- Frontend: React, Redux, CSS
- Backend: Node.js, Express
- Database: MariaDB
- Desktop wrapper: Electron
- Security: bcrypt for password hashing
- HTTP client: Axios

Installation
------------
1. Clone the repository:
   git clone https://github.com/BigSmoke19/SmokePos00.git

2. Navigate to the project directory:
   cd SmokePOS

3. Install dependencies:
   npm install

4. Start the backend server:
   cd smokess
   npm start

5. Start the Electron app:
   cd ..
   npm run dev

Configuration
-------------
- Configure your MariaDB database settings in `.env` file:
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=yourpassword
  DB_NAME=smokess
  DB_PORT=3306

Usage
-----
- Launch the app via Electron.
- Add categories and items.
- Use the POS interface to create invoices.


Notes
-----
- Ensure MariaDB is running before starting the app.
- The app currently includes a default user:
  Username: user
  Password: password

License
-------
This project is open-source. Free to use and modify.
