
import { Card } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getPetBackgroundColor } from "@/utils/petColors";
import worldMapOutline from "@/assets/world-map-outline.png";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Pet {
  id: string;
  name: string;
  breed: string;
  photoUrl?: string;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: any;
  onSelectPet: (petId: string) => void;
  onReorderPets?: (reorderedPets: Pet[]) => void;
  petLimit?: number;
  showEmptySlots?: boolean;
}

export const PetSelector = ({ pets, selectedPet, onSelectPet, onReorderPets, petLimit = 0, showEmptySlots = false }: PetSelectorProps) => {
  const navigate = useNavigate();
  
  // Show if multiple pets OR if we want to show empty slots
  if (pets.length <= 1 && !showEmptySlots) return null;
  
  // Calculate empty slots to show
  const emptySlotCount = showEmptySlots && petLimit > pets.length ? petLimit - pets.length : 0;
  const emptySlots = Array.from({ length: emptySlotCount }, (_, i) => ({
    id: `empty-${i}`,
    name: '',
    breed: '',
    isEmpty: true
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderPets) return;

    const reorderedPets = Array.from(pets);
    const [removed] = reorderedPets.splice(result.source.index, 1);
    reorderedPets.splice(result.destination.index, 0, removed);

    onReorderPets(reorderedPets);
  };

  return (
    <div className="mb-4 sm:mb-6 relative passport-map-container">
      <div 
        className="absolute inset-0 rounded-lg -m-2"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 70%, rgba(255,255,255,0.1) 100%),
            url(${worldMapOutline}),
            linear-gradient(45deg, transparent 48%, rgba(160, 82, 45, 0.15) 49%, rgba(160, 82, 45, 0.15) 51%, transparent 52%),
            linear-gradient(45deg, rgba(205, 133, 63, 0.06) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(222, 184, 135, 0.06) 25%, transparent 25%)
          `,
          backgroundSize: '100% 100%, contain, 8px 8px, 6px 6px, 6px 6px',
          backgroundPosition: 'center, center, 0 0, 0 0, 0 3px',
          backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat, repeat',
          opacity: 0.25,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div className="overflow-x-auto pb-2 relative z-10 py-2">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pets" direction="horizontal">
          {(provided) => (
            <div
              className="flex space-x-2 sm:space-x-3 min-w-max"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {pets.map((pet, index) => (
                <Draggable key={pet.id} draggableId={pet.id} index={index}>
                  {(provided, snapshot) => (
                    <Card 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`border-2 cursor-pointer flex-shrink-0 w-56 sm:w-64 transition-all ${
                        selectedPet?.id === pet.id 
                          ? 'border-navy-700 shadow-lg' 
                          : 'border-transparent hover:border-navy-300'
                      } ${snapshot.isDragging ? 'shadow-2xl scale-105' : ''}`}
                      onClick={() => onSelectPet(pet.id)}
                    >
                      <div className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 relative">
                          {pet.photoUrl ? (
                            <img 
                              src={pet.photoUrl} 
                              alt={pet.name} 
                              className="w-full h-full object-cover filter brightness-105 border border-gold-200/30" 
                              style={{ borderColor: 'rgba(212,175,55,0.3)' }}
                            />
                           ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center text-white font-bold relative overflow-hidden rounded-full shadow-md"
                              style={{ 
                                backgroundColor: getPetBackgroundColor(pet.name),
                                background: `
                                  radial-gradient(circle at 35% 25%, rgba(255,255,255,0.4) 0%, transparent 60%),
                                  linear-gradient(135deg, ${getPetBackgroundColor(pet.name)} 0%, rgba(0,0,0,0.15) 100%)
                                `,
                                border: '1px solid rgba(255,255,255,0.3)',
                                boxShadow: `
                                  inset 0 1px 2px rgba(255,255,255,0.3),
                                  0 2px 4px rgba(0,0,0,0.1)
                                `
                              }}
                            >
                              <span className="text-lg sm:text-xl z-10 relative font-bold text-white drop-shadow-md">
                                {pet.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{pet.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{pet.breed}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              
              {/* Empty Slots for Additional Pet Capacity */}
              {emptySlots.map((slot, index) => (
                <Card 
                  key={slot.id}
                  className="border-2 border-dashed border-gold-300 cursor-pointer flex-shrink-0 w-56 sm:w-64 transition-all hover:border-gold-500 hover:bg-gold-50/50"
                  onClick={() => navigate('/add-pet')}
                >
                  <div className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 relative border-2 border-dashed border-gold-300 flex items-center justify-center bg-gold-50/30">
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gold-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm sm:text-base text-gold-700">Add New Pet</h3>
                      <p className="text-xs sm:text-sm text-gold-600">Empty slot available</p>
                    </div>
                  </div>
                </Card>
              ))}
              
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>
    </div>
  );
};
