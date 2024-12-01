"use client";

import Lottie from "lottie-react";
import laurelWreath from "@/assets/animations/laurel-wreath.json";

export const LaurelAnimation = () => {
	return (
		<Lottie
			animationData={laurelWreath}
			className="absolute bottom-[1%] left-[calc(100%-0.37em)] w-[0.8em]"
			loop={true}
		/>
	);
};
