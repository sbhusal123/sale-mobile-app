import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A safe wrapper for AsyncStorage that falls back to an in-memory store
 * if the native module is not available (e.g., before a rebuild).
 */
class SafeStorage {
  private memoryStore: Record<string, string> = {};
  private isNativeAvailable: boolean = true;

  constructor() {
    this.checkNativeAvailability();
  }

  private async checkNativeAvailability() {
    try {
      // Try a simple operation to check if the native module is linked
      await AsyncStorage.getItem('__test__');
      this.isNativeAvailable = true;
    } catch (e) {
      console.warn('⚠️ AsyncStorage native module is null or not linked. Falling back to in-memory storage.');
      this.isNativeAvailable = false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isNativeAvailable) {
      try {
        return await AsyncStorage.getItem(key);
      } catch (e) {
        this.isNativeAvailable = false;
        return this.memoryStore[key] || null;
      }
    }
    return this.memoryStore[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isNativeAvailable) {
      try {
        await AsyncStorage.setItem(key, value);
        return;
      } catch (e) {
        this.isNativeAvailable = false;
      }
    }
    this.memoryStore[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    if (this.isNativeAvailable) {
      try {
        await AsyncStorage.removeItem(key);
        return;
      } catch (e) {
        this.isNativeAvailable = false;
      }
    }
    delete this.memoryStore[key];
  }

  async clear(): Promise<void> {
    if (this.isNativeAvailable) {
      try {
        await AsyncStorage.clear();
        return;
      } catch (e) {
        this.isNativeAvailable = false;
      }
    }
    this.memoryStore = {};
  }
}

export const storage = new SafeStorage();
