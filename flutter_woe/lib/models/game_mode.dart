enum GameModeType { woe, skeleton, encounters, space }

class GameMode {
  final GameModeType type;
  final String displayName;
  final String shortName;
  final int minPlayers;
  final int maxPlayers;
  final int timerSeconds;
  final bool supportsTeams;
  final bool hasCustomScoring;
  final List<String> concepts;

  const GameMode({
    required this.type,
    required this.displayName,
    required this.shortName,
    required this.minPlayers,
    this.maxPlayers = 99,
    this.timerSeconds = 120,
    this.supportsTeams = false,
    this.hasCustomScoring = false,
    this.concepts = const [],
  });

  static const GameMode woe = GameMode(
    type: GameModeType.woe,
    displayName: 'What On Earth',
    shortName: 'WOE',
    minPlayers: 4,
    timerSeconds: 120,
    concepts: [
      'DEMOCRACY', 'PIZZA', 'GRAVITY', 'THUNDER', 'MICROWAVE', 'BIRTHDAY',
      'MEDICINE', 'TRAFFIC', 'MUSIC', 'INTERNET', 'MOVIES', 'SPORTS',
      'WEDDING', 'VACATION', 'SCHOOL', 'MONEY', 'GOVERNMENT', 'RELIGION',
      'FASHION', 'ART', 'SCIENCE', 'HISTORY', 'BREAKFAST', 'COFFEE'
    ],
  );

  static const GameMode skeleton = GameMode(
    type: GameModeType.skeleton,
    displayName: 'Skeleton Crew [2p–3p]',
    shortName: 'SKELETON',
    minPlayers: 2,
    maxPlayers: 3,
    timerSeconds: 90,
    hasCustomScoring: true,
    concepts: [
      'HAUNTED HOUSE', 'GRAVEYARD', 'GHOST', 'VAMPIRE', 'ZOMBIE', 'WITCH',
      'MONSTER', 'CURSE', 'SPELL', 'POTION', 'BONES', 'COBWEBS'
    ],
  );

  static const GameMode encounters = GameMode(
    type: GameModeType.encounters,
    displayName: 'Close Encounters',
    shortName: 'ENCOUNTERS',
    minPlayers: 4,
    timerSeconds: 300,
    supportsTeams: true,
    concepts: [
      'UFO', 'ALIEN', 'SPACESHIP', 'PLANET', 'GALAXY', 'STAR', 'MOON',
      'ASTEROID', 'COMET', 'BLACK HOLE', 'NEBULA', 'ORBIT'
    ],
  );

  static const GameMode space = GameMode(
    type: GameModeType.space,
    displayName: 'Space Race',
    shortName: 'SPACE',
    minPlayers: 4,
    timerSeconds: 90,
    supportsTeams: true,
    hasCustomScoring: true,
    concepts: [
      'ROCKET', 'ASTRONAUT', 'SATELLITE', 'MARS', 'VENUS', 'JUPITER',
      'METEOR', 'APOLLO', 'NASA', 'TELESCOPE', 'SPACE STATION'
    ],
  );

  static List<GameMode> get allModes => [woe, skeleton, encounters, space];

  static GameMode fromType(GameModeType type) {
    switch (type) {
      case GameModeType.woe:
        return woe;
      case GameModeType.skeleton:
        return skeleton;
      case GameModeType.encounters:
        return encounters;
      case GameModeType.space:
        return space;
    }
  }
}