import 'package:flutter/material.dart';
import '../utils/app_colors.dart';
import '../utils/app_styles.dart';

class NSFWToggle extends StatelessWidget {
  final bool enabled;
  final VoidCallback onToggle;

  const NSFWToggle({
    super.key,
    required this.enabled,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // NSFW Label - expands to fill available space
        Expanded(
          child: GestureDetector(
            onTap: onToggle,
            child: Container(
              height: 54,
              decoration: enabled ? AppStyles.nsfwLabelOn : AppStyles.nsfwLabelOff,
              child: Center(
                child: Text(
                  'NSFW',
                  style: AppStyles.nsfwLabel,
                ),
              ),
            ),
          ),
        ),
        
        const SizedBox(width: 8), // Exact 8px gap from design
        
        // Toggle Switch - fixed width square
        GestureDetector(
          onTap: onToggle,
          child: Container(
            width: 54,
            height: 54,
            decoration: enabled ? AppStyles.nsfwSwitchOn : AppStyles.nsfwSwitchOff,
            child: Center(
              child: Container(
                width: 32,
                height: 32,
                decoration: AppStyles.nsfwIndicator,
              ),
            ),
          ),
        ),
      ],
    );
  }
}