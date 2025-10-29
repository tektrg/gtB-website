# CSS Centralization Refactoring

## Overview
Refactored the price calculator page to use centralized, reusable CSS components instead of page-specific inline styles.

## Changes Made

### 1. Created New CSS File: `/src/styles/calculator.css`

This new file contains reusable components for:

#### Calculator Input Components
- `.calculator-inputs` - Grid layout for input fields
- `.input-group` - Container for label, field, and hint
- `.input-label` - Styled labels
- `.input-field` - Consistent input styling with focus states
- `.input-hint` - Helper text below inputs
- `.info-box` - Information callout boxes

#### Data Table Components
- `.table-wrapper` - Responsive table container
- `.data-table` - Main table styling
- `.th-left`, `.th-right`, `.th-center` - Column alignment utilities
- `.highlighted` - Highlight rows (e.g., cheapest option)
- `.selected` - Selected row state

#### Badge Components
- `.badge` - Generic badge styling
- `.badge-primary` - Primary colored badge (accent blue)
- `.badge-secondary` - Secondary colored badge (gray)

#### Text Formatting
- `.text-primary` - Primary text style
- `.text-secondary` - Secondary/muted text
- `.text-small` - Small text
- `.text-large` - Large emphasized text
- `.text-highlight` - Highlighted text (accent color)
- `.text-left`, `.text-right`, `.text-center` - Alignment utilities

#### Button Components
- `.btn-select` - Selection toggle button
- `.btn-select.active` - Active state for selected items
- `.btn-remove` - Remove/close button with hover effects

#### Card Grid Layouts
- `.card-grid` - Responsive grid for cards
- `.data-card` - Individual card styling
- `.card-header` - Card header with title/subtitle
- `.card-title` - Card title text
- `.card-subtitle` - Card subtitle text

#### Data Display Components
- `.data-rows` - Container for data rows
- `.data-row` - Individual data row (label-value pair)
- `.data-label` - Label for data
- `.data-value` - Value for data
- `.data-row.emphasized` - Emphasized row (e.g., totals)
- `.data-footer` - Footer information

#### Utility Classes
- `.section-background` - Section with background color
- `.hidden` - Hide elements
- Responsive breakpoints at 768px

### 2. Updated `/src/pages/price-calculator.astro`

#### Imports
- Added `import "@/styles/calculator.css";`

#### HTML Class Changes
- `models-table` → `data-table`
- `th-rank`, `th-model`, `th-provider` → `th-left`
- `th-price`, `th-total` → `th-right`
- `th-action` → `th-center`
- `comparison-section` → `section-background`
- `comparison-grid` → `card-grid`
- `comparison-card` → `data-card`
- `comparison-card-header` → `card-header`
- `comparison-card-title` → `card-title`
- `comparison-card-provider` → `card-subtitle`
- `cost-breakdown` → `data-rows`
- `cost-row` → `data-row`
- `cost-label` → `data-label`
- `cost-value` → `data-value`
- `cost-row.total` → `data-row.emphasized`
- `context-info` → `data-footer`
- `cheapest` → `highlighted`
- `rank-badge` → `badge`
- `rank-badge.top` → `badge-primary`
- `rank-badge.normal` → `badge-secondary`
- `model-name` → `text-primary`
- `model-context` → `text-small`
- `provider-name` → `text-secondary`
- `price-value` → `text-secondary`
- `total-cost` → `text-large`
- `total-cost.free` → `text-highlight`
- `select-btn` → `btn-select`
- `select-btn.selected` → `btn-select.active`
- `remove-btn` → `btn-remove`

#### Style Block
- Removed ~300 lines of CSS
- Kept only 1 page-specific style (`.subtle`)

#### JavaScript Updates
- Updated all class names in `renderTable()` function
- Updated all class names in `updateComparison()` function
- Changed `style.display` to `classList.add/remove('hidden')`
- Removed inline styles from HTML generation

## Benefits

### Maintainability
- Single source of truth for component styles
- Easy to update design system across multiple pages
- Clear naming conventions (semantic, not presentational)

### Reusability
- Components can be used on any calculator/data visualization page
- No duplicate CSS code
- Consistent design patterns

### Performance
- Reduced page-specific CSS
- Better browser caching (shared CSS file)
- Smaller HTML file size

### Developer Experience
- Clear component structure
- Easy to understand what each class does
- Better separation of concerns

## Usage Examples

### For Future Pages

If you need to create another data comparison page:

```astro
---
import Base from "@/layouts/Base.astro";
import "@/styles/calculator.css";
---

<Base>
  <section>
    <div class="container">
      <!-- Calculator inputs -->
      <div class="calculator-inputs">
        <div class="input-group">
          <label class="input-label">Input Label</label>
          <input type="text" class="input-field" />
          <p class="input-hint">Helper text</p>
        </div>
      </div>

      <!-- Data table -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-left">Column 1</th>
              <th class="th-right">Column 2</th>
            </tr>
          </thead>
          <tbody>
            <tr class="highlighted">
              <td><span class="badge badge-primary">1</span></td>
              <td class="text-right"><span class="text-large">$10</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Comparison cards -->
      <div class="card-grid">
        <div class="data-card">
          <div class="card-header">
            <div>
              <div class="card-title">Title</div>
              <div class="card-subtitle">Subtitle</div>
            </div>
            <button class="btn-remove">×</button>
          </div>
          <div class="data-rows">
            <div class="data-row">
              <span class="data-label">Label:</span>
              <span class="data-value">Value</span>
            </div>
            <div class="data-row emphasized">
              <span class="data-label">Total:</span>
              <span class="data-value">$100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</Base>
```

## Files Modified

1. **Created**: `/src/styles/calculator.css` (369 lines)
2. **Modified**: `/src/pages/price-calculator.astro`
   - Reduced from ~694 lines to ~370 lines
   - Removed ~324 lines of duplicate CSS

## Next Steps

Consider applying this pattern to other pages:
- Any future pricing/comparison tools
- Data visualization pages
- Analytics dashboards
- Report pages with tables and cards
