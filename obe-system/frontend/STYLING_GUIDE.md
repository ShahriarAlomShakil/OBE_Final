# OBE System - Styling Guide

## Overview

The OBE System frontend uses a professional Tailwind CSS configuration with a comprehensive custom styling system. This guide documents all available styles, utilities, and best practices.

## Color Palette

### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary (Blue)** | #3B82F6 | Main actions, links, primary buttons |
| **Secondary (Indigo)** | #6366F1 | Secondary actions, accents |
| **Success (Green)** | #10B981 | Success messages, positive actions |
| **Warning (Amber)** | #F59E0B | Warnings, caution alerts |
| **Danger (Red)** | #EF4444 | Errors, delete actions, critical alerts |
| **Gray** | 50-950 scale | Backgrounds, text, borders |

Each color has a full shade palette from 50 (lightest) to 950 (darkest).

### Usage in Tailwind

```jsx
// Background
<div className="bg-primary-500"></div>
<div className="bg-success-600"></div>

// Text
<span className="text-danger-600">Error message</span>

// Border
<div className="border border-warning-500"></div>
```

## Typography

### Font Family

- **Primary Font:** Inter (loaded from Google Fonts)
- **Fallback:** System UI fonts for optimal performance

### Headings

All headings use `font-semibold` and `text-gray-900` by default:

```jsx
<h1>Heading 1 - 4xl/5xl</h1>
<h2>Heading 2 - 3xl/4xl</h2>
<h3>Heading 3 - 2xl/3xl</h3>
<h4>Heading 4 - xl/2xl</h4>
<h5>Heading 5 - lg/xl</h5>
<h6>Heading 6 - base/lg</h6>
```

### Paragraphs

```jsx
<p>Regular paragraph with text-gray-700 and relaxed line height</p>
```

## Buttons

### Solid Buttons

```jsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-success">Success Action</button>
<button className="btn-warning">Warning Action</button>
<button className="btn-danger">Delete Action</button>
```

### Outline Buttons

```jsx
<button className="btn-outline">Default Outline</button>
<button className="btn-outline-primary">Primary Outline</button>
<button className="btn-outline-secondary">Secondary Outline</button>
<button className="btn-outline-danger">Danger Outline</button>
```

### Ghost Buttons

```jsx
<button className="btn-ghost">Ghost Button</button>
<button className="btn-ghost-primary">Ghost Primary</button>
```

### Button Sizes

```jsx
<button className="btn-primary btn-sm">Small</button>
<button className="btn-primary">Medium (default)</button>
<button className="btn-primary btn-lg">Large</button>
<button className="btn-primary btn-xl">Extra Large</button>
```

### Icon Buttons

```jsx
<button className="btn-icon btn-primary">
  <IconComponent />
</button>
<button className="btn-icon-sm btn-secondary">
  <IconComponent />
</button>
```

### Loading State

```jsx
<button className="btn-primary btn-loading">Loading...</button>
```

### Disabled State

```jsx
<button className="btn-primary" disabled>Disabled</button>
```

## Form Inputs

### Text Input

```jsx
<div>
  <label className="label">Email Address</label>
  <input type="email" className="input" placeholder="Enter email" />
</div>
```

### Input with Required Label

```jsx
<label className="label label-required">Password</label>
```

### Input States

```jsx
// Error state
<input className="input input-error" />
<p className="error-message">Error text here</p>

// Success state
<input className="input input-success" />

// Disabled state
<input className="input" disabled />
```

### Input Sizes

```jsx
<input className="input input-sm" placeholder="Small input" />
<input className="input" placeholder="Normal input" />
<input className="input input-lg" placeholder="Large input" />
```

### Select Dropdown

```jsx
<select className="select">
  <option>Select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Textarea

```jsx
<textarea className="textarea" placeholder="Enter description"></textarea>
```

### Checkbox

```jsx
<div className="flex items-center gap-2">
  <input type="checkbox" id="check1" className="checkbox" />
  <label htmlFor="check1">Checkbox Label</label>
</div>
```

### Radio Button

```jsx
<div className="flex items-center gap-2">
  <input type="radio" id="radio1" name="group" className="radio" />
  <label htmlFor="radio1">Radio Label</label>
</div>
```

### Toggle/Switch

```jsx
<button className="toggle">
  <span className="toggle-slider"></span>
</button>

// Active state
<button className="toggle active">
  <span className="toggle-slider"></span>
</button>
```

### Helper Text

```jsx
<p className="helper-text">This is helper text for the input</p>
```

## Tables

### Basic Table

```jsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <th>Column 3</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 3</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Sortable Columns

```jsx
<th className="sortable">Sortable Column</th>
<th className="sortable asc">Ascending</th>
<th className="sortable desc">Descending</th>
```

### Table Variants

```jsx
// Striped rows
<table className="table table-striped">

// Compact spacing
<table className="table table-compact">
```

## Cards

### Standard Card

```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
    <p className="card-subtitle">Card subtitle</p>
  </div>
  <div className="card-body">
    Card content goes here
  </div>
  <div className="card-footer">
    <button className="btn-primary">Action</button>
  </div>
</div>
```

### Card Variants

```jsx
// Bordered card (no shadow)
<div className="card card-bordered">

// Flat card (no shadow or border)
<div className="card card-flat">

// Hover effect (lift on hover)
<div className="card card-hover">

// Compact padding
<div className="card card-compact">
```

## Badges/Status

```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
  Active
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
  Pending
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
  Inactive
</span>
```

## Utility Classes

### Gradient Backgrounds

```jsx
<div className="bg-gradient-primary">Primary gradient</div>
<div className="bg-gradient-secondary">Secondary gradient</div>
<div className="bg-gradient-success">Success gradient</div>
```

### Glassmorphism

```jsx
<div className="glass">Glassmorphism effect</div>
```

### Line Clamping

```jsx
<p className="line-clamp-2">Text truncated to 2 lines...</p>
<p className="line-clamp-3">Text truncated to 3 lines...</p>
```

### Skeleton Loading

```jsx
<div className="skeleton h-4 w-full"></div>
<div className="skeleton h-10 w-32"></div>
```

## Layout Utilities

### Container

```jsx
<div className="container mx-auto">
  Centered container with responsive padding
</div>
```

### Spacing

Standard Tailwind spacing plus custom sizes:
- `spacing-128` (32rem)
- `spacing-144` (36rem)

### Shadows

```jsx
<div className="shadow-soft">Soft shadow</div>
<div className="shadow-card">Card shadow</div>
<div className="shadow-dropdown">Dropdown shadow</div>
```

### Border Radius

```jsx
<div className="rounded-card">Card border radius (0.75rem)</div>
```

## Best Practices

### 1. Use Semantic Colors

```jsx
// ✅ Good
<button className="btn-danger">Delete</button>

// ❌ Avoid
<button className="bg-red-500 text-white px-4 py-2">Delete</button>
```

### 2. Consistent Spacing

Use the standard spacing scale:
```jsx
<div className="space-y-4"> {/* Vertical spacing */}
<div className="space-x-2"> {/* Horizontal spacing */}
```

### 3. Accessibility

Always include focus states and proper ARIA labels:
```jsx
<button className="btn-primary" aria-label="Submit form">
  Submit
</button>
```

### 4. Responsive Design

Use Tailwind's responsive prefixes:
```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>
```

### 5. State Management

Use consistent state styling:
```jsx
// Loading
<div className="opacity-50 pointer-events-none">

// Disabled
<button disabled className="btn-primary">

// Error
<input className="input input-error" />
```

## Custom Scrollbar

Custom scrollbar styling is automatically applied to all scrollable elements:
- Width/Height: 8px
- Track: Gray-100
- Thumb: Gray-300 (hover: Gray-400)
- Rounded thumb

## Focus States

All interactive elements have custom focus rings for accessibility:
- Ring width: 2px
- Ring color: Primary-500
- Ring offset: 2px

## Animation & Transitions

All components include smooth transitions:
- Duration: 200ms
- Easing: ease-in-out

## Viewing the Style Guide

To view all components and styles in action:

```jsx
import StyleGuide from './pages/StyleGuide';

// Add to your router
<Route path="/style-guide" element={<StyleGuide />} />
```

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- Project-specific styles: `/src/styles/index.css`
- Tailwind config: `/tailwind.config.js`

---

**Last Updated:** February 4, 2026
