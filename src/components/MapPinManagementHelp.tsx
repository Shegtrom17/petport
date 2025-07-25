import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Edit, Trash2, Filter, Tag } from 'lucide-react';

export const MapPinManagementHelp = () => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <MapPin className="w-5 h-5" />
          <span>Enhanced Map Pin Features</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Edit className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Edit & Label Pins</h4>
                <p className="text-sm text-blue-700">Click any pin to edit its title, description, and category</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Delete Pins</h4>
                <p className="text-sm text-blue-700">Remove individual pins or clear all pins at once</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Tag className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Pin Categories</h4>
                <p className="text-sm text-blue-700">Organize pins by type: vet visits, parks, hotels, restaurants, and more</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Filter className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Filter & View</h4>
                <p className="text-sm text-blue-700">Filter pins by category to focus on specific types of locations</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Available Pin Categories:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <span className="text-blue-700">📍 Custom Pin</span>
            <span className="text-blue-700">✈️ Travel Location</span>
            <span className="text-blue-700">❤️ Favorite Place</span>
            <span className="text-blue-700">🏥 Veterinary</span>
            <span className="text-blue-700">🌳 Park/Recreation</span>
            <span className="text-blue-700">🏨 Accommodation</span>
            <span className="text-blue-700">🍽️ Pet-Friendly Dining</span>
            <span className="text-blue-700">✂️ Grooming</span>
            <span className="text-blue-700">🎓 Training</span>
            <span className="text-blue-700">🚨 Emergency</span>
          </div>
        </div>
        
        <p className="text-sm text-blue-600 text-center italic">
          💡 Tip: Travel locations you add through the form will automatically create pins on the map!
        </p>
      </CardContent>
    </Card>
  );
};