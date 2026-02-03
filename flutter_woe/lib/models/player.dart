enum PlayerRole { alien, human }
enum TeamColor { none, red, blue, green }

class Player {
  final String id;
  String initials;
  int score;
  PlayerRole role;
  TeamColor team;
  bool isEditing;

  Player({
    required this.id,
    required this.initials,
    this.score = 0,
    this.role = PlayerRole.human,
    this.team = TeamColor.none,
    this.isEditing = false,
  });

  Player copyWith({
    String? id,
    String? initials,
    int? score,
    PlayerRole? role,
    TeamColor? team,
    bool? isEditing,
  }) {
    return Player(
      id: id ?? this.id,
      initials: initials ?? this.initials,
      score: score ?? this.score,
      role: role ?? this.role,
      team: team ?? this.team,
      isEditing: isEditing ?? this.isEditing,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'initials': initials,
      'score': score,
      'role': role.toString(),
      'team': team.toString(),
      'isEditing': isEditing,
    };
  }

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'],
      initials: json['initials'],
      score: json['score'] ?? 0,
      role: PlayerRole.values.firstWhere(
        (e) => e.toString() == json['role'],
        orElse: () => PlayerRole.human,
      ),
      team: TeamColor.values.firstWhere(
        (e) => e.toString() == json['team'],
        orElse: () => TeamColor.none,
      ),
      isEditing: json['isEditing'] ?? false,
    );
  }
}