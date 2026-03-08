import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const socialLinks = [
  { name: "Instagram", url: "#", icon: "📸" },
  { name: "TikTok", url: "#", icon: "🎵" },
  { name: "X (Twitter)", url: "#", icon: "𝕏" },
  { name: "Facebook", url: "#", icon: "📘" },
];

export const StoreFooter = () => {
  return (
    <footer className="border-t border-border py-12 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/store" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/store" className="hover:text-primary transition-colors">Flash Sales</Link></li>
              <li><Link to="/store" className="hover:text-primary transition-colors">Bundles</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/refunds" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/refunds" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Follow Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {socialLinks.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                    <span>{s.icon}</span> {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/refunds" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">TrendVault</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TrendVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
