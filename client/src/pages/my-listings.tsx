import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MyListings() {
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<(Product & { seller: { name: string, username: string } })[]>({
    queryKey: ["/api/products/seller"],
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("DELETE", `/api/products/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/seller"] });
      toast({
        title: "Success",
        description: "Product removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-lg text-muted-foreground">
              Loading your listings...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Listings</h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{product.title}</CardTitle>
                  <p className="text-2xl font-bold">₹{product.price}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {product.description}
                  </p>
                  <div className="mt-4">
                    <Badge variant={product.sold ? "destructive" : "default"}>
                      {product.sold ? "Sold" : "Available"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive"
                    onClick={() => deleteMutation.mutate(product.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Listing
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}

          {products.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
              You haven't posted any listings yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}