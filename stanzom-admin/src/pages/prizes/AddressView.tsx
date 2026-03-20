import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { prizeService } from '@/services/prizeService';
import type { PrizeDeliveryAddress } from '@/types';
import { cn } from '@/lib/utils';

const STATUSES = ['ALL', 'PENDING', 'ORDERED', 'SHIPPED', 'DELIVERED'] as const;

const statusColor: Record<string, string> = {
  PENDING: 'bg-gold/10 text-gold',
  ORDERED: 'bg-blue/10 text-blue',
  SHIPPED: 'bg-cyan/10 text-cyan',
  DELIVERED: 'bg-green/10 text-green',
};

export default function AddressView() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [orderIdVal, setOrderIdVal] = useState('');
  const qc = useQueryClient();

  const params: Record<string, unknown> = { page, size: 20 };
  if (statusFilter !== 'ALL') params.status = statusFilter;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  const { data, isLoading, error } = useQuery({
    queryKey: ['prize-addresses', params],
    queryFn: () => prizeService.getAddresses(params),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PrizeDeliveryAddress> }) =>
      prizeService.updateAddress(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prize-addresses'] }); setEditingId(null); },
  });

  const handleExport = async () => {
    try {
      const blob = await prizeService.exportAddressesCsv(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prize-addresses-' + new Date().toISOString().split('T')[0] + '.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  const addresses = data?.data ?? [];

  const columns: Column<PrizeDeliveryAddress>[] = [
    { key: 'fullName', header: 'Winner Name', render: (r) => r.fullName },
    { key: 'phone', header: 'Mobile', render: (r) => r.phone },
    { key: 'address', header: 'Address', render: (r) => (
      <span className="max-w-[200px] truncate block">{r.addressLine1}, {r.city}</span>
    )},
    { key: 'city', header: 'City', render: (r) => r.city },
    { key: 'state', header: 'State', render: (r) => r.state },
    { key: 'postalCode', header: 'Pincode', render: (r) => r.postalCode },
    { key: 'amazonOrderId', header: 'Amazon Order ID', render: (r) => {
      if (editingId === r.id) return (
        <div className="flex items-center gap-1">
          <Input value={orderIdVal} onChange={(e) => setOrderIdVal(e.target.value)}
            className="h-7 w-36 text-xs" autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateMut.mutate({ id: r.id, payload: { amazonOrderId: orderIdVal } });
              if (e.key === 'Escape') setEditingId(null);
            }} />
          <Button variant="ghost" size="sm" className="h-7 text-xs"
            onClick={() => updateMut.mutate({ id: r.id, payload: { amazonOrderId: orderIdVal } })}>Save</Button>
        </div>
      );
      return (
        <button className="text-blue hover:underline text-left"
          onClick={(e) => { e.stopPropagation(); setEditingId(r.id); setOrderIdVal(r.amazonOrderId ?? ''); }}>
          {r.amazonOrderId || 'Add ID'}
        </button>
      );
    }},
    { key: 'deliveryStatus', header: 'Status', render: (r) => (
      <Select value={r.deliveryStatus}
        onValueChange={(v) => updateMut.mutate({ id: r.id, payload: { deliveryStatus: v as PrizeDeliveryAddress['deliveryStatus'] } })}>
        <SelectTrigger className={cn('h-7 w-28 text-xs border-0', statusColor[r.deliveryStatus] ?? '')}
          onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="ORDERED">Ordered</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
        </SelectContent>
      </Select>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Prize Delivery Addresses</h1>
          <p className="mt-1 text-sm text-muted">Manage prize winner addresses and delivery status</p>
        </div>
        <Button variant="outline" onClick={handleExport}><Download size={16} /> Export CSV</Button>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
        </div>
      </div>
      {updateMut.isPending && (
        <div className="flex items-center gap-2 text-sm text-gold"><Loader2 size={14} className="animate-spin" /> Updating...</div>
      )}
      <DataTable columns={columns} data={addresses as unknown as Record<string, unknown>[]}
        isLoading={isLoading} error={error ? 'Failed to load addresses' : null}
        page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage}
        expandable={(row) => {
          const a = row as unknown as PrizeDeliveryAddress;
          return (
            <div className="space-y-1 text-sm">
              <p><span className="text-muted">Full Address:</span> {a.addressLine1}</p>
              {a.addressLine2 && <p><span className="text-muted">Line 2:</span> {a.addressLine2}</p>}
              <p><span className="text-muted">Location:</span> {a.city}, {a.state} - {a.postalCode}, {a.country}</p>
              <p><span className="text-muted">Phone:</span> {a.phone}</p>
            </div>
          );
        }}
        emptyMessage="No delivery addresses found"
      />
    </div>
  );
}
