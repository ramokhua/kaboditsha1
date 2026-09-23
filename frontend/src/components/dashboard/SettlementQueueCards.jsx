import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wheat, Home, Building2, Layers } from 'lucide-react';

const SETTLEMENT_META = {
  FARM: {
    label: 'Farm',
    icon: Wheat,
    accent: '#1F4A2B',
    tintBg: 'bg-[#1F4A2B]/10',
    tintText: 'text-[#1F4A2B]',
    description: 'Agricultural land'
  },
  VILLAGE: {
    label: 'Village',
    icon: Home,
    accent: '#B45F3A',
    tintBg: 'bg-[#B45F3A]/10',
    tintText: 'text-[#B45F3A]',
    description: 'Rural residential'
  },
  TOWN: {
    label: 'Town',
    icon: Building2,
    accent: '#2C1810',
    tintBg: 'bg-[#2C1810]/10',
    tintText: 'text-[#2C1810]',
    description: 'Urban residential'
  }
};

const SettlementCardHorizontal = ({ settlementType, data, onOpen }) => {
  const meta = SETTLEMENT_META[settlementType];
  const Icon = meta.icon;

  return (
    <button
      onClick={onOpen}
      className="group w-full text-left bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 border-l-4 overflow-hidden relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
      style={{ borderLeftColor: meta.accent }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{ backgroundColor: meta.accent }}
      />

      {/* Icon + Label */}
      <div className="relative z-10 flex items-center gap-3 md:min-w-[180px]">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.tintBg}`}>
          <Icon className={`w-6 h-6 ${meta.tintText}`} />
        </div>
        <div>
          <h3 className="font-bold text-[#2C1810] dark:text-white text-lg">
            {meta.label}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {meta.description}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="relative z-10 md:min-w-[140px] md:border-l md:border-gray-100 dark:md:border-gray-700 md:pl-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#2C1810] dark:text-white">
            {data.total.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            in queue
          </span>
        </div>
      </div>

      {/* Status Breakdown (inline) */}
      <div className="relative z-10 flex flex-wrap gap-4 md:gap-6 md:border-l md:border-gray-100 dark:md:border-gray-700 md:pl-6 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Pending</span>
          <span className="font-bold text-[#2C1810] dark:text-white">
            {data.pending.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Under Review</span>
          <span className="font-bold text-[#2C1810] dark:text-white">
            {data.underReview.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Verified</span>
          <span className="font-bold text-[#2C1810] dark:text-white">
            {data.verified.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Oldest + Avg Wait */}
      <div className="relative z-10 md:border-l md:border-gray-100 dark:md:border-gray-700 md:pl-6">
        <div className="flex flex-col md:items-end gap-0.5 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            ⏱️ Oldest: <strong className="text-[#2C1810] dark:text-white">{data.oldestMonths}mo</strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            📊 Avg wait: <strong className="text-[#2C1810] dark:text-white">{data.avgWaitMonths}mo</strong>
          </span>
        </div>
      </div>

      {/* Action */}
      <div
        className="relative z-10 flex items-center gap-2 text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity md:border-l md:border-gray-100 dark:md:border-gray-700 md:pl-6"
        style={{ color: meta.accent }}
      >
        <span className="hidden md:inline">Open</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

const ViewAllCardHorizontal = ({ total, onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="group w-full text-left bg-gradient-to-r from-[#2C1810] to-[#B45F3A] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />

      {/* Icon + Label */}
      <div className="relative z-10 flex items-center gap-3 md:min-w-[180px]">
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">All Applications</h3>
          <p className="text-white/70 text-xs">Mixed view across settlement types</p>
        </div>
      </div>

      {/* Total */}
      <div className="relative z-10 md:min-w-[140px] md:border-l md:border-white/20 md:pl-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{total.toLocaleString()}</span>
          <span className="text-xs text-white/70">total active</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="hidden md:block flex-1" />

      {/* Action */}
      <div className="relative z-10 flex items-center gap-2 text-sm font-semibold opacity-90 group-hover:opacity-100 transition-opacity md:border-l md:border-white/20 md:pl-6">
        <span>View All</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

const SettlementQueueCards = ({ summary }) => {
  const navigate = useNavigate();

  if (!summary) return null;

  const { settlementTypes, grandTotal } = summary;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#2C1810] dark:text-white">
          Settlement Queues
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Each settlement type has its own independent queue. Click to open.
        </p>
      </div>

      <div className="space-y-3">
        <SettlementCardHorizontal
          settlementType="TOWN"
          data={settlementTypes.TOWN}
          onOpen={() => navigate('/staff/applications?settlement=TOWN')}
        />
        <SettlementCardHorizontal
          settlementType="VILLAGE"
          data={settlementTypes.VILLAGE}
          onOpen={() => navigate('/staff/applications?settlement=VILLAGE')}
        />
        <SettlementCardHorizontal
          settlementType="FARM"
          data={settlementTypes.FARM}
          onOpen={() => navigate('/staff/applications?settlement=FARM')}
        />
        <ViewAllCardHorizontal
          total={grandTotal}
          onOpen={() => navigate('/staff/applications')}
        />
      </div>
    </div>
  );
};

export default SettlementQueueCards;