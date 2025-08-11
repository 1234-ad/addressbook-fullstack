# AddressBook Full-Stack Application

A comprehensive address book management system with separate User and Admin applications.

## 🚀 Features

### UserApp
- ✅ User authentication and registration
- ✅ Create, edit, and manage personal contacts
- ✅ Assign contacts to multiple groups
- ✅ Search and filter contacts
- ✅ Rich contact information (social links, job details)

### AdminApp
- ✅ Admin authentication
- ✅ Create and manage groups
- ✅ Search across all user addresses
- ✅ Assign addresses to groups
- ✅ Dashboard with statistics
- ✅ User management

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security
- **CORS** enabled

### Frontend
- **React.js** (User App)
- **React.js** (Admin App)
- **Material-UI** or **Tailwind CSS**
- **Axios** for API calls
- **React Router** for navigation

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/1234-ad/addressbook-fullstack.git
   cd addressbook-fullstack
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE addressbook;
   exit

   # Import schema
   mysql -u root -p addressbook < schema.sql
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install User App dependencies**
   ```bash
   cd frontend/user-app
   npm install
   npm start
   ```

2. **Install Admin App dependencies**
   ```bash
   cd frontend/admin-app
   npm install
   npm start
   ```

## 🗄️ Database Schema

### Tables
- **login** - User authentication and roles
- **addresses** - Contact information
- **groups** - Contact groups
- **address_groups** - Many-to-many relationship

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Addresses (User)
- `GET /api/addresses` - Get user's addresses
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `GET /api/addresses/:id` - Get single address

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group details
- `GET /api/groups/:id/addresses` - Get addresses in group

### Admin
- `GET /api/admin/groups` - Get all groups (admin)
- `POST /api/admin/groups` - Create group
- `PUT /api/admin/groups/:id` - Update group
- `DELETE /api/admin/groups/:id` - Delete group
- `GET /api/admin/addresses/search` - Search all addresses
- `POST /api/admin/addresses/:id/groups` - Assign address to groups
- `GET /api/admin/dashboard` - Get dashboard statistics

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention

## 🚦 Usage

### For Users
1. Register/Login to access your address book
2. Create contacts with detailed information
3. Assign contacts to groups for organization
4. Search and filter your contacts
5. Edit or delete contacts as needed

### For Admins
1. Login with admin credentials
2. Create and manage groups
3. Search across all user addresses
4. Assign addresses to appropriate groups
5. View dashboard statistics

## 📱 Screen Designs

### UserApp Screens
1. **Address Creation** - Form with all contact fields
2. **Group Selection** - Multi-select group assignment

### AdminApp Screens
1. **Group Management** - Create/edit/delete groups
2. **Address Search** - Search and assign addresses to groups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer**: [Your Name]
- **Version**: 1.1
- **Date**: August 2025