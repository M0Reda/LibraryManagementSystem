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

## Frontend Setup

The frontend is a **React + Vite** application that provides a user-friendly interface for the Library Management System.

### Frontend Features

- **Responsive UI**: Works on desktop, tablet, and mobile devices
- **User Authentication**: Secure login/logout with JWT token management
- **Protected Routes**: Only authenticated users can access restricted pages
- **Pages**:
  - **Home Page**: Dashboard with library statistics
  - **Books Page**: Browse, search, and filter available books
  - **Book Details**: View detailed information about a specific book
  - **Authors Page**: View all library authors
  - **Members Page**: Manage member profiles (Admin only)
  - **Borrowings Page**: Track active borrowings and returns
  - **Login Page**: User authentication interface

### Running the Frontend Locally

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (Vite's default port)

### Running the Frontend with Docker

The frontend is included in the `docker-compose.yml` and runs on port 3000:
```bash
docker-compose up --build
```

Access the frontend at: `http://localhost:3000`

### Frontend Technologies

- **React 18**: Modern UI framework with hooks
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication
- **React Router DOM**: Client-side routing
- **CSS**: Styling (CSS modules and global styles)

### Frontend Folder Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx     # Navigation bar component
│   │   └── ProtectedRoute.jsx  # Route protection for authenticated users
│   ├── pages/             # Page components
│   │   ├── HomePage.jsx   # Landing page with dashboard
│   │   ├── BooksPage.jsx  # Books catalog and search
│   │   ├── BookDetailPage.jsx  # Individual book details
│   │   ├── AuthorsPage.jsx    # Authors list
│   │   ├── MembersPage.jsx    # Members management
│   │   ├── BorrowingsPage.jsx # Borrowing records
│   │   └── LoginPage.jsx  # Authentication page
│   ├── services/
│   │   └── api.js         # Axios instance and API helper functions
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── index.html             # HTML template
├── Dockerfile             # Frontend container configuration
├── nginx.conf             # Nginx configuration for production
└── README.md              # Frontend-specific documentation
```

### Frontend API Communication

The frontend communicates with the backend API through the `api.js` service:

```javascript
// Example: Get all books
import { api } from './services/api';
const books = await api.get('/books');

// Example: Create a borrowing
const borrowing = await api.post('/borrowings', {
  bookId: '123e4567-e89b-12d3-a456-426614174000',
  memberId: '123e4567-e89b-12d3-a456-426614174001'
});
```

---

## Environment Variables & Configuration

### Backend Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=librarydb;Username=libraryuser;Password=librarypass"
  },
  "Jwt": {
    "Key": "SuperSecretKeyThatIsAtLeast32CharsLong!!",
    "Issuer": "LibrarySystem",
    "Audience": "LibraryUsers",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Docker Environment Variables

When running with Docker, environment variables override `appsettings.json`:
- `ConnectionStrings__DefaultConnection`: PostgreSQL connection string
- `Jwt__Key`: JWT signing key
- `Jwt__Issuer`: JWT issuer name
- `Jwt__Audience`: JWT audience
- `ASPNETCORE_ENVIRONMENT`: Development or Production

### Frontend Configuration

The frontend API base URL is configured in `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

Create a `.env` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Database Migrations & Seeding

### Running Migrations (Local Development)

Apply all pending migrations:
```bash
dotnet ef database update
```

Create a new migration after model changes:
```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Docker Database Initialization

Docker automatically initializes the database on first run using the existing migrations. The database is stored in a named volume `postgres-data` for persistence.

To reset the database:
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build  # Rebuild and reinitialize
```

### Seeded Data

The application includes default seeded data:
- **Admin Account**: `admin@library.com` / `Admin@123`
- **Sample Member**: `john@member.com` / `Admin@123`
- **Sample Books & Authors**: Loaded from migrations

---

## Health Check Endpoints

The application includes health check endpoints for monitoring:

- `GET /health` - Basic health check (returns 200 OK if service is running)
- Used by Docker for liveness and readiness probes

Example Docker health check:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 20s
```

---

## API Response Examples

### Successful Login Response

**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@library.com",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "message": "Login successful"
}
```

### Get Books Response

**Request:**
```bash
GET /api/books
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "The Great Gatsby",
    "isbn": "978-0743273565",
    "publishedYear": 1925,
    "authorId": "223e4567-e89b-12d3-a456-426614174001",
    "author": {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "F. Scott Fitzgerald"
    },
    "availableCopies": 3,
    "totalCopies": 5
  }
]
```

### Create Borrowing Response

**Request:**
```bash
POST /api/borrowings
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookId": "123e4567-e89b-12d3-a456-426614174000",
  "memberId": "323e4567-e89b-12d3-a456-426614174002",
  "borrowDate": "2026-05-06",
  "dueDate": "2026-05-20"
}
```

**Response (201 Created):**
```json
{
  "id": "423e4567-e89b-12d3-a456-426614174003",
  "memberId": "323e4567-e89b-12d3-a456-426614174002",
  "bookId": "123e4567-e89b-12d3-a456-426614174000",
  "borrowDate": "2026-05-06",
  "dueDate": "2026-05-20",
  "returnDate": null,
  "status": "Active"
}
```

### Error Response Examples

**401 Unauthorized (Missing/Invalid Token):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized: No token provided or token is invalid"
}
```

**403 Forbidden (Insufficient Permissions):**
```json
{
  "statusCode": 403,
  "message": "Forbidden: You do not have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**400 Bad Request (Validation Error):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Development Setup

### Prerequisites for Local Development

1. **Backend**:
   - .NET 8 SDK
   - PostgreSQL 16 (or run `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:16-alpine`)
   - Visual Studio Code or Visual Studio 2022

2. **Frontend**:
   - Node.js 18+ 
   - npm or yarn

### Full Stack Development Workflow

1. **Start PostgreSQL** (if not using Docker):
   ```bash
   # Windows
   pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start
   ```

2. **Terminal 1 - Backend**:
   ```bash
   cd LibraryManagementSystem
   dotnet restore
   dotnet ef database update
   dotnet run
   ```
   Backend runs on: `http://localhost:5000`

3. **Terminal 2 - Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

4. **Access the Application**:
   - Frontend: `http://localhost:5173`
   - API Swagger: `http://localhost:5000/swagger`
   - Login with: `admin@library.com` / `Admin@123`

### Debugging

**Backend - Visual Studio Code**:
1. Install C# Dev Kit extension
2. Press F5 to start debugging
3. Set breakpoints in your C# code

**Frontend - Browser DevTools**:
1. Open DevTools (F12)
2. Use React DevTools browser extension for component inspection

---

## Security Considerations

### Current Implementation

- **JWT Authentication**: Tokens signed with HS256
- **Password Hashing**: BCrypt.Net for secure password storage
- **CORS Policy**: Configured to accept requests from any origin (for development)
- **Role-Based Access Control**: Admin/Member roles for authorization

### Production Recommendations

1. **HTTPS Only**: Enable SSL/TLS certificates
2. **Restrict CORS**: Specify allowed origins instead of `AllowAnyOrigin()`
3. **HTTP-Only Cookies**: Store JWT in HTTP-only cookies instead of localStorage
4. **Rate Limiting**: Implement request throttling to prevent brute-force attacks
5. **Environment Variables**: Use secure vaults for sensitive configuration
6. **Input Validation**: Sanitize all user inputs
7. **SQL Injection Prevention**: Use parameterized queries (already done with EF Core)
8. **Secrets Management**: Use Azure Key Vault, AWS Secrets Manager, or similar
9. **Audit Logging**: Log all administrative actions
10. **Regular Updates**: Keep dependencies updated for security patches

---

## Contributing Guidelines

### Code Standards

- Follow **C# naming conventions** (PascalCase for classes/methods, camelCase for variables)
- Follow **JavaScript/React conventions** (camelCase for functions, PascalCase for components)
- Use meaningful variable and function names
- Add comments for complex business logic
- Keep methods/functions focused on a single responsibility

### Creating a New Feature

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Implement the feature (backend and/or frontend)
3. Test thoroughly
4. Submit a pull request with a clear description
5. Address code review comments

### Before Committing

- Ensure all code builds/runs without errors
- Test the feature manually
- Run any automated tests (if configured)
- Update documentation if needed

---

## Performance Optimization Notes

- **Database Indexing**: Consider adding indexes on frequently queried fields (Email, ISBN)
- **Pagination**: Implement pagination for large data sets (Books, Borrowings)
- **Caching**: Consider caching popular books or authors
- **API Response Optimization**: Use DTOs to return only necessary fields
- **Frontend Optimization**: 
  - Lazy load pages using React Router
  - Use React memo for component optimization
  - Implement infinite scroll or pagination for large lists

---

## Future Enhancements

- [ ] Email notifications for borrowing reminders and overdue books
- [ ] Advanced search and filtering options
- [ ] Book recommendations system based on borrowing history
- [ ] Fine management system for overdue books
- [ ] Review and rating system for books
- [ ] User dashboard with borrowing history and statistics
- [ ] Admin analytics and reporting
- [ ] Mobile app (React Native or Flutter)
- [ ] Integration with third-party book APIs (ISBN lookup)
- [ ] Two-factor authentication (2FA) for enhanced security
- [ ] Dark mode UI theme
- [ ] Multi-language support (i18n)

---

## Useful Commands

### Backend Commands

```bash
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the application
dotnet run

# Create a database migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Run tests (if test project exists)
dotnet test

# Publish for production
dotnet publish -c Release
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format  # If prettier is configured
```

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# Remove volumes (resets database)
docker-compose down -v

# View logs
docker-compose logs -f api

# Scale a service
docker-compose up --build --scale api=2
```

### PostgreSQL Commands (Docker)

```bash
# Connect to the database
docker exec -it lms-postgres psql -U libraryuser -d librarydb

# List tables
\dt

# Exit psql
\q
```

---

## Support & Contact

For issues, questions, or suggestions, please:
1. Check the **Troubleshooting** section above
2. Review the **API Endpoints** documentation
3. Check Docker logs: `docker-compose logs -f`
4. Consult the code comments and documentation

---

## License

This project is provided as-is for educational and development purposes.
