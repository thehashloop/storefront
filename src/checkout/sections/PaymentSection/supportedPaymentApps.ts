import { AdyenDropIn } from "./AdyenDropIn/AdyenDropIn";
import { adyenGatewayId } from "./AdyenDropIn/types";
import { StripeComponent } from "./StripeElements/stripeComponent";
import { stripeGatewayId } from "./StripeElements/types";
import { RazorpayComponent } from "./RazorpayPayment/RazorpayComponent";
import { razorpayGatewayId } from "./RazorpayPayment/types";

export const paymentMethodToComponent = {
	[adyenGatewayId]: AdyenDropIn,
	[stripeGatewayId]: StripeComponent,
	[razorpayGatewayId]: RazorpayComponent,
};
