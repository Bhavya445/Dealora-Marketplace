import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ProductCard({ product }: { product: Product & { seller: User } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const requestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/products/${product.id}/request`, { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}/requests`] });
      toast({
        title: "Success",
        description: "Purchase request sent successfully!",
      });
      setIsDialogOpen(false);
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
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
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {product.seller.name[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{product.seller.name}</span>
            <span className="text-xs text-muted-foreground">@{product.seller.username}</span>
          </div>
        </div>

        {!product.sold && user?.id !== product.sellerId && (
          <Button 
            className="w-full text-sm" 
            onClick={() => setIsDialogOpen(true)}
            disabled={requestMutation.isPending}
          >
            Request to Buy
          </Button>
        )}

        {product.sold && (
          <p className="text-sm text-muted-foreground text-center w-full">
            Sold Out
          </p>
        )}
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request to Buy {product.title}</DialogTitle>
            <DialogDescription>
              Send a message to {product.seller.name} about why you're interested in this product.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => requestMutation.mutate()}
              className="w-full sm:w-auto"
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}