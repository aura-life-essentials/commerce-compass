import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, CheckCircle, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-4 h-4" /> },
  processing: { label: "Processing", color: "bg-blue-500/20 text-blue-400", icon: <Package className="w-4 h-4" /> },
  shipped: { label: "Shipped", color: "bg-purple-500/20 text-purple-400", icon: <Truck className="w-4 h-4" /> },
  delivered: { label: "Delivered", color: "bg-green-500/20 text-green-400", icon: <CheckCircle className="w-4 h-4" /> },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400", icon: <CheckCircle className="w-4 h-4" /> },
};

export default function OrderHistory() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please sign in to view your order history</p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/store">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const items = order.items as Array<{
                product_id: string;
                title: string;
                price: number;
                quantity: number;
                image?: string;
              }>;

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${status.color}`}>
                          {status.icon}
                        </div>
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={status.color}>{status.label}</Badge>
                        <span className="text-lg font-bold">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.tracking_url && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <Truck className="w-4 h-4" />
                          Track Package
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {order.tracking_number && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Tracking #: {order.tracking_number}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Start shopping to see your orders here
              </p>
              <Link to="/store">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
