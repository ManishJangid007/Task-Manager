# Chrono - Task Manager

A modern, feature-rich task management application built with React, TypeScript, and shadcn/ui. Chrono helps you organize tasks by projects and dates, track progress, and manage configurations and credentials all in one place.

## Features

### Task Management
- 📅 **Daily Task View** - View all tasks organized by date with collapsible project sections
- 📊 **Project-Based Organization** - Organize tasks by projects with dedicated project views
- 🎯 **Task Priorities** - Assign high, medium, or low priority to tasks
- ✅ **Task Completion Tracking** - Mark tasks as complete and filter completed tasks
- 📝 **Batch Task Operations** - Add multiple tasks at once with batch task modal
- 🔍 **Date Filtering** - Filter tasks by specific dates across all views
- 📋 **Copy Tasks** - Copy tasks in multiple formats (normal, with status, CSV) with optional date inclusion

### Project Management
- 📌 **Pin Important Projects** - Pin frequently used projects to the top
- 🔍 **Project Search** - Quickly find projects using the search functionality
- 📊 **Project Sorting** - Sort projects alphabetically, by task count, or recent activity
- 🗂️ **Project Configuration** - Store key-value configurations for each project
- 📈 **Project Reports** - View task completion statistics by project

### Configuration & Keys Management
- ⚙️ **Project Configurations** - Store and manage key-value pairs for each project (e.g., API endpoints, environment variables)
- 🔑 **Keys Management** - Securely store and manage credentials (name/URL, username/email, password/key) with show/hide functionality
- 🔗 **Link Detection** - Automatically detects and makes configuration values clickable if they're URLs
- 📋 **Click to Copy** - Click any configuration or key value to copy it to clipboard

### Reports & Analytics
- 📊 **Task Completion Reports** - Visualize completed tasks by project over different time periods
- 📈 **Time Period Selection** - View reports for day, week, month, or year
- 📉 **Bar Charts** - Interactive charts powered by Recharts

### Data Management
- 💾 **Export Data** - Export all projects, tasks, configurations, and keys as JSON
- 📥 **Import Data** - Import previously exported data with confirmation dialog
- 🔄 **Auto Backup** - Automatic backup system using File System Access API
- ⌨️ **Keyboard Shortcuts** - Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac) to trigger backup
- 📁 **Custom Backup Location** - Select custom folder for automatic backups (File System Access API)

### User Interface
- 🎨 **Dark/Light Theme** - Toggle between dark and light themes
- 📱 **Responsive Design** - Fully responsive design that works on mobile, tablet, and desktop
- 🔒 **Fixed Headers** - Headers stay fixed at the top while scrolling on mobile
- 🎯 **Collapsible Sections** - Expand/collapse projects and dates for better organization
- 🔔 **Notifications** - Toast notifications for user actions

### Progressive Web App (PWA)
- 📱 **Installable** - Install as a standalone app on mobile and desktop
- 🔄 **Offline Support** - Service worker for offline functionality
- 🚀 **Auto Update** - Automatic service worker updates
- 📦 **Caching** - Smart caching of assets and resources

### Settings & Customization
- 👁️ **Show/Hide Completed Tasks** - Toggle visibility of completed tasks
- 🗑️ **Delete Confirmation** - Enable/disable confirmation dialogs for task deletion
- 📅 **Date in Copy** - Set default preference for including date when copying tasks
- 📊 **Project Sort Order** - Choose how projects are sorted in the sidebar
- 💾 **Backup Configuration** - Configure automatic backup folder location

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components built on Radix UI
- **Radix UI** - Accessible component primitives
  - Alert Dialog
  - Checkbox
  - Dropdown Menu
  - Popover
  - Switch
  - Tooltip
- **date-fns** - Date utility library
- **Recharts** - Composable charting library
- **react-day-picker** - Date picker component
- **lucide-react** - Icon library
- **vite-plugin-pwa** - PWA support with Workbox
- **File System Access API** - For automatic backups (modern browsers)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ManishJangid007/task-manager.git
   cd task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
gemini-task-manager/
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── checkbox.tsx
│   │   ├── combobox.tsx
│   │   ├── date-picker.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── theme-toggle.tsx
│   │   └── tooltip.tsx
│   ├── BatchTaskModal.tsx    # Batch task creation modal
│   ├── ConfigurationModal.tsx # Configuration entry modal
│   ├── ConfigurationView.tsx # Project configuration view
│   ├── CopyTasksModal.tsx    # Task copying modal with formats
│   ├── DailyView.tsx         # All tasks daily view
│   ├── Icons.tsx             # Icon components
│   ├── KeyModal.tsx          # Key entry modal
│   ├── KeysView.tsx          # Keys management view
│   ├── Modal.tsx             # Reusable modal component
│   ├── ProjectBatchTaskModal.tsx # Project-specific batch task modal
│   ├── ProjectView.tsx       # Individual project view
│   ├── ReportsView.tsx       # Reports and analytics view
│   ├── SettingsView.tsx      # Settings and preferences
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── SimpleCopyModal.tsx    # Simple copy modal
│   └── TaskItem.tsx           # Individual task item component
├── hooks/                     # Custom React hooks
│   └── useLocalStorage.ts     # LocalStorage hook with persistence
├── lib/                       # Utility libraries
│   ├── theme-provider.tsx     # Theme context provider
│   └── utils.ts               # Utility functions (cn, etc.)
├── utils/                     # Helper functions
│   ├── dateUtils.ts           # Date manipulation utilities
│   └── fileSystemAccess.ts    # File System Access API utilities
├── src/                       # Source files
│   └── index.css              # Global styles
├── public/                    # Static assets
│   ├── android-chrome-*.png   # PWA icons
│   ├── apple-touch-icon.png   # Apple touch icon
│   ├── favicon.ico            # Favicon
│   └── site.webmanifest       # PWA manifest
├── App.tsx                    # Main application component
├── index.tsx                  # Application entry point
├── index.html                 # HTML template
├── types.ts                   # TypeScript type definitions
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── components.json            # shadcn/ui configuration
└── package.json               # Dependencies and scripts
```

## Usage

### Creating Tasks

1. **Quick Add (Batch)**: Click the "+" button in the sidebar to open the batch task modal
   - Add multiple tasks at once
   - Assign different projects and priorities to each task
   - All tasks are created for today's date

2. **Project-Specific**: Navigate to a project and click "Add Task"
   - Add multiple tasks for the selected project
   - Choose dates and priorities for each task
   - Tasks are organized by date within the project

3. **Individual Task**: Click "Add Task" in any project view
   - Add a single task with title, date, and priority

### Managing Projects

- **Create Project**: Click "Add Project" in the sidebar
- **Edit Project**: Click the edit icon next to a project name
- **Pin Project**: Click the pin icon to pin/unpin projects
- **Delete Project**: Click the delete icon (deletes project and all its tasks)
- **Search Projects**: Use the search bar in the sidebar

### Task Priorities

Tasks can have three priority levels:
- 🔴 **High** - Urgent and important tasks
- 🟡 **Medium** - Normal priority (default)
- 🟢 **Low** - Less urgent tasks

Tasks are automatically sorted by priority within each date/project section.

### Copying Tasks

Tasks can be copied in multiple formats:

1. **Normal Format**: Simple list of task titles
2. **With Status Format**: Includes completion status (✓ or ☐)
3. **CSV Format**: Comma-separated values

You can copy:
- All tasks for a specific date
- All tasks for a project on a specific date
- Individual tasks (click to copy)

### Configuration Management

Store key-value pairs for each project:
- Navigate to a project → Click "Configuration"
- Add, edit, or delete configurations
- Click any value to copy it to clipboard
- URLs are automatically detected and made clickable

### Keys Management

Securely store credentials:
- Navigate to "Keys" in the sidebar
- Add keys with name/URL, username/email, and password/key
- Toggle visibility of passwords/keys
- Click any field to copy to clipboard
- Search keys by any field

### Reports

View task completion statistics:
- Navigate to "Reports" in the sidebar
- Select time period (day, week, month, year)
- View bar chart of completed tasks by project
- Only shows projects with completed tasks in the selected period

### Settings

Configure application preferences:
- **Show Completed Tasks**: Toggle visibility of completed tasks
- **Delete Confirmation**: Enable/disable confirmation dialogs
- **Date in Copy**: Default preference for including date when copying
- **Project Sort Order**: Choose sorting method (alphabetical, task count, recent activity)
- **Backup Configuration**: Select folder for automatic backups

### Backup & Restore

#### Automatic Backup (File System Access API)
1. Go to Settings
2. Click "Select Folder" to choose a backup location
3. Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac) to trigger backup
4. Backups are saved to `[selected-folder]/chrono/backup.json`

#### Manual Export/Import
1. **Export**: Go to Settings → Click "Export Data"
   - Downloads a JSON file with all your data
2. **Import**: Go to Settings → Click "Import Data"
   - Select a previously exported JSON file
   - Confirm to overwrite current data

## Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Trigger automatic backup (saves to configured folder)

## Browser Support

- **Modern Browsers**: Chrome, Edge, Firefox, Safari (latest versions)
- **File System Access API**: Currently supported in Chrome, Edge, and Opera
  - Other browsers will fall back to download-based backups
- **PWA Features**: Best experience on Chrome, Edge, and Safari

## Data Storage

All data is stored locally in the browser using:
- **LocalStorage** - For projects, tasks, configurations, keys, and settings
- **IndexedDB** - For File System Access API directory handles

No data is sent to external servers. All data remains on your device.

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- shadcn/ui components for UI consistency

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

Built by [Manish Jangid](https://github.com/ManishJangid007)

---

**Note**: This application works entirely offline after the initial load. All data is stored locally in your browser, ensuring privacy and security.
