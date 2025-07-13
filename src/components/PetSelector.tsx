
import { Card } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
    <div className="mb-4 sm:mb-6 overflow-x-auto pb-2">
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
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          {pet.photoUrl ? (
                            <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-navy-200 flex items-center justify-center text-sm sm:text-base">
                              {pet.name?.charAt(0).toUpperCase()}
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
  );
};
