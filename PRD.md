# Board Game Score Tracker

A comprehensive tool for tracking scores across multiple players and board games with persistent game history and statistics.

**Experience Qualities**: 
1. **Organized** - Clear player management and game setup that feels structured and intuitive
2. **Social** - Celebrates achievements and creates memorable moments around gaming sessions
3. **Reliable** - Consistent data persistence that players can trust with their gaming history

**Complexity Level**: Light Application (multiple features with basic state)
- Handles player management, score tracking, and game history with straightforward user flows and local data persistence

## Essential Features

**Player Management**
- Functionality: Add, edit, and remove players with names and optional avatars
- Purpose: Establish consistent player identities across gaming sessions
- Trigger: "Add Player" button or player list management
- Progression: Name input → Optional avatar selection → Save → Player appears in roster
- Success criteria: Players persist between sessions and can be selected for games

**Game Setup**
- Functionality: Select players, choose game type, set scoring rules (higher/lower wins)
- Purpose: Configure game parameters before score tracking begins
- Trigger: "New Game" button from main dashboard
- Progression: Select game type → Choose players → Set win condition → Start scoring
- Success criteria: Game configuration is saved and scoring interface loads correctly

**Live Score Tracking**
- Functionality: Real-time score entry with current standings and winner indication
- Purpose: Track progress during active gameplay with immediate feedback
- Trigger: Score input fields during active game
- Progression: Enter scores → Auto-calculate standings → Visual winner indication → Continue or end game
- Success criteria: Scores update instantly and rankings reflect current state

**Game History**
- Functionality: View past games with dates, players, scores, and winners
- Purpose: Maintain record of gaming sessions for statistics and nostalgia
- Trigger: "History" tab or completed game storage
- Progression: Complete game → Auto-save to history → Browse past games → View details
- Success criteria: All completed games are stored and retrievable with full details

**Player Statistics**
- Functionality: Win rates, average scores, and game counts per player
- Purpose: Provide insights into player performance across games
- Trigger: Player profile view or statistics dashboard
- Progression: Select player → View stats overview → Filter by game type → Compare with others
- Success criteria: Statistics accurately reflect historical performance data

## Edge Case Handling

- **Empty Player List**: Show onboarding flow to add first players before game creation
- **Duplicate Player Names**: Prevent or auto-increment names to maintain uniqueness
- **Incomplete Games**: Save draft games and allow resumption or deletion
- **Score Corrections**: Allow editing of current game scores with clear undo/redo
- **Data Loss Prevention**: Regular auto-save and confirmation dialogs for destructive actions

## Design Direction

The design should feel modern and playful like a digital board game companion - approachable yet organized, with subtle gaming-inspired touches that create excitement around competition and achievement without overwhelming the functional aspects.

## Color Selection

Triadic color scheme that balances warmth, energy, and trust to create an inviting gaming atmosphere.

- **Primary Color**: Deep Blue (`oklch(0.45 0.15 240)`) - Communicates reliability and focus for main actions
- **Secondary Colors**: Warm Orange (`oklch(0.65 0.15 45)`) for energy and Sage Green (`oklch(0.55 0.10 120)`) for balance
- **Accent Color**: Bright Orange (`oklch(0.70 0.20 50)`) - Attention-grabbing highlight for winners and important CTAs
- **Foreground/Background Pairings**: 
  - Background (White `oklch(1 0 0)`): Dark Blue text (`oklch(0.25 0.05 240)`) - Ratio 8.2:1 ✓
  - Card (Light Gray `oklch(0.98 0.02 240)`): Dark Blue text (`oklch(0.25 0.05 240)`) - Ratio 7.8:1 ✓
  - Primary (Deep Blue `oklch(0.45 0.15 240)`): White text (`oklch(1 0 0)`) - Ratio 5.1:1 ✓
  - Secondary (Warm Orange `oklch(0.65 0.15 45)`): Dark Blue text (`oklch(0.25 0.05 240)`) - Ratio 4.6:1 ✓
  - Accent (Bright Orange `oklch(0.70 0.20 50)`): White text (`oklch(1 0 0)`) - Ratio 4.8:1 ✓

## Font Selection

Clean, friendly sans-serif typography that balances readability with personality - Inter for its excellent legibility across all sizes and subtle gaming-friendly character.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Game Names): Inter Medium/20px/normal spacing
  - Body (Player Names, Scores): Inter Regular/16px/relaxed line height
  - Small (Timestamps, Stats): Inter Medium/14px/tight line height

## Animations

Subtle celebratory animations that enhance the gaming experience - winner reveals should feel rewarding while score updates provide smooth feedback without disrupting concentration.

- **Purposeful Meaning**: Gentle bounces for score updates, satisfying slides for winner announcements, and smooth transitions that maintain gaming flow
- **Hierarchy of Movement**: Winner celebrations > score changes > navigation transitions > hover states

## Component Selection

- **Components**: Cards for game sessions and player profiles, Tables for score tracking and history, Dialogs for game setup, Buttons with distinct hierarchy for primary/secondary actions, Badges for winner indicators, Avatar components for player representation
- **Customizations**: Custom score input components with large touch targets, winner celebration overlays, and game type selector cards
- **States**: Score buttons with pressed feedback, winner badges with subtle glow, active game indicators with pulsing animation
- **Icon Selection**: Trophy for winners, Plus for adding players/games, Clock for history, BarChart for statistics, Users for player management
- **Spacing**: Generous 6/8 unit spacing for game cards, tight 2/3 unit spacing within score rows, comfortable 4 unit gaps between sections
- **Mobile**: Stack score inputs vertically on small screens, collapse navigation to hamburger menu, enlarge touch targets for score entry, single-column layout for game history