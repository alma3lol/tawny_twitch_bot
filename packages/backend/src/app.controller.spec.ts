import { AppController } from './app.controller';
import {
  AppService,
  PrismaService,
  TwitchOAuth2ValidationResponse,
} from './app.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Token } from '../src/generated/client';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let mockedAppService: DeepMockProxy<AppService>;
  let prismaService: PrismaService;
  let mockedPrismaService: DeepMockProxy<{
    [K in keyof PrismaService]: Omit<PrismaService[K], 'groupBy'>;
  }>;

  beforeEach(async () => {
    mockedAppService = mockDeep<AppService>();
    appService = mockedAppService as AppService;
    mockedPrismaService =
      mockDeep<PrismaService>() as unknown as DeepMockProxy<{
        [K in keyof PrismaService]: Omit<PrismaService[K], 'groupBy'>;
      }>;
    prismaService = mockedPrismaService as unknown as PrismaService;
    appController = new AppController(appService, prismaService);
  });

  describe('root', () => {
    it('should return "index"', async () => {
      const token: Token = {
        id: 0,
        refresh_token: 'refresh_token',
        access_token: 'access_token',
        expires_at: new Date(),
      };
      const validatedToken: TwitchOAuth2ValidationResponse = {
        login: 'login',
        scope: [],
        user_id: 'user_id',
        client_id: 'client_id',
        expires_in: 0,
      };
      mockedAppService.validateToken.mockResolvedValue(validatedToken);
      mockedPrismaService.token.findFirst.mockResolvedValue(token);
      const res = {
        render: (template: string, _params: any) => template, // eslint-disable-line
      };
      expect(await appController.main(res as any)).toBe('index');
    });
  });
});
