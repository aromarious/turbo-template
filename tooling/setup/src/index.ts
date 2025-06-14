#!/usr/bin/env node
import { execSync } from 'child_process'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { glob } from 'glob'

function replaceInFile(filePath: string, searchValue: string, replaceValue: string): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    const updatedContent = content
      .replace(new RegExp(searchValue, 'g'), replaceValue)
      .replace(new RegExp(replaceValue + '.setup', 'g'), searchValue + '/setup')
    writeFileSync(filePath, updatedContent, 'utf8')
    console.log(`Updated: ${filePath}`)
  } catch (error) {
    console.error(`Error updating ${filePath}:`, (error as Error).message)
  }
}

async function findAndReplaceFiles(
  searchValue: string,
  replaceValue: string,
  projectRoot: string
): Promise<void> {
  const patterns = [
    '**/package.json',
    '**/*.ts',
    '**/*.js',
    '**/*.md',
    '**/*.hbs',
    '**/tsconfig.json',
    '**/eslint.config.js',
    'pnpm-lock.yaml',
  ]

  const ignorePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    '.cache/**',
    'tooling/setup/**',
    'README.md',
  ]

  // Project root is passed as parameter

  for (const pattern of patterns) {
    try {
      const files = await glob(pattern, {
        ignore: ignorePatterns,
        cwd: projectRoot,
      })

      for (const file of files) {
        const fullPath = `${projectRoot}/${file}`
        replaceInFile(fullPath, searchValue, replaceValue)
      }
    } catch (error) {
      console.error(`Error processing pattern ${pattern}:`, (error as Error).message)
    }
  }
}

async function main(): Promise<number> {
  console.log('🚀 Setting up your Turbo template...')

  // Check for environment variable first
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const envPrefix = process.env.PACKAGE_PREFIX

  if (!envPrefix) {
    console.log('No PACKAGE_PREFIX environment variable found. Skipping package prefix rename...')
    return 0
  }

  const newPrefix = envPrefix.trim()
  console.log(`Using package prefix from environment: ${newPrefix}`)

  console.log(`Replacing @acme with ${newPrefix}...`)

  // Get project root
  const projectRoot = process.cwd().replace(/\/tooling\/setup$/, '')

  await findAndReplaceFiles('@acme', newPrefix, projectRoot)

  // Update only dependencies in setup package.json (excluded from glob patterns)
  const setupPackageJson = `${projectRoot}/tooling/setup/package.json`
  if (existsSync(setupPackageJson)) {
    const content = readFileSync(setupPackageJson, 'utf8')
    // Only replace @acme references in dependencies and devDependencies sections
    const updatedContent = content
      .replace(
        /"@acme\/(eslint-config|prettier-config|tsconfig)": "workspace:\*"/g,
        `"${newPrefix}/$1": "workspace:*"`
      )
      .replace(
        /"prettier": "@acme\/prettier-config"/g,
        `"prettier": "${newPrefix}/prettier-config"`
      )
      .replace(/${newPrefix}\/setup/g, `@acme/setup`) // setup だけはもとのprefix
    writeFileSync(setupPackageJson, updatedContent, 'utf8')
    console.log(`Updated setup package dependencies: ${setupPackageJson}`)
  }

  // Update tsconfig.json in setup directory
  const setupTsConfig = `${projectRoot}/tooling/setup/tsconfig.json`
  if (existsSync(setupTsConfig)) {
    replaceInFile(setupTsConfig, '@acme', newPrefix)
  }

  // Remove lock file to force regeneration
  const lockFile = `${projectRoot}/pnpm-lock.yaml`
  if (existsSync(lockFile)) {
    unlinkSync(lockFile)
    console.log('Removed pnpm-lock.yaml')
  }

  // * pnpm clean:workspaces
  console.log('🧹 Cleaning workspace...')
  try {
    execSync('pnpm clean', { stdio: 'inherit', cwd: projectRoot })
    console.log('✅ Workspace cleaned successfully!')
  } catch (error) {
    console.error('Error during pnpm clean:', (error as Error).message)
    return 1
  }

  // * pnpm install --ignore-scripts
  console.log('📦 Installing packages with pnpm...')
  try {
    execSync('pnpm install --ignore-scripts', { stdio: 'inherit', cwd: projectRoot })
    console.log('✅ Dependencies installed successfully!')
  } catch (error) {
    console.error('Error during pnpm install:', (error as Error).message)
    return 1
  }

  // * pnpm build
  console.log('🔨 Building the project...')
  try {
    execSync('pnpm build', { stdio: 'inherit', cwd: projectRoot })
    console.log('✅ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', (error as Error).message)
    return 1
  }

  // Update postinstall script to remove setup-template
  console.log('🔧 Updating postinstall script...')
  const rootPackageJson = `${projectRoot}/package.json`
  if (existsSync(rootPackageJson)) {
    try {
      const packageContent = readFileSync(rootPackageJson, 'utf8')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const packageObj = JSON.parse(packageContent)

      // Remove setup-template from postinstall
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (packageObj.scripts?.postinstall) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        packageObj.scripts.postinstall = packageObj.scripts.postinstall
          .replace('pnpm setup-template && ', '')
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .replace('pnpm -F @acme/setup setup-template && ', '')
      }

      writeFileSync(rootPackageJson, JSON.stringify(packageObj, null, 2) + '\n', 'utf8')
      console.log('✅ Postinstall script updated - setup-template will no longer run automatically')
    } catch (error) {
      console.error('❌ Failed to update postinstall script:', (error as Error).message)
      // Don't return 1 here - setup was successful, just the postinstall update failed
    }
  }

  console.log('✅ Setup complete!')
  return 0
}

main()
  .then((exitCode) => {
    process.exit(exitCode)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
