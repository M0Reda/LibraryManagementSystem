# Library Management System

A complete ASP.NET Core 8 Web API for managing authors, books, members, and borrowings.

## Overview

This project is a comprehensive library management system that handles:
- **Book Inventory Management**: Create and manage books and their authors
- **Member Management**: Register and manage library members with profiles
- **Borrowing System**: Track book borrowings and returns with due date management
- **User Authentication**: Secure login system with role-based access control (Admin/Member)
- **Email Notifications**: Background jobs for sending reminders and notifications

---

## Prerequisites

Before running the project, ensure you have:
- **.NET 8 SDK** (or later) installed
- **Docker & Docker Compose** (for containerized setup)
- **PostgreSQL 16** (or use the Docker container)
- **Visual Studio Code** or **Visual Studio 2022** (recommended)

---

## How to Run Locally

1. Ensure you have the .NET 8 SDK installed.
2. Navigate to the `LibraryManagementSystem` folder.
3. Run the following command:
   ```bash
   dotnet run
   ```
4. The API will be accessible at `http://localhost:5000` (or the port specified in your console).

## How to Run with Docker

1. Ensure you have Docker and Docker Compose installed.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
3. The API will be accessible at `http://localhost:8080`.

Once the application is running, you can access the various services at:
- **API Swagger (Docker):** `http://localhost:8081` (dedicated `swaggerapi/swagger-ui` container)
- **API Swagger (Local):** `http://localhost:5000/swagger` (embedded Swashbuckle UI, only when running without Docker)
- **Reset Admin Tool:** `POST /api/ResetAdmin/reset-admin` (Use this if you cannot login with default credentials)
- **pgAdmin (Database UI):** `http://localhost:5050` (Login: `admin@library.com` / `admin`)

## Technologies Used

- **ASP.NET Core 8 Web API**: Modern, high-performance framework for building RESTful services.
- **Entity Framework Core + Npgsql**: ORM for .NET with a PostgreSQL provider — handles schema, migrations, and LINQ-to-SQL.
- **PostgreSQL 16**: Open-source relational database used for all persistent storage.
- **JWT Bearer Authentication**: Standard-based approach for securing API endpoints using signed tokens.
- **BCrypt.Net**: Robust password hashing library to protect member credentials at rest.
- **Swagger / Swashbuckle**: Interactive API documentation and in-browser endpoint testing tool.
- **Docker**: Packages the API into a portable, reproducible container image.
- **swaggerapi/swagger-ui**: Official standalone Swagger UI Docker image — serves the interactive API docs by reading the OpenAPI spec JSON from the API container.
- **pgAdmin4**: Web-based administration tool for managing the PostgreSQL database.

## Why HTTP-only Cookies for Auth Security?

While this project uses JWT in the Authorization header for simplicity, industry standards often recommend **HTTP-only cookies** for storing tokens in web applications because:
- **XSS Protection**: JavaScript cannot access HTTP-only cookies, preventing token theft via Cross-Site Scripting.
- **Automatic Transmission**: The browser automatically sends cookies with each request, simplifying client-side logic.
- **Mitigates Token Theft**: Even if an attacker injects a script, they cannot read the cookie content.

---

## Testing Workflow (Swagger)

1. Open `http://localhost:8081` (Docker) or `http://localhost:5000/swagger` (Local).
2. **Reset/Set Admin Credentials (Optional)**:
   - If you have trouble logging in, use `POST /api/ResetAdmin/reset-admin`.
   - Provide the `email` and `password` you want to use in the JSON body.
3. **Login as Admin**:
   - POST `/api/auth/login` with your credentials.
   - Copy the generated `token`.
4. **Authorize (CRITICAL)**:
   - Click the **Authorize** button in Swagger.
   - Enter **`Bearer {your_token}`** (Type the word "Bearer" followed by a space, then paste your token).
   - Click Authorize.
5. **Test Endpoints**:
   - GET `/api/books` should return the seeded books.
   - POST `/api/authors` (Admin only) to create a new author.
6. **Login as Member**:
   - POST `/api/auth/login` with member credentials (e.g., `john@member.com`).
   - Repeat the Authorization step with the new token.
6. **Borrow a Book**:
   - POST `/api/borrowings` with valid `bookId` and `memberId`.
7. **Verify Permissions**:
   - Try `DELETE /api/books` as a Member; it should return **403 Forbidden**.
   - Try any endpoint without a token; it should return **401 Unauthorized**.

---

## Project Structure

```
LibraryManagementSystem/
├── Controllers/          # API endpoints and request handling
│   ├── AuthController.cs         # Login/authentication endpoints
│   ├── AuthorsController.cs      # Author CRUD operations
│   ├── BooksController.cs        # Book CRUD operations
│   ├── BorrowingsController.cs   # Borrowing management
│   ├── MembersController.cs      # Member CRUD operations
│   └── ResetAdminController.cs   # [NEW] Admin credentials recovery tool
├── Services/            # Business logic layer
│   ├── Interfaces/      # Service contracts
│   └── Implementations/ # Service implementations
├── Models/              # Entity data models
│   ├── Author.cs
│   ├── Book.cs
│   ├── Borrowing.cs
│   ├── Member.cs
│   └── MemberProfile.cs
├── DTOs/                # Data Transfer Objects for API requests/responses
├── Data/                # Database context (Entity Framework)
├── Migrations/          # Database schema migrations
├── Middleware/          # Custom middleware (exception handling)
├── Program.cs           # Application entry point and configuration
├── appsettings.json     # Configuration settings
└── Dockerfile           # Docker container configuration
```

---

## Database Schema

### Core Entities

1. **Author**
   - `Id` (GUID): Primary key
   - `Name` (string): Author name
   - `Biography` (string, optional): Author bio
   - `CreatedAt` (DateTime): Creation timestamp
   - Relationships: One-to-Many with Books

2. **Book**
   - `Id` (GUID): Primary key
   - `Title` (string): Book title
   - `Isbn` (string): International Standard Book Number
   - `PublicationDate` (DateTime): Publication date
   - `AuthorId` (GUID): Foreign key to Author
   - `Description` (string): Book description
   - `AvailableCopies` (int): Number of available copies
   - `TotalCopies` (int): Total number of copies
   - Relationships: Many-to-One with Author, One-to-Many with Borrowings

3. **Member**
   - `Id` (GUID): Primary key
   - `Email` (string): Member email
   - `PasswordHash` (string): BCrypt hashed password
   - `Role` (enum: Admin, Member)
   - `CreatedAt` (DateTime): Account creation timestamp
   - Relationships: One-to-One with MemberProfile, One-to-Many with Borrowings

4. **MemberProfile**
   - `Id` (GUID): Primary key
   - `MemberId` (GUID): Foreign key to Member
   - `FirstName` (string): Member first name
   - `LastName` (string): Member last name
   - `PhoneNumber` (string): Contact number
   - `Address` (string): Member address
   - Relationships: One-to-One with Member

5. **Borrowing**
   - `Id` (GUID): Primary key
   - `MemberId` (GUID): Foreign key to Member
   - `BookId` (GUID): Foreign key to Book
   - `BorrowDate` (DateTime): Date of borrowing
   - `DueDate` (DateTime): Expected return date
   - `ReturnDate` (DateTime, optional): Actual return date
   - `Status` (enum: Active, Returned, Overdue)
   - Relationships: Many-to-One with Member and Book

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password

### Authors
- `GET /api/authors` - Get all authors
- `GET /api/authors/{id}` - Get author by ID
- `POST /api/authors` - Create new author (Admin only)
- `PUT /api/authors/{id}` - Update author (Admin only)
- `DELETE /api/authors/{id}` - Delete author (Admin only)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book (Admin only)
- `PUT /api/books/{id}` - Update book (Admin only)
- `DELETE /api/books/{id}` - Delete book (Admin only)

### Members
- `GET /api/members` - Get all members (Admin only)
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members` - Register new member
- `PUT /api/members/{id}` - Update member profile
- `DELETE /api/members/{id}` - Delete member (Admin only)

### Borrowings
- `GET /api/borrowings` - Get borrowing records
- `GET /api/borrowings/{id}` - Get borrowing by ID
- `POST /api/borrowings` - Create new borrowing record
- `PUT /api/borrowings/{id}/return` - Return a borrowed book

---

## Authentication & Authorization

### Login Credentials

**Admin Account:**
- Email: `admin@library.com`
- Password: `Admin@123`

**Member Account (Seeded):**
- Email: `john@member.com`
- Password: `Admin@123`

### Roles & Permissions

- **Admin**: Full access to all endpoints (create, read, update, delete books, authors, and members)
- **Member**: Limited access (view books, manage own profile, borrow books)

### How to Authenticate

1. Call `POST /api/auth/login` with credentials
2. Receive a JWT token in the response
3. Include the token in the `Authorization` header: `Bearer {token}`
4. Token expiry is configured in `appsettings.json`

---

## Configuration

Edit `appsettings.json` to configure:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=librarydb;Username=postgres;Password=password"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-chars",
    "Issuer": "LibraryAPI",
    "Audience": "LibraryClient",
    "ExpiryMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

**Key Settings:**
- **DefaultConnection**: PostgreSQL connection string
- **Jwt.SecretKey**: Secret key for JWT signing (min 32 characters recommended)
- **Jwt.ExpiryMinutes**: Token expiration time in minutes

---

## Troubleshooting

### Common Issues

1. **"Connection refused" when connecting to PostgreSQL**
   - Ensure PostgreSQL is running
   - Check connection string in `appsettings.json`
   - For Docker, ensure services are running: `docker-compose ps`

2. **"Database does not exist" error**
   - Run migrations: `dotnet ef database update`
   - Or use Docker which auto-initializes the database

3. **"401 Unauthorized" on API calls**
   - Ensure you've logged in and received a token
   - Verify token format: `Bearer {token}` (with space)
   - Check token hasn't expired

4. **"403 Forbidden" on endpoint access**
   - Verify you have the required role (Admin/Member)
   - Check endpoint permission requirements in controller

5. **Docker compose fails to start**
   - Ensure ports 8080, 8081, 5050, 5432 are not in use
   - Clear Docker cache: `docker-compose down -v`
   - Rebuild: `docker-compose up --build`

---

## License

This project is provided as-is for educational and development purposes.
