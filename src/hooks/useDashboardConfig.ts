import { useState, useEffect, useCallback } from 'react';
import { DashboardConfigManager, type DashboardConfig } from '@/lib/preferences/dashboard-config';

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(() => DashboardConfigManager.load());
  const [isLocked, setIsLocked] = useState(() => DashboardConfigManager.isLocked());

  // Subscribe to config changes
  useEffect(() => {
    const unsubscribe = DashboardConfigManager.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  const updateConfig = useCallback(
    (updates: Partial<DashboardConfig>) => {
      const newConfig = { ...config, ...updates };
      DashboardConfigManager.save(newConfig);
      setConfig(newConfig);
    },
    [config]
  );

  const updatePersonalInfo = useCallback(
    (updates: Partial<DashboardConfig['personalInfo']>) => {
      const newConfig = {
        ...config,
        personalInfo: { ...config.personalInfo, ...updates },
      };
      DashboardConfigManager.save(newConfig);
      setConfig(newConfig);
    },
    [config]
  );

  const updateLayout = useCallback(
    (updates: Partial<DashboardConfig['layout']>) => {
      const newConfig = {
        ...config,
        layout: { ...config.layout, ...updates },
      };
      DashboardConfigManager.save(newConfig);
      setConfig(newConfig);
    },
    [config]
  );

  const updateDataSources = useCallback(
    (updates: Partial<DashboardConfig['dataSources']>) => {
      const newConfig = {
        ...config,
        dataSources: { ...config.dataSources, ...updates },
      };
      DashboardConfigManager.save(newConfig);
      setConfig(newConfig);
    },
    [config]
  );

  const lock = useCallback(() => {
    DashboardConfigManager.lock();
    setIsLocked(true);
  }, []);

  const unlock = useCallback((passphrase: string) => {
    const success = DashboardConfigManager.unlock(passphrase);
    if (success) {
      setIsLocked(false);
    }
    return success;
  }, []);

  const reset = useCallback(() => {
    DashboardConfigManager.reset();
    setConfig(DashboardConfigManager.load());
  }, []);

  const applyPreset = useCallback(
    (presetName: string, presetConfig: Partial<DashboardConfig>) => {
      const newConfig = {
        ...config,
        ...presetConfig,
      };
      DashboardConfigManager.save(newConfig);
      setConfig(newConfig);
    },
    [config]
  );

  return {
    config,
    updateConfig,
    updatePersonalInfo,
    updateLayout,
    updateDataSources,
    isLocked,
    lock,
    unlock,
    reset,
    applyPreset,
    exportConfig: () => DashboardConfigManager.exportConfig(),
    importConfig: (json: string) => {
      const success = DashboardConfigManager.importConfig(json);
      if (success) {
        setConfig(DashboardConfigManager.load());
      }
      return success;
    },
  };
}
