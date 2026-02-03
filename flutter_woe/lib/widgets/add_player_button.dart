import 'package:flutter/material.dart';
import '../utils/app_colors.dart';
import '../utils/app_styles.dart';

class AddPlayerButton extends StatefulWidget {
  final Function(String) onAddPlayer;
  final bool addMode;
  final VoidCallback onToggleAddMode;

  const AddPlayerButton({
    super.key,
    required this.onAddPlayer,
    required this.addMode,
    required this.onToggleAddMode,
  });

  @override
  State<AddPlayerButton> createState() => _AddPlayerButtonState();
}

class _AddPlayerButtonState extends State<AddPlayerButton> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.addMode) {
      return _buildAddPlayerRow();
    } else {
      return _buildAddButton();
    }
  }

  Widget _buildAddButton() {
    return Container(
      width: double.infinity,
      height: 54,
      decoration: BoxDecoration(
        color: AppColors.dark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.dark, width: AppStyles.stroke),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            widget.onToggleAddMode();
            // Focus the input field after the UI updates
            WidgetsBinding.instance.addPostFrameCallback((_) {
              _focusNode.requestFocus();
            });
          },
          child: const Center(
            child: Text(
              '+',
              style: TextStyle(
                fontFamily: AppStyles.fontTitle,
                fontSize: 32,
                letterSpacing: 2,
                color: AppColors.cream,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAddPlayerRow() {
    return Container(
      height: 54,
      decoration: AppStyles.playerRowDecoration,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          // Alien icon placeholder
          const SizedBox(width: 36),
          
          const SizedBox(width: 12),
          
          // Input field
          Expanded(
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              maxLength: 3,
              textCapitalization: TextCapitalization.characters,
              style: AppStyles.playerName.copyWith(fontSize: 24),
              decoration: InputDecoration(
                hintText: '___',
                hintStyle: AppStyles.playerName.copyWith(
                  fontSize: 24,
                  color: AppColors.cream.withOpacity(0.5),
                ),
                border: InputBorder.none,
                counterText: '', // Hide character counter
              ),
              onSubmitted: (value) => _confirmAdd(),
            ),
          ),
          
          // Tool buttons
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildToolButton(
                icon: Icons.close,
                onTap: _cancelAdd,
              ),
              const SizedBox(width: 8),
              _buildToolButton(
                icon: Icons.keyboard_arrow_up,
                onTap: () {}, // Placeholder for move up
              ),
              const SizedBox(width: 8),
              _buildToolButton(
                icon: Icons.keyboard_arrow_down,
                onTap: () {}, // Placeholder for move down
              ),
              const SizedBox(width: 8),
              _buildToolButton(
                icon: Icons.check,
                onTap: _confirmAdd,
              ),
            ],
          ),
        ],
      ),
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

  void _confirmAdd() {
    final initials = _controller.text.trim().toUpperCase();
    if (initials.isNotEmpty) {
      widget.onAddPlayer(initials);
      _controller.clear();
      widget.onToggleAddMode();
    }
  }

  void _cancelAdd() {
    _controller.clear();
    widget.onToggleAddMode();
  }
}