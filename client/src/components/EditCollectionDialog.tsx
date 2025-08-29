import { useState, useEffect } from 'react';
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
import type { WindowCollection, UpdateWindowCollectionInput } from '../../../server/src/schema';

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: WindowCollection | null;
  onSubmit: (data: UpdateWindowCollectionInput) => Promise<void>;
  isLoading?: boolean;
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
  onSubmit,
  isLoading = false
}: EditCollectionDialogProps) {
  const [formData, setFormData] = useState<Omit<UpdateWindowCollectionInput, 'id'>>({
    name: '',
    description: '',
    main_image_url: '',
    brand_name: ''
  });

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name,
        description: collection.description,
        main_image_url: collection.main_image_url,
        brand_name: collection.brand_name
      });
    }
  }, [collection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection) return;
    
    try {
      await onSubmit({
        id: collection.id,
        ...formData
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Window Collection
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update the details of your window collection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Collection Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ 
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
              <Label htmlFor="edit-brand_name" className="text-sm font-medium">
                Brand Name *
              </Label>
              <Input
                id="edit-brand_name"
                value={formData.brand_name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ 
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
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ 
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
              <Label htmlFor="edit-main_image_url" className="text-sm font-medium">
                Main Image URL *
              </Label>
              <Input
                id="edit-main_image_url"
                type="url"
                value={formData.main_image_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ 
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
              {isLoading ? 'Updating...' : 'Update Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}