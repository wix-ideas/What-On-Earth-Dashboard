import 'package:flutter/material.dart';
import '../models/game_mode.dart';
import '../utils/app_colors.dart';
import '../utils/app_styles.dart';

class GameModeDropdown extends StatelessWidget {
  final GameMode currentMode;
  final Function(GameMode) onModeChanged;

  const GameModeDropdown({
    super.key,
    required this.currentMode,
    required this.onModeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 54,
      decoration: BoxDecoration(
        color: AppColors.dark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.dark, width: AppStyles.stroke),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<GameMode>(
          value: currentMode,
          isExpanded: true,
          dropdownColor: AppColors.dark,
          icon: const Padding(
            padding: EdgeInsets.only(right: 12),
            child: Icon(
              Icons.keyboard_arrow_down,
              color: AppColors.cream,
              size: 32,
            ),
          ),
          style: const TextStyle(
            fontFamily: AppStyles.fontUI,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            letterSpacing: 1,
            color: AppColors.cream,
          ),
          items: GameMode.allModes.map((mode) {
            return DropdownMenuItem<GameMode>(
              value: mode,
              child: Padding(
                padding: const EdgeInsets.only(left: 16),
                child: Text(
                  mode.displayName,
                  style: const TextStyle(
                    fontFamily: AppStyles.fontUI,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                    color: AppColors.cream,
                  ),
                ),
              ),
            );
          }).toList(),
          onChanged: (GameMode? newMode) {
            if (newMode != null) {
              onModeChanged(newMode);
            }
          },
        ),
      ),
    );
  }
}