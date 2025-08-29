import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import type { WindowCollection } from '../../../server/src/schema';

interface WindowCollectionCardProps {
  collection: WindowCollection;
  onView: (collection: WindowCollection) => void;
  onEdit: (collection: WindowCollection) => void;
  onDelete: (id: number) => void;
}

export function WindowCollectionCard({ 
  collection, 
  onView, 
  onEdit, 
  onDelete 
}: WindowCollectionCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 border-gray-200">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={collection.main_image_url} 
          alt={collection.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x225/f3f4f6/9ca3af?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-[#bc2024] transition-colors">
              {collection.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1 text-xs">
              {collection.brand_name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-gray-600 mb-4 line-clamp-2">
          {collection.description}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Created {collection.created_at.toLocaleDateString()}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(collection)}
              className="border-[#bc2024]/20 hover:bg-[#bc2024]/5 hover:border-[#bc2024]/40"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(collection)}
              className="border-blue-200 hover:bg-blue-50 hover:border-blue-400"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(collection.id)}
              className="border-red-200 hover:bg-red-50 hover:border-red-400 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}