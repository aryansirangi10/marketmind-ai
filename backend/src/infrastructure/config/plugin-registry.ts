// ==============================================================================
// Feature Flag & Plugin Module Registry (Enterprise Adaptability Layer)
// ==============================================================================

import { PrismaService } from "../database/prisma.service";

export interface PluginModule {
  name: string;
  version: string;
  isEnabled: boolean;
  initialize(): Promise<void>;
}

export class PluginRegistry {
  private static plugins: Map<string, PluginModule> = new Map();
  private static prisma = PrismaService.getClient();

  /**
   * Registers a dynamic plugin block
   */
  public static registerPlugin(plugin: PluginModule) {
    this.plugins.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered plugin: ${plugin.name} v${plugin.version}`);
  }

  /**
   * Initializes all enabled plugins
   */
  public static async initializePlugins() {
    for (const plugin of this.plugins.values()) {
      if (plugin.isEnabled) {
        try {
          await plugin.initialize();
          console.log(`[PluginRegistry] Initialized plugin: ${plugin.name}`);
        } catch (err: any) {
          console.error(`[PluginRegistry] Failed to initialize plugin ${plugin.name}: ${err.message}`);
        }
      }
    }
  }

  /**
   * Checks if a specific feature flag is enabled
   */
  public static async isFeatureEnabled(key: string): Promise<boolean> {
    try {
      const flag = await this.prisma.featureFlag.findUnique({
        where: { key }
      });
      return flag ? flag.value : false;
    } catch {
      // Fallback if db table is missing or empty
      return false;
    }
  }

  /**
   * Sets a feature flag state
   */
  public static async setFeatureFlag(key: string, value: boolean, description?: string) {
    try {
      await this.prisma.featureFlag.upsert({
        where: { key },
        update: { value },
        create: { key, value, description }
      });
    } catch (err: any) {
      console.error(`[PluginRegistry] Failed to set feature flag ${key}: ${err.message}`);
    }
  }
}
