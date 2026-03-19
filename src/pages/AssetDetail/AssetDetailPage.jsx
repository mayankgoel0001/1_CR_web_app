import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AssetHeader from './components/AssetHeader';
import HoldingSummary from './components/HoldingSummary';
import PerformanceChart from './components/PerformanceChart';
import PortfolioAllocation from './components/PortfolioAllocation';
import AssetInfo from './components/AssetInfo';
import InsightsCard from './components/InsightsCard';
import ActionButtons from './components/ActionButtons';
import Modal from '../../components/common/Modal';
import { deleteAssetById, updateAssetById } from '../../utils/assetStore';
import { assetDetailTemplates, getBaseAssetById, getDefaultBaseAsset, makeAssetDetailFromBase } from './mockData';



function mergeWithTemplate(baseDetail, template) {
  if (!template) return baseDetail;

  return {
    ...baseDetail,
    ...template,
    id: baseDetail.id,
    name: baseDetail.name,
    symbol: template.symbol || baseDetail.symbol,
    type: template.type || baseDetail.type,
    holding: {
      ...template.holding,
      ...baseDetail.holding,
      // Prefer a real market price from template when available.
      currentPrice: template.holding?.currentPrice || baseDetail.holding.currentPrice,
    },
    portfolioImpact: {
      ...template.portfolioImpact,
      ...baseDetail.portfolioImpact,
    },
    assetInfo: template.assetInfo || baseDetail.assetInfo,
    performanceHistory: template.performanceHistory || baseDetail.performanceHistory,
  };
}

function resolveAssetDetail(assetId, stateAsset) {
  const baseAsset = stateAsset || getBaseAssetById(assetId) || getDefaultBaseAsset();
  const template = assetDetailTemplates[String(baseAsset?.id || assetId)] || assetDetailTemplates[baseAsset?.name];
  const baseDetail = makeAssetDetailFromBase(baseAsset);

  return mergeWithTemplate(baseDetail, template);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeHoldingFromTotals(existingHolding, nextInvestedValue, nextCurrentValue) {
  const quantity = toNumber(existingHolding.quantity);
  const investedValue = Math.max(0, toNumber(nextInvestedValue));
  const currentValue = Math.max(0, toNumber(nextCurrentValue));
  const avgPrice = quantity > 0 ? investedValue / quantity : existingHolding.avgPrice;
  const currentPrice = quantity > 0 ? currentValue / quantity : (existingHolding.currentPrice || currentValue);
  const profitLoss = currentValue - investedValue;
  const returnPercent = investedValue ? (profitLoss / investedValue) * 100 : 0;

  return {
    ...existingHolding,
    investedValue,
    currentValue,
    avgPrice,
    currentPrice,
    profitLoss,
    returnPercent: Number(returnPercent.toFixed(1)),
  };
}

function computeHoldingFromQuantity(existingHolding, nextQuantity) {
  const currentQty = toNumber(existingHolding.quantity);
  const quantity = Math.max(0, toNumber(nextQuantity));

  if (currentQty <= 0) {
    return {
      ...existingHolding,
      quantity,
    };
  }

  const factor = quantity / currentQty;
  const investedValue = Math.max(0, toNumber(existingHolding.investedValue) * factor);
  const currentValue = Math.max(0, toNumber(existingHolding.currentValue) * factor);
  const avgPrice = investedValue / quantity;
  const currentPrice = currentValue / quantity;
  const profitLoss = currentValue - investedValue;
  const returnPercent = investedValue ? (profitLoss / investedValue) * 100 : 0;

  return {
    ...existingHolding,
    quantity,
    investedValue,
    currentValue,
    avgPrice,
    currentPrice,
    profitLoss,
    returnPercent: Number(returnPercent.toFixed(1)),
  };
}

export default function AssetDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const routeStateAsset = location.state?.asset;
  const storeAssetId = routeStateAsset?.id || id;

  const initialAsset = useMemo(() => resolveAssetDetail(id, routeStateAsset), [id, routeStateAsset]);
  const [asset, setAsset] = useState(initialAsset);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(() => ({
    name: initialAsset.name,
    investedValue: String(initialAsset.holding.investedValue || 0),
    currentValue: String(initialAsset.holding.currentValue || 0),
  }));
  const [quantityForm, setQuantityForm] = useState(() => ({
    quantity: String(initialAsset.holding.quantity || 0),
  }));

  useEffect(() => {
    setAsset(initialAsset);
    setEditForm({
      name: initialAsset.name,
      investedValue: String(initialAsset.holding.investedValue || 0),
      currentValue: String(initialAsset.holding.currentValue || 0),
    });
    setQuantityForm({ quantity: String(initialAsset.holding.quantity || 0) });
    setIsEditModalOpen(false);
    setIsQuantityModalOpen(false);
  }, [initialAsset]);

  const openEditModal = () => {
    setEditForm({
      name: asset.name,
      investedValue: String(asset.holding.investedValue || 0),
      currentValue: String(asset.holding.currentValue || 0),
    });
    setIsEditModalOpen(true);
  };

  const openQuantityModal = () => {
    setQuantityForm({ quantity: String(asset.holding.quantity || 0) });
    setIsQuantityModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const name = editForm.name.trim();
    const investedValue = toNumber(editForm.investedValue);
    const currentValue = toNumber(editForm.currentValue);

    if (!name || investedValue < 0 || currentValue < 0) {
      return;
    }

    setAsset((prev) => ({
      ...prev,
      name,
      holding: computeHoldingFromTotals(prev.holding, investedValue, currentValue),
    }));

    if (storeAssetId != null) {
      updateAssetById(storeAssetId, (prev) => ({
        ...prev,
        name,
        currentValue,
        purchasePrice: investedValue,
      }));
    }

    setIsEditModalOpen(false);
  };

  const handleQuantitySubmit = (e) => {
    e.preventDefault();
    const quantity = toNumber(quantityForm.quantity);
    const previousQuantity = toNumber(asset.holding.quantity);

    if (quantity < 0) {
      return;
    }

    setAsset((prev) => ({
      ...prev,
      holding: computeHoldingFromQuantity(prev.holding, quantity),
    }));

    if (storeAssetId != null) {
      updateAssetById(storeAssetId, (prev) => {
        if (previousQuantity <= 0) {
          return prev;
        }

        const factor = quantity / previousQuantity;
        return {
          ...prev,
          currentValue: Math.max(0, toNumber(prev.currentValue) * factor),
          purchasePrice: Math.max(0, toNumber(prev.purchasePrice) * factor),
        };
      });
    }

    setIsQuantityModalOpen(false);
  };

  const handleDelete = () => {
    const isConfirmed = window.confirm('Delete this asset? This action cannot be undone.');
    if (!isConfirmed) {
      return;
    }

    if (storeAssetId != null) {
      deleteAssetById(storeAssetId);
    }

    navigate('/my-assets');
  };

  return (
    <>
      <div className="flex flex-col gap-md h-[calc(100vh-theme(spacing.header)-48px)] max-md:h-auto">
        <div className="grid grid-cols-[minmax(0,1fr)_370px] gap-md items-start h-full overflow-hidden max-md:grid-cols-1 max-md:h-auto max-md:overflow-visible">
          <main className="grid gap-md h-full overflow-y-auto pr-[6px] max-md:h-auto max-md:overflow-visible max-md:pr-0">
            <AssetHeader asset={asset} />
            <PerformanceChart data={asset.performanceHistory} asset={asset} />

            <section className="grid grid-cols-2 gap-md max-md:grid-cols-1">
              <PortfolioAllocation allocation={asset.portfolioImpact} />
              <AssetInfo info={asset.assetInfo} type={asset.type} />
            </section>

            <InsightsCard asset={asset} />
          </main>

          <aside className="relative h-full">
            <div className="sticky top-0 grid gap-[10px] max-h-full overflow-y-auto max-md:static max-md:max-h-none max-md:overflow-visible">
              <HoldingSummary holding={asset.holding} />
              <ActionButtons
                onEdit={openEditModal}
                onUpdateQuantity={openQuantityModal}
                onDelete={handleDelete}
              />
            </div>
          </aside>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Asset">
        <form className="grid gap-[16px]" onSubmit={handleEditSubmit}>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]" htmlFor="asset-name">Asset Name</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                id="asset-name"
                className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]" htmlFor="invested-value">Invested Amount (INR)</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                id="invested-value"
                className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent"
                type="number"
                min="0"
                step="0.01"
                value={editForm.investedValue}
                onChange={(e) => setEditForm((prev) => ({ ...prev, investedValue: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]" htmlFor="current-value">Current Value (INR)</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                id="current-value"
                className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent"
                type="number"
                min="0"
                step="0.01"
                value={editForm.currentValue}
                onChange={(e) => setEditForm((prev) => ({ ...prev, currentValue: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-[12px] mt-[24px]">
            <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isQuantityModalOpen} onClose={() => setIsQuantityModalOpen(false)} title="Update Quantity">
        <form className="grid gap-[16px]" onSubmit={handleQuantitySubmit}>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]" htmlFor="asset-quantity">Quantity</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                id="asset-quantity"
                className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent"
                type="number"
                min="0"
                step="0.01"
                value={quantityForm.quantity}
                onChange={(e) => setQuantityForm({ quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <p className="mt-[-8px] text-[#8FA99C] text-[12px]">
            Holdings are scaled based on the updated quantity.
          </p>

          <div className="flex justify-end gap-[12px] mt-[8px]">
            <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsQuantityModalOpen(false)}>Cancel</button>
            <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Update</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
