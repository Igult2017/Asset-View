import { useState } from "react";
import { useAssets, useDeleteAsset } from "@/hooks/use-assets";
import { Sidebar } from "@/components/Sidebar";
import { AssetCard } from "@/components/AssetCard";
import { UploadDialog } from "@/components/UploadDialog";
import { AssetDetailSheet } from "@/components/AssetDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Asset } from "@shared/schema";
import { Search, Plus, Filter, SortAsc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: assets, isLoading, error } = useAssets();
  const { mutate: deleteAsset } = useDeleteAsset();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteAsset(id, {
      onSuccess: () => {
        toast({
          title: "Asset deleted",
          description: "The file has been permanently removed.",
        });
        if (selectedAsset?.id === id) {
          setIsDetailOpen(false);
          setSelectedAsset(null);
        }
      },
    });
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  };

  const filteredAssets = assets?.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "recent") {
      // Logic for recent could be date based, for now just show all matching search
      return matchesSearch; 
    }
    return matchesSearch && asset.type === filter;
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar currentFilter={filter} onFilterChange={setFilter} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="px-8 py-5 border-b border-border bg-card/50 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">
                {filter === "all" ? "All Assets" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {filteredAssets?.length || 0} items in library
              </p>
            </div>
            <div className="flex gap-3">
               <Button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-lg px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search assets..." 
                className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 rounded-xl transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" className="text-muted-foreground rounded-lg border-border/60">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="text-muted-foreground rounded-lg border-border/60">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-background/50">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm animate-pulse">Loading library...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive font-medium">Failed to load assets</p>
            </div>
          ) : filteredAssets?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No assets found</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                We couldn't find any assets matching your current filters. Try adjusting your search or upload a new file.
              </p>
              <Button onClick={() => setIsUploadOpen(true)} variant="outline">
                Upload New Asset
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredAssets?.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onDelete={handleDelete}
                  onClick={handleAssetClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
      
      <AssetDetailSheet 
        asset={selectedAsset} 
        open={isDetailOpen} 
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setTimeout(() => setSelectedAsset(null), 300);
        }} 
      />
    </div>
  );
}
