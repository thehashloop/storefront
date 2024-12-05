import * as Tabs from "@radix-ui/react-tabs";
import {
	AllCollectionsWithProductsDocument,
	type ProductListItemFragment,
	type Collection,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductList } from "@/ui/components/ProductList";
import { cn } from "@/lib/utils";

type CollectionNode = Pick<Collection, "id" | "name" | "description"> & {
	products?: {
		edges?: Array<{
			node: ProductListItemFragment;
		}> | null;
	} | null;
};

export default async function CollectionsPage({ params }: { params: { channel: string } }) {
	const data = await executeGraphQL(AllCollectionsWithProductsDocument, {
		variables: {
			channel: params.channel,
			first: 100,
		},
		revalidate: 60,
	});

	if (!data.collections?.edges) {
		return null;
	}

	const collections = data.collections;
	const firstCollection = collections.edges[0]?.node as CollectionNode;

	return (
		<div className="mx-auto max-w-7xl p-8">
			{/* Desktop View */}
			<div className="hidden md:block">
				<Tabs.Root defaultValue={firstCollection?.id} orientation="vertical" className="flex gap-4">
					<Tabs.List className="w-[160px] shrink-0 space-y-1 border-r pr-4" aria-label="Collections">
						{collections.edges.map(({ node: collection }) => {
							const typedCollection = collection as CollectionNode;
							return (
								<Tabs.Trigger
									key={typedCollection.id}
									value={typedCollection.id}
									className={cn(
										"w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
										"text-neutral-600 hover:text-neutral-900",
										"hover:bg-neutral-100 data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
										"disabled:pointer-events-none disabled:opacity-50",
									)}
								>
									{typedCollection.name}
								</Tabs.Trigger>
							);
						})}
					</Tabs.List>

					{collections.edges.map(({ node: collection }) => {
						const typedCollection = collection as CollectionNode;
						const products = typedCollection.products?.edges?.map(({ node }) => node) ?? [];

						return (
							<Tabs.Content key={typedCollection.id} value={typedCollection.id} className="grow outline-none">
								{products.length > 0 && <ProductList products={products} />}
							</Tabs.Content>
						);
					})}
				</Tabs.Root>
			</div>

			{/* Mobile View */}
			<div className="space-y-12 md:hidden">
				{collections.edges.map(({ node: collection }) => {
					const typedCollection = collection as CollectionNode;
					const products = typedCollection.products?.edges?.map(({ node }) => node) ?? [];

					return (
						<div key={typedCollection.id}>
							<h2 className="mb-6 text-xl font-semibold">{typedCollection.name}</h2>
							{products.length > 0 && <ProductList products={products} />}
						</div>
					);
				})}
			</div>
		</div>
	);
}
