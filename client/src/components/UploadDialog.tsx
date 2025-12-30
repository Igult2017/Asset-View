import { useState } from "react";
import { useCreateAsset } from "@/hooks/use-assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { mutate, isPending } = useCreateAsset();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    type: "image",
    size: "1.2 MB"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate generic asset creation
    // In a real app, this would handle file uploads
    const mockUrl = formData.type === 'image' 
      ? `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800` // Abstract art
      : "";

    mutate(
      {
        name: formData.name,
        type: formData.type,
        size: formData.size,
        url: mockUrl,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setFormData({ name: "", type: "image", size: "1.2 MB" });
          toast({
            title: "Asset uploaded",
            description: `${formData.name} has been added to your library.`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: "There was a problem uploading your asset.",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <UploadCloud className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl">Upload New Asset</DialogTitle>
          <DialogDescription>
            Add a new file to your asset library. 
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              placeholder="e.g., Marketing Banner Q1"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">File Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
              >
                <SelectTrigger id="type" className="rounded-lg">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Size (Mock)</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                required
                className="rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
