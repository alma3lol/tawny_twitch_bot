'use client';

import { TOGGLE_BOT_CONNECTED, useAppDispatch, useAppSelector, wrapper } from '@/redux';
import { AppService, PrismaService } from '@/services';
import { SocketIOServer } from '@/socket.io';
import { BotSubject } from '@/subjects';
import { CONNREFUSED } from 'dns';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function Home({ }: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const searchParams = useSearchParams();
	if (searchParams !== null) {
		const whaaaat = searchParams.get('whaaaat');
		if (whaaaat !== null) console.log(whaaaat);
	}
	const isBotConnected = useAppSelector(state => state.BOT.connected);
	const dispatch = useAppDispatch();
	useEffect(() => {
		const ioSocket = io('ws://localhost:4000/');
		ioSocket.on('connected', (connected) => {
			console.log({ connected });
			dispatch(TOGGLE_BOT_CONNECTED(connected));
		});
	});
	return (
		<div className= 'h-full w-full text-center flex' >
			<Head>
				<title>Tawny Twitch Bot - Index</title>
			</Head>
			<div className="m-auto" > Whether you're a brother or whether you're a mother you're staying alive...</div>
			<div>Bot connected: {`${ isBotConnected }`}</div>
		</div>
	)
}

export const getServerSideProps  = wrapper.getServerSideProps<{ client_id?: string }>(() => async ({  }) => {
	try {
		const prismaService = new PrismaService();
		const appService = new AppService();
		const token = await prismaService.token.findFirst();
		if (token === null) return { notFound: true, props: {} };
		let botSubject: BotSubject | undefined;
		try {
			await appService.validateToken(token.access_token);
			botSubject = await appService.startBot(token.access_token, prismaService);
		} catch (_e) {
			const result = await appService.refreshToken(token.refresh_token);
			await prismaService.token.update({
				where: { id: token.id },
				data: {
					access_token: result.access_token,
					refresh_token: result.refresh_token,
				},
			});
			botSubject = await appService.startBot(result.access_token, prismaService);
		}
		const server = SocketIOServer.getServer()
		server.on('connection', (socket) => {
			console.log(socket.id);
			socket.emit('welcome');
			botSubject?.subscribe({
				next: (connected) => {
					console.log({ connected });
					socket.emit('connected', connected);
				},
				complete: () => {
					socket.emit('connected', false);
				},
			});
		});
		return { props: {} }
	} catch (_e) {
		return { props: { client_id: process.env.CLIENT_ID } }
	}
});
