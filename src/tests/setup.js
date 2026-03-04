// Test setup - mock browser APIs not available in jsdom
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index) => Object.keys(store)[index] ?? null),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock })

// Mock crypto.randomUUID
if (!globalThis.crypto) {
  globalThis.crypto = {}
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = vi.fn(() => 'test-uuid-1234-5678-9012')
}
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    return arr
  })
}
if (!globalThis.crypto.subtle) {
  globalThis.crypto.subtle = {
    digest: vi.fn(async () => new ArrayBuffer(32)),
  }
}

// Mock confirm dialog
globalThis.confirm = vi.fn(() => true)

// Mock import.meta.env
if (!import.meta.env) {
  import.meta.env = {}
}
