import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import AssetHeader from './components/AssetHeader';
import HoldingSummary from './components/HoldingSummary';
import PerformanceChart from './components/PerformanceChart';
import PortfolioAllocation from './components/PortfolioAllocation';
import AssetInfo from './components/AssetInfo';
import InsightsCard from './components/InsightsCard';
import ActionButtons from './components/ActionButtons';
import { assetMock, assetMocks, makeAssetDetailFromBase } from './mockData';
import './AssetDetailPage.css';

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
  if (stateAsset) {
    const template = assetMocks[String(stateAsset.id)] || assetMocks[stateAsset.name];
    const baseDetail = makeAssetDetailFromBase(stateAsset);
    return mergeWithTemplate(baseDetail, template);
  }

  if (assetId && assetMocks[assetId]) return assetMocks[assetId];
  return assetMock;
}

export default function AssetDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const routeStateAsset = location.state?.asset;

  const asset = useMemo(() => resolveAssetDetail(id, routeStateAsset), [id, routeStateAsset]);

  return (
    <div className="asset-detail-page">
      <div className="asset-detail-layout">
        <main className="asset-detail-left">
          <AssetHeader asset={asset} />
          <PerformanceChart data={asset.performanceHistory} asset={asset} />

          <section className="asset-detail-info-grid">
            <PortfolioAllocation allocation={asset.portfolioImpact} />
            <AssetInfo info={asset.assetInfo} type={asset.type} />
          </section>

          <InsightsCard asset={asset} />
        </main>

        <aside className="asset-detail-right">
          <div className="asset-detail-sticky">
            <HoldingSummary holding={asset.holding} />
            <ActionButtons />
          </div>
        </aside>
      </div>
    </div>
  );
}
