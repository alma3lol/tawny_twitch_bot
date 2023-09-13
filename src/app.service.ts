import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import { Client } from 'tmi.js';
import { PrismaClient } from '../src/generated/client';

type TwitchOAuth2TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
};

type TwitchOAuth2ValidationResponse = {
  expires_in: number;
  scope: string[];
  client_id: string;
  login: string;
  user_id: string;
};

type TwitchOAuth2RefreshResponse = {
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

  startBot = async (access_token: string) => {
    const client = new Client({
      options: { debug: true },
      identity: {
        username: process.env.BOT_USERNAME,
        password: access_token,
      },
      channels: [process.env.CHANNEL],
    });

    client.connect();

    client.on('chat', (channel, user, message, self) => {
      if (self) return;
      if (user['message-type'] === 'chat') {
        const commandRegex = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
        const [_raw, command, args] = message.match(commandRegex);
        switch (command.toLowerCase()) {
          case 'help':
            client.say(
              channel,
              `@${user.username} call 911 instead of chatting here!`,
            );
            break;
          case 'hello':
            client.say(channel, `@${user.username}, heya!`);
            break;
          case 'milk':
            if (user.badges.broadcaster === '1') {
              let width = 3;
              try {
                width = parseInt(args.trim());
                if (width > 5) width = 5;
              } catch (_e) {}
              for (let i = 0; i < width; i++) {
                client.say(channel, 'milk '.repeat(i + 1).trim());
              }
              for (let i = width - 1; i > 0; i--) {
                client.say(channel, 'milk '.repeat(i).trim());
              }
            }
            break;
          default:
            break;
        }
      }
    });
    client.on('join', (channel, username, self) => {
      if (self) return;
      client.say(channel, `Welcome aboard @${username}`);
    });
  };
}

@Injectable()
export class PrismaService extends PrismaClient {}
