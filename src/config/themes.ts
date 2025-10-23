export const themes = {
  patriotic: {
    name: "Pawtriot 🇺🇸",
    colors: {
      background: "#F8F9FA",   // soft off-white
      accent: "#B21E2C",       // flag red
      text: "#2C495A",         // navy
      banner: { text: "🇺🇸 Proud to be a Pawtriot!", bg: "#2C495A", fg: "#FFFFFF" }
    },
    mottos: [
      "Proud to be a pawtriot.",
      "In dog we trust.",
      "One nation, under dog.",
      "Land of the free, home of the paws.",
      "United we wag."
    ],
    achievements: [
      "Defended backyard borders.",
      "Served in the War on Mailmen.",
      "Salutes the flag before breakfast.",
      "Stood guard during fireworks season.",
      "Protected family with unwavering loyalty."
    ],
    experiences: [
      "Chief Security Officer at Home Sweet Home",
      "Border Patrol Specialist (Backyard Division)",
      "Freedom Guardian & Treat Enthusiast",
      "National Anthem Howler (Pro Level)"
    ],
    references: [
      "Uncle Sam (says I'm a good dog)",
      "The Founding Fur-thers",
      "My fellow pawtriots",
      "Betsy Ross (made my bandana)"
    ]
  },

  christmas: {
    name: "Merry & Bright 🎄",
    colors: {
      background: "#165B33",   // evergreen
      accent: "#F2B84A",       // gold
      text: "#FFF8E7",         // cream
      bannerChoices: [
        { text: "🎄 Merry Christmas from PetPort!", bg: "#BB2528", fg: "#FFF8E7" },
        { text: "✨ Happy Holidays from PetPort!", bg: "#BB2528", fg: "#FFF8E7" }
      ]
    },
    mottos: [
      "Santa's favorite fur-baby.",
      "Bark the herald angels sing.",
      "All I want for Christmas is treats.",
      "Making spirits bright, one wag at a time.",
      "Merry and bright, day and night."
    ],
    achievements: [
      "Unwrapped presents early.",
      "Survived the family photoshoot.",
      "Caught Santa (and licked him).",
      "Decorated the tree (with drool).",
      "Starred in the holiday card."
    ],
    experiences: [
      "Chief Present Inspector at North Pole South Branch",
      "Cookie Taste Tester (Unpaid Internship)",
      "Christmas Tree Guard & Ornament Supervisor",
      "Santa's Little Helper (Very Little, Very Helpful)"
    ],
    references: [
      "Santa Paws himself",
      "Rudolph (we're tight)",
      "The Elves (I supervised their lunch breaks)",
      "Mrs. Claus (she loves me)"
    ]
  },

  fall: {
    name: "Fall is Paw-some 🍂",
    colors: {
      background: "#FAF6F1",   // warm cream
      accent: "#E5903A",       // pumpkin orange
      text: "#8B5E3C",         // cozy brown
      banner: { text: "🍁 Fall is Paw-some!", bg: "#8B5E3C", fg: "#FAF6F1" }
    },
    mottos: [
      "Pumpkin spice and puppy eyes.",
      "Sweater weather, better together.",
      "Leaves crunch, hearts melt.",
      "Falling for fall, one leaf at a time.",
      "Cozy, cuddly, and completely adorable."
    ],
    achievements: [
      "Mastered sunbeam positioning.",
      "Survived three leaf-blower attacks.",
      "Expert blanket burrower.",
      "Caught falling leaves (with mouth).",
      "Modeled every sweater in the closet."
    ],
    experiences: [
      "Sunbeam Strategist & Nap Coordinator",
      "Leaf Pile Destruction Specialist",
      "Pumpkin Patch Quality Control Inspector",
      "Professional Sweater Model & Couch Warmer"
    ],
    references: [
      "The Squirrels (they fear me)",
      "Every sunbeam in the house",
      "My favorite blanket",
      "The pumpkin I sniffed"
    ]
  }
} as const;

export type ThemeId = keyof typeof themes;
