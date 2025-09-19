# DataX React Frontend

This is the React-based version of the DataX platform frontend, converted from the original HTML/CSS/JavaScript implementation.

## Project Structure

```
react-based/
├── public/
│   └── index.html              # Main HTML template
├── src/
│   ├── components/             # Reusable React components
│   │   ├── Layout.js          # Main layout wrapper with sidebar
│   │   └── Sidebar.js         # Navigation sidebar component
│   ├── pages/                 # Main application pages
│   │   ├── Home.js           # Dashboard with feature overview
│   │   ├── Transform.js      # Data transformation management
│   │   ├── Load.js           # Data loading and file upload
│   │   ├── Editor.js         # SQL query editor
│   │   └── Lineage.js        # Data lineage visualization
│   ├── styles/               # CSS styling
│   │   └── ultra-modern.css  # Main stylesheet (copied from original)
│   ├── App.js               # Main App component with routing
│   └── index.js             # React app entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Features Converted

### ✅ Completed Components

1. **Dashboard (Home.js)**
   - Feature overview cards
   - Quick statistics
   - Navigation shortcuts

2. **Transform Page (Transform.js)**
   - Data transformation management
   - Form handling with React state
   - API integration for transforms

3. **Load Page (Load.js)**
   - File upload simulation
   - Load profile management
   - Dynamic form handling

4. **Editor Page (Editor.js)**
   - SQL query editor with syntax highlighting
   - Query execution interface
   - Dependency analysis
   - Sample query templates

5. **Lineage Page (Lineage.js)**
   - Data lineage visualization using vis.js
   - Interactive network diagrams
   - Export functionality
   - Sample lineage generation

6. **Shared Components**
   - Layout wrapper with consistent structure
   - Sidebar navigation with React Router
   - Responsive design maintained

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
cd frontend/react-based
npm install
```

### Development Server
```bash
npm start
```
This will start the development server on `http://localhost:3000`

### Build for Production
```bash
npm run build
```
This creates an optimized production build in the `build/` folder.

## Key Technologies

- **React 18.2.0** - Main UI framework
- **React Router DOM 6.8.0** - Client-side routing
- **vis-network 9.1.2** - Network visualization for lineage
- **Original CSS** - Maintained ultra-modern styling from original project

## API Integration

The React components are designed to work with the existing backend API:

- **Transform API**: `/api/transform/*`
- **Load API**: `/api/load/*`
- **Editor API**: `/api/editor/*`
- **Lineage API**: `/api/lineage/*`

Make sure your backend server is running on the appropriate port for full functionality.

## Differences from Original

### Improvements in React Version:
1. **Component-based architecture** - Better code organization and reusability
2. **State management** - Proper React state handling with hooks
3. **Routing** - Client-side navigation without page refreshes
4. **Error handling** - Better error states and user feedback
5. **Performance** - React's virtual DOM for optimized rendering

### Maintained Features:
- All original functionality preserved
- Same visual design and styling
- Same API endpoints and data structures
- Same user workflows and interactions

## Development Notes

- Uses functional components with React Hooks
- Follows React best practices for state management
- Maintains responsive design from original CSS
- Includes error handling and loading states
- Ready for further enhancement and feature additions

## Future Enhancements

The React structure makes it easy to add:
- Unit testing with React Testing Library
- State management with Redux or Context API
- Real-time updates with WebSocket integration
- Progressive Web App (PWA) features
- Enhanced accessibility features