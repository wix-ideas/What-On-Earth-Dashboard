import 'package:flutter/material.dart';
import '../models/player.dart';
import '../utils/app_colors.dart';
import '../utils/app_styles.dart';

class PlayerList extends StatelessWidget {
  final List<Player> players;
  final int alienCount;
  final bool editMode;
  final Function(String, String) onEditPlayer;
  final Function(String) onDeletePlayer;
  final Function(String) onMovePlayerUp;
  final Function(String) onMovePlayerDown;
  final Function(String) onToggleEditing;

  const PlayerList({
    super.key,
    required this.players,
    required this.alienCount,
    required this.editMode,
    required this.onEditPlayer,
    required this.onDeletePlayer,
    required this.onMovePlayerUp,
    required this.onMovePlayerDown,
    required this.onToggleEditing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxHeight: 260),
      child: ListView.builder(
        itemCount: players.length,
        itemBuilder: (context, index) {
          final player = players[index];
          final isAlien = index < alienCount;
          
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _buildPlayerRow(player, isAlien),
          );
        },
      ),
    );
  }

  Widget _buildPlayerRow(Player player, bool isAlien) {
    return Container(
      height: 54,
      decoration: isAlien 
          ? AppStyles.alienPlayerDecoration 
          : AppStyles.playerRowDecoration,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          // Alien icon
          if (isAlien) ...[
            const SizedBox(
              width: 36,
              height: 36,
              child: Center(
                child: Text(
                  '👽',
                  style: TextStyle(fontSize: 32),
                ),
              ),
            ),
            const SizedBox(width: 12),
          ] else ...[
            const SizedBox(width: 48), // Space for alignment
          ],
          
          // Player name or input
          Expanded(
            child: player.isEditing 
                ? _buildEditingInput(player)
                : Text(
                    player.initials,
                    style: AppStyles.playerName,
                  ),
          ),
          
          // Edit/tool buttons
          if (editMode) ...[
            _buildToolButtons(player),
          ] else ...[
            _buildEditButton(player),
          ],
        ],
      ),
    );
  }

  Widget _buildEditingInput(Player player) {
    return TextField(
      controller: TextEditingController(text: player.initials),
      maxLength: 3,
      textCapitalization: TextCapitalization.characters,
      style: AppStyles.playerName.copyWith(fontSize: 24),
      decoration: InputDecoration(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: AppColors.cream.withOpacity(0.3),
            width: 2,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(
            color: AppColors.cream,
            width: 2,
          ),
        ),
        counterText: '',
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      onSubmitted: (value) {
        onEditPlayer(player.id, value);
      },
    );
  }

  Widget _buildEditButton(Player player) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: () => onToggleEditing(player.id),
          child: const Icon(
            Icons.edit,
            color: AppColors.cream,
            size: 24,
          ),
        ),
      ),
    );
  }

  Widget _buildToolButtons(Player player) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildToolButton(
          icon: Icons.delete,
          onTap: () => onDeletePlayer(player.id),
        ),
        const SizedBox(width: 8),
        _buildToolButton(
          icon: Icons.keyboard_arrow_up,
          onTap: () => onMovePlayerUp(player.id),
        ),
        const SizedBox(width: 8),
        _buildToolButton(
          icon: Icons.keyboard_arrow_down,
          onTap: () => onMovePlayerDown(player.id),
        ),
        const SizedBox(width: 8),
        _buildToolButton(
          icon: player.isEditing ? Icons.check : Icons.edit,
          onTap: () {
            if (player.isEditing) {
              // Save logic would go here
              onToggleEditing(player.id);
            } else {
              onToggleEditing(player.id);
            }
          },
        ),
      ],
    );
  }

  Widget _buildToolButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: onTap,
          child: Icon(
            icon,
            color: AppColors.cream,
            size: 20,
          ),
        ),
      ),
    );
  }
}