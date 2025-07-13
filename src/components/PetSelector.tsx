
import { Card } from "@/components/ui/card";

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
}

export const PetSelector = ({ pets, selectedPet, onSelectPet }: PetSelectorProps) => {
  if (pets.length <= 1) return null;

  return (
    <div className="mb-4 sm:mb-6 overflow-x-auto pb-2">
      <div className="flex space-x-2 sm:space-x-3 min-w-max">
        {pets.map(pet => (
          <Card 
            key={pet.id} 
            className={`border-2 cursor-pointer flex-shrink-0 w-56 sm:w-64 transition-all ${
              selectedPet?.id === pet.id 
                ? 'border-navy-700 shadow-lg' 
                : 'border-transparent hover:border-navy-300'
            }`}
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
        ))}
      </div>
    </div>
  );
};
