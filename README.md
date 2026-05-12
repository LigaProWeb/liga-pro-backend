# Liga Pro - Backend

Backend del proyecto universitario **Liga Pro**, una plataforma para que jugadores amateurs puedan organizar y participar en partidos individuales o torneos de deportes como futbol, padel y volley.

El objetivo del backend es trabajar con **Nest.js**, **TypeScript** y una arquitectura de **microservicios dentro de un monorepo**, manteniendo todas las apps en un mismo repositorio para facilitar el desarrollo en equipo.

## Stack principal

- Nest.js
- TypeScript
- Node.js
- Arquitectura basada en microservicios
- Comunicacion interna por mensajes y eventos
- Frontend previsto: React con Next.js

## Idea general de arquitectura

La idea es separar el backend en varias aplicaciones Nest dentro del mismo repo:

```txt
Frontend Next.js
  |
  | HTTP / WebSocket
  v
API Gateway Nest
  |
  | mensajes y eventos internos
  v
Microservicios Nest
```

El frontend no deberia comunicarse directamente con cada microservicio. En su lugar, habla con una app principal llamada **API Gateway**, y esa app coordina la comunicacion con los servicios internos.

## Estructura monorepo propuesta

Cuando se convierta el proyecto a monorepo con el CLI de Nest, la estructura esperada seria:

```txt
backend/
  apps/
    api-gateway/
      src/
        main.ts
        app.module.ts

    users-service/
      src/
        main.ts
        users.module.ts
        users.controller.ts
        users.service.ts

    matches-service/
      src/
        main.ts
        matches.module.ts
        matches.controller.ts
        matches.service.ts

    tournaments-service/
      src/
        main.ts
        tournaments.module.ts
        tournaments.controller.ts
        tournaments.service.ts

    notifications-service/
      src/
        main.ts
        notifications.module.ts
        notifications.controller.ts
        notifications.service.ts

  libs/
    contracts/
      src/
        events/
        patterns/
        dto/

    common/
      src/
        config/
        constants/
        types/
```

## Responsabilidad de cada app

### api-gateway

Es la entrada principal al backend.

Responsabilidades:

- Recibir requests HTTP desde el frontend.
- Exponer endpoints publicos.
- Validar datos de entrada.
- Comunicarse con los microservicios internos.
- Enviar eventos en tiempo real al frontend mediante WebSockets o SSE.

Ejemplos:

```txt
POST /matches
GET /matches
POST /tournaments
GET /notifications
```

### users-service

Gestiona usuarios y perfiles deportivos.

Responsabilidades:

- Crear usuarios.
- Consultar usuarios.
- Actualizar perfiles.
- Guardar preferencias deportivas.

Posibles tablas para base de datos:

```txt
users
user_profiles
user_sport_preferences
```

### matches-service

Gestiona partidos individuales.

Responsabilidades:

- Crear partidos.
- Buscar partidos disponibles.
- Inscribir jugadores a partidos.
- Cancelar partidos.
- Cambiar estados del partido.

Posibles tablas:

```txt
matches
match_participants
sports
venues
```

### tournaments-service

Gestiona torneos.

Responsabilidades:

- Crear torneos.
- Inscribir equipos o jugadores.
- Administrar fixtures.
- Cambiar estados del torneo.

Posibles tablas:

```txt
tournaments
tournament_registrations
teams
team_members
fixtures
```

### notifications-service

Gestiona notificaciones internas y avisos al usuario.

Responsabilidades:

- Escuchar eventos emitidos por otros servicios.
- Crear notificaciones para usuarios.
- Informar al gateway que existe una nueva notificacion.

Posibles tablas:

```txt
notifications
notification_preferences
```

## Patrones de comunicacion

En Nest se pueden combinar dos formas de comunicacion entre servicios.

### Message-Response

Se usa cuando un servicio necesita una respuesta inmediata.

Ejemplos:

```txt
api-gateway -> users-service: crear usuario
api-gateway -> matches-service: buscar partidos disponibles
api-gateway -> tournaments-service: inscribir equipo
```

En Nest esto se implementa con:

```ts
@MessagePattern()
client.send()
```

Regla practica:

```txt
Si necesito una respuesta ahora, uso Message-Response.
```

### Event-Based

Se usa cuando un servicio solo quiere avisar que algo ocurrio.

Ejemplos:

```txt
match.created
match.player_joined
tournament.created
tournament.registration_completed
notification.created
```

En Nest esto se implementa con:

```ts
@EventPattern()
client.emit()
```

Regla practica:

```txt
Si estoy avisando que algo ya paso, uso Event-Based.
```

## Ejemplo de flujo completo

Caso: un jugador se une a un partido.

```txt
1. El frontend llama al API Gateway:
   POST /matches/:id/join

2. El API Gateway envia un mensaje al matches-service:
   matches.join

3. matches-service valida cupo y registra al jugador.

4. matches-service emite un evento:
   match.player_joined

5. notifications-service escucha ese evento.

6. notifications-service crea una notificacion para el organizador.

7. notifications-service emite:
   notification.created

8. api-gateway escucha ese evento.

9. api-gateway envia la notificacion al frontend por WebSocket.
```

## Eventos y mensajes iniciales

### Users

Mensajes:

```txt
users.create
users.find_by_id
users.update_profile
```

Eventos:

```txt
user.created
user.profile_completed
```

### Matches

Mensajes:

```txt
matches.create
matches.find_available
matches.join
matches.leave
matches.cancel
```

Eventos:

```txt
match.created
match.player_joined
match.player_left
match.cancelled
match.completed
```

### Tournaments

Mensajes:

```txt
tournaments.create
tournaments.find_open
tournaments.register_team
tournaments.start
```

Eventos:

```txt
tournament.created
tournament.registration_completed
tournament.started
tournament.finished
```

### Notifications

Mensajes:

```txt
notifications.find_by_user
notifications.mark_as_read
```

Eventos:

```txt
notification.created
notification.read
```

## Comunicacion con el frontend

El frontend no deberia escuchar directamente los eventos internos del backend.

La forma recomendada es:

```txt
Microservicios internos
  -> eventos internos
  -> api-gateway
  -> WebSocket o SSE
  -> Frontend Next.js
```

Para notificaciones en tiempo real, el flujo seria:

```txt
notifications-service emite notification.created
api-gateway escucha notification.created
api-gateway envia new-notification al usuario conectado
frontend actualiza campanita, toast o panel de notificaciones
```

## Libreria de contratos

La libreria `contracts` deberia contener los nombres de mensajes, eventos y DTOs compartidos entre apps.

Ejemplo:

```txt
libs/contracts/src/
  patterns/
    matches.patterns.ts
    users.patterns.ts
    tournaments.patterns.ts

  events/
    matches.events.ts
    users.events.ts
    tournaments.events.ts
    notifications.events.ts

  dto/
    create-match.dto.ts
    join-match.dto.ts
    create-tournament.dto.ts
```

Esto evita escribir strings repetidos en distintos servicios y ayuda a que el equipo tenga contratos claros.

## Comandos utiles del CLI de Nest

Convertir el proyecto a monorepo creando una app:

```bash
npx nest generate app matches-service
```

Crear otras apps:

```bash
npx nest generate app users-service
npx nest generate app tournaments-service
npx nest generate app notifications-service
```

Crear una libreria compartida:

```bash
npx nest generate library contracts
```

Crear modulo, controlador y servicio dentro de una app:

```bash
npx nest generate module matches --project matches-service
npx nest generate controller matches --project matches-service
npx nest generate service matches --project matches-service
```

Levantar una app especifica del monorepo:

```bash
npx nest start matches-service --watch
```

## Criterio para avanzar

No conviene crear todos los servicios con logica completa desde el primer dia. El primer flujo recomendado es:

```txt
api-gateway
matches-service
notifications-service
contracts
```

Con eso se puede demostrar:

- Request HTTP desde frontend o cliente de prueba.
- Comunicacion Message-Response entre gateway y microservicio.
- Evento interno cuando se crea o actualiza un partido.
- Reaccion del notifications-service ante un evento.
- Posible notificacion al frontend por WebSocket.

Despues de validar ese circuito, se pueden sumar `users-service` y `tournaments-service` con una base mas clara.
