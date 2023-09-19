import { FC } from "react";
import { ChatUserstate } from "tmi.js";
import { TimestampComponent } from "./timestamp.component";

export type ChatFeed =
	| {
			id: string;
			type: "CHAT";
			message: string;
			user: ChatUserstate;
			timestamp: number;
	  }
	| {
			id: string;
			type: "JOIN_LEAVE";
			username: string;
			timestamp: number;
	join: boolean;
	  };

export const ChatFeedComponent: FC<{ feed: ChatFeed }> = ({ feed }) => {
	return feed.type === "CHAT" ? <MessageFeed user={feed.user} timestamp={feed.timestamp} message={feed.message} /> : <JoinLeaveFeed username={feed.username} timestamp={feed.timestamp} join={feed.join} />;
};

const MessageFeed: FC<{
	user: ChatUserstate;
	timestamp: number;
	message: string;
}> = ({ user, message, timestamp }) => {
	return <div className="flex gap-1">
		<TimestampComponent timestamp={timestamp} />
		<div style={{ color: user.color }}>{user["display-name"]}:</div>
		<div>{message}</div>
	</div>;
};

const JoinLeaveFeed: FC<{ username: string; timestamp: number, join: boolean }> = ({
	username,
	timestamp,
	join,
}) => {
	return <div className="flex gap-1 text-gray-500">
		<TimestampComponent timestamp={timestamp} />
		<div className="dark:text-gray-700 flex gap-1">
			User
			<div className="dark:text-gray-100 text-gray-900 inline-flex gap-1">
				<div className="bg-gray-400 px-1 text-black rounded inline">
					{username}
				</div>
				{join ? 'joined' : 'left'}
			</div>
			the channel
		</div>
	</div>;
};
