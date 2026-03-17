const ASSET_STORAGE_KEY = 'onecr.assets';
const ASSET_STORAGE_INIT_KEY = 'onecr.assets.initialized';

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadAssets(defaultAssets = []) {
  if (!hasWindow()) {
    return [...defaultAssets];
  }

  try {
    const isInitialized = window.localStorage.getItem(ASSET_STORAGE_INIT_KEY) === 'true';
    const raw = window.localStorage.getItem(ASSET_STORAGE_KEY);

    if (!isInitialized) {
      if (defaultAssets.length > 0) {
        window.localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(defaultAssets));
      }
      window.localStorage.setItem(ASSET_STORAGE_INIT_KEY, 'true');
      return [...defaultAssets];
    }

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...defaultAssets];
    }

    return parsed;
  } catch {
    return [...defaultAssets];
  }
}

export function saveAssets(assetRows) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(assetRows));
  window.localStorage.setItem(ASSET_STORAGE_INIT_KEY, 'true');
}

export function updateAssetById(assetId, updater) {
  const idStr = String(assetId);
  const current = loadAssets();
  const next = current.map((asset) => (String(asset.id) === idStr ? updater(asset) : asset));
  saveAssets(next);
  return next;
}

export function deleteAssetById(assetId) {
  const idStr = String(assetId);
  const current = loadAssets();
  const next = current.filter((asset) => String(asset.id) !== idStr);
  saveAssets(next);
  return next;
}
