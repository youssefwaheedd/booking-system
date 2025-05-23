import Events from "@/components/events/Events";
import { useAuth } from "@/context/AuthContext";
import { LoaderCircleIcon } from "lucide-react";

const Home = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-2xl text-foreground">
          <LoaderCircleIcon className="h-8 w-8 animate-spin" />
          <span>Loading Home...</span>
        </div>
      </div>
    );
  }
  return <Events />;
};

export default Home;
