import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Trophy, Users, GameController, Calendar, Clock, Eye, Skull } from '@phosphor-icons/react'
import { Player, GameSession, GameTemplate } from '@/types'
import type { CharacterEvent } from '@/types'


interface CharacterProgression {
  initialCharacter: string;
  initialType?: string;
  died: boolean;
  replacements: Array<{ name: string; type?: string }>;
}

// Typage strict pour la progression de personnage
// (Déjà défini plus haut)

function getCharacterProgressions(characterHistory: CharacterEvent[] | undefined, playerId: string): CharacterProgression[] {
  if (!characterHistory) return [];
  const playerEvents = characterHistory.filter(event => event.details === String(playerId));
  const characterProgressions: CharacterProgression[] = [];
  let currentProgression: CharacterProgression | null = null;
  playerEvents.forEach(event => {
    if (event.eventType === 'created') {
      currentProgression = {
        initialCharacter: event.characterId ?? '',
        initialType: undefined,
        died: false,
        replacements: []
      };
      characterProgressions.push(currentProgression);
    } else if (event.eventType === 'died' && currentProgression) {
      currentProgression.died = true;
    } else if (event.eventType === 'changed' && currentProgression) {
      currentProgression.replacements.push({
        name: event.characterId ?? '',
        type: undefined
      });
    }
  });
  return characterProgressions;
}

// Typage strict pour la progression de personnage
// (Déjà défini plus haut)
import { useGameHistory } from '@/lib/database-hooks'

interface PlayerStatsDetailProps {
  player: Player
  onBack: () => void
}

export function PlayerStatsDetail({ player, onBack }: PlayerStatsDetailProps) {
  const { gameHistory } = useGameHistory()
  const playerGames = gameHistory.filter(game => 
    game.completed && game.players.includes(player.id)
  )

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const formatDuration = (duration?: string | number) => {
    if (!duration) return 'Unknown'
    const minutes = typeof duration === 'string' ? parseFloat(duration) : duration
    if (isNaN(minutes)) return 'Unknown'
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Calculate statistics
  const totalGames = playerGames.length
  const coopGames = playerGames.filter(game => game.isCooperative)
  const competitiveGames = playerGames.filter(game => !game.isCooperative)
  const wins = competitiveGames.filter(game => game.winner === player.id).length
  const coopWins = coopGames.filter(game => game.cooperativeResult === 'victory').length
  const totalWins = wins + coopWins
  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0'
  
  const deathCount = playerGames.filter(game => {
  const deadCharacters: Record<string, boolean> | undefined = game.deadCharacters;
  return !!deadCharacters && !!deadCharacters[String(player.id)];
  }).length;
  const averageScore = competitiveGames.length > 0 
    ? (competitiveGames.reduce((sum, game) => sum + (game.scores[player.id] || 0), 0) / competitiveGames.length).toFixed(1)
    : '0.0'
  function renderGames() {
    return playerGames.slice().reverse().map((game) => {
      const isWinner = game.winner === player.id;
      const isCoopVictory = game.isCooperative && game.cooperativeResult === 'victory';
      const isDead = !!game.deadCharacters && !!game.deadCharacters[String(player.id)];
      const score = game.scores[player.id] || 0;
      return (
        <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div>
              <div className="font-medium flex items-center gap-2">
                {game.gameTemplate}
                {(isWinner || isCoopVictory) && <Trophy size={16} className="text-yellow-500" />}
                {isDead && <Skull size={16} className="text-red-500" />}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(game.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  {game.players.length} players
                </div>
                {game.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(game.duration)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!game.isCooperative && (
              <div className="text-right">
                <div className="font-bold">{score}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            )}
            <Badge variant={
              game.isCooperative 
                ? (game.cooperativeResult === 'victory' ? 'default' : 'destructive')
                : (isWinner ? 'default' : 'secondary')
            }>
              {game.isCooperative 
                ? (game.cooperativeResult === 'victory' ? 'Victory' : 'Defeat')
                : (isWinner ? 'Won' : 'Lost')
              }
            </Badge>
          </div>
        </div>
      );
    });
  }

  if (totalGames === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <p className="text-muted-foreground">Player Statistics</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No games played yet</h3>
            <p className="text-muted-foreground">This player hasn't participated in any completed games</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <p className="text-muted-foreground">Player Statistics</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{totalGames}</p>
              </div>
              <GameController size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-xs text-muted-foreground">{totalWins} wins</p>
              </div>
              <Trophy size={24} className="text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{averageScore}</p>
                <p className="text-xs text-muted-foreground">competitive games</p>
              </div>
              <Users size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deaths</p>
                <p className="text-2xl font-bold">{deathCount}</p>
                <p className="text-xs text-muted-foreground">characters lost</p>
              </div>
              <Skull size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Game Types Played ({gameHistory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(playerGames.map(game => game.gameTemplate))).map(templateName => {
              const gameCount = playerGames.filter(g => g.gameTemplate === templateName).length;
              return (
                <Badge key={templateName} variant="outline">
                  {templateName} ({gameCount})
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>All Games ({totalGames})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {renderGames()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}