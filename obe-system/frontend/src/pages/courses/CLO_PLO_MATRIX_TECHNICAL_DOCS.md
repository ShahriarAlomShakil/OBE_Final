# CLO-PLO Mapping Matrix - Technical Documentation

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLOPLOMatrix.jsx                           │
│                   (Main Component)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Header       │  │ Instructions │  │   Legend     │        │
│  │ & Navigation │  │    Card      │  │    Card      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         Interactive Matrix Table                          │ │
│  │  ┌────────┬─────┬─────┬─────┬─────┐                      │ │
│  │  │CLO/PLO │ PLO1│ PLO2│ PLO3│ PLO4│                      │ │
│  │  ├────────┼─────┼─────┼─────┼─────┤                      │ │
│  │  │  CLO1  │  H  │  M  │     │  L  │ ← Click to cycle     │ │
│  │  ├────────┼─────┼─────┼─────┼─────┤   Or use dropdown    │ │
│  │  │  CLO2  │  M  │  H  │  L  │     │                      │ │
│  │  └────────┴─────┴─────┴─────┴─────┘                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ Statistics   │  │ Action       │                          │
│  │ Cards (4)    │  │ Buttons      │                          │
│  └──────────────┘  └──────────────┘                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │  CLO List    │  │  PLO List    │                          │
│  │  Panel       │  │  Panel       │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│   User       │
│  navigates   │
│  to matrix   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  CLOPLOMatrix Component Mounts           │
│  - useParams() extracts courseId         │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  React Query: Fetch Matrix Data          │
│  - cloPloMappingService.getMatrix()      │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Backend API Call                         │
│  GET /api/v1/clo-plo-mappings/matrix/:id │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Backend Queries Database                 │
│  1. Fetch course & degree_id             │
│  2. Fetch all CLOs for course            │
│  3. Fetch all PLOs for degree            │
│  4. Fetch existing mappings              │
│  5. Build matrix object                  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Response Returns                         │
│  { course, clos, plos, matrix }          │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Component State Initialized              │
│  - matrixData = matrix                   │
│  - hasChanges = false                    │
│  - Render matrix UI                      │
└──────┬───────────────────────────────────┘
       │
       │  User Interaction
       ▼
┌──────────────────────────────────────────┐
│  User Clicks Cell / Changes Dropdown     │
│  - handleCellClick() or                  │
│    handleDropdownChange()                │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Update Local State                       │
│  - matrixData updated                    │
│  - hasChanges = true                     │
│  - UI re-renders with new values         │
└──────┬───────────────────────────────────┘
       │
       │  User Clicks Save
       ▼
┌──────────────────────────────────────────┐
│  Save Mutation Triggered                  │
│  - cloPloMappingService.updateMatrix()   │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Service Converts Matrix to Array        │
│  matrix: { 1: { 5: 3, 6: 2 } }          │
│  →  [{clo_id: 1, plo_id: 5, strength: 3},│
│      {clo_id: 1, plo_id: 6, strength: 2}]│
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Backend API Call                         │
│  POST /api/v1/clo-plo-mappings/bulk      │
│  Body: { mappings: [...] }               │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Backend Processes in Transaction         │
│  For each mapping:                       │
│  - Check if exists → UPDATE              │
│  - Else → INSERT                         │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Success Response                         │
│  - Toast notification shown              │
│  - hasChanges = false                    │
│  - Query invalidated (refetch)           │
└──────────────────────────────────────────┘
```

---

## State Management

### Local State
- **matrixData** - Object storing current mapping strengths
  ```javascript
  {
    [cloId]: {
      [ploId]: strength  // null or 1-3
    }
  }
  ```
- **hasChanges** - Boolean tracking if user has unsaved changes

### React Query Cache
- **Query Key:** `['clo-plo-matrix', courseId]`
- **Stale Time:** 5 minutes (from global config)
- **Refetch:** On window focus disabled
- **Invalidation:** After successful save

---

## Interaction Patterns

### Cell Click Cycle
```javascript
handleCellClick(cloId, ploId) {
  currentValue → newValue
  
  null → 1 (Low)
  1    → 2 (Medium)
  2    → 3 (High)
  3    → null (Empty)
}
```

### Dropdown Selection
```javascript
handleDropdownChange(cloId, ploId, value) {
  value: '' → null
  value: '1' → 1
  value: '2' → 2
  value: '3' → 3
}
```

### Color Mapping
```javascript
getCellColorClass(strength) {
  null → 'bg-gray-100 hover:bg-gray-200'
  1    → 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300'
  2    → 'bg-orange-100 hover:bg-orange-200 border-orange-300'
  3    → 'bg-green-100 hover:bg-green-200 border-green-300'
}
```

---

## API Endpoints

### GET /api/v1/clo-plo-mappings/matrix/:courseId

**Request:**
```
GET /api/v1/clo-plo-mappings/matrix/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "code": "CS101",
      "title": "Introduction to Programming"
    },
    "clos": [
      {
        "id": 1,
        "clo_code": "CLO1",
        "description": "Understand basic programming concepts"
      },
      {
        "id": 2,
        "clo_code": "CLO2",
        "description": "Write simple programs"
      }
    ],
    "plos": [
      {
        "id": 5,
        "plo_code": "PLO1",
        "description": "Apply knowledge of mathematics and computing"
      },
      {
        "id": 6,
        "plo_code": "PLO2",
        "description": "Design and implement solutions"
      }
    ],
    "matrix": {
      "1": {
        "5": 2,
        "6": 1
      },
      "2": {
        "5": 3,
        "6": 2
      }
    }
  }
}
```

### POST /api/v1/clo-plo-mappings/bulk

**Request:**
```json
{
  "mappings": [
    { "clo_id": 1, "plo_id": 5, "mapping_strength": 2 },
    { "clo_id": 1, "plo_id": 6, "mapping_strength": 1 },
    { "clo_id": 2, "plo_id": 5, "mapping_strength": 3 },
    { "clo_id": 2, "plo_id": 6, "mapping_strength": 2 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "4 CLO-PLO mappings processed successfully",
  "data": [
    { "clo_id": 1, "plo_id": 5, "action": "updated" },
    { "clo_id": 1, "plo_id": 6, "action": "created" },
    { "clo_id": 2, "plo_id": 5, "action": "updated" },
    { "clo_id": 2, "plo_id": 6, "action": "updated" }
  ]
}
```

---

## Navigation Flow

### Entry Points to CLO-PLO Matrix:

1. **From Course Detail:**
   ```
   Course Detail → PLO Mapping Tab → "Full Matrix View" Button
   ```

2. **Direct URL:**
   ```
   /courses/:courseId/clo-plo-matrix
   ```

3. **From Course List:**
   ```
   Course List → Course Card → View Details → PLO Mapping Tab → Full Matrix View
   ```

### Exit/Navigation:

1. **Back to Course:**
   - "Back to Course" button → `/courses/:courseId`

2. **To CLO Management:**
   - If no CLOs exist → "Go to CLO Management" → `/courses/:courseId/clos`

3. **To PLO Management:**
   - If no PLOs exist → "Go to PLO Management" → `/plos`

---

## Statistics Calculations

### Coverage Percentage
```javascript
coverage = (totalMappedCells / (totalCLOs × totalPLOs)) × 100

Example:
- 3 CLOs, 4 PLOs = 12 total cells
- 7 cells have mappings
- Coverage = (7 / 12) × 100 = 58.33%
```

### Mapping Counts by Strength
```javascript
lowCount = count(strength === 1)
mediumCount = count(strength === 2)
highCount = count(strength === 3)
totalMappings = lowCount + mediumCount + highCount
```

### Per-CLO Mapping Count
```javascript
cloMappingCount = Object.values(matrix[cloId])
  .filter(v => v !== null)
  .length
```

### Per-PLO Mapping Count
```javascript
ploMappingCount = clos.filter(clo => 
  matrix[clo.id]?.[ploId] !== null
).length
```

---

## Responsive Design

### Desktop (≥1024px)
- Full matrix visible
- Side-by-side CLO/PLO detail panels
- 4-column statistics grid

### Tablet (768px - 1023px)
- Horizontal scroll for matrix
- Side-by-side panels
- 2-column statistics grid

### Mobile (<768px)
- Horizontal scroll for matrix
- Stacked CLO/PLO panels
- Single column statistics

---

## Performance Optimizations

1. **React Query Caching:** Matrix data cached for 5 minutes
2. **Batch Updates:** All mappings saved in single API call
3. **Optimistic Updates:** Could be added for instant UI feedback
4. **Lazy Loading:** Matrix only loads when component mounts
5. **Memoization:** Could add useMemo for statistics calculations

---

## Future Enhancements

### Phase 1 (Optional)
- [ ] Bulk actions: Clear all mappings, Copy from another course
- [ ] Mapping presets: Common patterns (1:1, cascading, etc.)
- [ ] Export matrix as CSV/Excel
- [ ] Print-friendly view

### Phase 2 (Advanced)
- [ ] Drag-and-drop mapping strength
- [ ] Visual heatmap mode (gradient colors)
- [ ] Comparison view: Compare mappings across courses
- [ ] Validation warnings: Unmapped CLOs/PLOs highlighted
- [ ] Suggestions: AI-powered mapping recommendations

### Phase 3 (Analytics)
- [ ] Historical tracking: See mapping changes over time
- [ ] Impact analysis: Which courses contribute most to each PLO
- [ ] Gap detection: PLOs with insufficient coverage
- [ ] Attainment preview: Estimated PLO attainment based on mappings

---

## Testing Checklist

### Functional Tests
- [ ] Matrix loads correctly with existing mappings
- [ ] Cell click cycles through strengths properly
- [ ] Dropdown selection updates matrix
- [ ] Save persists all changes to backend
- [ ] Reset discards unsaved changes
- [ ] Statistics calculate correctly
- [ ] Empty state shows when no CLOs/PLOs
- [ ] Tooltips display on PLO header hover
- [ ] Navigation buttons work correctly

### Edge Cases
- [ ] No CLOs defined → Redirect to CLO Management
- [ ] No PLOs defined → Redirect to PLO Management
- [ ] Large matrix (20+ CLOs, 15+ PLOs) → Scrollable
- [ ] Network error → Error message displayed
- [ ] Unsaved changes → Warning indicator shows

### UI/UX Tests
- [ ] Colors match design specifications
- [ ] Responsive on mobile, tablet, desktop
- [ ] Loading states show during fetch/save
- [ ] Toast notifications work
- [ ] Keyboard navigation functional

---

## Troubleshooting

### Common Issues

**Problem:** Matrix shows empty even though mappings exist  
**Solution:** Check backend returns correct matrix format, verify CLO/PLO IDs match

**Problem:** Save fails silently  
**Solution:** Check browser console for errors, verify API endpoint, check authentication token

**Problem:** Cell colors not showing  
**Solution:** Verify Tailwind CSS classes are loaded, check bg-yellow-100, etc. are in config

**Problem:** PLO tooltips not appearing  
**Solution:** Check z-index values, ensure parent container doesn't have overflow-hidden

---

## Code Quality

### ESLint Status
✅ No errors  
✅ No warnings  
✅ Proper hooks usage (useState, useQuery, useMutation)  
✅ No unused imports

### Best Practices Applied
- ✅ Functional components with hooks
- ✅ Proper error handling
- ✅ Loading states
- ✅ Accessible UI (tooltips, aria-labels)
- ✅ Semantic HTML
- ✅ Clean code structure
- ✅ Comprehensive comments

---

## Dependencies

### Required Packages
- `react` - Core React library
- `react-router-dom` - Routing (useParams, useNavigate)
- `@tanstack/react-query` - Data fetching and caching
- `react-hot-toast` - Toast notifications
- `tailwindcss` - Styling

### Internal Dependencies
- `../../services/cloPloMappingService` - API service
- `../../components/ui` - UI components (Button, Spinner, Alert, Card)

---

## Maintenance Notes

### When modifying this component:
1. **Changing colors:** Update getCellColorClass() function
2. **Adding strengths:** Update cycle logic in handleCellClick()
3. **API changes:** Update service method calls
4. **New statistics:** Add calculations in statistics section

### Related backend files:
- `/obe-system/backend/routes/clo-plo-mappings.js`
- `/obe-system/backend/controllers/CLOPLOController.js` (if exists)
- Database table: `clo_plo_mapping`

---

**Last Updated:** February 4, 2026  
**Maintained by:** Development Team
