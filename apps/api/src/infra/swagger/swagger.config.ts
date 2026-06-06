import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Vangly API')
    .setDescription('Backend for Vangly (Invitely / Vemtap)')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Onboarding, login, refresh, logout, PIN reset')
    .addTag('locations', 'Org-admin command center: locations + dashboards')
    .addTag('teams', 'Teams within a location')
    .addTag('members', 'Members / users of a location')
    .addTag('forms', 'Form builder, publishing, responses, cloning')
    .addTag('public-forms', 'Public form surface (no auth)')
    .addTag('jobs', 'Background job status (bulk import, etc.)')
    .addTag('health', 'Service health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
