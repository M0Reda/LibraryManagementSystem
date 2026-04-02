# Library Management System

A complete ASP.NET Core 8 Web API for managing authors, books, members, and borrowings.

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
- **pgAdmin (Database UI):** `http://localhost:5050` (Login: `admin@library.com` / `admin`)
- **MailHog (Email UI):** `http://localhost:8025` (For testing Hangfire email reminders, if implemented)

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
- **MailHog**: Web and API based SMTP testing tool, used to intercept and view emails sent by the application (useful for testing background email jobs).

## Why HTTP-only Cookies for Auth Security?

While this project uses JWT in the Authorization header for simplicity, industry standards often recommend **HTTP-only cookies** for storing tokens in web applications because:
- **XSS Protection**: JavaScript cannot access HTTP-only cookies, preventing token theft via Cross-Site Scripting.
- **Automatic Transmission**: The browser automatically sends cookies with each request, simplifying client-side logic.
- **Mitigates Token Theft**: Even if an attacker injects a script, they cannot read the cookie content.

---

## Testing Workflow (Swagger)

1. Open `http://localhost:8081`
2. **Login as Admin**:
   - POST `/api/auth/login` with `{"email": "admin@library.com", "password": "Admin@123"}`
   - Copy the generated `token`.
3. **Authorize**:
   - Click the "Authorize" button in Swagger.
   - Enter `Bearer {your_token}` and click Authorize.
4. **Test Endpoints**:
   - GET `/api/books` should return the seeded books.
   - POST `/api/authors` (Admin only) to create a new author.
5. **Login as Member**:
   - POST `/api/auth/login` with `{"email": "john@member.com", "password": "Admin@123"}`
   - Repeat the Authorization step with the new token.
6. **Borrow a Book**:
   - POST `/api/borrowings` with valid `bookId` and `memberId`.
7. **Verify Permissions**:
   - Try `DELETE /api/books` as a Member; it should return **403 Forbidden**.
   - Try any endpoint without a token; it should return **401 Unauthorized**.
