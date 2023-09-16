import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import { Client } from 'tmi.js';
import { PrismaClient } from '../src/generated/client';
import { BotSubject } from './subjects';

export type TwitchOAuth2TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
};

export type TwitchOAuth2ValidationResponse = {
  expires_in: number;
  scope: string[];
  client_id: string;
  login: string;
  user_id: string;
};

export type TwitchOAuth2RefreshResponse = {
  access_token: string;
  refresh_token: string;
  scope: string[];
  token_type: string;
};

@Injectable()
export class AppService {
  getToken = async (code: string) => {
    const response = await Axios.post<TwitchOAuth2TokenResponse>(
      'https://id.twitch.tv/oauth2/token',
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3000/token',
      },
      {
        responseType: 'json',
      },
    );
    return response.data;
  };

  validateToken = async (token: string) => {
    const response = await Axios.get<TwitchOAuth2ValidationResponse>(
      'https://id.twitch.tv/oauth2/validate',
      {
        responseType: 'json',
        headers: {
          Authorization: `OAuth ${token}`,
        },
      },
    );
    return response.data;
  };

  refreshToken = async (refresh_token: string) => {
    const response = await Axios.post<TwitchOAuth2RefreshResponse>(
      'https://id.twitch.tv/oauth2/token',
      `client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`,
      {
        responseType: 'json',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data;
  };

  startBot = async (access_token: string, prismaService: PrismaService) => {
    if (process.env.NODE_ENV === 'test') return;
    const client = new Client({
      options: { debug: true },
      identity: {
        username: process.env.BOT_USERNAME,
        password: access_token,
      },
      channels: process.env.CHANNEL.split(','),
    });

    client.connect();

    // const botSubject = new BotSubject(client, prismaService);
    new BotSubject(client, prismaService);
  };
}

@Injectable()
export class PrismaService extends PrismaClient {}
