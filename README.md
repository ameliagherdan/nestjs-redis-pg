# NestJS Task Management System with Redis Caching and JWT Authentication

## Overview

This is a NestJS-based task management system that provides user authentication, role-based authorization, task CRUD operations, and caching with Redis to optimize performance. The system follows best practices for security, error handling, and code structure by applying design patterns such as the repository pattern, strategy pattern, and cache-aside pattern. It integrates Redis for caching and PostgreSQL for data persistence using TypeORM.

## Key Features

### User Authentication and Authorization:
- **JWT Authentication**: Uses JSON Web Token (JWT) for secure access to protected resources.
- **Role-Based Authorization**: Custom guards (`RolesGuard`) are implemented to restrict access to routes based on user roles.
- **Password Hashing**: User passwords are securely hashed using `bcrypt` with salting to enhance security.
- **Refresh Tokens**: Enables session extension without requiring the user to log in again, providing a better user experience.

### Task Management:
- **CRUD Operations**: Users can create, read, update, and delete tasks.
- **Redis Caching**: Tasks are cached in Redis to minimize database queries and improve performance.
- **PostgreSQL with TypeORM**: All task data is stored in a PostgreSQL database. TypeORM allows for seamless integration with NestJS and a clean separation of business logic from data access.

### Redis Caching:
- **Optimized Performance**: Redis is used to cache task data, reducing the load on the database.
- **Cache Invalidation**: Caches are dynamically invalidated when tasks are created, updated, or deleted to ensure data freshness.

### Error Handling:
- **Global Error Handling**: Exceptions are handled globally using NestJS’s built-in exception filters for consistent error responses.
- **Custom Exceptions**: Includes custom exceptions such as `NotFoundException` and `UnauthorizedException` for specific error handling scenarios.

## Design Patterns Applied

### Repository Pattern:
- Data access in `TasksService` and `UsersService` is abstracted into repositories, promoting separation of concerns and making the code easier to maintain and test.

### Dependency Injection:
- Built-in dependency injection in NestJS is used to manage services, repositories, and external libraries such as Redis and TypeORM. `RedisService`, `TasksService`, and `AuthService` are injected into various modules, ensuring modularity and flexibility.

### Strategy Pattern:
- Used in the authentication system with `LocalStrategy` and `JwtStrategy`, providing flexibility in how users are authenticated.

### Decorator Pattern:
- Custom decorators, such as `@Roles`, are used to annotate routes with role-based authorization metadata. The `RolesGuard` interprets this metadata to enforce access control.

### Cache-Aside Pattern:
- Implements the cache-aside pattern with Redis, where data is first looked up in the cache. If it is not found, it is retrieved from the PostgreSQL database and then cached for future requests.

## Tech Stack

- **Backend**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Cache**: [Redis](https://redis.io/)
- **Authentication**: [JWT](https://jwt.io/)
- **Authorization**: Role-based using custom guards and decorators
- **Security**: Password hashing with `bcrypt`
- **Validation**: DTOs with class-validator
- **Dependency Management**: [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/)

## Architecture Diagram

The architecture of the system includes user requests flowing through JWT authentication, Redis caching for task data, and database interaction with PostgreSQL.

[Architecture Diagram](assets/architecture.jpg)

### Prerequisites
- Node.js and npm installed
- PostgreSQL and Redis installed and running
- Docker (optional, if using Docker for Redis/PostgreSQL)
