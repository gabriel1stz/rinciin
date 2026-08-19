// AIInsight.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface AIInsightProps {
  totalIncome?: number;
  totalExpense?: number;
}

export const AIInsight: React.FC<AIInsightProps> = ({
  totalIncome = 0,
  totalExpense = 0,
}) => {
  const savings = totalIncome - totalExpense;
  const ratio = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  const isPositive = savings >= 0;
  const isOptimal = ratio >= 20;

  return (
    <div className="ai-insight-box">
      <div className="ai-insight-content">
        <div className="ai-insight-icon-box">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="ai-insight-title">Insight Keuangan Cerdas</h4>
          <p className="ai-insight-text">
            {totalIncome === 0 && totalExpense === 0 ? (
              'Catat pengeluaran dan pemasukan harian untuk mendapatkan analisis kebiasaan finansialmu.'
            ) : !isPositive ? (
              'Pengeluaran bulan ini melebihi total pemasukan. Tinjau kategori pengeluaran terbesar untuk menyeimbangkan arus kas.'
            ) : isOptimal ? (
              `Kondisi keuanganmu sangat sehat! Rasio tabungan bulan ini mencapai ${ratio}%, melebihi standar aman 20%.`
            ) : (
              `Arus kasmu positif dengan rasio tabungan ${ratio}%. Optimalkan alokasi belanja agar target tabungan 20% tercapai.`
            )}
          </p>
        </div>
      </div>

      <Link to="/reports">
        <Button variant="outline" size="sm" rightIcon={<ArrowRight size={14} />}>
          Lihat Analisis
        </Button>
      </Link>
    </div>
  );
};
