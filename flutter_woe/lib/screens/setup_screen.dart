import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/game_state_provider.dart';
import '../models/game_mode.dart';
import '../utils/app_colors.dart';
import '../utils/app_styles.dart';
import '../widgets/space_background.dart';
import '../widgets/nsfw_toggle.dart';
import '../widgets/player_list.dart';
import '../widgets/add_player_button.dart';
import '../widgets/game_mode_dropdown.dart';
import 'game_screen.dart';

class SetupScreen extends StatelessWidget {
  const SetupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<GameStateProvider>(
        builder: (context, gameState, child) {
          return Stack(
            children: [
              // Space background with stars and earth
              const SpaceBackground(),
              
              // Main content
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(AppStyles.padding),
                  child: Column(
                    children: [
                      // Header with title and menu
                      _buildHeader(context),
                      
                      const SizedBox(height: 10),
                      
                      // Main board container
                      Expanded(
                        child: Container(
                          decoration: AppStyles.boardDecoration,
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              // Game mode dropdown
                              GameModeDropdown(
                                currentMode: gameState.currentMode,
                                onModeChanged: (mode) {
                                  gameState.setGameMode(mode);
                                },
                              ),
                              
                              const SizedBox(height: 12),
                              
                              // Players section
                              Expanded(
                                child: PlayerList(
                                  players: gameState.players,
                                  alienCount: gameState.alienPlayers.length,
                                  editMode: gameState.editMode,
                                  onEditPlayer: (playerId, initials) {
                                    gameState.editPlayer(playerId, initials);
                                  },
                                  onDeletePlayer: (playerId) {
                                    gameState.removePlayer(playerId);
                                  },
                                  onMovePlayerUp: (playerId) {
                                    gameState.movePlayerUp(playerId);
                                  },
                                  onMovePlayerDown: (playerId) {
                                    gameState.movePlayerDown(playerId);
                                  },
                                  onToggleEditing: (playerId) {
                                    final player = gameState.players.firstWhere((p) => p.id == playerId);
                                    gameState.setPlayerEditing(playerId, !player.isEditing);
                                  },
                                ),
                              ),
                              
                              // Add player button
                              AddPlayerButton(
                                onAddPlayer: (initials) {
                                  gameState.addPlayer(initials);
                                },
                                addMode: gameState.addMode,
                                onToggleAddMode: () {
                                  gameState.toggleAddMode();
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 12),
                      
                      // Bottom controls
                      Column(
                        children: [
                          // NSFW Toggle
                          NSFWToggle(
                            enabled: gameState.nsfwEnabled,
                            onToggle: () {
                              gameState.toggleNSFW();
                            },
                          ),
                          
                          const SizedBox(height: 12),
                          
                          // Start Game Button
                          _buildStartButton(context, gameState),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        // Title section
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'WHAT ON EARTH',
                style: AppStyles.titleLarge.copyWith(
                  shadows: [
                    for (int i = -3; i <= 3; i++)
                      for (int j = -3; j <= 3; j++)
                        if (i != 0 || j != 0)
                          Shadow(
                            offset: Offset(i.toDouble(), j.toDouble()),
                            color: AppColors.dark,
                          ),
                  ],
                ),
              ),
              Text(
                'ARE YOU TALKING ABOUT?',
                style: AppStyles.titleSmall.copyWith(
                  shadows: [
                    for (int i = -2; i <= 2; i++)
                      for (int j = -2; j <= 2; j++)
                        if (i != 0 || j != 0)
                          Shadow(
                            offset: Offset(i.toDouble(), j.toDouble()),
                            color: AppColors.dark,
                          ),
                  ],
                ),
              ),
            ],
          ),
        ),
        
        // Menu button
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: AppColors.yellow,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.dark, width: AppStyles.stroke),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => _showMenu(context),
              child: const Icon(
                Icons.menu,
                color: AppColors.dark,
                size: 26,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStartButton(BuildContext context, GameStateProvider gameState) {
    final canStart = gameState.canStartGame;
    
    return Container(
      width: double.infinity,
      height: 66,
      decoration: AppStyles.primaryButton.copyWith(
        color: canStart ? AppColors.yellow : AppColors.yellow.withOpacity(0.55),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppStyles.radius),
          onTap: canStart ? () => _startGame(context, gameState) : null,
          child: Center(
            child: Text(
              'START GAME',
              style: AppStyles.buttonPrimary.copyWith(
                color: canStart ? AppColors.dark : AppColors.dark.withOpacity(0.55),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _startGame(BuildContext context, GameStateProvider gameState) {
    if (!gameState.canStartGame) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('This mode requires at least ${gameState.currentMode.minPlayers} players.'),
          backgroundColor: AppColors.red,
        ),
      );
      return;
    }

    gameState.startGame();
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const GameScreen(),
      ),
    );
  }

  void _showMenu(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          decoration: AppStyles.boardDecoration,
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildMenuButton('TUTORIAL', () {
                Navigator.of(context).pop();
                _showTutorial(context);
              }),
              const SizedBox(height: 12),
              _buildMenuButton('NEW GAME', () {
                Navigator.of(context).pop();
                _confirmNewGame(context);
              }),
              const SizedBox(height: 12),
              _buildMenuButton('EXIT GAME', () {
                Navigator.of(context).pop();
                _confirmExit(context);
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuButton(String text, VoidCallback onTap) {
    return Container(
      width: double.infinity,
      height: 50,
      decoration: AppStyles.tertiaryButton,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppStyles.radius),
          onTap: onTap,
          child: Center(
            child: Text(
              text,
              style: AppStyles.buttonSecondary.copyWith(
                fontSize: 24,
                letterSpacing: 2,
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showTutorial(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tutorial'),
        content: const Text(
          'Tutorial coming soon! For now:\n\n'
          '1. Add players (top half are Aliens)\n'
          '2. Start game\n'
          '3. Reveal concept, start timer\n'
          '4. Tap alien names to score\n'
          '5. Humans get bonus points at milestones (3, 5, 6, 7... correct)',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _confirmNewGame(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New Game'),
        content: const Text('Start a new game? All progress will be lost.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<GameStateProvider>().setGameMode(GameMode.woe);
            },
            child: const Text('New Game'),
          ),
        ],
      ),
    );
  }

  void _confirmExit(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exit'),
        content: const Text('Exit to main menu? All progress will be lost.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // Exit logic here
            },
            child: const Text('Exit'),
          ),
        ],
      ),
    );
  }
}