# SaveLoadMenu Component

## Overview

The SaveLoadMenu component provides a user interface for managing game save slots. It supports saving, loading, and deleting game progress with a Vietnamese-language interface.

**Implements Requirements:**
- 7.8: Display save slot information (timestamp, progress, resources)
- 2.2: Component modularization with single responsibility
- 2.3: React hooks for state and side effects

## Features

- **5 Save Slots**: Displays all 5 available save slots (0-4)
- **Save Metadata Display**: Shows timestamp, player name, level, progress, resources, and play time
- **Save Operation**: Save current game state to any slot (with overwrite confirmation)
- **Load Operation**: Load game state from any filled slot
- **Delete Operation**: Delete save data with confirmation dialog
- **Visual Feedback**: Progress bars, resource icons, and animations
- **Error Handling**: User-friendly error messages for save/load failures
- **Vietnamese Interface**: All text in Vietnamese for cultural authenticity

## Usage

```tsx
import { SaveLoadMenu } from '@/components/game/SaveLoadMenu';

function GameMenu() {
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [mode, setMode] = useState<'save' | 'load'>('save');

  return (
    <>
      <button onClick={() => {
        setMode('save');
        setSaveMenuOpen(true);
      }}>
        Lưu Game
      </button>
      
      <button onClick={() => {
        setMode('load');
        setSaveMenuOpen(true);
      }}>
        Tải Game
      </button>

      <SaveLoadMenu
        open={saveMenuOpen}
        onOpenChange={setSaveMenuOpen}
        mode={mode}
      />
    </>
  );
}
```

## Props

### SaveLoadMenuProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controls modal visibility |
| `onOpenChange` | `(open: boolean) => void` | Yes | Callback when modal open state changes |
| `mode` | `'save' \| 'load'` | Yes | Determines if menu is for saving or loading |

## Component Structure

### SaveLoadMenu (Main Component)
- Manages modal state and save slot data
- Handles save/load/delete operations
- Displays grid of save slot cards
- Shows delete confirmation dialog

### SaveSlotCard (Sub-component)
- Displays individual save slot information
- Shows empty state for unused slots
- Provides action buttons (save/load/delete)
- Animated progress bar and entrance animation

### DeleteConfirmDialog (Sub-component)
- Confirmation dialog for delete operations
- Shows slot information being deleted
- Prevents accidental deletions

## State Management

The component integrates with Zustand store:
- Reads game state for saving
- Uses notification system for user feedback
- Accesses profile, resources, collection, etc.

## Save Data Structure

Saves include:
- **Metadata**: Slot, timestamp, player name, progress, level, play time
- **Game State**: Phase, difficulty, current level, elapsed time
- **Hero Data**: Selected hero, unlocked heroes
- **Combat Data**: Units, buildings, active effects
- **Resources**: Food, gold, army, caps, generation rates
- **Collection**: Heroes, items, completion percentage
- **Profile**: Name, rank, level, experience, wins, losses, achievements, statistics
- **Research**: Completed, in progress, available research
- **Quiz**: Questions answered, correct answers, completed categories, rewards

## Error Handling

The component handles various error types:
- **SaveSlotError**: Invalid slot number or empty slot
- **LocalStorageError**: General save/load failures
- **QuotaExceededError**: Insufficient storage space
- **Validation Errors**: Corrupted or invalid save data

All errors display user-friendly Vietnamese messages via notifications.

## Styling

- Uses Tailwind CSS for styling
- Framer Motion for animations
- Vietnamese cultural theme colors (vietnam-500, vietnam-600)
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Hover effects and transitions

## Accessibility

- Semantic HTML structure
- ARIA labels for icon buttons
- Keyboard navigation support (via Radix UI Modal)
- Focus management in dialogs
- Screen reader friendly

## Future Enhancements

- **State Restoration**: Currently shows success message but doesn't fully restore state
- **Import/Export**: Add buttons for importing/exporting save files
- **Auto-save Indicator**: Show which slot is used for auto-save
- **Cloud Sync**: Integration with cloud storage (optional feature)
- **Save Preview**: Thumbnail or screenshot of game state

## Dependencies

- `@/lib/saves/local`: Local storage operations
- `@/store`: Zustand game store
- `@/components/ui/Modal`: Modal dialog component
- `@/components/ui/Button`: Button component
- `framer-motion`: Animations
- `@/schemas/save.schema`: Type definitions

## Testing

To test the component:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveLoadMenu } from './SaveLoadMenu';

describe('SaveLoadMenu', () => {
  it('displays save slots', () => {
    render(<SaveLoadMenu open={true} onOpenChange={() => {}} mode="save" />);
    expect(screen.getByText(/Lưu Game/i)).toBeInTheDocument();
  });

  it('handles save operation', async () => {
    const user = userEvent.setup();
    render(<SaveLoadMenu open={true} onOpenChange={() => {}} mode="save" />);
    
    const saveButton = screen.getAllByText(/Lưu vào đây/i)[0];
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Đã lưu game/i)).toBeInTheDocument();
    });
  });
});
```

## Notes

- Save data is stored in browser localStorage with keys `game-save-slot-{0-4}`
- Metadata is stored separately for quick loading
- Save data is compressed using LZ-string
- All timestamps use Vietnamese locale formatting
- Component is client-side only ('use client' directive)
