import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService, PrismaService } from './app.service';
import { Response } from 'express';
import { addMilliseconds } from 'date-fns';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  async main(@Res() res: Response) {
    try {
      const token = await this.prismaService.token.findFirst();
      try {
        await this.appService.validateToken(token.access_token);
        this.appService.startBot(token.access_token);
      } catch (_e) {
        const result = await this.appService.refreshToken(token.refresh_token);
        await this.prismaService.token.update({
          where: { id: token.id },
          data: {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
          },
        });
        this.appService.startBot(result.access_token);
      }
      return res.render('success', {});
    } catch (_e) {
      return res.render('index', { client_id: process.env.CLIENT_ID });
    }
  }

  @Get('/token')
  async getToken(
    @Query()
    query:
      | { code: string; scope: string }
      | { error: string; error_description: string },
    @Res() res: Response,
  ) {
    if ('code' in query) {
      try {
        const result = await this.appService.getToken(query.code);
        await this.prismaService.token.create({
          data: {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            expires_at: addMilliseconds(new Date(), result.expires_in),
          },
        });
        return res.redirect('/');
      } catch (e) {
        console.log(e);
        return res.render('error', {
          error: `Server couldn't authorize! (Twitch Response status: ${e.response.data.status} - ${e.response.data.message})`,
        });
      }
    } else {
      return res.render('error', {
        error: 'User denied access to the app.',
      });
    }
  }
}
