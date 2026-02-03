import 'package:flutter/material.dart';

class AppColors {
  // Exact color palette from design brief
  static const Color dark = Color(0xFF1C313B);
  static const Color yellow = Color(0xFFFFBD00);
  static const Color green = Color(0xFF4DAD73);
  static const Color blue = Color(0xFF58B6BF);
  static const Color red = Color(0xFFDF4C4C);
  static const Color cream = Color(0xFFFEAC3);
  
  // Additional colors for specific use cases
  static const Color white = cream; // Skeleton Crew uses cream as white
  
  // Gradient backgrounds for space theme
  static const LinearGradient spaceGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [dark, Color(0xFF0A1A20)],
  );
}