import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CreateWindowCollectionInput } from '../../../server/src/schema';

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWindowCollectionInput) => Promise<void>;
  isLoading?: boolean;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false
}: CreateCollectionDialogProps) {
  const [formData, setFormData] = useState<CreateWindowCollectionInput>({
    name: '',
    description: '',
    main_image_url: '',
    brand_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        main_image_url: '',
        brand_name: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create New Window Collection
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new window collection to showcase your products.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Collection Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateWindowCollectionInput) => ({ 
                    ...prev, 
                    name: e.target.value 
                  }))
                }
                placeholder="Enter collection name"
                required
                className="focus:ring-[#bc2024] focus:border-[#bc2024]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="brand_name" className="text-sm font-medium">
                Brand Name *
              </Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateWindowCollectionInput) => ({ 
                    ...prev, 
                    brand_name: e.target.value 
                  }))
                }
                placeholder="Enter brand name"
                required
                className="focus:ring-[#bc2024] focus:border-[#bc2024]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateWindowCollectionInput) => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))
                }
                placeholder="Describe this window collection"
                rows={3}
                required
                className="resize-none focus:ring-[#bc2024] focus:border-[#bc2024]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="main_image_url" className="text-sm font-medium">
                Main Image URL *
              </Label>
              <Input
                id="main_image_url"
                type="url"
                value={formData.main_image_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateWindowCollectionInput) => ({ 
                    ...prev, 
                    main_image_url: e.target.value 
                  }))
                }
                placeholder="https://example.com/image.jpg"
                required
                className="focus:ring-[#bc2024] focus:border-[#bc2024]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#bc2024] hover:bg-[#a01c1f] text-white"
            >
              {isLoading ? 'Creating...' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}