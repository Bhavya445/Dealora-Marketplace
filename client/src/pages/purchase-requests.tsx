import { useQuery, useMutation } from "@tanstack/react-query";
import { PurchaseRequest, Product, User } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import { motion } from "framer-motion";

type RequestWithDetails = PurchaseRequest & {
  product: Product;
  buyer: User;
};

export default function PurchaseRequests() {
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery<RequestWithDetails[]>({
    queryKey: ["/api/purchase-requests/seller"],
    refetchInterval: 5000,
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const res = await apiRequest("POST", `/api/purchase-requests/${requestId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests/seller"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Purchase request approved",
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

  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const res = await apiRequest("POST", `/api/purchase-requests/${requestId}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests/seller"] });
      toast({
        title: "Success",
        description: "Purchase request rejected",
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
              Loading purchase requests...
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
        <h1 className="text-3xl font-bold mb-8">Purchase Requests</h1>

        <div className="space-y-6">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{request.product.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {request.buyer.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{request.buyer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        @{request.buyer.username} • {format(new Date(request.createdAt), 'PPp')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{request.message}</p>
                </CardContent>
                {request.status === 'pending' && (
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      Approve
                    </Button>
                  </CardFooter>
                )}
                {request.status !== 'pending' && (
                  <CardFooter>
                    <p className="text-sm capitalize text-muted-foreground">
                      Status: {request.status}
                    </p>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          ))}

          {requests.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground"
            >
              No purchase requests yet.
            </motion.p>
          )}
        </div>
      </main>
    </div>
  );
}