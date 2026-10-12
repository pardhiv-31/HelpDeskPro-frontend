# HelpDesk Pro

HelpDesk Pro is a full-stack IT support ticket management system built as a college project. It provides a React dashboard for creating, searching, filtering, editing, resolving, and deleting support tickets through a Spring Boot REST API.

## Features

- Create, list, retrieve, edit, and delete support tickets
- Status workflow: `OPEN`, `IN_PROGRESS`, `RESOLVED`
- Priority values: `LOW`, `MEDIUM`, `HIGH`
- Search by title or description
- Filter by status and priority
- Dashboard totals for all, open, in-progress, and resolved tickets
- Required title and description validation
- Useful `400` and `404` API responses
- Responsive React interface with loading, empty, success, and error states

## Technology stack

- Frontend: React 19, Vite, JavaScript, CSS
- Backend: Java 21, Spring Boot 4, Maven
- Persistence: Spring Data JPA with H2

## Project structure

```text
helpdesk-pro/
|-- frontend/                 React + Vite application
|-- helpdesk-pro/             Spring Boot + Maven backend
|   |-- src/main/java/com/helpdesk/
|       |-- controller/       REST controllers and API error handling
|       |-- model/            JPA ticket entity
|       |-- repository/       Spring Data repository
|       `-- service/          Ticket business logic
`-- README.md
```

## Architecture

The React frontend runs on port `5173` and calls the backend at `http://localhost:8080/api/tickets`. The backend follows a Controller -> Service -> Repository -> Model structure. Spring Data JPA persists tickets to H2.

## Prerequisites

- Windows 10 or newer
- Java 21
- Node.js and npm
- No separate database server is required

## Start the backend on Windows

Open PowerShell in the nested backend directory:

```powershell
cd C:\Users\addan\Downloads\helpdesk-pro\helpdesk-pro
.\mvnw.cmd spring-boot:run
```

The backend starts at http://localhost:8080.

## Start the frontend on Windows

Open a second PowerShell window:

```powershell
cd C:\Users\addan\Downloads\helpdesk-pro\frontend
npm.cmd install
npm.cmd run dev
```

The frontend starts at http://localhost:5173.

On systems where PowerShell blocks `npm.ps1`, use `npm.cmd` as shown above.

## Database configuration

The current configuration uses an in-memory H2 database:

```properties
spring.datasource.url=jdbc:h2:mem:helpdeskdb
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
```

Tickets are cleared when the backend stops. The H2 console is available at http://localhost:8080/h2-console while the backend is running. Use JDBC URL `jdbc:h2:mem:helpdeskdb`, username `sa`, and an empty password.

## REST API

Base URL: `http://localhost:8080/api/tickets`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tickets` | List all tickets |
| GET | `/api/tickets/{id}` | Retrieve one ticket |
| POST | `/api/tickets` | Create a ticket; returns `201` |
| PUT | `/api/tickets/{id}` | Update a ticket |
| DELETE | `/api/tickets/{id}` | Delete a ticket; returns `204` |

Example JSON body:

```json
{
  "title": "Cannot access printer",
  "description": "The office printer is not visible from my laptop.",
  "category": "Hardware",
  "priority": "MEDIUM",
  "status": "OPEN"
}
```

`title` and `description` are required. Invalid requests return `400`; a missing ticket ID returns `404`.

## Verification commands

Backend compilation and tests:

```powershell
cd C:\Users\addan\Downloads\helpdesk-pro\helpdesk-pro
.\mvnw.cmd clean test-compile
.\mvnw.cmd clean test
```

Frontend production build and lint:

```powershell
cd C:\Users\addan\Downloads\helpdesk-pro\frontend
npm.cmd run build
npm.cmd run lint
```

For a manual demonstration, create a ticket, search for it, filter it, edit its status to `IN_PROGRESS` and `RESOLVED`, then delete it.
