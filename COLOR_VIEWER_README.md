# Color Viewer Implementation

## Overview
A real-time color viewer has been added to all product pages. When users select a color from the dropdown, they can see:
- A live color preview box
- The color name
- The hex color code

## How It Works

### In product.html
The `createColorSelect()` function has been enhanced to include:
1. **Color dropdown** - Select from available colors
2. **Live color preview** - Visual box showing the selected color
3. **Color information** - Displays the color name and hex value

### Color Configuration (colors.js)
A separate `colors.js` file has been created to manage all colors centrally. This allows you to:
- Add new colors easily
- Modify existing colors
- Share color definitions across files

## Adding Custom Colors

### Option 1: Update colors.js
Edit the `colorMap` and `colorOptions` objects in `colors.js`:

```javascript
export const colorMap = {
  'black': '#000000',
  'white': '#ffffff',
  'red': '#ff0000',
  'blue': '#0000ff',
  'green': '#00ff00',
  'yellow': '#ffff00',
  'purple': '#800080',  // Add new color
  'orange': '#ff8000'   // Add new color
};

export const colorOptions = [
  {value:'black', text:'Black'},
  {value:'white', text:'White'},
  {value:'red', text:'Red'},
  {value:'blue', text:'Blue'},
  {value:'green', text:'Fluorecent Green'},
  {value:'yellow', text:'Yellow'},
  {value:'purple', text:'Purple'},  // Add new option
  {value:'orange', text:'Orange'}   // Add new option
];
```

### Option 2: Modify product.html directly
The color options are defined inside the `createColorSelect()` function. Edit the `colorOptions` array directly:

```javascript
const colorOptions = [
  {value:'black',text:'Black'},
  {value:'white',text:'White'},
  {value:'red',text:'Red'},
  {value:'blue',text:'Blue'},
  {value:'green',text:'Fluorecent Green'},
  {value:'yellow',text:'Yellow'},
  {value:'purple',text:'Purple'},  // Add new option
  {value:'orange',text:'Orange'}   // Add new option
];
```

And update the `colorMap` object at the top of the script section:

```javascript
const colorMap = {
  'black': '#000000',
  'white': '#ffffff',
  'red': '#ff0000',
  'blue': '#0000ff',
  'green': '#00ff00',
  'yellow': '#ffff00',
  'purple': '#800080',  // Add new color
  'orange': '#ff8000'   // Add new color
};
```

## Features

### Real-time Preview
When a user selects a color from the dropdown, the color viewer immediately shows:
- A 50x50px color box with rounded corners
- The color name below the box
- The hex code

### Styling
The color viewer is styled to match your existing design:
- Uses your blue accent color (#4f8cff) for the border
- Integrates seamlessly with your dark theme (#181a1b, #23272f)
- Responsive layout that works on all product pages

### Compatible with All Products
The enhanced color viewer works with all products that use color selection:
- Vases (Spiral, Strata, MCM, Wave, Evergreen, Japandi)
- Spotify Keychain
- Piramide
- Corn Fidget Toy
- Middle Finger Lighter
- Battery Dispenser
- Name Keychain
- Guitar Wall Mount
- Gridfinity Hollow Bin

## Color Values Reference

| Name | Value | Hex Code |
|------|-------|----------|
| Black | `black` | `#000000` |
| White | `white` | `#ffffff` |
| Red | `red` | `#ff0000` |
| Blue | `blue` | `#0000ff` |
| Fluorecent Green | `green` | `#00ff00` |
| Yellow | `yellow` | `#ffff00` |

## Future Enhancements
- Add color swatches/buttons instead of dropdown
- Support for custom hex input
- Color picker modal
- Color combination suggestions
- Product image color customization based on selection
