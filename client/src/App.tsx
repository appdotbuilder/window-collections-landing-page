import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Building2, Package, Sparkles } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { WindowCollectionCard } from '@/components/WindowCollectionCard';
import { CreateCollectionDialog } from '@/components/CreateCollectionDialog';
import { EditCollectionDialog } from '@/components/EditCollectionDialog';
import { CollectionDetailsDialog } from '@/components/CollectionDetailsDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import type { 
  WindowCollection, 
  CreateWindowCollectionInput,
  UpdateWindowCollectionInput 
} from '../../server/src/schema';

function App() {
  const [collections, setCollections] = useState<WindowCollection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<WindowCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<WindowCollection | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);
  
  // Loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getWindowCollections.query();
      setCollections(result);
      setFilteredCollections(result);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Search functionality
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = collections.filter((collection: WindowCollection) =>
      collection.name.toLowerCase().includes(query) ||
      collection.brand_name.toLowerCase().includes(query) ||
      collection.description.toLowerCase().includes(query)
    );
    setFilteredCollections(filtered);
  }, [searchQuery, collections]);

  const handleCreateCollection = async (data: CreateWindowCollectionInput) => {
    setCreateLoading(true);
    try {
      const newCollection = await trpc.createWindowCollection.mutate(data);
      setCollections((prev: WindowCollection[]) => [...prev, newCollection]);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateCollection = async (data: UpdateWindowCollectionInput) => {
    setUpdateLoading(true);
    try {
      const updatedCollection = await trpc.updateWindowCollection.mutate(data);
      if (updatedCollection) {
        setCollections((prev: WindowCollection[]) =>
          prev.map((c: WindowCollection) => c.id === data.id ? updatedCollection : c)
        );
      }
      setEditDialogOpen(false);
      setSelectedCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;
    
    setDeleteLoading(true);
    try {
      await trpc.deleteWindowCollection.mutate({ id: collectionToDelete });
      setCollections((prev: WindowCollection[]) =>
        prev.filter((c: WindowCollection) => c.id !== collectionToDelete)
      );
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewCollection = (collection: WindowCollection) => {
    setSelectedCollection(collection);
    setDetailsDialogOpen(true);
  };

  const handleEditCollection = (collection: WindowCollection) => {
    setSelectedCollection(collection);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setCollectionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const collectionToDeleteName = collectionToDelete 
    ? collections.find((c: WindowCollection) => c.id === collectionToDelete)?.name 
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="gradient-hero text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Premium Windows
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-red-100 mb-8 leading-relaxed">
              Discover our exquisite collection of high-quality windows designed to transform your space
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge variant="secondary" className="text-base px-4 py-2 bg-white/10 text-white border-white/20">
                <Sparkles className="h-4 w-4 mr-1" />
                Premium Quality
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2 bg-white/10 text-white border-white/20">
                <Package className="h-4 w-4 mr-1" />
                {collections.length} Collections
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search collections by name, brand, or description..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 focus:ring-[#bc2024] focus:border-[#bc2024]"
            />
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#bc2024] hover:bg-[#a01c1f] text-white whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>

        <Separator className="mb-8" />

        {/* Collections Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#bc2024] mb-4"></div>
              <p className="text-gray-600 text-lg">Loading collections...</p>
            </div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16">
              {searchQuery ? (
                <>
                  <Search className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No Results Found</h3>
                  <p className="text-gray-500 text-center mb-4">
                    No collections match your search for "{searchQuery}". Try a different term.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <Package className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No Collections Yet</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Get started by creating your first window collection to showcase your products.
                  </p>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-[#bc2024] hover:bg-[#a01c1f] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Collection
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Window Collections
              </h2>
              <Badge variant="outline" className="text-base px-3 py-1">
                {filteredCollections.length} of {collections.length} collections
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((collection: WindowCollection) => (
                <WindowCollectionCard
                  key={collection.id}
                  collection={collection}
                  onView={handleViewCollection}
                  onEdit={handleEditCollection}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Dialogs */}
      <CreateCollectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateCollection}
        isLoading={createLoading}
      />

      <EditCollectionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        collection={selectedCollection}
        onSubmit={handleUpdateCollection}
        isLoading={updateLoading}
      />

      <CollectionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        collection={selectedCollection}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteCollection}
        title="Delete Window Collection"
        description={`Are you sure you want to delete "${collectionToDeleteName}"? This action cannot be undone and will also delete all windows in this collection.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default App;