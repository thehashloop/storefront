import React, { useEffect, useState } from "react";
import { usePaymentProcessingScreen } from "../PaymentProcessingScreen";
import {
	type RazorpayGatewayInitializePayload,
	razorpayGatewayId,
	type RazorpayPaymentResponse,
} from "./types";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useTransactionProcess } from "@/checkout/sections/PaymentSection/useTransactionProcess";
import { useTransactionInitializeMutation } from "@/checkout/graphql";
import {
	useCheckoutValidationState,
	useCheckoutValidationActions,
	areAllFormsValid,
} from "@/checkout/state/checkoutValidationStateStore";
import { useUser } from "@/checkout/hooks/useUser";
// import { useCheckoutUpdateState, useCheckoutUpdateStateActions } from "@/checkout/state/updateStateStore";
import { getQueryParams } from "@/checkout/lib/utils/url";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";

interface RazorpayOptions {
	key: string;
	amount: number;
	currency: string;
	name: string;
	order_id: string;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	handler: (response: RazorpayPaymentResponse) => void;
	modal?: {
		ondismiss: () => void;
	};
}

declare global {
	interface Window {
		Razorpay: new (options: RazorpayOptions) => {
			open: () => void;
		};
	}
}

interface RazorpayComponentProps {
	config: {
		data: RazorpayGatewayInitializePayload;
	};
}

interface RazorpayTransactionData {
	razorpayKey: string;
	razorpayOrderId: string;
}

interface PaymentError {
	code?: string;
	message?: string;
}

export const RazorpayComponent: React.FC<RazorpayComponentProps> = ({ config }) => {
	console.log("config", config);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		checkout: { id: checkoutId, totalPrice, billingAddress, email },
	} = useCheckout();

	const { validationState } = useCheckoutValidationState();
	const { validateAllForms } = useCheckoutValidationActions();
	const { authenticated } = useUser();

	// const { updateState, loadingCheckout } = useCheckoutUpdateState();
	// const { setSubmitInProgress, setShouldRegisterUser } = useCheckoutUpdateStateActions();

	const [{ fetching }, transactionInitialize] = useTransactionInitializeMutation();
	const [, transactionProcess] = useTransactionProcess();
	const { setIsProcessingPayment } = usePaymentProcessingScreen();
	const { onCheckoutComplete } = useCheckoutComplete();

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	// Handle redirect flow
	useEffect(() => {
		const { razorpayPaymentId, razorpayOrderId, razorpaySignature, transaction } = getQueryParams();

		if (razorpayPaymentId && razorpayOrderId && razorpaySignature && transaction) {
			void transactionProcess({
				id: transaction,
				data: {
					razorpay_payment_id: razorpayPaymentId,
					razorpay_order_id: razorpayOrderId,
					razorpay_signature: razorpaySignature,
				},
			}).then((processResponse) => {
				if (!processResponse.hasErrors) {
					void onCheckoutComplete();
				}
			});
		}
	}, [transactionProcess, onCheckoutComplete]);

	const handlePayment = async () => {
		try {
			validateAllForms(authenticated);

			if (!areAllFormsValid(validationState)) {
				setError("Please fill in all required fields");
				return;
			}

			setIsLoading(true);
			setError(null);
			setIsProcessingPayment(true);

			const result = await transactionInitialize({
				checkoutId,
				paymentGateway: {
					id: razorpayGatewayId,
					data: {
						amount: totalPrice?.gross.amount,
						currency: totalPrice?.gross.currency,
					},
				},
			});

			const initializeResponse = result.data;

			if (!initializeResponse?.transactionInitialize) {
				throw new Error("Missing transaction initialize data");
			}

			const { transaction, data: transactionData } = initializeResponse.transactionInitialize as unknown as {
				transaction: { id: string };
				data: RazorpayTransactionData;
			};

			if (!transaction?.id || !transactionData) {
				throw new Error("Missing transaction data");
			}

			const options = {
				key: transactionData.razorpayKey,
				amount: (totalPrice?.gross.amount || 0) * 100,
				currency: totalPrice?.gross.currency,
				name: "Your Store",
				order_id: transactionData.razorpayOrderId,
				prefill: {
					name: billingAddress ? `${billingAddress.firstName} ${billingAddress.lastName}`.trim() : undefined,
					email: email || undefined,
					contact: billingAddress?.phone || undefined,
				},
				handler: async (response: RazorpayPaymentResponse) => {
					try {
						const processResponse = await transactionProcess({
							id: transaction.id,
							data: {
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_order_id: response.razorpay_order_id,
								razorpay_signature: response.razorpay_signature,
							},
						});

						if (processResponse.hasErrors) {
							const allErrors = [
								processResponse.apiErrors,
								processResponse.customErrors,
								processResponse.graphqlErrors,
							].flatMap((e): string[] => e as string[]);
							throw new Error(allErrors.join("\n"));
						}

						// Complete checkout after successful payment
						void onCheckoutComplete();

						setIsProcessingPayment(false);
						setIsLoading(false);
					} catch (processError) {
						console.error("Payment processing error:", processError);
						setError("Payment processing failed");
						setIsProcessingPayment(false);
						setIsLoading(false);
					}
				},
				modal: {
					ondismiss: function () {
						setIsProcessingPayment(false);
						setIsLoading(false);
					},
				},
			};

			const razorpay = new window.Razorpay(options);
			razorpay.open();
		} catch (error: unknown) {
			handlePaymentError(error as PaymentError);
		}
	};

	const handlePaymentError = (error: PaymentError) => {
		if (error.code === "PAYMENT_FAILED") {
			setError("Payment failed. Please try again.");
		} else if (error.code === "VALIDATION_ERROR") {
			setError("Invalid payment details.");
		} else {
			setError("An unexpected error occurred.");
		}
		setIsProcessingPayment(false);
		setIsLoading(false);
	};

	return (
		<div className="w-full">
			<div className="mb-4 flex flex-row items-center justify-between">
				<div className="flex items-center gap-4">
					<span className="font-medium">Pay with Razorpay</span>
				</div>
				<div className="text-right">
					{totalPrice?.gross && (
						<span className="font-medium">
							{totalPrice.gross.amount} {totalPrice.gross.currency}
						</span>
					)}
				</div>
			</div>

			{error && <div className="mb-4 text-sm text-red-500">{error}</div>}

			<button
				onClick={handlePayment}
				disabled={isLoading || fetching}
				className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300"
			>
				{isLoading ? "Processing..." : "Pay Securely"}
			</button>
		</div>
	);
};
