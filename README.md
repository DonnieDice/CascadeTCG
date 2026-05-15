# CascadeTCG

**Project**: CascadeTCG  
**Version**: 2.0 (Capture Race Edition)  
**Last Updated**: 2025-12-04  
**Status**: Core mechanics finalized → Ready for implementation

---

## Game Overview

**Type**: 2-player competitive card game (PvP or PvAI)  
**Win Condition**: Be the first to capture all 36 cards from your own deck (reduce deck to 0)  
**Core Loop**: Gain seals → Cascade captures → Attack opponent's deck → Cycle cards back → Race to empty your deck  
**Theme**: Magical card sealing with cost-based cascade chains

---

## Complete Game Mechanics

### 1. DECK & CARDS

**Deck Size**: 36 cards (identical for both players)

**Cost Distribution**:
```
Cost 1: 12 cards (33.3%)
Cost 2: 10 cards (27.8%)
Cost 3:  8 cards (22.2%)
Cost 4:  6 cards (16.7%)
```

**Elements**: Fire, Water, Wind, Earth  
- **Currently cosmetic only** (no mechanical effects)
- Balanced within each cost tier (3 of each element per tier)

**Card Properties**:
```javascript
{
  id: string,        
  cost: 1|2|3|4,    
  element: 'fire'|'water'|'wind'|'earth',   
  name: string       
}
```

**Card Names by Cost**:
```
Cost 1: Spark, Ember, Flicker, Drop, Stream, Ripple, Breeze, Gust, Draft, Pebble, Stone, Dust
Cost 2: Firey, Heat, Flame, Watery, Flow, Wave, Windy, Blow, Gale, Earthy, Ground, Soil
Cost 3: Inferno, Phoenix, Ocean, Glacier, Tempest, Thunder, Terra, Canyon
Cost 4: Sun, Star, Moon, Eclipse, Cosmos, Astral, World, Titan
```

---

### 2. STARTING STATE

| Resource | Starting Value | Notes |
|----------|----------------|-------|
| HP | 25 | Backup loss condition |
| Seal Points | 3 | Carries over between turns |
| Deck | 36 cards | Goal: reduce to 0 |
| Field | 0 cards | Captured this turn |
| Last Turn Captures | 0 | For Mirror ability |
| Cascade Counter | 0/3 | Resets each turn |

**Decks are NOT shuffled.**

---

### 3. HEROES

Choose one hero before the game starts.

#### The Fortune
- **Ability**: Lucky Draw
- **Trigger**: End of turn
- **Effect**: If you cascaded ≤1 card this turn, gain +1 seal
- **Strategy**: Rewards short turns for seal economy

#### The Mirror
- **Ability**: Reflection Power
- **Trigger**: Start of turn
- **Effect**: If opponent captured ≥3 cards on their last turn, gain +1 seal
- **Strategy**: Anti-aggro, punishes opponent's big turns

#### The Power
- **Ability**: Raw Strength (passive)
- **Trigger**: None
- **Effect**: No special ability
- **Strategy**: Consistent baseline performance

---

### 4. TURN STRUCTURE

#### PHASE 1 — Start Turn
1. Gain +1 seal (unconditional)
2. **Mirror ability check**: If opponent captured ≥3 cards last turn → +1 seal

#### PHASE 2 — Auto-Capture
1. Reveal top card of your deck
2. Automatically capture it for FREE (place on Field)
3. Set `lastCapturedCost = card.cost` (stored as **C**)

#### PHASE 3 — Cascade (0–3 total successful captures)

**Hard Limit**: Maximum 3 successful cascades per turn (across all chains)

**For each cascade attempt:**

1. **Reveal** next card from deck (revealed cost: **R**)
2. **Compare R to C** (last captured cost):

| Condition | Seal Cost | Result |
|-----------|-----------|--------|
| **R < C** | **0 seals** | Auto-capture (FREE), update C = R |
| **R = C** | **R + 1 seals** | Capture if paid (FORCED), C stays same |
| **R > C** | N/A | Cannot capture, chain breaks |

3. **Make Decision**:
   - **R < C**: Auto-capture for free, increment cascade counter, may continue
   - **R = C**: Pay (R + 1) seals to capture, OR decline and card goes to bottom
   - **R > C**: Card goes to bottom, chain ends

4. **After chain ends** (R > C or declined R = C):
   - If cascade counter < 3: May **pay 1 seal** to start new chain
   - If cascade counter = 3: Phase 3 ends immediately
   - New chain resets C to last successfully captured card's cost

5. **Check limit**: If 3 successful cascades reached → Phase 3 ends

**Important**: 
- Chain breaks (R > C) do NOT count toward cascade limit
- You can attempt multiple chains per turn (each costs 1 seal)
- Once you hit 3 successful cascades, NO more chains possible

#### PHASE 4 — Capture Resolution (Deck Annihilation)

1. **Calculate Attack Value**:
   ```
   Attack Value = Sum of all costs on your Field
   ```

2. **Weighted Deck Destruction**:
   - Opponent reveals top card of their deck
   - If Attack Value ≥ Card Cost: Eliminate card permanently, subtract cost from Attack Value
   - If Attack Value < Card Cost: Card survives, goes to bottom of opponent's deck
   - Repeat until Attack Value = 0 or opponent's deck empty

**Example**:
```
Your Field: [Cost 4, Cost 2, Cost 1] = Attack Value 7
Opponent reveals Cost 3 → Eliminate (7 - 3 = 4 remaining)
Opponent reveals Cost 2 → Eliminate (4 - 2 = 2 remaining)
Opponent reveals Cost 3 → SURVIVES (2 < 3), goes to bottom
Result: 2 cards eliminated from opponent's deck
```

#### PHASE 5 — End Turn
1. **Fortune ability check**: If cascaded ≤1 → +1 seal
2. **Track captures**: `lastTurnCaptures = Field.length` (for opponent's Mirror)
3. **Cycle Field**: Move all Field cards to bottom of YOUR deck (in order)
4. **Reset**: Clear Field, reset cascade counter to 0/3
5. **Pass turn** to opponent

---

### 5. RESOURCES

#### Seal Points
- **Starting**: 3
- **Gain**: +1 per turn (unconditional)
- **Gain**: +1 from hero abilities (conditional)
- **Spend**: 
  - Forced captures (R = C): Costs (R + 1) seals
  - New chain attempts: Costs 1 seal
- **Carries Over**: Never resets between turns

#### Field
- **Function**: Temporary zone for cards captured this turn
- **Size**: 1-4 cards (1 auto + up to 3 cascades)
- **Usage**: 
  - Determines Attack Value for Phase 4
  - Cycles back to bottom of your deck in Phase 5

#### Deck
- **Starting**: 36 cards
- **Goal**: Reduce to 0 cards (win condition)
- **No reshuffling**: Order is deterministic
- **Bottom placement**: Failed cascades, survivors, cycled Field cards

#### Last Turn Captures
- **Function**: Tracks opponent's Field size from previous turn
- **Usage**: Triggers Mirror ability (≥3 captures)
- **Updated**: At end of Phase 5

---

### 6. VICTORY CONDITION

**Primary Win**: Deck = 0 cards (first player to empty their deck wins immediately)  
**Secondary Win**: Opponent HP ≤ 0 (backup, reserved for future card effects)

**Average Game Length**: 8-12 turns

---

## Cascade Mechanics Deep Dive

### Free Cascade Chains

When R < C, you get free cascades until the chain breaks:

```
Auto-Capture: Cost 4 (C = 4, cascades: 0/3)
Reveal Cost 3 → R < C → FREE! (C = 3, cascades: 1/3)
Reveal Cost 2 → R < C → FREE! (C = 2, cascades: 2/3)
Reveal Cost 1 → R < C → FREE! (C = 1, cascades: 3/3)
LIMIT REACHED → Phase 3 ends

Result: 4 cards captured, 0 seals spent
```

### Multiple Chains Per Turn

After a chain breaks, pay 1 seal to attempt a new chain:

```
Auto-Capture: Cost 4 (C = 4, cascades: 0/3)

CHAIN 1:
  Reveal Cost 2 → FREE! (cascades: 1/3)
  Reveal Cost 4 → BREAKS (Cost 4 to bottom)

PAY 1 SEAL for CHAIN 2:
  C resets to 2 (last captured)
  Reveal Cost 1 → FREE! (cascades: 2/3)
  Reveal Cost 3 → BREAKS (Cost 3 to bottom)

PAY 1 SEAL for CHAIN 3:
  C resets to 1 (last captured)
  Reveal Cost 4 → BREAKS (Cost 4 to bottom)
  
Result: 3 cards captured, 2 seals spent on chain attempts
```

### Forced Captures (Tie Breaker)

When R = C, pay (R + 1) seals to force capture:

```
Last captured: Cost 2 (C = 2)
Reveal Cost 2 → R = C → Pay 3 seals (2 + 1)
If paid: Capture, C stays 2, cascades +1, may continue
If not paid: Cost 2 to bottom, chain ends
```

**Strategic Use**: Keeps C at same level, allows horizontal chain extension

### Chain Breaks (R > C)

When R > C, chain ends automatically:

```
Last captured: Cost 2 (C = 2)
Reveal Cost 4 → R > C → BREAKS immediately
Cost 4 goes to bottom of deck
Cannot pay to continue
May pay 1 seal to start new chain (if cascades < 3)
```

---

## Game State Structure

```javascript
{
  gameState: 'hero-select' | 'playing' | 'victory' | 'defeat',
  currentTurn: 'player' | 'enemy',
  turnNumber: 1,
  phase: 'start' | 'auto-capture' | 'cascade' | 'resolution' | 'end',

  player: {
    hero: { id: string, name: string, ability: string },
    hp: 25,
    seals: 3,
    deck: Card[],              // Remaining cards (goal: reduce to 0)
    field: Card[],             // Captured this turn (1-4 cards)
    lastTurnCaptures: number,  // Cards captured last turn (for Mirror)
    cascadeCount: 0,           // 0-3 successful cascades
    cascadeLimit: 3,           // Always 3
    lastCapturedCost: number | null  // Reference for cascade comparison
  },

  enemy: { /* identical structure */ },

  revealedCard: Card | null,
  log: string[],
  waitingForPlayer: boolean
}
```

---

## Strategic Considerations

### Free Cascade Chains
- **Best case**: Auto-capture Cost 4, chain down to Cost 1 (4 cards, 0 seals)
- **Worst case**: Auto-capture Cost 1 (no free cascades possible)
- **Strategy**: Hope for high-cost auto-captures

### Multiple Chain Strategy
- **When to attempt**: If you have spare seals and cascades remaining (< 3)
- **Cost**: 1 seal per chain attempt (even if immediately breaks)
- **Risk**: Chain might break on first reveal, wasting the seal
- **Reward**: Potential to hit more free cascades and reach 3-cascade limit
- **Limit awareness**: Cannot start new chain once at 3/3 cascades

### Forced Captures
- **Cost**: Always (R + 1) seals (expensive)
- **When to use**: Need specific card, or want to extend chain horizontally
- **Risk**: Cost 4 tie = 5 seals to force
- **Reward**: Keeps C at same level for continued cascades

### Seal Management
- **Conservative play**: Avoid forced captures and extra chains → Triggers Fortune (+1 seal)
- **Aggressive play**: Force captures and attempt multiple chains → Burns seals quickly
- **Banking**: Save seals for crucial Cost 3-4 forced captures
- **Chain gambling**: 1 seal for new chain is cheap but risky

### Deck Race Strategy
- **Capture 4 cards**: 1 auto + 3 cascades = maximum captures per turn
- **Big attacks**: More Field cards = bigger Attack Value = more opponent deck elimination
- **Race condition**: Empty YOUR deck faster than opponent empties theirs
- **Value**: Eliminating opponent's high-cost cards slows their progress

### Hero Synergies
- **The Fortune**: Best for seal economy, rewards 0-1 cascade turns (+1-3 seals/game)
- **The Mirror**: Anti-aggro, gains seals when opponent has big turns (+1-2 seals/game)
- **The Power**: No variance, pure skill-based play (baseline)

---

## Edge Cases

### Deck Exhaustion
- If deck is empty at Phase 2: Cannot auto-capture → You WIN (deck = 0)
- Game ends immediately

### Zero Seals
- Can still perform free cascades (R < C)
- Cannot perform forced captures (R = C)
- Cannot start new chains (costs 1 seal)

### Cascade Limit Reached
- Once at 3/3 cascades, Phase 3 ends immediately
- Cannot start new chains even with seals remaining

### Chain Breaks Immediately
- Auto-capture Cost 1, reveal Cost 2 → Breaks
- Valid (bad luck), not a rules violation

### Forced Capture With Exact Seals
- C = 3, Seals = 4
- Reveal Cost 3 → Costs 4 seals to force
- Can pay exact amount → Seals = 0 after
- Can still continue with free cascades (R < C)

### Multiple Chains Without Success
```
Pay 1 seal → Reveal Cost 4 → Breaks immediately
Pay 1 seal → Reveal Cost 3 → Breaks immediately
Result: 2 seals wasted, 0 cascades gained
Still valid play (risky gamble)
```

---

## UI/UX Requirements

### Critical Display Elements

1. **Deck Size Counter** (both players)
   - Format: "📚 28 / 36 cards remaining"
   - Progress bar showing capture race
   - **Most important stat** (primary win condition)

2. **Seal Display**
   - Large glowing orb
   - Format: "🔮 6 seals"
   - Pulsing animation when gained

3. **Cascade Counter**
   - Format: "Cascades: 2 / 3"
   - Color-coded:
     - 0/3: Green
     - 1/3: Yellow
     - 2/3: Orange
     - 3/3: Red + "LIMIT REACHED"

4. **Last Captured Cost (C)**
   - Format: "Last Captured: Cost 3"
   - Used for comparison display

5. **Revealed Card Comparison**
   - Shows: "Revealed: Cost 2"
   - Shows: "Compare: 2 < 3 → FREE CASCADE!"
   - Visual indicators (✓ free, 💰 pay, ✗ breaks)

6. **Field Display**
   - Highlighted zone for this turn's captures
   - Shows 1-4 cards
   - Gold border/glow effect
   - Attack value shown: "⚔️ Total: 9"

7. **Capture Resolution Log**
   - Live feed during Phase 4:
   ```
   Attack Value: 9
   Eliminated: Cost 3 (6 left)
   Eliminated: Cost 2 (4 left)
   Eliminated: Cost 1 (3 left)
   Survived: Cost 4 (sent to bottom)
   ```

8. **Win Condition Tracker**
   - Shows both players' deck sizes
   - Race visualization
   - Format: "Player: 28 left | Enemy: 31 left"

---

## Visual Effects

- Card slide-in animations
- Failure shake (when R > C breaks chain)
- Successful capture glow
- Attack phase slashes/impacts
- Deck destruction animations
- Field cards cycling to bottom of deck
- HP ticker (if used)
- Seal gain sparkles

---

## AI Logic (Basic)

### Free Cascades (R < C)
- Always take (no cost, always beneficial)

### Forced Captures (R = C)
- Take if: `(R + 1) <= seals AND (cascades < 2)`
- Avoid if: Low on seals or already at 2/3 cascades

### New Chain Attempts
- Attempt if: `seals >= 3 AND cascades < 3`
- Avoid if: Low on seals or at 2/3 cascades (risky)

### Early Stop
- If leading in deck race by 5+ cards, play conservatively
- If behind, attempt more chains aggressively

---

## Logging Examples

```
[Turn 3] Phase 2: Auto-Capture → Cost 3 (Inferno)
[Turn 3] Phase 3: Cascade #1 → Cost 2 (Watery) → FREE (2 < 3)
[Turn 3] Phase 3: Cascade #2 → Cost 2 (Earthy) → FORCED (2 = 2), paid 3 seals → SUCCESS
[Turn 3] Phase 3: Cascade #3 → Cost 4 (Sun) → CHAIN BREAKS (4 > 2)
[Turn 3] Phase 3: New chain attempt (paid 1 seal)
[Turn 3] Phase 3: Cascade #3 → Cost 1 (Breeze) → FREE (1 < 2) → LIMIT REACHED
[Turn 3] Phase 4: Attack Value = 10 (3+2+2+1)
[Turn 3] Phase 4: Eliminated Cost 3 (Attack: 7 left)
[Turn 3] Phase 4: Eliminated Cost 2 (Attack: 5 left)
[Turn 3] Phase 4: Eliminated Cost 1 (Attack: 4 left)
[Turn 3] Phase 4: Cost 4 SURVIVES (4 > 4)
[Turn 3] Phase 5: Fortune check → Cascaded 3 times → No bonus
```

---

## Testing Checklist

### Unit Tests
- Cascade comparison logic (R < C, R = C, R > C)
- Seal economy (gain, spend, carry over)
- Cascade counter limits (3 max)
- Multiple chain attempts
- Field cycling to bottom of deck
- Deck annihilation calculation

### Turn Simulations
- All free cascades (4→3→2→1)
- All chain breaks (1→2→3→4)
- Multiple chains in one turn
- Zero seals scenarios
- Empty deck win condition
- Forced capture sequences

### Edge Case Tests
- Cascade limit enforcement
- New chain after 3/3 cascades (should block)
- Exact seal costs
- Multiple ties in a row
- Chain breaks then new chain
- Running out of seals mid-chain

---

## Glossary

**Auto-Capture** — Free top card revealed at start of turn (Phase 2)  
**Cascade** — Optional chained card reveals after auto-capture  
**Free Cascade** — When R < C, capture costs 0 seals  
**Forced Capture** — When R = C, capture costs (R + 1) seals  
**Chain Break** — When R > C, cascade ends automatically  
**New Chain** — Pay 1 seal to start fresh cascade attempt after chain breaks  
**Field** — Temporary zone holding this turn's captured cards  
**Last Captured Cost (C)** — Reference value for comparing next revealed card  
**Revealed Cost (R)** — Cost of card currently being evaluated  
**Capture Resolution** — Phase 4 where Field's total cost eliminates opponent's deck cards  
**Deck Annihilation** — Permanently eliminating cards from opponent's deck  
**Cycling** — Moving Field cards back to bottom of your deck at end of turn  
**Last Turn Captures** — Count of cards captured previous turn (for Mirror ability)

---

## Cascade Comparison Quick Reference

```
R < C → FREE CASCADE (auto-capture, update C = R, cascades +1)
R = C → FORCED CAPTURE (pay R+1 seals, C stays same, cascades +1)
R > C → CHAIN BREAKS (to bottom, chain ends, no cascade increment)

After chain breaks:
  If cascades < 3 → May pay 1 seal to start new chain
  If cascades = 3 → Phase 3 ends immediately
```

---

## Final Game Flow Summary

```
PHASE 1: START
  +1 seal (unconditional)
  Mirror check: If opponent captured ≥3 last turn → +1 seal

PHASE 2: AUTO-CAPTURE
  Reveal top card → Free capture to Field
  Set C = card cost

PHASE 3: CASCADE (0-3 total)
  Loop:
    Reveal card (cost R)
    If R < C: FREE → Capture, update C, cascades +1
    If R = C: FORCED → Pay (R+1) or decline
    If R > C: BREAKS → Card to bottom
    
    If chain breaks AND cascades < 3:
      May pay 1 seal to start new chain
    
    If cascades = 3: STOP (Phase 3 ends)

PHASE 4: CAPTURE RESOLUTION
  Attack Value = Sum of Field costs
  Loop:
    Opponent reveals top card
    If Attack ≥ Cost: Eliminate, subtract cost
    If Attack < Cost: Survives to bottom
  Until Attack = 0 or opponent deck empty

PHASE 5: END TURN
  Fortune check: If cascaded ≤1 → +1 seal
  Track lastTurnCaptures = Field.length
  Move Field → Bottom of YOUR deck
  Reset cascade counter to 0/3
  Pass turn
```
# Card Sprite System - Using Single Image for All Cards

## Overview
Use a single sprite sheet image containing all 52 cards and extract individual cards using CSS `background-position`.

---

## Image Analysis

Based on the Clow Card image:
- **Layout**: 13 columns × 4 rows = 52 cards
- **Card dimensions**: ~100px width × ~200px height (estimate, adjust based on actual image)
- **Total image size**: ~1300px × 800px

---

## Implementation Approaches

### **Option 1: CSS Background Position (Recommended)**

Upload the sprite sheet and use `background-position` to show specific cards.

```css
.card {
  width: 100px;
  height: 200px;
  background-image: url('/clow-cards-sprite.png');
  background-size: 1300px 800px; /* Total sprite sheet size */
  background-repeat: no-repeat;
}

/* Example: Card at row 0, column 0 (The Arrow) */
.card-arrow {
  background-position: 0px 0px;
}

/* Example: Card at row 0, column 1 (The Big) */
.card-big {
  background-position: -100px 0px;
}

/* Example: Card at row 1, column 0 (The Fly) */
.card-fly {
  background-position: 0px -200px;
}
```

**Formula**:
```javascript
const cardWidth = 100;  // Width of one card
const cardHeight = 200; // Height of one card
const columns = 13;

// Calculate position for any card
function getCardPosition(cardIndex) {
  const row = Math.floor(cardIndex / columns);
  const col = cardIndex % columns;
  
  return {
    x: -(col * cardWidth),
    y: -(row * cardHeight)
  };
}
```

---

### **Option 2: React Component with Dynamic Positioning**

```jsx
const CardSprite = ({ cardIndex, cost, element, name }) => {
  const cardWidth = 100;
  const cardHeight = 200;
  const columns = 13;
  
  const row = Math.floor(cardIndex / columns);
  const col = cardIndex % columns;
  
  const backgroundPositionX = -(col * cardWidth);
  const backgroundPositionY = -(row * cardHeight);
  
  return (
    <div
      className="card-sprite"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        backgroundImage: 'url(/clow-cards-sprite.png)',
        backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
        backgroundSize: `${columns * cardWidth}px ${4 * cardHeight}px`,
        backgroundRepeat: 'no-repeat'
      }}
      title={name}
    />
  );
};
```

---

### **Option 3: Canvas Extraction (Advanced)**

Extract each card as a separate image blob at runtime:

```javascript
function extractCardFromSprite(spriteImage, cardIndex) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const cardWidth = 100;
  const cardHeight = 200;
  const columns = 13;
  
  const row = Math.floor(cardIndex / columns);
  const col = cardIndex % columns;
  
  canvas.width = cardWidth;
  canvas.height = cardHeight;
  
  // Draw the specific card section
  ctx.drawImage(
    spriteImage,
    col * cardWidth,     // Source X
    row * cardHeight,    // Source Y
    cardWidth,           // Source Width
    cardHeight,          // Source Height
    0,                   // Destination X
    0,                   // Destination Y
    cardWidth,           // Destination Width
    cardHeight           // Destination Height
  );
  
  return canvas.toDataURL(); // Returns base64 image
}
```

---

## Card Mapping

Create a mapping between your card data and sprite positions:

```javascript
// Card names from the sprite (left to right, top to bottom)
const SPRITE_CARD_ORDER = [
  // Row 1 (0-12)
  'Arrow', 'Big', 'Bubbles', 'Change', 'Cloud', 'Create', 'Dark', 'Dash', 'Dream', 'Earth', 'Erase', 'Fight', 'Firey',
  
  // Row 2 (13-25)
  'Fly', 'Flower', 'Freeze', 'Glow', 'Illusion', 'Jump', 'Libra', 'Light', 'Little', 'Lock', 'Loop', 'Maze',
  
  // Row 3 (26-38)
  'Mirror', 'Mist', 'Move', 'Power', 'Rain', 'Return', 'Sand', 'Shadow', 'Shield', 'Shot', 'Silent', 'Sleep', 'Snow',
  
  // Row 4 (39-51)
  'Song', 'Storm', 'Sweet', 'Sword', 'Through', 'Thunder', 'Time', 'Twin', 'Voice', 'Watery', 'Wave', 'Windy', 'Wood'
];

// Map your game cards to sprite indices
function getCardSpriteIndex(cardName) {
  return SPRITE_CARD_ORDER.indexOf(cardName);
}
```

---

## Implementation in CascadeTCG

### **Step 1: Update Card Component**

```jsx
const Card = ({ card, showCost = true, spriteIndex }) => {
  const cardWidth = 100;
  const cardHeight = 200;
  const columns = 13;
  
  const row = Math.floor(spriteIndex / columns);
  const col = spriteIndex % columns;
  
  const bgX = -(col * cardWidth);
  const bgY = -(row * cardHeight);
  
  return (
    <div className="relative group">
      {/* Card sprite */}
      <div
        className="card-sprite rounded-lg shadow-lg"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          backgroundImage: 'url(/clow-cards-sprite.png)',
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${columns * cardWidth}px ${4 * cardHeight}px`,
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Cost badge overlay */}
      {showCost && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
          {card.cost}
        </div>
      )}
      
      {/* Hover tooltip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-sm font-bold">{card.name}</p>
        <p className="text-xs">{ELEMENT_ICONS[card.element]} {card.element}</p>
      </div>
    </div>
  );
};
```

### **Step 2: Generate Deck with Sprite Indices**

```javascript
function generateDeck() {
  const costs = [
    { cost: 1, count: 12 },
    { cost: 2, count: 10 },
    { cost: 3, count: 8 },
    { cost: 4, count: 6 }
  ];
  
  const elements = ['fire', 'water', 'wind', 'earth'];
  const deck = [];
  let cardId = 0;
  let spriteIndex = 0;
  
  costs.forEach(({ cost, count }) => {
    const perElement = count / 4;
    
    elements.forEach(element => {
      for (let i = 0; i < perElement; i++) {
        deck.push({
          id: `card-${cardId++}`,
          cost,
          element,
          name: SPRITE_CARD_ORDER[spriteIndex] || `Card ${cardId}`,
          spriteIndex: spriteIndex++
        });
      }
    });
  });
  
  return deck;
}
```

---

## Measuring Actual Card Dimensions

To get exact dimensions from your sprite:

```javascript
// Run this in browser console after loading the image
const img = new Image();
img.onload = function() {
  console.log('Image dimensions:', img.width, 'x', img.height);
  console.log('Card width (approx):', img.width / 13);
  console.log('Card height (approx):', img.height / 4);
};
img.src = '/path/to/clow-cards-sprite.png';
```

Or use this React component to measure:

```jsx
const SpriteMeasurer = () => {
  const [dimensions, setDimensions] = useState(null);
  
  const handleImageLoad = (e) => {
    const img = e.target;
    setDimensions({
      totalWidth: img.naturalWidth,
      totalHeight: img.naturalHeight,
      cardWidth: Math.floor(img.naturalWidth / 13),
      cardHeight: Math.floor(img.naturalHeight / 4)
    });
  };
  
  return (
    <div>
      <img 
        src="/clow-cards-sprite.png" 
        onLoad={handleImageLoad}
        style={{ display: 'none' }}
      />
      {dimensions && (
        <pre>{JSON.stringify(dimensions, null, 2)}</pre>
      )}
    </div>
  );
};
```

---

## Optimization Tips

1. **Compress the sprite sheet**: Use tools like TinyPNG to reduce file size
2. **Use WebP format**: Better compression for web
3. **Lazy load**: Only load sprite when game starts
4. **Cache aggressively**: Set long cache headers
5. **Preload**: Add `<link rel="preload" as="image" href="/sprite.png">` to HTML hea
---

**End of GEMINI.md for CascadeTCG v2.0**
