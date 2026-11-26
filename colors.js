// Color configuration file
// Define all available colors for your products

export const colorMap = {
  'black': '#1c1c1c',
  'white': '#ffffff',
  'red': '#a30000',
  'blue': '#47d6cf',
  'green': '#00ff00',
  'yellow': '#cfc104',
  'army green': '#4b5320',
  'bright orange': '#ff6700',
  'purple': '#800080',
};

export const colorOptions = [
  {value:'black', text:'Black'},
  {value:'white', text:'White'},
  {value:'red', text:'Red'},
  {value:'blue', text:'Blue'},
  {value:'green', text:'Fluorecent Green'},
  {value:'yellow', text:'Yellow'},
  {value:'army green', text:'Army Green'},
  {value:'bright orange', text:'Bright Orange'},
  {value:'purple', text:'Purple'},
];

// Helper function to get color hex by value
export function getColorHex(colorValue) {
  return colorMap[colorValue.toLowerCase()] || '#000000';
}

// Helper function to get color text by value
export function getColorText(colorValue) {
  const option = colorOptions.find(opt => opt.value === colorValue.toLowerCase());
  return option ? option.text : 'Unknown';
}
