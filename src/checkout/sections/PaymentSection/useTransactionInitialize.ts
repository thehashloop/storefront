import { useMemo } from "react";
import { useTransactionInitializeMutation } from "@/checkout/graphql";
import { useSubmit } from "@/checkout/hooks/useSubmit";

export const useTransactionInitialize = () => {
	const [{ fetching }, transactionInitialize] = useTransactionInitializeMutation();

	const onSubmit = useSubmit<{}, typeof transactionInitialize>(
		useMemo(
			() => ({
				hideAlerts: true,
				scope: "transactionInitialize",
				onSubmit: transactionInitialize,
				onError: ({ errors }) => {
					console.error("Transaction initialize error:", errors);
				},
			}),
			[transactionInitialize],
		),
	);

	return [{ fetching }, onSubmit] as const;
};
