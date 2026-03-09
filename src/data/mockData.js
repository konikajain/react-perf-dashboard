export const COMPONENT_ITEMS = Array.from({ length: 200 }, (_, i) => ({
    id: i,
    name:
      ['Button', 'Card', 'Modal', 'Input', 'Table',
       'Chart', 'Nav', 'Form', 'Badge', 'Tooltip'][i % 10] + ` #${i + 1}`,
    size: Math.floor(Math.random() * 60 + 5),
  }))
  
  export const BUNDLES = [
    { name: 'main.js',          raw: 820,  optimized: 210 },
    { name: 'vendor.js',        raw: 1400, optimized: 480 },
    { name: 'recharts.js',      raw: 340,  optimized: 90  },
    { name: 'framer-motion.js', raw: 280,  optimized: 68  },
  ]