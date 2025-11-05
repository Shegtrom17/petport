import type { PodcastEpisode } from '../podcastEpisodes';

const episode: PodcastEpisode = {
  slug: "petport-digital-pet-profile-platform",
  title: "The Digital Pet Profile & Information Platform for a Lifetime",
  description: "PetPort is the all-in-one app that gives every pet a voice for life. From LiveLinks and real-time pet care updates to lost-pet flyers, résumé builders, storyboards, and instant photo-to-PDF records, it keeps every detail organized, shareable, and ready when your pet needs you most.",
  coverImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-pet-profile-1000x1000.jpg",
  ogImage: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-pet-profile-1200x630.jpg",
  audioUrl: "https://pub-5e3024d73a954e09aa62c81c9d3f1592.r2.dev/petport-digital-pet-profile-platform.m4a",
  duration: "10:11",
  publishDate: "2025-09-07",
  transcript: `PetPort is the all-in-one digital pet profile and care management app that unites every part of an animal's life — from lost-pet flyers and community alert systems to daily care and wellness tracking, medical documentation, and adoption transfers. Inside the app, pet owners, fosters, and rescues can store digital health records, create photo-to-PDF medical files, and share proof of vaccinations or Coggins tests instantly. Interactive LiveLinks allow sitters and trainers to post real-time updates on feeding, medication, and behavior. PetPort also features a Pet Résumé Builder for housing and travel, an instant lost-pet flyer generator with QR codes and sighting boards, and secure record transfer for adopters or new owners. More than a file system, it's a complete pet wellness and voice-for-life platform that keeps every story, record, and relationship connected under one roof.

Okay, let's uh let's unpack this. We're diving into Petport, that's really trying to solve a problem I think well pretty much everyone who loves an animal faces.
Oh yeah, that total chaos of information.
Exactly. All the pet stuff scattered everywhere. Petport promises something different. Giving every animal a secure, lasting digital voice for life.
And it's a struggle. You know, it's shared by everyone. Pet parents, sure, but also fosters, big rescues. We've all been there digging for that one piece. piece of paper, an allergy note maybe, or a vaccine date and it's stuck in some binder or a junk drawer
or old emails, cloud drives you barely remember,
right? And when that info gets lost, especially during a handover, like with allergies or meds or even just, you know, feeding details, the stakes get really high really fast.
No kidding. So, this deep dive is about understanding how Petport aims to well end that mess.
The idea is this complete transferable digital identity for dogs, cats, horses.
Yeah. Unifying all that critical care information.
And it's one subscription for multiple pets, which seems practical.
That single umbrella is key. I think it really speaks to their main idea, that continuity of care, right?
It's not just about like storing files. It's about building a narrative for the pet, giving them that voice that carries through their whole life,
sharing what makes them happy, what hurts.
Even conquering a fear of thunderstorms, maybe.
Exactly. Preserving their story, even if they move to a new home. home. It builds trust.
I think that nails the spirit of it. Okay,
so let's look at the how. The technology choice here seems really deliberate. It's interesting that Petport isn't your typical app store download. It's a PWA, a progressive web app.
Uh-huh. And that PWA choice is well, it's strategic. Think about it. For people already overwhelmed by info chaos, native apps can be another headache.
You mean heavy downloads, endless updates?
Yeah. Those update required pop-ups, sync errors, maybe doesn't work on your partner's phone. A PWA of voids all that. It runs securely right in your browser.
Any browser, Apple, Android, Windows,
any modern browser. Yeah. On your phone, your tablet, your desktop. It acts like an app, feels like an app, but without all the installation friction. It's just there and always up to date.
Okay. Universality, less friction. But if it's all about critical info, what about connectivity? That's the big weakness for anything mobile, right? We all been there. Remote horse show park with bad signal.
We're traveling overseas,
right? And you need that proof of vaccination. Now, how does a web app solve that?
Ah, that's the clever part. That's the real aha moment with the PWA approach. Yeah. Key data is stored locally.
Locally on the device.
Exactly. So, crucial stuff. Care summaries, med lists, vaccine records. It's accessible offline. You don't need Wi-Fi. You don't need cell service. You pull it up instantly.
Okay. That is transformative, especially in an emergency. Reliability is everything.
Totally.
So, let's shift to the systems. Uh they call it the living core. This is the bit that replaces that constant back and forth texting between owners and sitters, right?
The live links and the care and handling board.
Yeah, the live links are kind of the interactive gateways, but that care and handling board, that's the synchronization hub. Think about it. No more five frantic texts from the sitter asking about feeding times or meds
or where that special toy is hidden.
Exactly. This board means everyone involved with the pet is looking at the same realtime information, the single source of truth. And it's not static like a print out left on the counter.
Yeah,
the owner can update it from anywhere. They mentioned someone updating meta instructions from Scotland,
right? That ability to instantly change critical details, maybe a diet adjustment or an emergency contact and know the person on the ground sees it immediately. That's vital for consistent care.
Makes sense.
And it works both ways. The sitter, the trainer, the groom, they're not just reading instructions. They can add notes right back onto the board,
like daily updates.
Mhm. Ate all his food today or horses hoof looked a bit off or maybe shy cat finally played with the feather wand. It creates this running log seamlessly part of the pet's history.
Okay, so that covers daily care consistency. But what about emergencies? Like the worst case scenario, a lost pet. How does Petport pivot from routine care to like organized crisis response? The lost pet mode.
This is designed to cut through the panic, turn that emotional chaos into well standard effective action. The owner activates lost pet mode.
Okay.
And the pet's existing live link, the one maybe a sitter or walker already has access to it, instantly changes. It shifts to display critical emergency focused info.
So if someone finds the pet, maybe scans a QR tag, they get that link
and they're immediately directed to the sighting board. They can report exactly where and when they saw the animal right there.
Instant reporting.
Yes. And the system automates the communication. New sightings trigger email alerts to the owner to any trusted contacts they setup. Plus, and this is clever, it generates a professional flyer.
A ready to go flyer.
Yep. High quality, branded, all the key details, contact info, one tap to print it. You're not wasting precious time designing something or hunting for a printer. You go straight into organized response.
That focus on saving time in a crisis.
That's smart.
But Petport also seems to be about giving animals like systemic credibility. The pet resume builder sounds unique. Why is a pet resume a big deal beyond just a rental applications.
Well, it moves the needle from just, you know, my dog is friendly to actual documented reliability. Think about housing, insurance, maybe specialized training programs. Often a pet's record is just anecdotes,
right?
This resume aims to be a proper digital portfolio and it's built automatically from verified data within Petport. It provides quantifiable, trustworthy proof.
So, it pulls in things like what? Certifications, medical summaries.
Exactly. Certific awards, key medical points, training logs. But the real gamecher, I think, is the ability to request and submit references directly within the live light.
References for a pet.
Yeah. Like from a previous landlord or a vet or a trainer. They can vouch for the pet's behavior or health. And that endorsement gets securely attached to the animal's digital identity. You can share it instantly as a PDF or just send the live link. It's about breaking down barriers using trust and verified records.
That narrative idea comes through again with the photo storyboard. journal, too, doesn't it? We all have tons of pet photos, but this sounds more structured.
It's about context and continuity. It's not just a photo dump. It's a dated log. You capture milestones for a swim, maybe overcoming a fear, a new grooming style with little notes and captions.
Building that story over time.
Precisely. It creates this living history that helps anyone new understand the pet's personality, their quirks, their journey. It's more than just medical charts.
And connecting that back.
Yeah.
For rescues or fosters, that seems less transfer must be huge when a pet gets adopted.
The new owner gets the whole picture. The health records, yes, but also the trainers notes, the behavioral insights, those little milestone photos and stories. They're not starting from scratch trying to piece things together,
avoiding that confusion.
Exactly. The system is built for transition, which is different from just storing files.
Okay. Practicalities. We still need paper sometimes, right? For the vet or kennel or whatever. There's a quick share hub.
Yeah, that's the practical engine room. Need proof of vaccination for the dog park. or that full resume for an apartment application. It generates clean, professional PDFs instantly,
ready to email or print
in seconds. Keeps things looking consistent and professional even when you have to step outside the purely digital world.
Okay, last big piece, transferable accounts and this legacy idea. This seems fundamental to the voice for life promise. What happens when a pet changes hands?
This tackles a really important, often overlooked issue and Animal inheritance, continuity of history. What happens to all that info when a pet is adopted or sold or maybe the owner can no longer care for them?
Usually it just vanishes, right?
Often. Yeah.
Yeah.
Or it's incomplete. Petport is designed so the entire account, the complete history transfers securely to the new subscriber, the new caretaker.
So the medical data, the training notes, those references we talked about, it all goes with the animal.
Exactly. The history belongs to the pet. Rescues can build that detailed record from day one and hand it off completely. to the adopter or you know if something happens to the original owner
the pet's needs aren't suddenly a mystery
right the care history the critical information it remains visible and accessible it's very intentional legacy planning focused squarely on the animals ongoing welfare
and accessibility we know one subscription covers multiple pets is it expensive to maintain this
the pricing seems designed for broad use the source material mentioned $14.99 a year or $1.99 a month
okay pretty acceptable
yeah uh seems like a small ongoing investment for that level of clarity and safety. And they offer a 7-day free trial, so you can basically upload your current chaos and see how it feels to have it all organized.
So, wrapping this up,
what's the real takeaway here? Petport's innovation isn't just the tech itself, is it? It feels like it's more about understanding that a pet's life story is critical data.
I think so.
It's like a digital bridge connecting everyone who cares for that animal over time, ensuring their care doesn't rely on fading memories or lost folders.
Absolutely. It ensures the trainer's progress logs are there. The vet can see past tests easily. The sitter knows those little comfort cues. And crucially, a new family can step in and continue the story seamlessly,
grounded in trust and verified info.
It really does aim to give the pet that continuous voice.
So, here's something to think about. If we can ensure a pet's entire life story, all their critical care history transfers securely and seamlessly like this,
if their voice for life never fades, how How does that idea of a permanent digital pet identity change our fundamental responsibilities towards animal welfare? Maybe even how we approach things like pet inheritance and legacy planning. Definitely something to consider.`,
  displayTranscript: `
    <h1>The Digital Pet Profile & Information Platform for a Lifetime</h1>

    <p class="lead text-lg text-muted-foreground mb-6">
      In this opening deep-dive, Alex and Jamie explore how <strong>PetPort</strong> is transforming pet care by giving every animal a <strong>voice for life</strong>. More than a filing system, PetPort connects the entire world of care—from real-time <strong>LiveLinks</strong> and <strong>Care & Handling boards</strong> that keep sitters, trainers, and owners in sync, to <strong>lost-pet flyers</strong>, <strong>résumé builders</strong>, and transferable records that travel with your pet for life.
    </p>

    <h2>The Problem: Information Chaos</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">0:00</span>
          <h3 class="text-xl font-bold text-foreground">The Scattered Pet Information Crisis</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX/JAMIE</p>
        <p class="text-foreground leading-relaxed">We're diving into <strong>Petport</strong>—the system trying to solve the problem everyone who loves an animal faces: total <strong>chaos of information</strong>. All the pet stuff scattered everywhere. Petport promises something different: giving every animal a secure, lasting <strong>digital voice for life</strong>.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">0:45</span>
          <h3 class="text-xl font-bold text-foreground">When Lost Info Becomes Life-Threatening</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed">It's shared by everyone—pet parents, fosters, big rescues. We've all been there: digging for that one piece of paper, an allergy note, a vaccine date, stuck in some binder or junk drawer, old emails, cloud drives you barely remember. When that info gets lost, especially during a handover—allergies, meds, feeding details—the stakes get really high really fast.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">1:20</span>
          <h3 class="text-xl font-bold text-foreground">Complete Transferable Digital Identity</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX</p>
        <p class="text-foreground leading-relaxed">The idea is this complete <strong>transferable digital identity</strong> for dogs, cats, horses. Unifying all that critical care information. One subscription for multiple pets. It's not just about storing files—it's about building a narrative for the pet, giving them that voice that carries through their whole life, sharing what makes them happy, what hurts, even conquering fears. Preserving their story, even if they move to a new home.</p>
      </div>
    </div>

    <h2>The Technology: Why a PWA Changes Everything</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">2:10</span>
          <h3 class="text-xl font-bold text-foreground">Progressive Web App: Universal Access</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed">Petport isn't your typical app store download. It's a <strong>PWA, a Progressive Web App</strong>. That PWA choice is strategic. For people already overwhelmed by info chaos, native apps can be another headache: heavy downloads, endless updates, sync errors. A PWA avoids all that. It runs securely right in your browser—any browser: Apple, Android, Windows. It acts like an app, feels like an app, but without all the installation friction.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">3:00</span>
          <h3 class="text-xl font-bold text-foreground">Offline Access: The Emergency Lifesaver</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX</p>
        <p class="text-foreground leading-relaxed">What about connectivity? That's the big weakness for anything mobile, right? Remote horse show, traveling overseas, and you need that proof of vaccination. That's the real aha moment with the PWA approach. Key data is stored locally on the device. Crucial stuff—care summaries, med lists, <strong>vaccine records</strong>—it's accessible offline. You don't need Wi-Fi. You pull it up instantly. That is transformative, especially in an emergency.</p>
      </div>
    </div>

    <h2>The Living Core: Real-Time Care Coordination</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">3:50</span>
          <h3 class="text-xl font-bold text-foreground">LiveLinks & Care Board: Single Source of Truth</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed">The <strong>Live Links</strong> are the interactive gateways, but that <strong>Care and Handling Board</strong> is the synchronization hub. No more five frantic texts from the sitter asking about feeding times or meds. This board means everyone involved with the pet is looking at the same real-time information, the single source of truth. And it's not static like a printout left on the counter.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">4:30</span>
          <h3 class="text-xl font-bold text-foreground">Instant Updates from Anywhere</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX</p>
        <p class="text-foreground leading-relaxed">The owner can update it from anywhere. Someone updating med instructions from Scotland—that ability to instantly change critical details, maybe a diet adjustment or emergency contact, and know the person on the ground sees it immediately. That's vital for consistent care. And it works both ways. The sitter, the trainer, the groomer—they can add notes right back onto the board: daily updates, "Ate all his food today" or "Horse's hoof looked a bit off." It creates this running log seamlessly part of the <strong>pet's history</strong>.</p>
      </div>
    </div>

    <h2>Crisis Mode: Lost Pet Protocol</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">5:20</span>
          <h3 class="text-xl font-bold text-foreground">One-Tap Lost Pet Mode Activation</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed">How does Petport pivot from routine care to organized crisis response? The <strong>Lost Pet Mode</strong> is designed to cut through the panic, turn emotional chaos into standard effective action. The owner activates lost pet mode, and the pet's existing <strong>live link</strong> instantly changes. It shifts to display critical emergency-focused info.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">5:55</span>
          <h3 class="text-xl font-bold text-foreground">Sighting Board & Auto-Generated Flyers</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX</p>
        <p class="text-foreground leading-relaxed">If someone finds the pet, scans a QR tag, they're immediately directed to the <strong>Sighting Board</strong>. They can report exactly where and when they saw the animal right there. The system automates the communication—new sightings trigger email alerts to the owner, to any trusted contacts. Plus, it generates a professional <strong>Lost Pet Flyer</strong>: high quality, branded, all the key details, contact info, one tap to print it. You're not wasting precious time designing something.</p>
      </div>
    </div>

    <h2>Systemic Credibility: The Pet Résumé</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">6:40</span>
          <h3 class="text-xl font-bold text-foreground">From Anecdotes to Verified Digital Portfolio</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed">Petport gives animals systemic credibility. The <strong>Pet Résumé Builder</strong> is unique. It moves the needle from just "my dog is friendly" to actual documented reliability. Think about housing, insurance, specialized training programs. Often a pet's record is just anecdotes. This résumé aims to be a proper <strong>digital portfolio</strong> built automatically from verified data within Petport.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">7:15</span>
          <h3 class="text-xl font-bold text-foreground">Professional References for Pets</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX</p>
        <p class="text-foreground leading-relaxed">It pulls in Certifications, Awards, Medical Summaries, training logs. The real gamechanger is the ability to request and submit <strong>references</strong> directly within the live link—from a previous landlord, a vet, a trainer. They can vouch for the pet's behavior or health. That endorsement gets securely attached to the animal's digital identity. You can share it instantly as a PDF or just send the live link. It's about breaking down barriers using trust and verified records.</p>
      </div>
    </div>

    <h2>Legacy & Transfer: Photo Storyboard Journal</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">7:55</span>
          <h3 class="text-xl font-bold text-foreground">Building a Living History</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed">That narrative idea comes through with the <strong>Photo Storyboard & Journal</strong>. It's about context and continuity. It's not just a photo dump—it's a dated log. You capture milestones: first swim, overcoming a fear, a new grooming style, with little notes and captions. Building that story over time creates this <strong>living history</strong> that helps anyone new understand the pet's personality, their quirks, their journey.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">8:30</span>
          <h3 class="text-xl font-bold text-foreground">Seamless Transfer for Adoption & Rescue</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX</p>
        <p class="text-foreground leading-relaxed">For rescues or fosters, that seamless transfer is huge when a pet gets adopted. The new owner gets the whole picture—health records, yes, but also the trainer's notes, the behavioral insights, those little milestone photos and stories. They're not starting from scratch. The system is built for transition, which is different from just storing files.</p>
      </div>
    </div>

    <h2>Transferable Accounts: History Belongs to the Pet</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">9:00</span>
          <h3 class="text-xl font-bold text-foreground">Legacy Planning for Animals</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed"><strong>Transferable accounts</strong> and the legacy idea seem fundamental to the voice for life promise. What happens when a pet changes hands? This tackles animal inheritance, continuity of history. Usually it just vanishes. Petport is designed so the entire account, the complete history, transfers securely to the new subscriber, the new caretaker.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">9:35</span>
          <h3 class="text-xl font-bold text-foreground">The History Travels with the Animal</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX</p>
        <p class="text-foreground leading-relaxed">The medical data, the training notes, those references—it all goes with the animal. The history belongs to the pet. Rescues can build that detailed record from day one and hand it off completely to the adopter. If something happens to the original owner, the pet's needs aren't suddenly a mystery. The care history, the critical information, remains visible and accessible. It's intentional <strong>legacy planning</strong> focused squarely on the animal's ongoing welfare.</p>
      </div>
    </div>

    <h2>Accessibility, Pricing, and Call to Action</h2>

    <div class="space-y-6">
      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">10:05</span>
          <h3 class="text-xl font-bold text-foreground">$14.99 Per Year for Multiple Pets</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: JAMIE</p>
        <p class="text-foreground leading-relaxed">One subscription covers multiple pets. The pricing seems designed for broad use: <strong>$14.99 a year</strong> or <strong>$1.99 a month</strong>. That small ongoing investment buys clarity and safety. They offer a <strong>7-day free trial</strong>, so you can upload your current chaos and see how it feels to have it all organized.</p>
      </div>

      <div class="border-l-4 border-brand-primary pl-6">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-sm font-mono text-muted-foreground">10:40</span>
          <h3 class="text-xl font-bold text-foreground">Give Your Pet a Voice for Life</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-2">Host: ALEX/JAMIE</p>
        <p class="text-foreground leading-relaxed">Petport's innovation is its compassion. It's a <strong>digital bridge</strong> connecting everyone who cares for that animal over time. It ensures the trainer's progress logs are there, the vet can see past tests easily, the sitter knows those little comfort cues. And crucially, a new family can step in and continue the story seamlessly. If we can ensure a pet's entire life story transfers securely like this, how does that idea of a permanent digital pet identity change our fundamental responsibilities towards animal welfare? Visit <strong>PetPort.app</strong> and give your pet a voice for life.</p>
      </div>
    </div>
  `,
  keywords: [
    "digital pet profile and emergency care",
    "pet record transfer system",
    "Progressive Web App animal records",
    "digital pet health records management",
    "lost pet alert system community",
    "transferable pet records for adoption",
    "pet care checklist app for sitters",
    "pet insurance documents storage PWA",
    "give your pet a voice for life"
  ],
  relatedPages: [
    "/demos",
    "/lost-pet-features",
    "/referral-program"
  ]
};

export default episode;
