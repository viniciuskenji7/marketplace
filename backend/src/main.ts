
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { getAllowedFrontendOrigin } from './common/config/frontend-origin.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bodyParser: false });

    const configService = app.get(ConfigService);

    app.use(helmet());
    app.use(cookieParser());
    app.use(json({ limit: '10kb' }));
    app.use(urlencoded({ extended: true, limit: '10kb' }));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: getAllowedFrontendOrigin(configService.get<string>('FRONTEND_URL')),
        credentials: true,
    });

    const port = configService.get<number>('PORT') ?? 3000;

    await app.listen(port);
}

void bootstrap().catch((error: unknown) => {
    console.error(
        'Falha ao iniciar a aplicação:',
        error instanceof Error ? error.stack : String(error),
    );
    process.exitCode = 1;
});
