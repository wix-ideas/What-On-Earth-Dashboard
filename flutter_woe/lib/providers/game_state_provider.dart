import 'package:flutter/material.dart';
import 'dart:math';
import '../models/player.dart';
import '../models/game_mode.dart';

class GameStateProvider extends ChangeNotifier {
  // Game configuration
  GameMode _currentMode = GameMode.woe;
  bool _nsfwEnabled = false;
  List<Player> _players = [];
  
  // Game state
  int _currentRound = 1;
  int _currentCycle = 0;
  bool _gameActive = false;
  String _currentConcept = '';
  bool _conceptRevealed = false;
  List<String> _seenConcepts = [];
  
  // Timer state
  int _timerSeconds = 120;
  bool _timerRunning = false;
  DateTime? _timerStartTime;
  int _timerPausedTime = 0;
  
  // Scoring state
  Map<String, int> _roundScores = {};
  int _roundTotal = 0;
  int _lastMilestone = 0;
  
  // UI state
  bool _editMode = false;
  String? _editingPlayerId;
  bool _addMode = false;

  // Getters
  GameMode get currentMode => _currentMode;
  bool get nsfwEnabled => _nsfwEnabled;
  List<Player> get players => List.unmodifiable(_players);
  int get currentRound => _currentRound;
  int get currentCycle => _currentCycle;
  bool get gameActive => _gameActive;
  String get currentConcept => _currentConcept;
  bool get conceptRevealed => _conceptRevealed;
  int get timerSeconds => _timerSeconds;
  bool get timerRunning => _timerRunning;
  Map<String, int> get roundScores => Map.unmodifiable(_roundScores);
  int get roundTotal => _roundTotal;
  bool get editMode => _editMode;
  String? get editingPlayerId => _editingPlayerId;
  bool get addMode => _addMode;

  // Computed properties
  List<Player> get alienPlayers {
    final alienCount = (_players.length / 2).floor();
    return _players.take(alienCount).toList();
  }

  List<Player> get humanPlayers {
    final alienCount = (_players.length / 2).floor();
    return _players.skip(alienCount).toList();
  }

  bool get canStartGame {
    return _players.length >= _currentMode.minPlayers;
  }

  String get timerDisplay {
    final minutes = _timerSeconds ~/ 60;
    final seconds = _timerSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  // Game mode management
  void setGameMode(GameMode mode) {
    _currentMode = mode;
    _resetGame();
    notifyListeners();
  }

  void toggleNSFW() {
    _nsfwEnabled = !_nsfwEnabled;
    notifyListeners();
  }

  // Player management
  void addPlayer(String initials) {
    if (initials.isEmpty || initials.length > 3) return;
    
    final normalizedInitials = initials.toUpperCase();
    if (_players.any((p) => p.initials == normalizedInitials)) return;

    final player = Player(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      initials: normalizedInitials,
    );

    _players.add(player);
    _assignTeams();
    _updateRoundScores();
    notifyListeners();
  }

  void removePlayer(String playerId) {
    _players.removeWhere((p) => p.id == playerId);
    _assignTeams();
    _updateRoundScores();
    notifyListeners();
  }

  void editPlayer(String playerId, String newInitials) {
    final normalizedInitials = newInitials.toUpperCase();
    if (normalizedInitials.isEmpty || normalizedInitials.length > 3) return;
    
    if (_players.any((p) => p.id != playerId && p.initials == normalizedInitials)) return;

    final playerIndex = _players.indexWhere((p) => p.id == playerId);
    if (playerIndex != -1) {
      _players[playerIndex] = _players[playerIndex].copyWith(
        initials: normalizedInitials,
        isEditing: false,
      );
      notifyListeners();
    }
  }

  void movePlayerUp(String playerId) {
    final index = _players.indexWhere((p) => p.id == playerId);
    if (index > 0) {
      final player = _players.removeAt(index);
      _players.insert(index - 1, player);
      _assignTeams();
      notifyListeners();
    }
  }

  void movePlayerDown(String playerId) {
    final index = _players.indexWhere((p) => p.id == playerId);
    if (index < _players.length - 1) {
      final player = _players.removeAt(index);
      _players.insert(index + 1, player);
      _assignTeams();
      notifyListeners();
    }
  }

  void setPlayerEditing(String playerId, bool editing) {
    final playerIndex = _players.indexWhere((p) => p.id == playerId);
    if (playerIndex != -1) {
      _players[playerIndex] = _players[playerIndex].copyWith(isEditing: editing);
      _editingPlayerId = editing ? playerId : null;
      notifyListeners();
    }
  }

  void toggleAddMode() {
    _addMode = !_addMode;
    notifyListeners();
  }

  void toggleEditMode() {
    _editMode = !_editMode;
    if (!_editMode) {
      // Clear all editing states
      for (int i = 0; i < _players.length; i++) {
        _players[i] = _players[i].copyWith(isEditing: false);
      }
      _editingPlayerId = null;
    }
    notifyListeners();
  }

  // Team assignment for team-based modes
  void _assignTeams() {
    if (!_currentMode.supportsTeams) {
      for (int i = 0; i < _players.length; i++) {
        _players[i] = _players[i].copyWith(team: TeamColor.none);
      }
      return;
    }

    for (int i = 0; i < _players.length; i++) {
      TeamColor team;
      if (_currentMode.type == GameModeType.encounters) {
        team = i % 2 == 0 ? TeamColor.red : TeamColor.blue;
      } else if (_currentMode.type == GameModeType.space) {
        team = i % 2 == 0 ? TeamColor.green : TeamColor.blue;
      } else {
        team = TeamColor.none;
      }
      _players[i] = _players[i].copyWith(team: team);
    }
  }

  // Game flow
  void startGame() {
    if (!canStartGame) return;
    
    _gameActive = true;
    _resetRound();
    notifyListeners();
  }

  void _resetGame() {
    _players.clear();
    _currentRound = 1;
    _currentCycle = 0;
    _gameActive = false;
    _seenConcepts.clear();
    _editMode = false;
    _addMode = false;
    _editingPlayerId = null;
    _resetRound();
  }

  void _resetRound() {
    _timerSeconds = _currentMode.timerSeconds;
    _timerRunning = false;
    _conceptRevealed = false;
    _currentConcept = '';
    _roundTotal = 0;
    _timerStartTime = null;
    _timerPausedTime = 0;
    _lastMilestone = 0;
    _updateRoundScores();
  }

  void _updateRoundScores() {
    _roundScores.clear();
    for (final player in _players) {
      _roundScores[player.id] = 0;
    }
  }

  // Concept management
  void revealConcept() {
    if (_conceptRevealed) return;
    
    _currentConcept = _getRandomConcept();
    _conceptRevealed = true;
    notifyListeners();
  }

  void skipConcept() {
    if (!_conceptRevealed) return;
    
    _currentConcept = _getRandomConcept();
    notifyListeners();
  }

  String _getRandomConcept() {
    final concepts = _currentMode.concepts;
    final available = concepts.where((c) => !_seenConcepts.contains(c)).toList();
    
    if (available.isEmpty) {
      _seenConcepts.clear();
      return concepts[Random().nextInt(concepts.length)];
    }
    
    final concept = available[Random().nextInt(available.length)];
    _seenConcepts.add(concept);
    return concept;
  }

  // Timer management
  void startTimer() {
    if (!_conceptRevealed) return;
    
    if (_timerStartTime == null) {
      _timerStartTime = DateTime.now();
    } else {
      _timerStartTime = DateTime.now().subtract(Duration(milliseconds: _timerPausedTime));
    }
    
    _timerRunning = true;
    notifyListeners();
  }

  void pauseTimer() {
    if (_timerStartTime != null) {
      _timerPausedTime = DateTime.now().difference(_timerStartTime!).inMilliseconds;
    }
    _timerRunning = false;
    notifyListeners();
  }

  void toggleTimer() {
    if (_timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  void updateTimer() {
    if (!_timerRunning || _timerStartTime == null) return;
    
    final elapsed = DateTime.now().difference(_timerStartTime!).inSeconds;
    _timerSeconds = _currentMode.timerSeconds - elapsed;
    
    if (_timerSeconds <= 0) {
      _timerSeconds = 0;
      _endRound();
    }
    
    notifyListeners();
  }

  void _endRound() {
    _timerRunning = false;
    // End round logic will be implemented
    notifyListeners();
  }

  // Scoring
  void scoreAlien(String playerId) {
    if (!_conceptRevealed || !_timerRunning) return;
    
    final player = _players.firstWhere((p) => p.id == playerId);
    if (player.role != PlayerRole.alien) return;
    
    // Award point to alien
    _roundScores[playerId] = (_roundScores[playerId] ?? 0) + 1;
    player.score++;
    _roundTotal++;
    
    // Check for human milestone bonuses
    _checkHumanMilestones();
    
    // Load next concept
    _currentConcept = _getRandomConcept();
    notifyListeners();
  }

  void _checkHumanMilestones() {
    // WOE scoring: 3 → +1, 5 → +1, then 6, 7, 8, 9... → +1 each
    final milestones = [3, 5];
    for (int i = 6; i <= 50; i++) {
      milestones.add(i);
    }
    
    if (milestones.contains(_roundTotal) && _roundTotal > _lastMilestone) {
      _lastMilestone = _roundTotal;
      
      // Award bonus point to all humans
      for (final human in humanPlayers) {
        human.score++;
      }
    }
  }

  // Round progression
  void nextRound() {
    if (_players.isNotEmpty) {
      // Rotate players: move top player to bottom
      final topPlayer = _players.removeAt(0);
      _players.add(topPlayer);
      _currentRound++;
      
      // Check if cycle completed
      if (_currentRound > _players.length) {
        _currentCycle++;
        _currentRound = 1;
      }
    }
    
    _resetRound();
    notifyListeners();
  }

  bool get gameEnded {
    return _currentCycle >= 2;
  }

  Player? get winner {
    if (!gameEnded) return null;
    
    final sortedPlayers = List<Player>.from(_players)
      ..sort((a, b) => b.score.compareTo(a.score));
    
    return sortedPlayers.first;
  }
}