import { FC, FormEvent, useEffect, useState } from "react";
import {
	Channel,
	Game,
	SET_SUBMITTING,
	useAppDispatch,
	useAppSelector,
} from "../redux";
import { Socket } from "socket.io-client";
import { Button, Spinner, Tooltip } from "flowbite-react";
import { FaPaperPlane, FaRightFromBracket } from "react-icons/fa6";
import { UserComponent } from "./user.component";
import _ from "lodash";
import { ChatFeed, ChatFeedComponent } from "./chatfeed.component";

export const ChannelComponent: FC<
	Channel & { socket: Socket; chosen: boolean }
> = ({
	channel,
	users,
	messages,
	joinsAndLeaves,
	socket,
	joined,
	chosen,
	mod,
	game,
}) => {
	const games = useAppSelector((state) => state.GAMES);
	const [leaving, setLeaving] = useState(false);
	const handleLeaveChannel = () => {
		socket
			.emitWithAck("cmd", { cmd: "leave", args: [channel] })
			.then((left: boolean) => {
				setLeaving(false);
				if (!left) return;
			});
	};
	const [channelGame, setChannelGame] = useState<Game | undefined>(undefined);
	useEffect(() => {
		if (game) setChannelGame(_.find(games, { id: game }));
	}, [game]);
	const dispatch = useAppDispatch();
	const { submitting: isSubmitting } = useAppSelector((state) => state.APP);
	const [chatInput, setChatInput] = useState("");
	const handleSendChat = (e: FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		dispatch(SET_SUBMITTING(true));
		socket
			.emitWithAck("cmd", { cmd: "chat", args: [channel, chatInput] })
			.then(() => {
				setChatInput("");
				dispatch(SET_SUBMITTING(false));
			});
	};
	if (!chosen) return null;
	const chatFeed: ChatFeed[] = [];
	chatFeed.push(
		...messages.map<ChatFeed>((chat) => ({
			id: `${chat.user.username}-${chat.timestamp}`,
			type: "CHAT",
			...chat,
		}))
	);
	chatFeed.push(
		...joinsAndLeaves.map<ChatFeed>((joinLeave) => ({
			id: `${joinLeave.username}-${joinLeave.timestamp}`,
			type: "JOIN_LEAVE",
			...joinLeave,
		}))
	);
	return joined ? (
		<div className="dark:text-white md:max-h-[750px] min-w-full flex flex-col gap-2 border border-black dark:border-white rounded divide-y divide-black dark:divide-gray-50">
			<div className="flex flex-col gap-2 p-2">
				<div className="flex gap-2">
					<div className="font-bold my-auto">{channel}</div>
					<div className="grow text-center font-bold text-lg">
						{`Active game: ${
							channelGame && !channelGame.ended
								? channelGame.type
								: "None"
						}`}
					</div>
					<Tooltip content="Leave channel">
						<Button
							isProcessing={leaving}
							onClick={handleLeaveChannel}
							size="xs"
							color="purple"
						>
							<FaRightFromBracket />
						</Button>
					</Tooltip>
				</div>
				<div>Here goes other actions</div>
			</div>
			<div className="flex divide-x divide-black dark:divide-gray-50 h-full">
				<div className="basis-4/5 md:max-h-[calc(700px-2rem-0.4rem)] flex flex-col gap-1">
					<div className="grow p-2 overflow-y-auto flex flex-col gap-1 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
						{chatFeed
							.sort(
								(feed1, feed2) =>
									feed1.timestamp - feed2.timestamp
							)
							.map((feed, i) => (
								<ChatFeedComponent
									key={`${feed.id}-${i}`}
									feed={feed}
								/>
							))}
					</div>
					<form className="flex p-2 gap-2" onSubmit={handleSendChat}>
						<input
							id="chatInput"
							required
							type="text"
							className="h-full bg-gray-300 dark:bg-gray-800 border-0 grow focus:ring-0 rounded-full"
							placeholder="Message..."
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
						/>
						<Button
							type="submit"
							color="purple"
							pill
							disabled={isSubmitting}
						>
							{isSubmitting ? <Spinner /> : <FaPaperPlane />}
						</Button>
					</form>
				</div>
				<div className="basis-1/5 h-full flex flex-col">
					<div className="p-2 font-bold text-lg border-b border-black dark:border-gray-50">{`Total users: ${users.length}`}</div>
					<div className="flex flex-col md:max-h-[calc(750px-8rem-0.3rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
						{users.map((username) => (
							<UserComponent
								key={username}
								username={username}
								socket={socket}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	) : null;
};
