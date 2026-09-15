// About page content. Story paragraphs are Emmanuel's own words; inline
// {tokens} mark where small interactive pieces sit inside the text.

export const person = {
  name: "Emmanuel Ofuje Dania",
  callName: "Ofuje",
  pronunciation: "aww-foo-jeh",
  meaning: "he who brings joy",
  audio: "/assets/audio/name.mp3",
};

export const photos = {
  front: {
    src: "/assets/images/about-camera.jpg",
    alt: "Emmanuel photographing his reflection in a mirrored lift, camera covering his face",
  },
  back: {
    src: "/assets/images/about-face.jpg",
    alt: "Emmanuel in a pink shirt and scarf, white headphones around his head, in front of red and green leaves",
  },
};

// {ibadan} → a chip that jumps to the coordinates section
// {pipeline} → the phrase plus a run button that replays the pull quote
export const story = [
  "I grew up in {ibadan}, Nigeria, and I've always been the type of person to follow my curiosity. Hours spent going down Reddit threads, or with my nose buried in books. I developed an avid love for reading, devouring books far above my reading level. I love learning broadly, picking up new ideas, and sharing what I find with other people. That curiosity was also what led my dad, who was already in the tech space, to introduce me to software and technology. I found a medium that let me turn ideas into things I could actually see and use, and eventually share with other people. Along the way, I developed a love for different forms of storytelling, from deeply immersive games to amazing pilots and shows.",
  "I eventually fell in love with {pipeline} running on my laptop. There was something strangely satisfying about being able to command a machine to do something and then watch it happen without my own input. That fascination led me to pursue a degree in Software Engineering, specializing in Machine Learning and AI, which I recently completed. There's a genuine joy in taking an idea, building it out, and seeing it become something that improves my own life or someone else's, especially when it is both visually appealing and useful. I've worked on everything from speech technology for African languages to machine-learning research and small products built with friends.",
  { quote: "I like learning a little bit about everything, then finding a way to build something with it." },
  "I enjoy working across the stack because I care about the whole experience, not just whether the code works. I like thinking about how something feels to use, how it looks, and whether the problem it solves is actually worth solving.",
  "I'm still figuring out exactly where all of this takes me, but I know I want to keep building, learning, and making things that leave people a little better off than I found them.",
];

export const facts = [
  { term: "Grew up", value: "Ibadan, Nigeria" },
  { term: "Studied & built", value: "Kigali, Rwanda" },
  { term: "Degree", value: "BSc Software Engineering, specializing in ML & AI" },
  { term: "Works across", value: "Machine learning, full-stack, frontend" },
];

// The pipeline log that "builds" the pull quote
export const pipeline = [
  { step: "reading", result: "1 more rabbit hole" },
  { step: "collecting ideas", result: "37 found, 3 kept" },
  { step: "building", result: "ok" },
  { step: "printing output", result: "↓" },
];

export const cities = [
  {
    id: "ibadan",
    name: "Ibadan",
    country: "Nigeria",
    meaning: "where I grew up.",
    lat: 7.3775,
    lon: 3.947,
    timeZone: "Africa/Lagos",
    zoneAbbr: "WAT",
  },
  {
    id: "kigali",
    name: "Kigali",
    country: "Rwanda",
    meaning: "where I found myself, studied, and built.",
    lat: -1.9441,
    lon: 30.0619,
    timeZone: "Africa/Kigali",
    zoneAbbr: "CAT",
  },
];

export const currently = {
  updated: "2026-09",
  entries: [
    { label: "building", text: "{My portfolio}, personal projects, and whatever interesting ideas I can't stop thinking about." },
    { label: "learning", text: "{Machine learning}, AI engineering, and becoming a better software engineer." },
    { label: "reading", text: "Essays, technical rabbit holes, and {Dungeon Crawler Carl}." },
    { label: "listening to", text: "Soulful music, D&D podcasts, {game soundtracks}, and lo-fi." },
  ],
};

export const beyond = {
  games: {
    line: "Especially worlds I can get completely lost in.",
    playing: ["Fortnite", "Baldur's Gate 3", "Watch Dogs"],
    memory:
      "Before I wrote a line of code, I was building in Minecraft: a world with no instructions, just blocks and whatever I could imagine. Its soundtrack stuck with me too. <em>Sweden</em>, by C418, is the song playing in the corner of this site.",
  },
  guitar: "Still very much learning.",
  writing: "Figuring things out by putting them into words.",
  drawing: "Making things without a screen.",
};

export const onward = [
  { label: "See the resume", href: "/resume" },
  { label: "Get in touch", href: "/#contact" },
  { label: "GitHub", href: "https://github.com/e-dania" },
];
