import { useMemo } from "react";
import { useTransactionProcessMutation } from "@/checkout/graphql";
import { useSubmit } from "@/checkout/hooks/useSubmit";

interface TransactionProcessArgs {
	id: string;
	data: {
		razorpay_payment_id: string;
		razorpay_order_id: string;
		razorpay_signature: string;
	};
}

export const useTransactionProcess = () => {
	const [{ fetching }, transactionProcess] = useTransactionProcessMutation();

	const onSubmit = useSubmit<TransactionProcessArgs, typeof transactionProcess>(
		useMemo(
			() => ({
				hideAlerts: true,
				scope: "transactionProcess",
				onSubmit: transactionProcess,
				onError: ({ errors }) => {
					console.error("Transaction process error:", errors);
				},
			}),
			[transactionProcess],
		),
	);

	return [{ fetching }, onSubmit] as const;
};
