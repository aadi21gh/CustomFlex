import { useState, useMemo } from 'react';
import { fabric } from 'fabric';
import { Search, Sparkles, Flame, Smile, Globe } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════════════════════
   Sticker Library — Ultimate Viral Meme & Pop Culture Collection
   ─────────────────────────────────────────────────────────────────────────────
   Categories:
   1. Global Internet Classics (Doge, Pepe, This Is Fine, Pikachu, Chad, Wojak, etc.)
   2. Desi / Indian Viral Memes (Babu Bhaiya, Jethalal, Majnu Bhai, Chappal, etc.)
   3. Trending & Gen Z (Let Him Cook, Emotional Damage, Mewing, Touch Grass, etc.)
   ═══════════════════════════════════════════════════════════════════════════════ */

const STICKERS = {
  global: [
    {
      name: 'Doge',
      category: 'global',
      tags: ['doge', 'shiba', 'dog', 'wow', 'much', 'crypto'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#eab308" stroke="#ca8a04" stroke-width="2.5" />
        <!-- Ears -->
        <polygon points="20,35 15,10 38,22" fill="#ca8a04" stroke="#854d0e" stroke-width="2" />
        <polygon points="80,35 85,10 62,22" fill="#ca8a04" stroke="#854d0e" stroke-width="2" />
        <!-- Face muzzle -->
        <ellipse cx="50" cy="60" rx="22" ry="18" fill="#fef08a" />
        <ellipse cx="50" cy="52" rx="7" ry="5" fill="#1e293b" />
        <path d="M46 57 Q50 64 54 57" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" />
        <!-- Eyes with iconic side-eye -->
        <ellipse cx="36" cy="40" rx="5" ry="6" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" />
        <ellipse cx="64" cy="40" rx="5" ry="6" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" />
        <circle cx="38" cy="40" r="3.2" fill="#1e293b" />
        <circle cx="66" cy="40" r="3.2" fill="#1e293b" />
        <text x="25" y="24" fill="#3b82f6" font-family="'Comic Sans MS', sans-serif" font-weight="bold" font-size="7">much wow</text>
        <text x="60" y="85" fill="#ec4899" font-family="'Comic Sans MS', sans-serif" font-weight="bold" font-size="7">so flex</text>
      </svg>`
    },
    {
      name: 'This Is Fine',
      category: 'global',
      tags: ['fine', 'fire', 'dog', 'burning', 'coffee', 'this is fine'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="16" fill="#ffedd5" stroke="#ea580c" stroke-width="2.5" />
        <!-- Flames background -->
        <path d="M10 85 Q15 45 25 60 Q35 30 45 55 Q55 25 65 50 Q75 35 85 65 L90 85 Z" fill="#f97316" opacity="0.85" />
        <path d="M15 85 Q22 55 30 68 Q40 45 50 65 Q60 40 70 60 Q78 50 85 85 Z" fill="#facc15" />
        <!-- Dog head -->
        <circle cx="50" cy="50" r="16" fill="#d97706" stroke="#78350f" stroke-width="2" />
        <!-- Small green bowler hat -->
        <ellipse cx="50" cy="36" rx="10" ry="3" fill="#15803d" />
        <rect x="44" y="26" width="12" height="10" fill="#15803d" />
        <!-- Calm vacant eyes -->
        <circle cx="45" cy="48" r="3.5" fill="#ffffff" stroke="#78350f" stroke-width="1" />
        <circle cx="55" cy="48" r="3.5" fill="#ffffff" stroke="#78350f" stroke-width="1" />
        <circle cx="45" cy="48" r="1.5" fill="#000000" />
        <circle cx="55" cy="48" r="1.5" fill="#000000" />
        <!-- Coffee Mug -->
        <rect x="66" y="62" width="12" height="15" rx="2" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
        <path d="M78 65 Q83 69 78 74" fill="none" stroke="#000000" stroke-width="1.5" />
        <text x="50" y="92" fill="#7c2d12" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle">THIS IS FINE.</text>
      </svg>`
    },
    {
      name: 'Pepe Feels Good',
      category: 'global',
      tags: ['pepe', 'frog', 'feels good man', 'green', '4chan'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#4ade80" stroke="#15803d" stroke-width="3" />
        <!-- Frog bulging eyes -->
        <ellipse cx="34" cy="34" rx="12" ry="10" fill="#ffffff" stroke="#15803d" stroke-width="2.5" />
        <ellipse cx="66" cy="34" rx="12" ry="10" fill="#ffffff" stroke="#15803d" stroke-width="2.5" />
        <circle cx="34" cy="34" r="5" fill="#1e293b" />
        <circle cx="66" cy="34" r="5" fill="#1e293b" />
        <circle cx="36" cy="32" r="1.8" fill="#ffffff" />
        <circle cx="68" cy="32" r="1.8" fill="#ffffff" />
        <!-- Thick iconic lips -->
        <path d="M18 56 Q50 68 82 56 Q50 82 18 56 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
        <path d="M22 56 Q50 64 78 56" fill="none" stroke="#fca5a5" stroke-width="2" />
        <!-- Nostrils -->
        <ellipse cx="45" cy="48" rx="2" ry="3" fill="#15803d" />
        <ellipse cx="55" cy="48" rx="2" ry="3" fill="#15803d" />
        <text x="50" y="91" fill="#14532d" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="7.5" text-anchor="middle">FEELS GOOD MAN</text>
      </svg>`
    },
    {
      name: 'Surprised Pikachu',
      category: 'global',
      tags: ['pikachu', 'pokemon', 'surprised', 'shocked', 'open mouth'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#facc15" stroke="#ca8a04" stroke-width="3" />
        <!-- Ears with black tips -->
        <polygon points="18,30 5,5 30,18" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
        <polygon points="18,30 5,5 14,8" fill="#1e293b" />
        <polygon points="82,30 95,5 70,18" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
        <polygon points="82,30 95,5 86,8" fill="#1e293b" />
        <!-- Red cheeks -->
        <circle cx="24" cy="54" r="8" fill="#ef4444" />
        <circle cx="76" cy="54" r="8" fill="#ef4444" />
        <!-- Round open eyes -->
        <circle cx="36" cy="42" r="6" fill="#1e293b" />
        <circle cx="34" cy="40" r="2" fill="#ffffff" />
        <circle cx="64" cy="42" r="6" fill="#1e293b" />
        <circle cx="62" cy="40" r="2" fill="#ffffff" />
        <!-- Nose -->
        <polygon points="48,48 52,48 50,51" fill="#1e293b" />
        <!-- Iconic small open :O mouth -->
        <ellipse cx="50" cy="62" rx="7" ry="9" fill="#1e293b" />
        <ellipse cx="50" cy="64" rx="5" ry="6" fill="#f43f5e" />
        <text x="50" y="88" fill="#854d0e" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle">:O</text>
      </svg>`
    },
    {
      name: 'Stonks',
      category: 'global',
      tags: ['stonks', 'arrow', 'up', 'money', 'business', 'invest'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="18" fill="#0f172a" stroke="#3b82f6" stroke-width="2.5" />
        <path d="M15 75 L35 55 L50 65 L85 20 M85 20 L65 20 M85 20 L85 40" fill="none" stroke="#22c55e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M15 75 L35 55 L50 65 L85 20" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <text x="50" y="90" fill="#ffffff" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="1">STONKS</text>
      </svg>`
    },
    {
      name: 'Deal With It',
      category: 'global',
      tags: ['shades', 'sunglasses', 'deal with it', 'pixel', 'thug life'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#334155" stroke-width="3" />
        <!-- Pixel Sunglasses -->
        <rect x="16" y="38" width="30" height="14" fill="#0f172a" />
        <rect x="16" y="34" width="8" height="4" fill="#0f172a" />
        <rect x="22" y="38" width="4" height="4" fill="#ffffff" />
        <rect x="26" y="42" width="4" height="4" fill="#ffffff" />
        <rect x="46" y="38" width="8" height="4" fill="#0f172a" />
        <rect x="54" y="38" width="30" height="14" fill="#0f172a" />
        <rect x="76" y="34" width="8" height="4" fill="#0f172a" />
        <rect x="60" y="38" width="4" height="4" fill="#ffffff" />
        <rect x="64" y="42" width="4" height="4" fill="#ffffff" />
        <!-- Smug smile -->
        <path d="M38 68 Q50 78 64 66" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <text x="50" y="89" fill="#0f172a" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="7.5" text-anchor="middle">DEAL WITH IT</text>
      </svg>`
    },
    {
      name: 'Trollface',
      category: 'global',
      tags: ['troll', 'trollface', 'problem', 'classic', 'rage comic'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
        <ellipse cx="38" cy="38" rx="8" ry="4" fill="none" stroke="black" stroke-width="2.5" />
        <ellipse cx="62" cy="38" rx="8" ry="4" fill="none" stroke="black" stroke-width="2.5" />
        <circle cx="36" cy="38" r="2.5" fill="black" />
        <circle cx="60" cy="38" r="2.5" fill="black" />
        <path d="M30 30 Q38 26 46 30" fill="none" stroke="black" stroke-width="1.5" />
        <path d="M54 30 Q62 26 70 30" fill="none" stroke="black" stroke-width="1.5" />
        <path d="M22 50 C22 80, 78 80, 78 50" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" />
        <path d="M20 50 C35 53, 65 53, 80 50" fill="none" stroke="black" stroke-width="3" />
        <line x1="30" y1="52" x2="33" y2="68" stroke="black" stroke-width="1.5" />
        <line x1="40" y1="52" x2="42" y2="72" stroke="black" stroke-width="1.5" />
        <line x1="50" y1="52" x2="50" y2="73" stroke="black" stroke-width="1.5" />
        <line x1="60" y1="52" x2="58" y2="72" stroke="black" stroke-width="1.5" />
        <line x1="70" y1="52" x2="67" y2="68" stroke="black" stroke-width="1.5" />
        <text x="50" y="90" fill="#020617" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle">PROBLEM?</text>
      </svg>`
    },
    {
      name: 'GigaChad',
      category: 'global',
      tags: ['gigachad', 'sigma', 'chad', 'jawline', 'male', 'based'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="20" fill="#0f172a" stroke="#64748b" stroke-width="2.5" />
        <path d="M48 20 C52 20, 55 18, 58 24 C62 30, 60 38, 64 42 C68 45, 72 48, 70 54 C68 60, 60 62, 58 72 C56 82, 52 85, 48 85 C44 85, 40 82, 38 72 C36 62, 28 60, 26 54 C24 48, 28 45, 32 42 C36 38, 34 30, 38 24 C41 18, 44 20, 48 20 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
        <line x1="42" y1="36" x2="46" y2="38" stroke="#38bdf8" stroke-width="2" />
        <line x1="54" y1="38" x2="58" y2="36" stroke="#38bdf8" stroke-width="2" />
        <path d="M35 48 Q48 56 61 48" fill="none" stroke="#38bdf8" stroke-width="1.5" />
        <path d="M42 70 L48 76 L54 70" fill="none" stroke="#38bdf8" stroke-width="2" />
        <text x="50" y="93" fill="#38bdf8" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle" letter-spacing="1">GIGACHAD</text>
      </svg>`
    },
    {
      name: 'Crying Wojak',
      category: 'global',
      tags: ['wojak', 'crying', 'sobbing', 'tears', 'rage'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#64748b" stroke-width="2.5" />
        <!-- Angled angry/sad eyebrows -->
        <path d="M30 35 L44 42" stroke="#000" stroke-width="2.5" stroke-linecap="round" />
        <path d="M70 35 L56 42" stroke="#000" stroke-width="2.5" stroke-linecap="round" />
        <!-- Eyes with tear streams -->
        <ellipse cx="38" cy="46" rx="5" ry="3" fill="#000" />
        <ellipse cx="62" cy="46" rx="5" ry="3" fill="#000" />
        <path d="M38 48 Q32 62 36 78" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
        <path d="M62 48 Q68 62 64 78" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
        <!-- Open crying mouth -->
        <path d="M36 68 Q50 58 64 68 Q50 82 36 68 Z" fill="#b91c1c" stroke="#000" stroke-width="2" />
        <text x="50" y="92" fill="#ef4444" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="7" text-anchor="middle">NOOOO!</text>
      </svg>`
    },
    {
      name: 'Pop Cat',
      category: 'global',
      tags: ['pop cat', 'cat', 'kitten', 'popping', 'meme'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
        <!-- Cat ears -->
        <polygon points="22,35 15,12 40,24" fill="#f59e0b" />
        <polygon points="78,35 85,12 60,24" fill="#f59e0b" />
        <!-- Cat eyes -->
        <ellipse cx="36" cy="40" rx="5" ry="7" fill="#000" />
        <ellipse cx="64" cy="40" rx="5" ry="7" fill="#000" />
        <circle cx="34" cy="38" r="2" fill="#fff" />
        <circle cx="62" cy="38" r="2" fill="#fff" />
        <!-- Giant O popping mouth -->
        <ellipse cx="50" cy="62" rx="16" ry="18" fill="#7f1d1d" stroke="#000" stroke-width="2.5" />
        <ellipse cx="50" cy="64" rx="12" ry="12" fill="#dc2626" />
        <text x="50" y="93" fill="#b45309" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="9" text-anchor="middle">POP!</text>
      </svg>`
    },
    {
      name: 'Galaxy Brain',
      category: 'global',
      tags: ['brain', 'galaxy', 'expanding', 'smart', 'iq', 'cosmic'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5" />
        <!-- Brain outline glowing -->
        <path d="M35 55 C25 50, 25 35, 38 32 C35 22, 50 18, 55 26 C62 18, 75 22, 72 34 C82 38, 80 52, 70 56 C74 65, 65 75, 52 72 C42 75, 32 66, 35 55 Z" fill="#6366f1" stroke="#a5b4fc" stroke-width="2" />
        <!-- Glowing energy rays -->
        <line x1="50" y1="12" x2="50" y2="2" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
        <line x1="25" y1="20" x2="16" y2="12" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
        <line x1="75" y1="20" x2="84" y2="12" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
        <line x1="15" y1="45" x2="5" y2="45" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
        <line x1="85" y1="45" x2="95" y2="45" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
        <text x="50" y="88" fill="#38bdf8" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="7" text-anchor="middle">GALAXY BRAIN</text>
      </svg>`
    },
    {
      name: 'Skull / Dead',
      category: 'global',
      tags: ['skull', 'dead', 'laughing', 'im dead', 'lol'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#18181b" stroke="#71717a" stroke-width="2.5" />
        <!-- Skull cranium -->
        <path d="M28 45 C28 25, 72 25, 72 45 C72 58, 65 62, 62 72 L38 72 C35 62, 28 58, 28 45 Z" fill="#f4f4f5" stroke="#27272a" stroke-width="2" />
        <!-- Eye sockets -->
        <ellipse cx="40" cy="46" rx="6" ry="8" fill="#18181b" />
        <ellipse cx="60" cy="46" rx="6" ry="8" fill="#18181b" />
        <!-- Inverted heart nose -->
        <path d="M48 58 L50 54 L52 58 Z" fill="#18181b" />
        <!-- Teeth -->
        <line x1="44" y1="66" x2="44" y2="72" stroke="#27272a" stroke-width="2" />
        <line x1="50" y1="66" x2="50" y2="72" stroke="#27272a" stroke-width="2" />
        <line x1="56" y1="66" x2="56" y2="72" stroke="#27272a" stroke-width="2" />
        <text x="50" y="90" fill="#a1a1aa" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle">I'M DEAD 💀</text>
      </svg>`
    }
  ],
  desi: [
    {
      name: 'Babu Bhaiya',
      category: 'desi',
      tags: ['babu bhaiya', 'hera pheri', 'khopdi tod', 'paresh rawal', 'desi'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="45" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
        <rect x="22" y="28" width="22" height="18" rx="2" fill="none" stroke="black" stroke-width="4.5" />
        <rect x="56" y="28" width="22" height="18" rx="2" fill="none" stroke="black" stroke-width="4.5" />
        <line x1="44" y1="34" x2="56" y2="34" stroke="black" stroke-width="4.5" />
        <path d="M42 42 L50 36 L58 42" fill="none" stroke="black" stroke-width="2" />
        <path d="M28 58 Q40 50 50 58 Q60 50 72 58 Q80 50 82 45 Q75 62 50 62 Q25 62 18 45 Q20 50 28 58 Z" fill="black" />
        <text x="50" y="84" fill="#0f172a" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="9" text-anchor="middle">BABU BHAIYA</text>
      </svg>`
    },
    {
      name: 'Jethalal',
      category: 'desi',
      tags: ['jethalal', 'tmkoc', 'babita', 'pagal aurat', 'champaklal', 'tarak mehta'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" />
        <!-- Hair style -->
        <path d="M25 32 C30 18, 70 18, 75 32 C75 22, 60 14, 50 14 C40 14, 25 22, 25 32 Z" fill="#1e293b" />
        <!-- Eyeglasses -->
        <circle cx="36" cy="38" r="9" fill="none" stroke="#1e293b" stroke-width="2.5" />
        <circle cx="64" cy="38" r="9" fill="none" stroke="#1e293b" stroke-width="2.5" />
        <line x1="45" y1="38" x2="55" y2="38" stroke="#1e293b" stroke-width="2.5" />
        <!-- Mustache -->
        <path d="M34 52 Q44 48 50 53 Q56 48 66 52 Q50 60 34 52 Z" fill="#1e293b" />
        <text x="50" y="74" fill="#854d0e" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="7.5" text-anchor="middle">AYE PAGAL AURAT!</text>
        <text x="50" y="86" fill="#ca8a04" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="7" text-anchor="middle">JETHALAL</text>
      </svg>`
    },
    {
      name: 'Majnu Bhai Art',
      category: 'desi',
      tags: ['majnu bhai', 'welcome', 'painting', 'donkey', 'horse', 'art'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="10" fill="#fef3c7" stroke="#b45309" stroke-width="3" />
        <!-- Golden Picture Frame -->
        <rect x="10" y="10" width="80" height="70" fill="#fff" stroke="#f59e0b" stroke-width="2" />
        <!-- Stick figure horse with donkey on top -->
        <line x1="30" y1="65" x2="70" y2="65" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />
        <line x1="32" y1="65" x2="30" y2="78" stroke="#78350f" stroke-width="2.5" />
        <line x1="68" y1="65" x2="70" y2="78" stroke="#78350f" stroke-width="2.5" />
        <!-- Horse neck & head -->
        <line x1="30" y1="65" x2="22" y2="48" stroke="#78350f" stroke-width="3" />
        <!-- Donkey standing on horse's back! -->
        <line x1="42" y1="48" x2="62" y2="48" stroke="#000" stroke-width="3" stroke-linecap="round" />
        <line x1="45" y1="48" x2="45" y2="64" stroke="#000" stroke-width="2" />
        <line x1="58" y1="48" x2="58" y2="64" stroke="#000" stroke-width="2" />
        <circle cx="66" cy="42" r="4" fill="#000" />
        <text x="50" y="93" fill="#92400e" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="7.5" text-anchor="middle">MAJNU BHAI ART</text>
      </svg>`
    },
    {
      name: 'Jaane Ka Nahi',
      category: 'desi',
      tags: ['bulati hai', 'jaane ka nahi', 'rahat indori', 'warning', 'desi'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <polygon points="50,8 92,85 8,85" fill="#facc15" stroke="black" stroke-width="3" stroke-linejoin="round" />
        <path d="M50 30 L50 55" fill="none" stroke="black" stroke-width="5" stroke-linecap="round" />
        <circle cx="50" cy="68" r="4.5" fill="black" />
        <text x="50" y="80" fill="black" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="5.5" text-anchor="middle">BULATI HAI MAGAR</text>
        <text x="50" y="96" fill="#facc15" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8.5" text-anchor="middle">JAANE KA NAHI</text>
      </svg>`
    },
    {
      name: 'BINOD',
      category: 'desi',
      tags: ['binod', 'viral', 'comment', 'slayy point', 'youtube'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="15" width="90" height="70" rx="14" fill="#09090b" stroke="#22c55e" stroke-width="2.5" />
        <!-- Comment icon bubble -->
        <circle cx="24" cy="40" r="8" fill="#3f3f46" />
        <rect x="36" y="34" width="48" height="6" rx="2" fill="#71717a" />
        <text x="50" y="65" fill="#22c55e" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="16" text-anchor="middle" letter-spacing="2">BINOD</text>
      </svg>`
    },
    {
      name: 'Flying Chappal',
      category: 'desi',
      tags: ['chappal', 'flying', 'mummy', 'slipper', 'desi mom'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#fef2f2" stroke="#dc2626" stroke-width="3" />
        <path d="M35 30 C32 20, 48 15, 52 25 C55 35, 45 60, 48 75 C49 80, 40 82, 38 75 C35 60, 38 40, 35 30 Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5" />
        <path d="M34 24 Q44 26 49 20 Q54 26 50 30" fill="none" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round" />
        <line x1="68" y1="35" x2="82" y2="28" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
        <line x1="62" y1="50" x2="78" y2="42" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
        <line x1="65" y1="65" x2="80" y2="58" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
        <text x="50" y="90" fill="#b91c1c" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8.5" text-anchor="middle">FLYING CHAPPAL</text>
      </svg>`
    },
    {
      name: 'Chai Lover',
      category: 'desi',
      tags: ['chai', 'tea', 'cup', 'cutting chai', 'morning'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="45" fill="#5B4636" stroke="#DFD8C9" stroke-width="3" />
        <path d="M40 30 Q35 20 40 15 T35 5" fill="none" stroke="#EFEAE0" stroke-width="2.5" stroke-linecap="round" />
        <path d="M50 30 Q45 20 50 15 T45 5" fill="none" stroke="#EFEAE0" stroke-width="2.5" stroke-linecap="round" />
        <path d="M60 30 Q55 20 60 15 T55 5" fill="none" stroke="#EFEAE0" stroke-width="2.5" stroke-linecap="round" />
        <path d="M30 40 L35 75 C37 80 63 80 65 75 L70 40 Z" fill="#C76D4A" />
        <rect x="31" y="50" width="38" height="8" fill="#E7B8A4" />
        <text x="50" y="90" fill="#EFEAE0" font-family="'Outfit', 'Inter', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">CHAI LOVER</text>
      </svg>`
    }
  ],
  trending: [
    {
      name: 'Let Him Cook',
      category: 'trending',
      tags: ['cook', 'chef', 'let him cook', 'fire', 'kitchen'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#0f172a" stroke="#f97316" stroke-width="2.5" />
        <!-- Chef Hat -->
        <path d="M36 44 C26 40, 26 25, 40 22 C42 12, 58 12, 60 22 C74 25, 74 40, 64 44 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
        <rect x="36" y="44" width="28" height="8" rx="2" fill="#ffffff" />
        <!-- Pan with flames -->
        <ellipse cx="50" cy="62" rx="20" ry="6" fill="#334155" />
        <line x1="68" y1="62" x2="84" y2="54" stroke="#475569" stroke-width="3" stroke-linecap="round" />
        <!-- Fire in pan -->
        <path d="M40 60 Q45 48 50 56 Q55 46 60 60 Z" fill="#f97316" />
        <path d="M44 60 Q48 52 50 58 Q53 50 56 60 Z" fill="#facc15" />
        <text x="50" y="88" fill="#f97316" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle">LET HIM COOK 🔥</text>
      </svg>`
    },
    {
      name: 'Emotional Damage',
      category: 'trending',
      tags: ['damage', 'emotional', 'steven he', 'meme', 'ko'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <polygon points="50,5 64,30 95,24 75,48 95,70 65,70 50,95 35,70 5,70 25,48 5,24 36,30" fill="#dc2626" stroke="#ffffff" stroke-width="2.5" />
        <polygon points="50,12 60,32 85,28 70,48 85,64 62,64 50,84 38,64 15,64 30,48 15,28 40,32" fill="#b91c1c" />
        <text x="50" y="46" fill="#fef08a" font-family="'Outfit', 'Impact', sans-serif" font-weight="900" font-size="11" text-anchor="middle">EMOTIONAL</text>
        <text x="50" y="60" fill="#ffffff" font-family="'Outfit', 'Impact', sans-serif" font-weight="900" font-size="12" text-anchor="middle">DAMAGE!</text>
      </svg>`
    },
    {
      name: 'Mewing 🤫',
      category: 'trending',
      tags: ['mewing', 'shh', 'jawline', 'bye bye', 'rizz'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5" />
        <!-- Shushing hand & finger -->
        <rect x="46" y="32" width="8" height="24" rx="4" fill="#fbcfe8" stroke="#831843" stroke-width="1.5" />
        <!-- Sharp jawline angle indicator -->
        <path d="M25 45 L35 70 L50 82" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
        <text x="50" y="26" fill="#f472b6" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="10" text-anchor="middle">BYE BYE 🤫</text>
        <text x="50" y="93" fill="#38bdf8" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8" text-anchor="middle">MEWING STREAK</text>
      </svg>`
    },
    {
      name: 'No Cap 🧢',
      category: 'trending',
      tags: ['no cap', 'cap', 'hat', 'facts', 'real'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#0284c7" stroke="#0369a1" stroke-width="2.5" />
        <!-- Baseball Cap -->
        <path d="M30 46 C30 28, 70 28, 70 46 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
        <path d="M26 46 Q50 42 74 46 L90 52 C85 57, 65 55, 26 46 Z" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
        <!-- Cross / Cancel sign over it -->
        <circle cx="50" cy="50" r="30" fill="none" stroke="#ef4444" stroke-width="4.5" />
        <line x1="29" y1="29" x2="71" y2="71" stroke="#ef4444" stroke-width="4.5" />
        <text x="50" y="92" fill="#ffffff" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="10" text-anchor="middle">NO CAP</text>
      </svg>`
    },
    {
      name: 'Touch Grass',
      category: 'trending',
      tags: ['touch grass', 'grass', 'nature', 'gamer', 'outside'],
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#f0fdf4" stroke="#16a34a" stroke-width="3" />
        <!-- Grass blades -->
        <path d="M25 72 Q30 35 40 45 Q35 72 35 72" fill="#22c55e" />
        <path d="M40 72 Q48 25 54 40 Q46 72 46 72" fill="#16a34a" />
        <path d="M52 72 Q65 30 72 48 Q60 72 60 72" fill="#4ade80" />
        <!-- Hand reaching down to touch -->
        <path d="M35 15 L50 35 Q55 38 48 42 L32 24 Z" fill="#fed7aa" stroke="#9a3412" stroke-width="1.5" />
        <text x="50" y="88" fill="#15803d" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="8.5" text-anchor="middle">TOUCH GRASS 🌱</text>
      </svg>`
    }
  ]
};

const StickerLibrary = () => {
  const { fabricRef, syncLayers, pushHistory, activeSide, addCanvasObject } = useStudio();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const canvas = () => fabricRef.current;

  // Flattened all stickers
  const allStickersList = useMemo(() => {
    return [
      ...STICKERS.global,
      ...STICKERS.desi,
      ...STICKERS.trending,
    ];
  }, []);

  // Filtered stickers based on active category & search query
  const filteredStickers = useMemo(() => {
    return allStickersList.filter((s) => {
      const matchCat = activeCategory === 'all' || s.category === activeCategory;
      const matchQuery = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [allStickersList, activeCategory, searchQuery]);

  const addSticker = (sticker) => {
    if (!canvas()) {
      toast.error('Canvas not initialized');
      return;
    }

    fabric.loadSVGFromString(sticker.svgString, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);

      obj.set({
        id: `sticker_${Date.now()}`,
        customName: `${sticker.name} Sticker`,
        side: activeSide || 'front',
      });

      const maxDim = 95;
      if (obj.width > maxDim || obj.height > maxDim) {
        const scale = maxDim / Math.max(obj.width, obj.height);
        obj.set({ scaleX: scale, scaleY: scale });
      }

      if (addCanvasObject) {
        addCanvasObject(obj, { side: activeSide });
      } else {
        canvas().add(obj);
        canvas().setActiveObject(obj);
        canvas().renderAll();
        syncLayers();
        pushHistory();
      }
      toast.success(`Added ${sticker.name}!`, { duration: 1200 });
    });
  };

  const categories = [
    { id: 'all', label: 'All Memes', icon: Sparkles },
    { id: 'global', label: 'Internet Classics', icon: Globe },
    { id: 'desi', label: 'Desi Viral', icon: Smile },
    { id: 'trending', label: 'Gen Z / Trending', icon: Flame },
  ];

  return (
    <div className="flex flex-col h-full bg-dark-950 overflow-hidden select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-glass-border space-y-2 bg-dark-900/60">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-dark-400" />
          <input
            type="text"
            placeholder="Search doge, pepe, pikachu, babu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-dark-950/80 border border-glass-border text-xs text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === id
                  ? 'bg-brand-500 text-dark-950 font-bold shadow-sm'
                  : 'bg-dark-900/60 text-dark-400 hover:text-dark-200 border border-glass-border'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stickers Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between text-2xs text-dark-500 px-1 mb-1 font-semibold">
          <span>{filteredStickers.length} STICKERS</span>
          <span>Click to place on {activeSide ? activeSide.toUpperCase() : 'CANVAS'}</span>
        </div>

        {filteredStickers.length === 0 ? (
          <div className="text-center py-12 text-dark-500 text-xs">
            No meme stickers found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {filteredStickers.map((sticker) => (
              <button
                key={sticker.name}
                onClick={() => addSticker(sticker)}
                title={`Add ${sticker.name}`}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-glass-border hover:border-brand-500/60 hover:bg-brand-500/10 transition-all duration-200 aspect-square group bg-dark-900/40 hover:scale-105 active:scale-95 shadow-sm"
              >
                <div
                  className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform drop-shadow-md"
                  dangerouslySetInnerHTML={{ __html: sticker.svgString }}
                />
                <span className="text-[10px] mt-1 text-dark-300 group-hover:text-brand-300 font-semibold truncate w-full text-center">
                  {sticker.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerLibrary;
