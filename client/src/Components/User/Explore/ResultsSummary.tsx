interface ResultsSummaryProps {
  activeTab: string;
  getCurrentTotal: () => number | string;
  searchQuery: string;
}

const ResultsSummary = ({ activeTab, getCurrentTotal, searchQuery }: ResultsSummaryProps) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2 text-sm text-default-600">
      <span className="font-medium">
        {getCurrentTotal()} {activeTab} found
      </span>
      {searchQuery && <span>• Searching for "{searchQuery}"</span>}
    </div>
  </div>
);

export default ResultsSummary;