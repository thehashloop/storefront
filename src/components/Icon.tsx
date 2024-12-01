import { type FC } from "react";
import { IconPaths } from "./IconPaths";

interface IconProps {
	name: string;
	viewBox?: string;
}

export const Icon: FC<IconProps> = ({ name, viewBox = "0 0 48 48" }) => {
	const className = `icon icon--${name}`;

	return (
		<svg className={className} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
			{IconPaths[name]}
		</svg>
	);
};
