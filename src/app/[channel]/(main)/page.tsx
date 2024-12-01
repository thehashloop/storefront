import { LaurelAnimation } from "@/ui/components/LaurelAnimation";
import { ProductListByCollectionDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductList } from "@/ui/components/ProductList";

export const metadata = {
	title: "Storefront",
	description: "e-commerce",
};

export default async function Page({ params }: { params: { channel: string } }) {
	const data = await executeGraphQL(ProductListByCollectionDocument, {
		variables: {
			slug: "featured-products",
			channel: params.channel,
		},
		revalidate: 60,
	});

	if (!data.collection?.products) {
		return null;
	}

	const products = data.collection?.products.edges.map(({ node: product }) => product);

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			<h2 className=" hero text-[40px] font-bold leading-none text-[#000] md:text-[65px] lg:text-[60px] xl:text-[69px] ">
				<span>Your Gateway to </span>
				<span className=" relative inline-flex items-center font-laica text-[#FF073A]">
					Ayurvedic Wellness
					<LaurelAnimation />
				</span>
			</h2>
			<h2 className="sr-only">Product list</h2>

			<section className="mx-3 md:mx-0">
				<div className="relative mx-auto w-full max-w-[1200px] gap-8 overflow-clip rounded-xl bg-transparent px-1 py-6 md:px-1 md:py-6">
					<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{/* Card 1 */}
						<div className="shadow-fade grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-[#e6ffd7]">
							<div className="px-[20px] py-[20px]">
								<p className="!leading-xs md:!leading-h1 pb-3 text-[32px] font-bold lg:text-5xl">
									Ayurvedic Blends
								</p>
							</div>
							<div className="flex min-h-[200px] items-center justify-center"></div>
						</div>
						{/* Card 2 */}
						<div className="shadow-fade grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-[#d9fff6]">
							<div className="px-[20px] py-[20px]">
								<p className="!leading-xs md:!leading-h1 pb-3 text-[32px] font-bold lg:text-5xl">
									Nutraherbs
								</p>
							</div>
							<div className="flex min-h-[200px] justify-center"></div>
						</div>
						{/* Card 3 */}
						<div className="shadow-fade grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-[#daf4ff]">
							<div className="px-[20px] py-[20px]">
								<p className="!leading-xs md:!leading-h1 pb-3 text-[32px] font-bold  lg:text-5xl">
									Nutritional Supplements
								</p>
							</div>
							<div className="flex min-h-[200px] justify-center"></div>
						</div>

						{/* Card 4 */}
						<div className="shadow-fade grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-[#daebff]">
							<div className="px-[20px] py-[20px]">
								<p className="!leading-xs md:!leading-h1 pb-3 text-[32px] font-bold  lg:text-5xl">
									Body and Bath
								</p>
							</div>
							<div className="flex min-h-[200px] justify-center"></div>
						</div>
						{/* Card 5 */}
						<div className="shadow-fade grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-[#dbe0ff]">
							<div className="px-[20px] py-[20px]">
								<p className="!leading-xs md:!leading-h1 pb-3 text-[32px] font-bold  lg:text-5xl">
									Organic Farming
								</p>
							</div>
							<div className="flex min-h-[200px] justify-center"></div>
						</div>
						{/* Card 6 */}
						<div className="shadow-fade grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-[#f2ddff]">
							<div className="px-[20px] py-[20px]">
								<p className="!leading-xs md:!leading-h1 pb-3 text-[32px] font-bold lg:text-5xl">
									Animal Feed Supplements
								</p>
							</div>
							<div className="flex min-h-[200px] justify-center"></div>
						</div>
					</div>
				</div>
			</section>

			<h1 className="pb-8 text-xl font-semibold">Our Best Sellers</h1>
			<ProductList products={products} />
		</section>
	);
}
