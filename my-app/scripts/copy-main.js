import { mkdirSync, cpSync } from 'fs'
mkdirSync('dist/main', { recursive: true })
cpSync('src/main', 'dist/main', { recursive: true })
