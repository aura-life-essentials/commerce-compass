import { Header } from '@/components/dashboard/Header';
import { Web3RoadmapHero } from '@/components/subscription/Web3RoadmapHero';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const IndustryRoadmaps = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-6">
        <Link to="/welcome">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      {/* Main Hero Section */}
      <Web3RoadmapHero />
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Omega Swarm AI. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Enterprise-grade Web3 transformation powered by autonomous AI agents.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default IndustryRoadmaps;
