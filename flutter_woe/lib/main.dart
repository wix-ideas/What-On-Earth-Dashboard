import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'screens/setup_screen.dart';
import 'providers/game_state_provider.dart';
import 'utils/app_colors.dart';

void main() {
  runApp(const WOEApp());
}

class WOEApp extends StatelessWidget {
  const WOEApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Lock to portrait orientation
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);

    // Set status bar style
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: AppColors.dark,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
    );

    return ChangeNotifierProvider(
      create: (context) => GameStateProvider(),
      child: MaterialApp(
        title: 'What On Earth Are You Talking About?',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          fontFamily: 'P22Underground',
          scaffoldBackgroundColor: AppColors.dark,
        ),
        home: const SetupScreen(),
      ),
    );
  }
}