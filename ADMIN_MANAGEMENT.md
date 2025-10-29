# Admin User Management

This document explains how to create and manage admin users for the BookShare application.

## Quick Start

### 1. Create New Admin User
```bash
npm run create-admin
```

### 2. List Existing Admin Users
```bash
npm run list-admins
```

## Default Admin Account

The system automatically creates a default admin account when you initialize the database:

- **Email:** admin@bookshare.com
- **Password:** Admin123!
- **Admin Code:** ADMIN123

## Creating Custom Admin Users

### Interactive Script
Run the admin creation script and follow the prompts:

```bash
npm run create-admin
```

The script will ask for:
1. **First Name** - Admin's first name
2. **Last Name** - Admin's last name
3. **Email** - Must be unique and valid
4. **Password** - Must meet security requirements
5. **Confirm Password** - Must match the password

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

### Example Session
```
🛡️  === BookShare Admin User Creator ===

👤 Enter admin first name: John
👤 Enter admin last name: Smith
📧 Enter admin email: john.admin@company.com
🔒 Enter admin password: SecureAdmin123
🔒 Confirm admin password: SecureAdmin123

🎉 Admin user created successfully!
📧 Email: john.admin@company.com
👤 Name: John Smith
🛡️  Role: Administrator
🆔 User ID: 671f8a5b2c3d4e5f6a7b8c9d
📅 Created: 10/28/2024

🔐 Admin Login Credentials:
   • Email: john.admin@company.com
   • Password: [the password you entered]
   • Admin Code: ADMIN123

🌐 Admin can now login at: http://localhost:3000/admin/login
```

## Managing Existing Users

### Promote Existing User to Admin
If you try to create an admin with an email that already exists, the script will offer to promote the existing user to admin:

```
❌ A user with email john@example.com already exists
⚠️  Do you want to update this user to admin? (y/N): y

✅ User updated to admin successfully!
```

### List All Admin Users
```bash
npm run list-admins
```

Example output:
```
👥 === Current Admin Users ===

1. Admin User
   📧 admin@bookshare.com
   🆔 671f8a5b2c3d4e5f6a7b8c9d
   📅 Created: 10/28/2024

2. John Smith
   📧 john.admin@company.com
   🆔 671f8a5b2c3d4e5f6a7b8c9e
   📅 Created: 10/28/2024
```

## Script Features

### ✅ **Validation**
- Email format validation
- Password strength requirements
- Duplicate email checking
- Database connection verification

### ✅ **Security**
- Passwords are hashed with bcrypt (12 salt rounds)
- No plain text password storage
- Secure environment variable loading

### ✅ **Error Handling**
- Clear error messages
- Graceful database disconnection
- Input validation with helpful prompts

### ✅ **MongoDB Integration**
- Direct database connection
- Proper schema validation
- Environment variable support

## Troubleshooting

### Database Connection Issues
```
❌ Error: MONGODB_URI not found in environment variables
```
**Solution:** Make sure you have a `.env.local` file with `MONGODB_URI` set.

### Email Already Exists
```
❌ A user with email admin@example.com already exists
```
**Solution:** Choose a different email or promote the existing user to admin.

### Password Too Weak
```
❌ Password must contain at least one uppercase letter, one lowercase letter, and one number
```
**Solution:** Use a stronger password that meets all requirements.

### MongoDB Connection Error
```
❌ MongoDB connection error: [error details]
```
**Solution:**
1. Check your internet connection
2. Verify `MONGODB_URI` is correct
3. Ensure MongoDB Atlas allows connections from your IP

## Environment Variables

The script automatically loads these from `.env.local`:

- `MONGODB_URI` - Your MongoDB connection string (required)
- `ADMIN_CODE` - The admin access code (defaults to "ADMIN123")

## Command Line Options

```bash
# Create new admin user (interactive)
npm run create-admin

# List existing admin users
npm run list-admins

# Show help
npm run create-admin -- --help
```

## Security Best Practices

1. **Use Strong Passwords** - Follow the password requirements
2. **Unique Emails** - Each admin should have a unique email
3. **Change Default Admin** - Change the default admin password
4. **Regular Audits** - Periodically review admin users with `npm run list-admins`
5. **Secure Admin Code** - Consider changing the default `ADMIN_CODE` in production

## Admin Login Process

Once created, admins can login at:
- **URL:** `http://localhost:3000/admin/login`
- **Credentials:** Email + Password + Admin Code
- **Default Admin Code:** `ADMIN123`

The admin will then be redirected to the admin dashboard with full administrative privileges.