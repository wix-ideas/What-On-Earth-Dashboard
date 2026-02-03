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
              decoration: BoxDecoration(
                // OFF: Dark navy background, ON: Red background
                color: enabled ? AppColors.red : AppColors.dark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: enabled ? AppColors.red : AppColors.dark, 
                  width: 3
                ),
              ),
              child: Center(
                child: Text(
                  'NSFW',
                  style: const TextStyle(
                    fontFamily: 'Cubano',
                    fontSize: 24,
                    letterSpacing: 3,
                    color: AppColors.cream, // Always cream text
                    fontWeight: FontWeight.normal,
                  ),
                ),
              ),
            ),
          ),
        ),
        
        const SizedBox(width: 8), // Exact 8px gap from design
        
        // Toggle Switch - fixed width square with cream rectangle inside
        GestureDetector(
          onTap: onToggle,
          child: Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              // OFF: Dark navy background, ON: Red background  
              color: enabled ? AppColors.red : AppColors.dark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: enabled ? AppColors.red : AppColors.dark,
                width: 3
              ),
            ),
            child: Center(
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.cream, // Always cream rectangle
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}