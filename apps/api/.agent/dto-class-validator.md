# DTOs with class-validator + class-transformer

> Every byte that crosses the network boundary in either direction —
> request **and** response — must be modeled as a typed class, validated
> on the way in, and shaped on the way out.

---

## 1. Required packages

```bash
pnpm add class-validator class-transformer
```

Globally enable validation in `main.ts`:

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // strip unknown fields
    forbidNonWhitelisted: true, // 400 if client sends extras
    forbidUnknownValues: true,
    transform: true,            // run class-transformer
    transformOptions: {
      enableImplicitConversion: false, // be explicit, see §5
    },
  }),
);
```

`whitelist + forbidNonWhitelisted` is non-negotiable. It is your mass-
assignment firewall.

---

## 2. File & folder layout

```
src/modules/users/
  dto/
    create-user.dto.ts
    update-user.dto.ts
    query-users.dto.ts
    index.ts            // re-exports
  entities/
    user.entity.ts      // response shape
  users.controller.ts
  users.service.ts
  users.module.ts
```

- One DTO file per concern. Do not cram `Create | Update | Query` into one
  file.
- `dto/index.ts` re-exports them so consumers can do
  `import { CreateUserDto } from './dto'`.
- `entities/*.entity.ts` is the response shape (used by Swagger and
  serialization — see §4).

---

## 3. Naming

| Purpose | Suffix | Example |
| --- | --- | --- |
| Body for creating a resource | `Create*Dto` | `CreateUserDto` |
| Body for partial update | `Update*Dto` | `UpdateUserDto` |
| Body for full replace | `Replace*Dto` | `ReplaceUserDto` (use sparingly) |
| Query / search params | `*QueryDto` or `Find*Dto` | `FindUsersQueryDto` |
| Path params | `*ParamsDto` | `UserIdParamsDto` |
| Response shape | `*Entity` | `UserEntity` |
| Response envelope (paged) | `*PaginatedResponseDto` | `UsersPaginatedResponseDto` |

---

## 4. DTO template (the good kind of boilerplate)

```ts
// create-user.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/[A-Z]/, { message: 'password must contain an uppercase letter' })
  @Matches(/[a-z]/, { message: 'password must contain a lowercase letter' })
  @Matches(/[0-9]/, { message: 'password must contain a number' })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
```

### Definite-assignment (`!:`)

Use `!:` on required fields. The validation pipe throws before the field
is read, so the runtime value is guaranteed.

---

## 5. Avoid `enableImplicitConversion`

Implicit conversion hides bugs. Be explicit:

```ts
// query-users.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindUsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)   // "20" -> 20
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}
```

---

## 6. Update DTOs: all fields optional, no mass-assign to `id`

```ts
// update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  // password changes go through a dedicated ChangePasswordDto
}
```

`PartialType` from `@nestjs/swagger` (not `@nestjs/mapped-types`) so
Swagger metadata is preserved.

---

## 7. Response shaping with entities (not Prisma models)

Never return a Prisma model directly. Define an entity that:

- Omits secrets (`passwordHash`, `internalFlags`, `tokenVersion`).
- Picks only the fields the client should see.
- Is annotated with `@ApiProperty` (see `swagger-docs.md`).

```ts
// entities/user.entity.ts
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserEntity {
  @Expose() id!: string;
  @Expose() email!: string;
  @Expose() firstName!: string;
  @Expose() lastName!: string;
  @Expose() createdAt!: Date;

  static fromPrisma(u: {
    id: string; email: string; firstName: string; lastName: string; createdAt: Date;
  }): UserEntity {
    return Object.assign(new UserEntity(), u);
  }
}
```

Enable the global `ClassSerializerInterceptor`:

```ts
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

Now `new UserEntity().fromPrisma(user)` is the only way the service
returns users, and unknown fields never leak.

---

## 8. Custom validators

Wrap reusable rules instead of stacking decorators on the DTO.

```ts
// validators/is-strong-password.decorator.ts
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            value.length >= 12 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value)
          );
        },
        defaultMessage: () => 'password is too weak',
      },
    });
}
```

Then: `@IsStrongPassword() password!: string;`

---

## 9. Common gotchas

- **Arrays / nested objects**: every nested DTO needs `@ValidateNested()`
  + `@Type(() => NestedDto)`. Forgetting `@Type` silently does nothing.
- **Enums**: prefer `@IsEnum(MyEnum)` over free-form strings.
- **Dates**: accept `string` in the DTO, convert with `new Date(v)` in the
  service, and validate with `@IsISO8601()`.
- **Booleans from query strings**: query params are always strings. Use
  `@Transform(({ value }) => value === 'true' || value === '1')`.
- **File uploads**: don't accept files through JSON. Use `FileInterceptor`
  + a separate DTO.
- **Don't reuse entity classes for input**. Keep request and response
  shapes separate so adding a field to the response never accidentally
  becomes a way to write to the DB.

---

## 10. Checklist for a new endpoint

- [ ] `Create*Dto` / `Update*Dto` / `*QueryDto` exist and are exported
- [ ] `ValidationPipe` is enabled globally with `whitelist` + `forbidNonWhitelisted`
- [ ] No `any` types in the DTO
- [ ] `class-transformer` is used for coercion, not implicit conversion
- [ ] A matching `*Entity` exists for the response
- [ ] Service returns entities, not Prisma models
- [ ] Swagger decorators applied (see `swagger-docs.md`)
