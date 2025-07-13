
import { Card } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getPetBackgroundColor } from "@/utils/petColors";
import worldMapOutline from "@/assets/world-map-outline.png";

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
}

export const PetSelector = ({ pets, selectedPet, onSelectPet, onReorderPets }: PetSelectorProps) => {
  if (pets.length <= 1) return null;

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
                              className="w-full h-full flex items-center justify-center text-navy-800 font-semibold relative overflow-hidden"
                              style={{ 
                                backgroundColor: getPetBackgroundColor(pet.name),
                                background: `
                                  radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%),
                                  repeating-linear-gradient(45deg, transparent 0%, rgba(0,0,0,0.05) 50%),
                                  ${getPetBackgroundColor(pet.name)}
                                `
                              }}
                            >
                              <span className="text-lg sm:text-xl z-10 relative">
                                {pet.name?.charAt(0).toUpperCase()}
                              </span>
                              {/* Optional subtle paw print watermark */}
                              <div 
                                className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
                                style={{ fontSize: '0.5rem' }}
                              >
                                🐾
                              </div>
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
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>
    </div>
  );
};
