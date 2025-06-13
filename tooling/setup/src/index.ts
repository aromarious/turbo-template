#!/usr/bin/env node
import { execSync } from 'child_process'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { createInterface } from 'readline'
import { glob } from 'glob'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function promptForPrefix(): Promise<string> {
  return new Promise((resolve) => {
    rl.question('Enter your package prefix (e.g., @mycompany): ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function replaceInFile(filePath: string, searchValue: string, replaceValue: string): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    const updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue)
    writeFileSync(filePath, updatedContent, 'utf8')
    console.log(`Updated: ${filePath}`)
  } catch (error) {
    console.error(`Error updating ${filePath}:`, (error as Error).message)
  }
}

async function findAndReplaceFiles(searchValue: string, replaceValue: string): Promise<void> {
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

  const ignorePatterns = ['node_modules/**', '.git/**', 'dist/**', '.cache/**']

  for (const pattern of patterns) {
    try {
      const files = await glob(pattern, {
        ignore: ignorePatterns,
        cwd: process.cwd(),
      })

      for (const file of files) {
        replaceInFile(file, searchValue, replaceValue)
      }
    } catch (error) {
      console.error(`Error processing pattern ${pattern}:`, (error as Error).message)
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 Setting up your Turbo template...')

  const newPrefix = await promptForPrefix()

  if (!newPrefix) {
    console.log('No prefix provided. Skipping setup.')
    return
  }

  console.log(`Replacing @acme with ${newPrefix}...`)

  await findAndReplaceFiles('@acme', newPrefix)

  // Remove lock file to force regeneration
  const lockFile = 'pnpm-lock.yaml'
  if (existsSync(lockFile)) {
    unlinkSync(lockFile)
    console.log('Removed pnpm-lock.yaml')
  }

  // Reinstall dependencies
  console.log('Reinstalling dependencies...')
  try {
    execSync('pnpm install', { stdio: 'inherit' })
    console.log('✅ Setup complete!')
  } catch (error) {
    console.error('Error during pnpm install:', (error as Error).message)
  }
}

main().catch(console.error)
