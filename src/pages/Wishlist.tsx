import { useWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Bell, BellOff } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Wishlist() {
  const { user } = useAuth();
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addToCart } = useCart();

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist.mutateAsync(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = (item: typeof wishlist extends (infer T)[] ? T : never) => {
    addToCart({
      id: item.product_id || item.id,
      title: item.product_title,
      price: item.product_price || 0,
      image: item.product_image || "",
      quantity: 1,
    });
    toast.success("Added to cart!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Please sign in to view your wishlist</p>
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {wishlist?.length || 0} saved items
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : wishlist && wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => item.product_id && handleRemove(item.product_id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  {item.notify_on_sale && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        Sale Alert On
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                      {item.product_title}
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      ${(item.product_price || 0).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save items you love and we'll notify you when they go on sale
              </p>
              <Link to="/store">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
