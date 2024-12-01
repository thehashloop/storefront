import { invariant } from "ts-invariant";
import { type TypedDocumentString } from "../gql/graphql";
// import { getServerAuthClient } from "@/app/config";

type GraphQLErrorResponse = {
	errors: readonly {
		message: string;
	}[];
};

type GraphQLRespone<T> = { data: T } | GraphQLErrorResponse;

interface GraphQLResponseWithExtensions {
	extensions?: Record<string, unknown>;
	data?: unknown;
}

function hasExtensions(body: unknown): body is GraphQLResponseWithExtensions {
	return typeof body === "object" && body !== null && "extensions" in body;
}

export async function executeGraphQL<Result, Variables>(
	operation: TypedDocumentString<Result, Variables>,
	options: {
		headers?: HeadersInit;
		cache?: RequestCache;
		revalidate?: number;
		withAuth?: boolean;
	} & (Variables extends Record<string, never> ? { variables?: never } : { variables: Variables }),
): Promise<Result> {
	const apiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
	invariant(apiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

	// Add connection diagnostic
	const testConnection = async () => {
		try {
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: "{ shop { name } }",
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log("API Connection Test:", {
				status: "OK",
				url: apiUrl,
				response: data,
			});
		} catch (error) {
			console.error("API Connection Test Failed:", {
				url: apiUrl,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			throw error;
		}
	};

	// Test connection before proceeding
	await testConnection();

	const { variables, headers, cache, revalidate, withAuth = true } = options;

	const input = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Connection: "keep-alive",
			...headers,
		},
		body: JSON.stringify({
			query: operation.toString(),
			variables,
		}),
		cache,
		next: { revalidate },
	};

	try {
		// Try using fetch directly first
		const response = await fetch(apiUrl, input);

		if (!response.ok) {
			const body = await response.text().catch(() => "");
			console.error("GraphQL HTTP Error:", {
				status: response.status,
				statusText: response.statusText,
				body,
				input: input.body,
			});
			throw new HTTPError(response, body);
		}

		const body = (await response.json()) as GraphQLRespone<Result>;

		if ("errors" in body) {
			// Log more details about the error
			console.error("GraphQL Response Error Details:", {
				errors: body.errors,
				query: operation.toString(),
				variables,
				extensions: hasExtensions(body) ? body.extensions : undefined,
				data: hasExtensions(body) ? body.data : undefined,
			});

			// Check if we need to retry with auth
			if (!withAuth && body.errors[0]?.message?.includes("Name or service not known")) {
				console.log("Retrying with auth...");
				return await executeGraphQL(operation, { ...options, withAuth: true });
			}

			throw new GraphQLError(body);
		}

		return body.data;
	} catch (error) {
		console.error("GraphQL Execution Error:", {
			error,
			url: apiUrl,
			query: operation.toString(),
			variables,
		});
		throw error;
	}
}

class GraphQLError extends Error {
	constructor(public errorResponse: GraphQLErrorResponse) {
		const message = errorResponse.errors.map((error) => error.message).join("\n");
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
class HTTPError extends Error {
	constructor(response: Response, body: string) {
		const message = `HTTP error ${response.status}: ${response.statusText}\n${body}`;
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
