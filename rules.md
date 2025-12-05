# CascadeTCG - Complete Official Rules v2.0

**Last Updated**: December 4, 2025  
**Game Type**: 2-Player Competitive Card Game  
**Win Condition**: Capture Race (Empty your own deck first)

---

## 🎯 Game Overview

**Objective**: Be the first player to capture all 36 cards from your own deck  
**Core Loop**: Capture cards via cascades → Attack to eliminate opponent's deck → Race to empty your deck first  
**Theme**: Magical card sealing with cost-based cascade chains  
**Average Game Length**: 8-12 turns

---

## 🃏 Deck & Card Structure

### Deck Composition (36 cards per player)
- **12× Cost 1** (33.3%)
- **10× Cost 2** (27.8%)
- **8× Cost 3** (22.2%)
- **6× Cost 4** (16.7%)

### Elements (9 cards each)
- 🔥 **Fire**
- 💧 **Water**
- 🌪️ **Wind**
- 🌍 **Earth**

**Elements are cosmetic only (no mechanical effects yet).**  
**Elements are evenly distributed across all cost tiers.**

### Card Names by Cost

**Cost 1**: Spark, Ember, Flicker, Drop, Stream, Ripple, Breeze, Gust, Draft, Pebble, Stone, Dust

**Cost 2**: Firey, Heat, Flame, Watery, Flow, Wave, Windy, Blow, Gale, Earthy, Ground, Soil

**Cost 3**: Inferno, Phoenix, Ocean, Glacier, Tempest, Thunder, Terra, Canyon

**Cost 4**: Sun, Star, Moon, Eclipse, Cosmos, Astral, World, Titan

---

## 🎮 Starting State

| Resource | Starting Value | Notes |
|----------|----------------|-------|
| HP | 25 | Backup loss condition only |
| Seals | 3 | Carries over between turns |
| Deck | 36 cards | Goal: reduce to 0 |
| Field | 0 cards | Captured cards this turn |
| Cascade Counter | 0/3 | Resets each turn |

**Decks are NOT shuffled unless specified.**

---

## 🦸 Hero Cards

Choose one hero before the game starts:

### The Fortune
- **Ability**: Lucky Draw
- **Trigger**: End of turn
- **Effect**: If you cascaded ≤1 card this turn, gain +1 seal
- **Strategy**: Rewards conservative turns for seal economy

### The Mirror
- **Ability**: Reflection Power
- **Trigger**: Start of turn
- **Effect**: If opponent captured ≥3 cards on their last turn, gain +1 seal
- **Strategy**: Punishes opponent's big turns, rewards defensive play

### The Power
- **Ability**: Raw Strength (passive)
- **Trigger**: None
- **Effect**: No special ability
- **Strategy**: Consistent baseline performance

---

## 🎮 Turn Structure (5 Phases)

### **PHASE 1: Start Turn**

1. **Gain +1 Seal** (unconditional)
2. **Hero Check**: The Mirror's ability triggers here

---

### **PHASE 2: Auto-Capture**

1. Reveal the top card of your deck
2. **Automatically capture it for FREE** (place on your Field)
3. Set `lastCapturedCost = auto-captured card's cost` (stored as **C**)

---

### **PHASE 3: Cascade (0-3 Optional Attempts)**

**Hard Limit**: Maximum **3 cascades per turn** (total across all chains)

For each cascade attempt:

#### **Step 1: Reveal Next Card**
Reveal the next card from your deck (revealed cost: **R**)

#### **Step 2: Compare R to C** (last captured cost)

| Condition | Seal Cost | Result |
|-----------|-----------|--------|
| **R < C** | **0 seals** | Auto-capture (FREE CASCADE), update C = R |
| **R = C** | **R + 1 seals** | Capture if paid (FORCED CAPTURE), C stays same |
| **R > C** | Card to bottom | Cannot capture, cascade chain ends |

#### **Step 3: Make Decision**

**If R < C (Free Cascade)**:
- Automatically capture for free
- Update C = R (new card becomes reference)
- Increment cascade counter
- May continue cascading

**If R = C (Tie - Forced Capture)**:
- Must pay **R + 1 seals** to capture
- If you pay: Card captured, C stays same, increment cascade counter, may continue
- If you decline or can't pay: Card goes to **bottom of your deck**, cascade chain ends

**If R > C (Chain Breaks)**:
- **Cannot capture** (no payment option)
- Card goes to **bottom of your deck**
- Cascade chain ends
- Does NOT count toward cascade limit

#### **Step 4: Continue or Start New Chain**

**After a chain ends (R > C or declined R = C):**
- Check your cascade counter
  - **If counter < 3**: You may **pay 1 seal** to start a new cascade chain
    - Reset C to the last successfully captured card's cost
    - Reveal next card and continue from Step 1
  - **If counter = 3**: Phase 3 ends immediately (limit reached)
- You may also choose to stop and proceed to Phase 4 at any time

**Important Notes:**
- The 3-cascade limit applies to **total successful cascades across all chains**
- Chain breaks (R > C) do NOT count toward the limit
- Once you hit 3 successful cascades, you CANNOT start another chain
- You can pay for a new chain attempt even if you're at 2/3 cascades (hoping for one more)

#### **Step 5: Check Cascade Limit**
If you've cascaded 3 times successfully (total), Phase 3 ends automatically and you cannot start new chains

---

### **PHASE 4: Capture Resolution (Deck Annihilation)**

Use the total cost of your captured Field cards to eliminate cards from **opponent's deck**.

#### **Step 1: Calculate Total Cost Attack Value**
```
Attack Value = Sum of all card costs on your Field
```

Example: Field has cards with costs [3, 2, 4, 1]  
Attack Value = 3 + 2 + 4 + 1 = **10**

#### **Step 2: Weighted Deck Destruction**

1. Opponent reveals the **top card** of their deck
2. Check if you can afford to eliminate it:
   - **If Attack Value ≥ Card Cost**: Pay the cost, eliminate the card permanently (removed from game)
   - **If Attack Value < Card Cost**: Card **survives** and goes to bottom of opponent's deck
3. Subtract the eliminated card's cost from your Attack Value
4. Repeat until Attack Value reaches 0 or opponent's deck is empty

**Example**:
```
Your Attack Value: 10
Opponent reveals: Cost 3 → Eliminated (10 - 3 = 7 remaining)
Opponent reveals: Cost 2 → Eliminated (7 - 2 = 5 remaining)
Opponent reveals: Cost 4 → Eliminated (5 - 4 = 1 remaining)
Opponent reveals: Cost 3 → SURVIVES (1 < 3), goes to bottom
Attack ends with 1 remaining attack value (wasted)

Result: Eliminated 3 cards from opponent's deck
```

---

### **PHASE 5: End Turn**

1. **Hero Check**: The Fortune's ability triggers here
2. **Cycle Field**: Move all cards from your Field to the **bottom of your deck** (in order captured)
3. **Reset Counters**: Clear cascade counter, clear Field
4. **Pass Turn**: Opponent begins their Phase 1

---

## 🔗 Cascade Rules Deep Dive

### The Free Cascade Chain

When R < C, you get **unlimited free cascades** down the chain until it breaks:

```
Auto-Capture: Cost 4 (C = 4)
Reveal: Cost 3 → R < C → FREE! (C = 3, cascades: 1/3)
Reveal: Cost 2 → R < C → FREE! (C = 2, cascades: 2/3)
Reveal: Cost 1 → R < C → FREE! (C = 1, cascades: 3/3) LIMIT REACHED
Phase 3 ends

Result: Captured 4 cards (1 auto + 3 free cascades)
Seals spent: 0
```

**The chain continues as long as each card is LOWER than the previous.**

### Multiple Chains Per Turn

When a chain breaks (R > C) but you still have cascades remaining, you can **pay 1 seal** to start a new chain:

```
Auto-Capture: Cost 4 (C = 4, cascades: 0/3)

CHAIN 1:
Reveal: Cost 2 → R < C → FREE! (C = 2, cascades: 1/3)
Reveal: Cost 3 → R > C → BREAKS (Cost 3 to bottom)

CHAIN 2 (pay 1 seal to attempt):
C resets to 2 (last captured)
Reveal: Cost 1 → R < C → FREE! (C = 1, cascades: 2/3)
Reveal: Cost 2 → R > C → BREAKS (Cost 2 to bottom)

CHAIN 3 (pay 1 seal to attempt):
C resets to 1 (last captured)
Reveal: Cost 4 → R > C → BREAKS (Cost 4 to bottom)
Only 2/3 cascades used, but no more chains attempted

Result: Captured 3 cards (1 auto + 2 cascades)
Seals spent: 2 (for chain attempts)
```

**Key Points:**
- Each new chain costs **1 seal** to attempt
- C resets to your last successfully captured card's cost
- You can attempt multiple chains until you hit 3 total cascades
- A chain that immediately breaks still costs the 1 seal

### Forced Capture (Tie Breaker)

When R = C, you can **force capture** by paying extra seals:

```
Last captured: Cost 2 (C = 2)
Reveal: Cost 2 → R = C → Pay 3 seals (R + 1)
If paid: Capture, C stays 2, can continue (cascades: +1)
If not paid: Cost 2 to bottom, chain ends
```

**This allows you to "reset" the chain by staying at the same cost level.**

### Chain Breaks (R > C)

When R > C, the cascade chain **automatically ends**:

```
Last captured: Cost 2 (C = 2)
Reveal: Cost 4 → R > C → Breaks immediately
Cost 4 goes to bottom of deck
Cannot pay to continue this chain
May pay 1 seal to start new chain (if cascades < 3)
```

**Higher costs cannot be captured during cascades.**

---

## 🏆 Victory Conditions

### Primary Win Condition
**Deck Depletion**: The first player to reduce their own deck to **0 cards** wins immediately

### Secondary Win Condition (Backup)
**HP Depletion**: If a player's HP reaches 0, they lose (reserved for future card effects)

---

## 📊 Game State Structure

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
    deck: Card[],              // Remaining cards (starts at 36)
    field: Card[],             // Captured this turn (1-4 cards)
    lastTurnCaptures: number,  // Cards captured on last turn (for Mirror)
    cascadeCount: 0,           // 0-3 successful cascades
    cascadeLimit: 3,           // Always 3
    lastCapturedCost: number | null
  },
  
  enemy: { /* identical structure */ },
  
  revealedCard: Card | null,
  log: string[],
  waitingForPlayer: boolean
}
```

---

## 🎲 Key Mechanics Deep Dive

### Last Captured Cost (C)
- **Updates when**: You capture a card with cost **lower** than C (R < C)
- **Stays same when**: You force capture a card with cost **equal** to C (R = C, paid)
- **Never updates when**: R > C (chain breaks, no capture possible)
- **Used for**: Comparing against next revealed card

### Cascade Counter
- **Increments**: Only on successful captures (paid or free)
- **Does NOT increment**: When chain breaks (R > C) or you decline
- **Limit**: 3 cascades maximum
- **Resets**: At end of turn (Phase 5)

### Field vs Deck vs Total Captured
- **Field**: Cards captured **this turn only** (temporary, used for attack calculation)
- **Deck**: Cards you haven't captured yet (goal: reduce to 0)
- **Total Captured**: Lifetime count of all cards ever captured (for Mirror ability tracking)

### Seal Economy
- **Gain**: +1 per turn (unconditional)
- **Gain**: +1 from hero abilities (conditional)
- **Spend**: Only on forced captures (R = C, costs R + 1 seals)
- **Carries Over**: Never resets, accumulates across turns

### Bottom of Deck Mechanics
- **When cards go to bottom**:
  - Failed cascades (R = C, not paid)
  - Chain breaks (R > C)
  - Survivors from opponent's Capture Resolution
  - Your Field cards at end of turn (Phase 5)
- **Order**: Cards go to bottom in the order they were processed
- **Not shuffled**: Deck order is deterministic

---

## 🧪 Strategic Considerations

### Free Cascade Chains
- **Best case**: Auto-capture Cost 4, chain down 4→3→2→1 (4 cards, 0 seals)
- **Worst case**: Auto-capture Cost 1 (no possible free cascades)
- **Strategy**: Hope for high-cost auto-captures early game

### Multiple Chain Strategy
- **When to start new chains**: If you have spare seals and cascades remaining (< 3)
- **Cost**: 1 seal per chain attempt (even if it immediately breaks)
- **Risk**: Chain might break immediately, wasting the seal
- **Reward**: Potential to hit more free cascades and reach 3-cascade limit
- **Limit awareness**: Once you hit 3 successful cascades, you CANNOT pay for another chain
- **Example scenarios**:
  - At 2/3 cascades: Can pay for new chain (hoping for 1 more capture)
  - At 3/3 cascades: CANNOT start new chain (limit reached)
  - Break on Cost 4, pay 1 seal to attempt another chain from last captured Cost 2

### Forced Captures (R = C)
- **Cost**: Always R + 1 seals
- **When to use**: When you need that specific card or want to continue the chain
- **Risk**: Expensive (Cost 4 tie = 5 seals to force)
- **Reward**: Keeps C at same level for potential continued cascades
- **Chain strategy**: Multiple ties can extend chains horizontally at same cost level

### Seal Management
- **Conservative play**: Avoid forced captures and extra chains, rely on natural free cascades → Triggers Fortune
- **Aggressive play**: Pay for forced captures and multiple chain attempts → Burns seals quickly
- **Banking**: Save seals for crucial Cost 3-4 forced captures or multiple chain attempts
- **Chain gambling**: Spending 1 seal for a new chain attempt is cheap but risky

### Deck Destruction Strategy
- **Big attacks**: Capture 4 cards → Big attack value → More opponent deck elimination
- **Race condition**: Empty YOUR deck faster than opponent empties theirs
- **Value**: Eliminating opponent's high-cost cards = harder for them to attack you back
- **Multiple chains**: More captures per turn = faster deck cycling = faster win

### Hero Choice
- **The Fortune**: Best for seal economy, rewards 0-1 cascade turns (+1-3 seals per game)
- **The Mirror**: Anti-aggro hero, gains seals when opponent has big turns (+1-2 seals per game)
- **The Power**: No variance, pure skill-based play (baseline)

---

## 📝 Example Turn Walkthrough

**Setup**:
- Player has 8 seals
- Deck top cards: [Cost 4, Cost 2, Cost 2, Cost 1, Cost 3]

---

**Phase 1: Start Turn**
- Gain +1 seal → Seals: 9
- Mirror check: Opponent captured 4 cards last turn (≥3) → **+1 seal bonus!**
- Seals: 10

---

**Phase 2: Auto-Capture**
- Reveal: **Cost 4** (Fire - Inferno)
- Auto-capture to Field
- Last Captured Cost (C) = 4
- Field: [Cost 4]

---

**Phase 3: Cascades**

**Cascade Attempt 1:**
- Reveal: **Cost 2** (Water - Watery)
- R (2) < C (4) → **FREE CASCADE!**
- Auto-capture, update C = 2
- Cascade counter: 1/3
- Seals: 9
- Field: [Cost 4, Cost 2]

**Cascade Attempt 2:**
- Reveal: **Cost 2** (Earth - Earthy)
- R (2) = C (2) → **FORCED CAPTURE** (costs 3 seals)
- Decision: Pay 3 seals to capture
- Capture! C stays 2
- Cascade counter: 2/3
- Seals: 9 - 3 = 6
- Field: [Cost 4, Cost 2, Cost 2]

**Cascade Attempt 3:**
- Reveal: **Cost 4** (Fire - Sun)
- R (4) > C (2) → **CHAIN BREAKS!**
- Cost 4 goes to bottom of deck
- Cascade counter: Still 2/3 (no increment)
- Seals: 6

**New Chain Attempt (pay 1 seal):**
- Decision: Pay 1 seal to start new chain
- Seals: 6 - 1 = 5
- C resets to 2 (last captured)

**Cascade Attempt 4:**
- Reveal: **Cost 1** (Wind - Breeze)
- R (1) < C (2) → **FREE CASCADE!**
- Auto-capture, update C = 1
- Cascade counter: 3/3 → **LIMIT REACHED**
- Seals: 5
- Field: [Cost 4, Cost 2, Cost 2, Cost 1]
- Phase 3 ends automatically

---

**Phase 4: Capture Resolution**
- Attack Value = 4 + 2 + 2 + 1 = **9**

Opponent's deck reveals:
1. **Cost 3** → 9 ≥ 3 → Eliminate (9 - 3 = 6 remaining)
2. **Cost 2** → 6 ≥ 2 → Eliminate (6 - 2 = 4 remaining)
3. **Cost 1** → 4 ≥ 1 → Eliminate (4 - 1 = 3 remaining)
4. **Cost 4** → 3 < 4 → **SURVIVES**, goes to bottom of opponent's deck

**Result**: Eliminated 3 cards from opponent's deck (permanently removed from game)

---

**Phase 5: End Turn**
- Fortune check: Cascaded 3 times (not ≤1) → No bonus
- Move Field [Cost 4, Cost 2, Cost 2, Cost 1] → Bottom of player's deck
- Clear Field, reset cascade counter to 0/3
- Pass turn to opponent

---

**Turn Summary**:
- Captured: 4 cards (1 auto + 3 cascades across 2 chains)
- Seals spent: 4 (3 for forced capture + 1 for new chain)
- Seals remaining: 5
- Opponent's deck reduced by: 3 cards
- Player's deck: 32 → 28 cards (after cycling Field back)

---

## ⚠️ Edge Cases

### Deck Exhaustion
- If your deck is empty at start of Phase 2:
  - Cannot auto-capture → You WIN (deck = 0)
  - Game ends immediately

### Zero Seals
- You can still perform free cascades (R < C)
- You cannot perform forced captures (R = C)
- Cascade ends if you hit a tie with 0 seals

### Cascade Limit Reached
- Once you hit 3 cascades, Phase 3 ends immediately
- You cannot reveal more cards, even if the chain could continue
- Proceed to Phase 4 automatically

### All Cascades Break Early
- Auto-capture Cost 1, then reveal Cost 2 → Breaks immediately
- Field has only 1 card → Attack Value very low
- This is valid (bad luck, not a rules violation)

### Tie in Deck Size
- Both players cannot empty their decks on the same turn (turns alternate)
- Active player always achieves 0 cards first if racing

### Forced Capture With Exact Seals
- Last captured: Cost 3, Seals: 4
- Reveal: Cost 3 → Forced capture costs 4 seals
- You have exactly enough → Can pay and capture
- Seals: 4 - 4 = 0 (can still continue with free cascades)

### Multiple Ties in a Row
```
C = 2, Seals = 10, Cascades: 0/3
Reveal Cost 2 → Pay 3 seals, C stays 2, Seals = 7, Cascades: 1/3
Reveal Cost 2 → Pay 3 seals, C stays 2, Seals = 4, Cascades: 2/3
Reveal Cost 2 → Pay 3 seals, C stays 2, Seals = 1, Cascades: 3/3
Phase 3 ends (limit reached)
Result: Captured 3 ties before hitting limit
```

### Chain Breaks Then New Chain
```
C = 3, Seals = 5, Cascades: 1/3
Reveal Cost 4 → R > C → Chain breaks (does NOT count as cascade)
Pay 1 seal to start new chain → Seals = 4
C resets to 3
Reveal Cost 2 → R < C → FREE! Cascades: 2/3
Reveal Cost 1 → R < C → FREE! Cascades: 3/3 (limit reached)
Phase 3 ends immediately
Result: 2 more cascades captured across new chain, total 3 successful
```

### Attempting Chain After Hitting Limit
```
C = 2, Seals = 10, Cascades: 0/3
Reveal Cost 1 → FREE! Cascades: 1/3
Reveal Cost 4 → BREAKS
Pay 1 seal for new chain
Reveal Cost 3 → BREAKS
Pay 1 seal for new chain
Reveal Cost 2 → R = C → Pay 3 seals → Cascades: 2/3
Reveal Cost 1 → FREE! Cascades: 3/3 (LIMIT REACHED)
Phase 3 ends immediately

Cannot start another chain - limit already reached
Result: 3 successful cascades total across multiple chains
Seals spent: 2 (chains) + 3 (forced) = 5 seals
```

### Running Out of Seals Mid-Chain
```
C = 2, Seals = 2, Cascades: 2/3
Reveal Cost 2 → Forced capture costs 3 seals
Have only 2 seals → Cannot afford
Cost 2 goes to bottom, chain ends
Cannot start new chain (need 1 seal, have 0)
Phase 3 ends with only 2/3 cascades used
```

---

## 🎨 UI/UX Requirements

### Critical Display Elements

1. **Deck Size Counter** (both players)
   - Large, prominent display
   - Format: "📚 28 / 36 cards remaining"
   - Progress bar showing % captured

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
   - Shows reference value
   - Format: "Last Captured: Cost 3"
   - Used for comparison display

5. **Revealed Card Comparison**
   - Shows: "Revealed: Cost 2"
   - Shows: "Compare: 2 < 3 → FREE CASCADE!"
   - Visual indicators (✓ free, 💰 pay, ✗ breaks)

6. **Field Display**
   - Highlighted zone for current turn's captures
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

## 📚 Glossary

**Auto-Capture**: Free top card revealed at start of turn (Phase 2)  
**Cascade**: Optional chained card reveals after auto-capture  
**Free Cascade**: When R < C, capture costs 0 seals  
**Forced Capture**: When R = C, capture costs (R + 1) seals  
**Chain Break**: When R > C, cascade ends automatically  
**Field**: Temporary zone holding this turn's captured cards  
**Last Captured Cost (C)**: Reference value for comparing next revealed card  
**Revealed Cost (R)**: Cost of card currently being evaluated for cascade  
**Capture Resolution**: Phase where Field's total cost eliminates opponent's deck cards  
**Deck Annihilation**: Permanently eliminating cards from opponent's deck  
**Cycling**: Moving Field cards back to bottom of your deck at end of turn  
**Total Captured**: Lifetime count of all cards captured (tracked for Mirror ability)

---

## 🎯 Cascade Comparison Quick Reference

```
R < C → FREE CASCADE (auto-capture, update C = R)
R = C → FORCED CAPTURE (pay R+1 seals, C stays same)
R > C → CHAIN BREAKS (to bottom, cascade ends)
```

---

**End of CascadeTCG Official Rules v2.0**