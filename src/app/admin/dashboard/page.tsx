"use client";

import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      <PageHeader
        className="mb-5"
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Visão geral da barbearia"
      />
      <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
        <div className="w-12 h-12 rounded-full admin-surface-subtle flex items-center justify-center mx-auto mb-3">
          <LayoutDashboard className="w-5 h-5 text-gold" />
        </div>
        <p className="text-sm font-medium admin-text-primary">Em breve</p>
        <p className="text-xs admin-text-secondary mt-1">
          O painel de indicadores da barbearia está sendo construído.
        </p>
      </div>
    </div>
  );
}
