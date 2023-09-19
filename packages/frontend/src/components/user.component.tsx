import { FC } from "react";
import { Socket } from "socket.io-client";

export const UserComponent: FC<{ username: string, socket: Socket }> = ({ username, socket }) => {
	return (
		<div className="p-2 hover:bg-purple-900 hover:text-white transition-all duration-150 cursor-pointer">{username}</div>
	);
};
