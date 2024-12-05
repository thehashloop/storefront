import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.toString();

	try {
		console.log(`http://localhost:3003/?${query}`);
		const response = await fetch(`http://localhost:3003/?${query}`, {
			signal: AbortSignal.timeout(5000),
			headers: {
				"Content-Type": "application/json",
			},
		});
		console.log(response);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		if (!response.body) {
			throw new Error("Response body is empty");
		}

		const data = await response.json();

		if (!data || (Array.isArray(data) && data.length === 0)) {
			return NextResponse.json({ message: "No results found" }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("API call failed:", error);
		if (error instanceof TypeError) {
			return NextResponse.json({ error: "Network or parsing error" }, { status: 500 });
		}
		return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
	}
}
