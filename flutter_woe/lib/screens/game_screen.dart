import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../providers/game_state_provider.dart';
import '../utils/app_colors.dart';
import '../utils/app_styles.dart';
import '../widgets/space_background.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Enter fullscreen mode
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    
    // Start timer updates
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      context.read<GameStateProvider>().updateTimer();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    // Exit fullscreen mode
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<GameStateProvider>(
        builder: (context, gameState, child) {
          return Stack(
            children: [
              // Space background
              const SpaceBackground(),
              
              // Game content
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    children: [
                      // Game header with timer and controls
                      _buildGameHeader(gameState),
                      
                      const SizedBox(height: 8),
                      
                      // Main game board
                      Expanded(
                        child: _buildGameBoard(gameState),
                      ),
                      
                      // Next round button (shown when timer ends)
                      if (gameState.timerSeconds <= 0) ...[
                        const SizedBox(height: 8),
                        _buildNextRoundButton(),
                      ],
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

  Widget _buildGameHeader(GameStateProvider gameState) {
    return Container(
      height: 80,
      padding: const EdgeInsets.all(8),
      child: Row(
        children: [
          // Timer display
          Container(
            height: 64,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: _getTimerColor(gameState.timerSeconds),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.dark, width: 3),
            ),
            child: Center(
              child: Text(
                gameState.timerDisplay,
                style: AppStyles.timerDisplay.copyWith(
                  color: gameState.timerSeconds <= 10 ? AppColors.cream : AppColors.dark,
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 8),
          
          // Control buttons
          Row(
            children: [
              _buildControlButton(
                icon: gameState.timerRunning ? '||' : '▶',
                color: gameState.timerRunning ? AppColors.yellow : AppColors.green,
                onTap: () => gameState.toggleTimer(),
              ),
              const SizedBox(width: 8),
              _buildControlButton(
                icon: '◄',
                color: AppColors.yellow,
                onTap: () {
                  // Previous concept logic
                },
              ),
              const SizedBox(width: 8),
              _buildControlButton(
                icon: '►',
                color: AppColors.yellow,
                onTap: () => gameState.skipConcept(),
              ),
            ],
          ),
          
          // Game title (center)
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'WHAT ON EARTH',
                    style: AppStyles.titleLarge.copyWith(
                      fontSize: 24,
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
                      fontSize: 16,
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
          ),
          
          // Exit button
          Container(
            width: 64,
            height: 64,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(32),
                onTap: () => _showExitConfirmation(),
                child: Center(
                  child: Text(
                    '×',
                    style: AppStyles.titleLarge.copyWith(
                      fontSize: 48,
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
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required String icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.dark, width: 3),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Center(
            child: Text(
              icon,
              style: const TextStyle(
                fontFamily: AppStyles.fontTitle,
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: AppColors.dark,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGameBoard(GameStateProvider gameState) {
    return Stack(
      children: [
        // Concept display (center)
        Center(
          child: GestureDetector(
            onTap: gameState.conceptRevealed ? null : () => gameState.revealConcept(),
            child: Container(
              width: MediaQuery.of(context).size.width * 0.95,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.cream,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.dark, width: 4),
              ),
              child: Center(
                child: Text(
                  gameState.conceptRevealed 
                      ? gameState.currentConcept.isEmpty 
                          ? 'ROUND OVER' 
                          : gameState.currentConcept
                      : 'TAP TO REVEAL',
                  style: AppStyles.conceptDisplay.copyWith(
                    color: AppColors.yellow,
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
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
        ),
        
        // Alien players (bottom left)
        Positioned(
          bottom: 16,
          left: 16,
          right: 96,
          child: _buildAlienPlayers(gameState),
        ),
        
        // Round score (bottom right)
        Positioned(
          bottom: 16,
          right: 16,
          child: _buildRoundScore(gameState),
        ),
      ],
    );
  }

  Widget _buildAlienPlayers(GameStateProvider gameState) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: gameState.alienPlayers.map((player) {
        return GestureDetector(
          onTap: () => gameState.scoreAlien(player.id),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: BoxDecoration(
              color: AppColors.green,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.dark, width: 3),
            ),
            child: Text(
              player.initials,
              style: AppStyles.playerName.copyWith(
                fontSize: 24,
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
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRoundScore(GameStateProvider gameState) {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        image: const DecorationImage(
          image: NetworkImage(
            'https://static.wixstatic.com/media/1369e3_d8dd2f5c0d2d499fa414f3423d6b1bbd~mv2.png',
          ),
          fit: BoxFit.contain,
        ),
      ),
      child: Center(
        child: Text(
          gameState.roundTotal.toString(),
          style: AppStyles.timerDisplay.copyWith(
            fontSize: 28,
            color: AppColors.yellow,
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
      ),
    );
  }

  Widget _buildNextRoundButton() {
    return Container(
      width: double.infinity,
      height: 66,
      decoration: AppStyles.primaryButton,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppStyles.radius),
          onTap: () {
            context.read<GameStateProvider>().nextRound();
            Navigator.of(context).pop(); // Return to inter-round screen
          },
          child: Center(
            child: Text(
              'NEXT ROUND',
              style: AppStyles.buttonPrimary,
            ),
          ),
        ),
      ),
    );
  }

  Color _getTimerColor(int seconds) {
    if (seconds <= 10) return AppColors.red;
    if (seconds <= 30) return AppColors.yellow;
    return AppColors.yellow;
  }

  void _showExitConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exit Game'),
        content: const Text('Exit game? Progress will be saved.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Exit game
            },
            child: const Text('Exit'),
          ),
        ],
      ),
    );
  }
}