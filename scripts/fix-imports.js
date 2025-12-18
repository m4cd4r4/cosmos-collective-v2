#!/usr/bin/env node

/**
 * Import Path Fixer
 *
 * Automatically updates import paths in migrated components from The Great Expanse
 * to match the Cosmos Collective structure.
 *
 * Usage: node scripts/fix-imports.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan for files that need import fixes
const DIRS_TO_SCAN = [
  'src/components/features/launch',
  'src/components/features/agency',
  'src/components/features/vehicle',
  'src/components/features/video',
  'src/components/features/arcade',
  'src/lib/api',
  'src/lib/queries',
  'src/lib/stores',
  'src/app/api/launches',
  'src/app/api/predictions',
];

// Import path mappings (old pattern -> new pattern)
const IMPORT_MAPPINGS = [
  // Library imports
  { from: /from ['"]@\/lib\/api\/launch-library['"]/g, to: "from '@/lib/api/launch-library'" },
  { from: /from ['"]@\/lib\/queries\/keys['"]/g, to: "from '@/lib/queries/keys'" },
  { from: /from ['"]@\/lib\/queries\/launches['"]/g, to: "from '@/lib/queries/launches'" },
  { from: /from ['"]@\/lib\/stores\/preferences['"]/g, to: "from '@/lib/stores/preferences'" },
  { from: /from ['"]@\/lib\/stores\/ui['"]/g, to: "from '@/lib/stores/ui'" },
  { from: /from ['"]@\/lib\/utils['"]/g, to: "from '@/lib/utils'" },

  // Type imports
  { from: /from ['"]@\/types\/launch['"]/g, to: "from '@/types/launch'" },
  { from: /from ['"]@\/types\/agency['"]/g, to: "from '@/types/agency'" },
  { from: /from ['"]@\/types\/vehicle['"]/g, to: "from '@/types/vehicle'" },
  { from: /from ['"]@\/types\/video['"]/g, to: "from '@/types/video'" },
  { from: /from ['"]@\/types\/prediction['"]/g, to: "from '@/types/prediction'" },
  { from: /from ['"]@\/types\/common['"]/g, to: "from '@/types/common'" },

  // Component imports - arcade
  { from: /from ['"]@\/components\/arcade\/games\//g, to: "from '@/components/features/arcade/games/" },
  { from: /from ['"]@\/components\/arcade\//g, to: "from '@/components/features/arcade/" },

  // Component imports - video
  { from: /from ['"]@\/components\/video\//g, to: "from '@/components/features/video/" },

  // Component imports - launch
  { from: /from ['"]@\/components\/launch\//g, to: "from '@/components/features/launch/" },
  { from: /from ['"]@\/components\/home\/upcoming-launches['"]/g, to: "from '@/components/features/launch/UpcomingLaunches'" },
  { from: /from ['"]@\/components\/home\/status-bar['"]/g, to: "from '@/components/features/launch/StatusBar'" },

  // Component imports - agency/vehicle
  { from: /from ['"]@\/components\/agency\//g, to: "from '@/components/features/agency/" },
  { from: /from ['"]@\/components\/vehicle\//g, to: "from '@/components/features/vehicle/" },

  // UI components - fix relative imports and case sensitivity
  { from: /from ['"]\.\.\/ui\/badge['"]/g, to: "from '@/components/ui/Badge'" },
  { from: /from ['"]\.\.\/ui\/spinner['"]/g, to: "from '@/components/ui/Spinner'" },
  { from: /from ['"]\.\.\/ui\/button['"]/g, to: "from '@/components/ui/Button'" },
  { from: /from ['"]\.\.\/ui\/card['"]/g, to: "from '@/components/ui/Card'" },
  { from: /from ['"]@\/components\/ui\/badge['"]/g, to: "from '@/components/ui/Badge'" },
  { from: /from ['"]@\/components\/ui\/spinner['"]/g, to: "from '@/components/ui/Spinner'" },
  { from: /from ['"]@\/components\/ui\/button['"]/g, to: "from '@/components/ui/Button'" },
  { from: /from ['"]@\/components\/ui\/card['"]/g, to: "from '@/components/ui/Card'" },

  // Utility imports - fix path variations
  { from: /from ['"]@\/lib\/utils\/cn['"]/g, to: "from '@/lib/utils'" },

  // API imports - fix external → api
  { from: /from ['"]@\/lib\/external\/launch-library['"]/g, to: "from '@/lib/api/launch-library'" },

  // Arcade game imports - fix to games subdirectory
  { from: /from ['"]\.\/(asteroids-game)['"]/g, to: "from './games/$1'" },
  { from: /from ['"]\.\/(invaders-game)['"]/g, to: "from './games/$1'" },
  { from: /from ['"]\.\/(snake-game)['"]/g, to: "from './games/$1'" },
  { from: /from ['"]\.\/(breakout-game)['"]/g, to: "from './games/$1'" },
  { from: /from ['"]\.\/(missile-command-game)['"]/g, to: "from './games/$1'" },
  { from: /from ['"]\.\/(thrust-game)['"]/g, to: "from './games/$1'" },
  { from: /from ['"]\.\/(defender-game)['"]/g, to: "from './games/$1'" },
  { from: /from ['"]\.\/(lunar-lander-game)['"]/g, to: "from './games/$1'" },

  // Video component imports - fix relative paths and case
  { from: /from ['"]\.\/(youtube-embed)['"]/g, to: "from './YouTubeEmbed'" },
  { from: /from ['"]\.\.\/video\/video-card['"]/g, to: "from '@/components/features/video/VideoCard'" },

  // Launch component imports - fix relative paths
  { from: /from ['"]\.\.\/launch\/launch-countdown['"]/g, to: "from './LaunchCountdown'" },

  // Remove age-mode references (to be replaced with SimpleExplanation)
  { from: /from ['"]@\/lib\/providers\/age-mode-provider['"]/g, to: "// REMOVED: from '@/lib/providers/age-mode-provider' (replaced with SimpleExplanation)" },
  { from: /from ['"]@\/components\/ui\/age-mode-toggle['"]/g, to: "// REMOVED: from '@/components/ui/age-mode-toggle' (replaced with SimpleExplanation)" },
];

// Stats tracking
let stats = {
  filesScanned: 0,
  filesModified: 0,
  importsFixed: 0,
  errors: [],
};

/**
 * Recursively get all .ts, .tsx files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return arrayOfFiles;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.match(/\.(ts|tsx)$/)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Fix import paths in a single file
 */
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changesInFile = 0;

    // Apply each import mapping
    IMPORT_MAPPINGS.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        changesInFile += matches.length;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.importsFixed += changesInFile;
      console.log(`✅ Fixed ${changesInFile} import(s) in: ${path.relative(process.cwd(), filePath)}`);
    }

    stats.filesScanned++;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Import Path Fixer - Starting...\n');
  console.log('Scanning directories:');
  DIRS_TO_SCAN.forEach(dir => console.log(`  - ${dir}`));
  console.log('');

  // Collect all files to process
  let allFiles = [];
  DIRS_TO_SCAN.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    const files = getAllFiles(fullPath);
    allFiles = allFiles.concat(files);
  });

  console.log(`Found ${allFiles.length} TypeScript files\n`);

  // Process each file
  allFiles.forEach(fixImportsInFile);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`Files scanned:   ${stats.filesScanned}`);
  console.log(`Files modified:  ${stats.filesModified}`);
  console.log(`Imports fixed:   ${stats.importsFixed}`);
  console.log(`Errors:          ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`);
    });
  }

  console.log('\n✨ Import path fixing complete!');

  if (stats.filesModified > 0) {
    console.log('\n📝 Next steps:');
    console.log('  1. Review the changes: git diff');
    console.log('  2. Check for missing UI components (Badge, Spinner)');
    console.log('  3. Run type check: npm run type-check');
    console.log('  4. Fix any remaining TypeScript errors');
  }
}

// Run the script
main();
