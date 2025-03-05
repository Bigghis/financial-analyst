import { useAsset } from '../../context/AssetContext';

export function QualitativeTab() {
  const { assetData } = useAsset();

  return (
    <div className="tab-content">
      <h2>Qualitative Analysis for {assetData.ticker}</h2>
      {/* Qualitative data display */}
    </div>
  );
} 