export interface RazorpayGatewayInitializePayload {
	key: string;
	order_id: string;
	name?: string;
	description?: string;
	image?: string;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	theme?: {
		color: string;
	};
}

export interface TransactionInitializeResponse {
	data?: {
		transactionInitialize?: {
			transaction: {
				id: string;
			};
			data: RazorpayTransactionData;
			errors: Array<{
				field: string;
				message: string;
				code: string;
			}>;
		};
	};
	error?: {
		message: string;
	};
}

export interface RazorpayPaymentResponse {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}

export interface RazorpayTransactionData {
	razorpayKey: string;
	razorpayOrderId: string;
}

export const razorpayGatewayId = "saleor.app.razorpay";

export interface RazorpayTransactionInitializeResponse {
	data?: {
		transactionInitialize?: {
			transaction?: {
				id: string;
				actions: Array<string>;
			} | null;
			transactionEvent?: {
				message: string;
				type: string | null;
			} | null;
			data?: {
				razorpayKey: string;
				razorpayOrderId: string;
			} | null;
			errors: Array<{
				field?: string | null;
				code: string;
				message?: string | null;
			}>;
		} | null;
	} | null;
}
