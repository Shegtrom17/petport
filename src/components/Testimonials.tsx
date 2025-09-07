import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Taylor Cummings",
    role: "Traveling Pet Parent",
    rating: 5,
    quote: "This app is a game changer. I can update care instructions from anywhere and share them instantly by email, link, or PDF—no stress, no hassle, just total peace of mind."
  },
  {
    name: "Travis Foster",
    role: "Groomer",
    rating: 5,
    quote: "I was shocked when I got a link asking me to review one of my client's dogs—what a clever idea! It took me just a minute to write a reference, and now the owner can share it with future groomers. Honestly, every pet owner should be doing this."
  },
  {
    name: "Micah S.",
    role: "Vet",
    location: "Sugar Creek, MO",
    rating: 5,
    quote: "Last week a family came in with a very sick cat. With one tap, I had his full history and vaccines on-screen. In an emergency, that instant access makes all the difference. Get the App for your pets, please!"
  }
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex justify-center mb-4">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-lg ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export const Testimonials = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-primary mb-4">Pet Parents Love PetPort</h2>
          <p className="text-xl text-brand-primary-dark">Real stories from our community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <StarRating rating={testimonial.rating} />
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-brand-primary font-semibold">
                  {testimonial.name}
                </div>
                <div className="text-brand-primary-dark text-sm">
                  {testimonial.role}
                  {testimonial.location && `, ${testimonial.location}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}