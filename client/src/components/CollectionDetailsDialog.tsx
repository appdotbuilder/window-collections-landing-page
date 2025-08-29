import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Package, Calendar } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { WindowCollection, WindowCollectionWithWindows } from '../../../server/src/schema';

interface CollectionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: WindowCollection | null;
}

export function CollectionDetailsDialog({
  open,
  onOpenChange,
  collection
}: CollectionDetailsDialogProps) {
  const [collectionDetails, setCollectionDetails] = useState<WindowCollectionWithWindows | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCollectionDetails = useCallback(async () => {
    if (!collection) return;
    
    setIsLoading(true);
    try {
      const result = await trpc.getWindowCollectionById.query({ id: collection.id });
      setCollectionDetails(result);
    } catch (error) {
      console.error('Failed to load collection details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    if (open && collection) {
      loadCollectionDetails();
    }
  }, [open, collection, loadCollectionDetails]);

  if (!collection) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-6 w-6 text-[#bc2024]" />
            {collection.name}
            <Badge variant="secondary" className="text-sm">
              {collection.brand_name}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Collection Header */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={collection.main_image_url}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x225/f3f4f6/9ca3af?text=No+Image';
                  }}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{collection.description}</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Created {collection.created_at.toLocaleDateString()}
                </div>
              </div>
            </div>

            <Separator />

            {/* Windows Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  Windows in Collection
                  {collectionDetails && (
                    <Badge variant="outline" className="text-sm">
                      {collectionDetails.windows.length} items
                    </Badge>
                  )}
                </h3>
                <Button
                  size="sm"
                  className="bg-[#bc2024] hover:bg-[#a01c1f] text-white"
                  onClick={() => {
                    // TODO: Implement add window functionality
                    console.log('Add window to collection:', collection.id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Window
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#bc2024]"></div>
                  <p className="text-gray-500 mt-2">Loading windows...</p>
                </div>
              ) : collectionDetails?.windows && collectionDetails.windows.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectionDetails.windows.map((window) => (
                    <Card key={window.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={window.main_image_url}
                          alt={window.description}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=No+Image';
                          }}
                        />
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {window.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#bc2024]">
                            ${window.price.toFixed(2)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {window.gallery_image_urls.length} images
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mb-3" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">No Windows Yet</h4>
                    <p className="text-gray-500 text-center mb-4">
                      This collection doesn't have any windows. Add some to get started!
                    </p>
                    <Button
                      className="bg-[#bc2024] hover:bg-[#a01c1f] text-white"
                      onClick={() => {
                        // TODO: Implement add window functionality
                        console.log('Add first window to collection:', collection.id);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Window
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}