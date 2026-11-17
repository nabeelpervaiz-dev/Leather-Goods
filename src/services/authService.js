import { STORAGE_KEYS, readStorage, removeStorage, writeStorage } from './storageService.js';

export const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@creatingleathergoods.pk',
  password: 'LeatherAdmin2026!',
  name: 'Store Administrator',
  role: 'admin',
};

export function getCurrentAdminSession() {
  const session = readStorage(STORAGE_KEYS.ADMIN_SESSION, null);
  if (session && session.email && session.role === 'admin') {
    return session;
  }
  return null;
}

export async function loginAdmin(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  if (!normalizedEmail || !rawPassword) {
    throw new Error('Please enter both email and password.');
  }

  if (
    normalizedEmail !== DEMO_ADMIN_CREDENTIALS.email ||
    rawPassword !== DEMO_ADMIN_CREDENTIALS.password
  ) {
    throw new Error('Invalid administrator email or password.');
  }

  const session = {
    uid: 'demo-admin-1',
    email: DEMO_ADMIN_CREDENTIALS.email,
    name: DEMO_ADMIN_CREDENTIALS.name,
    role: 'admin',
    signedInAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.ADMIN_SESSION, session);
  return session;
}

export async function logoutAdmin() {
  removeStorage(STORAGE_KEYS.ADMIN_SESSION);
}
