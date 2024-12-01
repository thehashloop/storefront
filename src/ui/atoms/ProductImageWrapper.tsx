import NextImage, { type ImageProps } from "next/image";

export const ProductImageWrapper = ({ isSticky = false, ...props }: ImageProps & { isSticky?: boolean }) => {
	return (
		<div className={`${isSticky ? "sticky top-[4rem]" : ""} aspect-square overflow-hidden bg-neutral-50`}>
			<NextImage {...props} className="h-full w-full object-contain object-center p-2" />
		</div>
	);
};
