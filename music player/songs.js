// Music library data — 20 songs with REAL audio URLs and album art
const SONGS = [
  {
    id: 1,
    title: "Neon Lights",
    artist: "Synthia Wave",
    album: "Electric Dreams",
    genre: "Pop",
    duration: 214,
    cover: "https://picsum.photos/seed/neonlights/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Midnight Drive",
    artist: "The Velvet Echoes",
    album: "After Dark",
    genre: "Rock",
    duration: 247,
    cover: "https://picsum.photos/seed/midnightdrive/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Blue Serenade",
    artist: "Miles Carter",
    album: "Smooth Horizons",
    genre: "Jazz",
    duration: 318,
    cover: "https://picsum.photos/seed/blueserenade/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "City Pulse",
    artist: "DJ Axiom",
    album: "Urban Frequency",
    genre: "Hip-Hop",
    duration: 198,
    cover: "https://picsum.photos/seed/citypulse/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5,
    title: "Aurora Borealis",
    artist: "Nebula Sound",
    album: "Celestial Waves",
    genre: "Electronic",
    duration: 276,
    cover: "https://picsum.photos/seed/auroraborealis/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 6,
    title: "Golden Hour",
    artist: "Lana Fields",
    album: "Sunlit Stories",
    genre: "Pop",
    duration: 203,
    cover: "https://picsum.photos/seed/goldenhour/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 7,
    title: "Thunder Road",
    artist: "Iron Clad",
    album: "Steel & Fire",
    genre: "Rock",
    duration: 289,
    cover: "https://picsum.photos/seed/thunderroad/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 8,
    title: "Rainy Café",
    artist: "Ella Fontaine",
    album: "Parisian Nights",
    genre: "Jazz",
    duration: 342,
    cover: "https://picsum.photos/seed/rainycafe/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: 9,
    title: "Street Chronicles",
    artist: "K-Nova",
    album: "Concrete Jungle",
    genre: "Hip-Hop",
    duration: 225,
    cover: "https://picsum.photos/seed/streetchronicles/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: 10,
    title: "Digital Horizon",
    artist: "Pixel Dreams",
    album: "Binary Sunset",
    genre: "Electronic",
    duration: 302,
    cover: "https://picsum.photos/seed/digitalhorizon/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    id: 11,
    title: "Starlight Kiss",
    artist: "Marina Glow",
    album: "Cosmic Love",
    genre: "Pop",
    duration: 191,
    cover: "https://picsum.photos/seed/starlightkiss/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"
  },
  {
    id: 12,
    title: "Broken Chains",
    artist: "Revolt Engine",
    album: "Uprising",
    genre: "Rock",
    duration: 264,
    cover: "https://picsum.photos/seed/brokenchains/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
  },
  {
    id: 13,
    title: "Velvet Smoke",
    artist: "Oscar Trane",
    album: "Late Night Grooves",
    genre: "Jazz",
    duration: 356,
    cover: "https://picsum.photos/seed/velvetsmoke/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3"
  },
  {
    id: 14,
    title: "Flow State",
    artist: "Lyric Master",
    album: "Mind Over Matter",
    genre: "Hip-Hop",
    duration: 210,
    cover: "https://picsum.photos/seed/flowstate/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3"
  },
  {
    id: 15,
    title: "Cyber Bloom",
    artist: "Glitch Garden",
    album: "Neon Flora",
    genre: "Electronic",
    duration: 245,
    cover: "https://picsum.photos/seed/cyberbloom/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  },
  {
    id: 16,
    title: "Daydream",
    artist: "Aria Belle",
    album: "Floating",
    genre: "Pop",
    duration: 228,
    cover: "https://picsum.photos/seed/daydream/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
  },
  {
    id: 17,
    title: "Wildfire",
    artist: "Crimson Peak",
    album: "Burn Bright",
    genre: "Rock",
    duration: 253,
    cover: "https://picsum.photos/seed/wildfire/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3"
  },
  {
    id: 18,
    title: "Autumn Leaves",
    artist: "Julian Reeves",
    album: "Seasonal Moods",
    genre: "Jazz",
    duration: 294,
    cover: "https://picsum.photos/seed/autumnleaves/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 19,
    title: "Concrete Dreams",
    artist: "Metro Collective",
    album: "Skyline",
    genre: "Hip-Hop",
    duration: 237,
    cover: "https://picsum.photos/seed/concretedreams/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 20,
    title: "Synthwave Sunset",
    artist: "Retro Pulse",
    album: "Outrun",
    genre: "Electronic",
    duration: 268,
    cover: "https://picsum.photos/seed/synthwavesunset/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

// Each song gets a unique gradient fallback for its album art
const COVER_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #f5576c 0%, #ff8a5c 100%)",
  "linear-gradient(135deg, #667eea 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
  "linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)",
  "linear-gradient(135deg, #feada6 0%, #f5efef 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
  "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
  "linear-gradient(135deg, #9890e3 0%, #b1f4cf 100%)",
  "linear-gradient(135deg, #ebc0fd 0%, #d9ded8 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
];

// Fallback placeholder SVG data URI for broken images (music note icon)
const FALLBACK_IMG = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#1a1a2e"/><text x="150" y="160" text-anchor="middle" font-size="80" fill="#7c5cfc">♫</text></svg>`);
