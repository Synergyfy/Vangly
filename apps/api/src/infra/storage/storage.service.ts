import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ResolvedPhoto {
  photo_url: string;
}

@Injectable()
export class StorageService {
  private readonly cdnHost: string;
  private readonly allowedHosts: string[];

  constructor(config: ConfigService) {
    this.cdnHost = 'cdn.vangly.app';
    const cors = (config.get<string>('CORS_ORIGINS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    this.allowedHosts = [this.cdnHost, ...cors];
  }

  resolvePhotoUrl(input: { photo_url?: string | null }): ResolvedPhoto | null {
    if (!input.photo_url) return null;
    let parsed: URL;
    try {
      parsed = new URL(input.photo_url);
    } catch {
      throw new BadRequestException('photo_url must be a valid URL.');
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new BadRequestException('photo_url must use http(s).');
    }
    if (
      !this.allowedHosts.some(
        (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`),
      )
    ) {
      throw new BadRequestException(
        `photo_url host "${parsed.hostname}" is not on the CDN allowlist.`,
      );
    }
    return { photo_url: parsed.toString() };
  }
}
