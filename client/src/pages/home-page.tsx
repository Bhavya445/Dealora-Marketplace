import { useQuery } from "@tanstack/react-query";
import { Product, PRODUCT_CATEGORIES } from "@shared/schema";
import ProductGrid from "@/components/products/product-grid";
import Navbar from "@/components/layout/navbar";
import Navbar2 from "@/components/layout/navbar2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function HomePage() {
  const [category, setCategory] = useState<string>("all");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: [category === "all" ? "/api/products" : `/api/products/category/${category}`],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <Navbar2 />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="w-full flex flex-wrap justify-start">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
            {PRODUCT_CATEGORIES.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="flex-1 sm:flex-none"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={category} className="mt-6">
            <ProductGrid products={products} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}