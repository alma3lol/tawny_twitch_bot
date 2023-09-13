import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  main(@Res() res: Response) {
    return res.render('index', { client_id: process.env.CLIENT_ID });
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
        this.appService.startBot(result.access_token);
        return res.render('success', {});
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
