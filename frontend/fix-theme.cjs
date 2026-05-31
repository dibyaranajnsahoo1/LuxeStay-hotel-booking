const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Replace text-dark-950 with text-[#0a0a0f] in components
function replaceInFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('text-dark-950')) {
        content = content.replace(/text-dark-950/g, 'text-[#0a0a0f]');
        fs.writeFileSync(fullPath, content);
        console.log('Fixed text-dark-950 in', fullPath);
      }
    }
  }
}
replaceInFiles(srcDir);

// 2. Update tailwind.config.js
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');
let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');

const newDark = `        dark: {
          DEFAULT: 'rgb(var(--color-dark-950) / <alpha-value>)',
          50: 'rgb(var(--color-dark-50) / <alpha-value>)',
          100: 'rgb(var(--color-dark-100) / <alpha-value>)',
          200: 'rgb(var(--color-dark-200) / <alpha-value>)',
          300: 'rgb(var(--color-dark-300) / <alpha-value>)',
          400: 'rgb(var(--color-dark-400) / <alpha-value>)',
          500: 'rgb(var(--color-dark-500) / <alpha-value>)',
          600: 'rgb(var(--color-dark-600) / <alpha-value>)',
          700: 'rgb(var(--color-dark-700) / <alpha-value>)',
          800: 'rgb(var(--color-dark-800) / <alpha-value>)',
          900: 'rgb(var(--color-dark-900) / <alpha-value>)',
          950: 'rgb(var(--color-dark-950) / <alpha-value>)',
        },
        white: 'rgb(var(--color-white) / <alpha-value>)',`;

tailwindConfig = tailwindConfig.replace(/dark:\s*\{[\s\S]*?950:\s*'#0a0a0f',\s*\}/, newDark);
tailwindConfig = tailwindConfig.replace(
  /'hero-gradient':.*/, 
  `'hero-gradient': 'linear-gradient(135deg, rgb(var(--color-dark-950)) 0%, rgb(var(--color-dark-900)) 50%, rgb(var(--color-dark-800)) 100%)',`
);
tailwindConfig = tailwindConfig.replace(
  /'card-gradient':.*/, 
  `'card-gradient': 'linear-gradient(to bottom, transparent 50%, rgb(var(--color-dark-950) / 0.9) 100%)',`
);
fs.writeFileSync(tailwindConfigPath, tailwindConfig);
console.log('Updated tailwind.config.js');

// 3. Update index.css
const indexCssPath = path.join(srcDir, 'index.css');
let indexCss = fs.readFileSync(indexCssPath, 'utf8');

const newCssVars = `:root,
html.light {
  /* Dynamic colors for light mode mapping to tailwind's dark scale */
  --color-dark-50:  10, 10, 15;
  --color-dark-100: 23, 23, 31;
  --color-dark-200: 37, 37, 53;
  --color-dark-300: 15, 15, 26;
  --color-dark-400: 107, 107, 136;
  --color-dark-500: 58, 58, 85;
  --color-dark-600: 200, 200, 216;
  --color-dark-700: 232, 232, 240;
  --color-dark-800: 255, 255, 255;
  --color-dark-900: 240, 240, 246;
  --color-dark-950: 244, 244, 248;
  --color-white:    15, 15, 26;

  /* Legacy CSS vars for existing components */
  --bg-base:        #f4f4f8;
  --bg-surface:     #ffffff;
  --bg-elevated:    #f0f0f6;
  --bg-overlay:     #e8e8f0;
  --bg-input:       #ffffff;
  --border-subtle:  #dddde8;
  --border-default: #c8c8d8;
  --border-strong:  #a8a8c0;
  --text-primary:   #0f0f1a;
  --text-secondary: #3a3a55;
  --text-muted:     #6b6b88;
  --text-faint:     #9898b0;
  --text-inverse:   #ffffff;
  --gold:           #b8860b;
  --gold-light:     #d4a842;
  --gold-bg:        rgba(212,168,66,0.08);
  --gold-border:    rgba(212,168,66,0.25);
  --shadow-card:    0 4px 24px rgba(0,0,0,0.08);
  --shadow-hover:   0 12px 40px rgba(0,0,0,0.14);
  --shadow-glow:    0 0 20px rgba(184,134,11,0.25);
  --success-bg:     rgba(34,197,94,0.1);
  --success-text:   #16a34a;
  --error-bg:       rgba(239,68,68,0.1);
  --error-text:     #dc2626;
  --warning-bg:     rgba(234,179,8,0.1);
  --warning-text:   #ca8a04;
  --info-bg:        rgba(59,130,246,0.1);
  --info-text:      #2563eb;
}

html.dark {
  /* Dynamic colors for dark mode mapping to tailwind's dark scale */
  --color-dark-50:  245, 245, 247;
  --color-dark-100: 235, 235, 240;
  --color-dark-200: 209, 209, 219;
  --color-dark-300: 168, 168, 184;
  --color-dark-400: 120, 120, 144;
  --color-dark-500: 90, 90, 114;
  --color-dark-600: 72, 72, 96;
  --color-dark-700: 58, 58, 80;
  --color-dark-800: 37, 37, 53;
  --color-dark-900: 23, 23, 31;
  --color-dark-950: 10, 10, 15;
  --color-white:    255, 255, 255;

  /* Legacy CSS vars for existing components */
  --bg-base:        #0a0a0f;
  --bg-surface:     #17171f;
  --bg-elevated:    #252535;
  --bg-overlay:     #3a3a50;
  --bg-input:       #252535;
  --border-subtle:  #252535;
  --border-default: #3a3a50;
  --border-strong:  #484860;
  --text-primary:   #f0f0f5;
  --text-secondary: #d1d1db;
  --text-muted:     #787890;
  --text-faint:     #484860;
  --text-inverse:   #0a0a0f;
  --gold:           #d4a842;
  --gold-light:     #f0c866;
  --gold-bg:        rgba(212,168,66,0.10);
  --gold-border:    rgba(212,168,66,0.30);
  --shadow-card:    0 4px 24px rgba(0,0,0,0.35);
  --shadow-hover:   0 12px 40px rgba(0,0,0,0.5);
  --shadow-glow:    0 0 20px rgba(212,168,66,0.30);
  --success-bg:     rgba(34,197,94,0.10);
  --success-text:   #4ade80;
  --error-bg:       rgba(239,68,68,0.10);
  --error-text:     #f87171;
  --warning-bg:     rgba(234,179,8,0.10);
  --warning-text:   #facc15;
  --info-bg:        rgba(59,130,246,0.10);
  --info-text:      #60a5fa;
}`;

// Replace everything from `:root,` up to just before `/* =====================================================` for BASE STYLES
indexCss = indexCss.replace(/:root,[\s\S]*?}\n\n\/\* ===/g, newCssVars + '\n\n/* ===');

// Remove the hacky html.light overrides
const hackyRegex = /  html\.light \.text-white \{[\s\S]*?html\.light \.text-dark-300 \{ color: var\(--text-primary\) !important; \}/;
indexCss = indexCss.replace(hackyRegex, '');

fs.writeFileSync(indexCssPath, indexCss);
console.log('Updated index.css');
