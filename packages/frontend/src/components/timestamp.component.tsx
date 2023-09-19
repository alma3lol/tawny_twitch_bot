import moment from "moment";
import { FC, useEffect, useState } from "react";
import { Tooltip } from 'flowbite-react';

export const TimestampComponent: FC<{ timestamp: number }> = ({ timestamp }) => {
	const [tooltip, setTooltip] = useState(moment.unix(timestamp).fromNow());
	useEffect(() => {
		const interval = setInterval(() => setTooltip(moment.unix(timestamp).fromNow()), 1000);
		return () => clearInterval(interval)
	});
	return <Tooltip content={tooltip}><div>{moment.unix(timestamp).format('HH:mm')}</div></Tooltip>
}
