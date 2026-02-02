import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppStyles {
  // Design system constants
  static const double radius = 14.0;
  static const double padding = 14.0;
  static const double stroke = 3.0;
  static const double touchTarget = 44.0;
  
  // Font families
  static const String fontTitle = 'Cubano';
  static const String fontUI = 'P22Underground';
  
  // Text styles using exact fonts from design brief
  static const TextStyle titleLarge = TextStyle(
    fontFamily: fontTitle,
    fontSize: 36,
    height: 1.0,
    letterSpacing: 1.5,
    color: AppColors.yellow,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle titleSmall = TextStyle(
    fontFamily: fontTitle,
    fontSize: 17,
    height: 1.0,
    letterSpacing: 2.2,
    color: AppColors.cream,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle buttonPrimary = TextStyle(
    fontFamily: fontTitle,
    fontSize: 34,
    letterSpacing: 4,
    color: AppColors.dark,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle buttonSecondary = TextStyle(
    fontFamily: fontTitle,
    fontSize: 28,
    letterSpacing: 3,
    color: AppColors.dark,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle playerName = TextStyle(
    fontFamily: fontTitle,
    fontSize: 28,
    letterSpacing: 2,
    color: AppColors.cream,
    fontWeight: FontWeight.bold,
  );
  
  static const TextStyle conceptDisplay = TextStyle(
    fontFamily: fontTitle,
    fontSize: 48,
    letterSpacing: 2,
    color: AppColors.yellow,
    fontWeight: FontWeight.bold,
  );
  
  static const TextStyle timerDisplay = TextStyle(
    fontFamily: fontTitle,
    fontSize: 32,
    color: AppColors.dark,
    fontWeight: FontWeight.bold,
  );
  
  static const TextStyle nsfwLabel = TextStyle(
    fontFamily: fontTitle,
    fontSize: 24,
    letterSpacing: 3,
    color: AppColors.cream,
    fontWeight: FontWeight.normal,
  );
  
  // Button decorations
  static BoxDecoration primaryButton = BoxDecoration(
    color: AppColors.yellow,
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  static BoxDecoration secondaryButton = BoxDecoration(
    color: AppColors.green,
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  static BoxDecoration tertiaryButton = BoxDecoration(
    color: AppColors.cream,
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  // Container decorations
  static BoxDecoration boardDecoration = BoxDecoration(
    color: AppColors.cream,
    borderRadius: BorderRadius.circular(18),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  static BoxDecoration playerRowDecoration = BoxDecoration(
    color: AppColors.dark,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  static BoxDecoration alienPlayerDecoration = BoxDecoration(
    color: AppColors.green,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  // NSFW Toggle decorations
  static BoxDecoration nsfwLabelOff = BoxDecoration(
    color: AppColors.dark,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  static BoxDecoration nsfwLabelOn = BoxDecoration(
    color: AppColors.red,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: AppColors.red, width: stroke),
  );
  
  static BoxDecoration nsfwSwitchOff = BoxDecoration(
    color: AppColors.dark,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: AppColors.dark, width: stroke),
  );
  
  static BoxDecoration nsfwSwitchOn = BoxDecoration(
    color: AppColors.red,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: AppColors.red, width: stroke),
  );
  
  static BoxDecoration nsfwIndicator = BoxDecoration(
    color: AppColors.cream,
    borderRadius: BorderRadius.circular(6),
  );
}