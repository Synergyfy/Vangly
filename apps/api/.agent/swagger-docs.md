# Swagger / OpenAPI Documentation

> Public APIs are documented APIs. Every endpoint in this service must
> appear in Swagger with **accurate** request/response schemas, status
> codes, auth requirements, and examples.

---

## 1. Setup

```bash
pnpm add @nestjs/swagger swagger-ui-express
```

In `main.ts`:

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Vangly API')
  .setDescription('Backend for Vangly')
  .setVersion('1.0.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'access-token', // security name
  )
  .addTag('users', 'User accounts and profiles')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document, {
  swaggerOptions: { persistAuthorization: true },
});
```

Mount it at `/docs` in dev and staging. In production, gate it behind
auth or disable it (see `security.md` §10).

---

## 2. DTOs are the schema

Swagger is generated from the same classes that validate the request.
**Do not** hand-write schemas; decorate the DTOs.

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane', minLength: 2, maxLength: 50 })
  @IsString() @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString() @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: 'jane@example.com', format: 'email' })
  @IsEmail()
  email!: string;
}
```

Rules:

- Every DTO field has either `@ApiProperty` or `@ApiPropertyOptional`.
- Prefer `PartialType`, `OmitType`, `PickType` from `@nestjs/swagger` so
  metadata propagates. **Do not import these from `@nestjs/mapped-types`.**
- Add `example` to every field. Boring values are fine; the point is
  the schema is self-explanatory.

---

## 3. Entities / response schemas

Mirror DTOs with `*Entity` classes (see `dto-class-validator.md` §7) and
decorate them the same way:

```ts
export class UserEntity {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'jane@example.com' })
  email!: string;

  @ApiProperty()
  createdAt!: Date;
}
```

For paginated responses, define a generic envelope:

```ts
export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items!: T[];

  @ApiProperty({ example: 123 })
  total!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}
```

Use it as `@ApiOkResponse({ type: PaginatedResponseDto(UserEntity) })`.

---

## 4. Controller decorators — the minimum useful set

```ts
@ApiTags('users')
@ApiBearerAuth('access-token') // applies to every method
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: UserEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email already in use' })
  create(@Body() dto: CreateUserDto): Promise<UserEntity> { /* ... */ }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserEntity> { /* ... */ }
}
```

Rules:

- `@ApiTags` on every controller.
- `@ApiOperation({ summary })` on every route.
- `@ApiOkResponse` / `@ApiCreatedResponse` / etc. with a typed schema.
- Document **all** non-2xx responses your code can actually return
  (400, 401, 403, 404, 409, 429, 500). No "implied 500" mystery meat.
- Document every `@Param` and `@Query` that has constraints beyond
  "string" (formats, enums, ranges).

---

## 5. Auth and security schemes

- One `addBearerAuth(...)` per scheme, with a unique security name.
- Apply per-controller with `@ApiBearerAuth('access-token')` and per-route
  with `@ApiSecurity('api-key')` etc.
- If an endpoint is **public** (login, register, health), add
  `@ApiBearerAuth('access-token')` at the controller level **and**
  `@ApiOperation({ security: [] })` (or use a separate controller) so the
  lock icon is correctly shown as off.

---

## 6. Examples and edge cases

- Use `example` and `examples` (`{ value1: {...}, value2: {...} }`) for
  fields with non-obvious shapes (enums, ISO date strings, cuid/uuid).
- For nullable fields, set `nullable: true` on `@ApiProperty` and reflect
  that with `@IsOptional()` + the type.
- For polymorphic payloads, prefer discriminated unions with
  `discriminator: { propertyName: 'kind' }` and a `oneOf`/`anyOf` schema.
- Avoid `additionalProperties: true` on response schemas — it hides
  contract drift. Be explicit.

---

## 7. Error responses

Standardize on a single error envelope and document it once:

```ts
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: '2026-06-06T12:34:56.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/users' })
  path!: string;
}
```

If you have one, register it as a global response schema in
`SwaggerModule.createDocument` (via `extraModels`) so it shows up in the
"Schemas" section of the UI.

---

## 8. Don't ship undocumented endpoints

CI / pre-merge guard:

```ts
// scripts/check-swagger.ts (run in CI)
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

(async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  const config = new DocumentBuilder().setTitle('Vangly API').setVersion('1.0.0').build();
  const doc = SwaggerModule.createDocument(app, config);
  const paths = Object.keys(doc.paths);
  const unannotated = paths.filter((p) =>
    Object.values(doc.paths[p]).every((op: any) => !op.summary || !op.responses),
  );
  if (unannotated.length) {
    console.error('Undocumented paths:', unannotated);
    process.exit(1);
  }
  await app.close();
})();
```

Add to `package.json`:

```json
"scripts": {
  "docs:check": "ts-node scripts/check-swagger.ts"
}
```

A PR that adds an endpoint but breaks `pnpm docs:check` is a blocker.

---

## 9. Versioning

- URL versioning: `/v1/users`, `/v2/users`. Reflect in the controller
  path **and** in the Swagger tag.
- When you bump versions, copy the relevant controllers, change the tag
  summary, and start a new file. Do not sprinkle `if (version === 1)` in
  one file.
- Update the API version in `DocumentBuilder.setVersion()` and the README.

---

## 10. Checklist for a new endpoint

- [ ] DTOs/Entities have `@ApiProperty` / `@ApiPropertyOptional` on every field
- [ ] Controller has `@ApiTags`; method has `@ApiOperation({ summary })`
- [ ] Success response type is set (`@ApiOkResponse`, etc.)
- [ ] All non-2xx responses the code can return are documented
- [ ] Auth scheme is declared (or explicitly `security: []` for public)
- [ ] `@Param` / `@Query` constraints are documented
- [ ] `pnpm docs:check` passes
