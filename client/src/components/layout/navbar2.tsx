import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar2() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-center gap-4">
        <Link href="/requests">
          <Button variant="outline">
            Purchase Requests
          </Button>
        </Link>

        <Link href="/new">
          <Button>
            Create Listing
          </Button>
        </Link>
      </div>
    </nav>
  );
}
