import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { userService, type UserListEntry } from '@/services/userService';

export default function UserList() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [influencerFilter, setInfluencerFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const params: Record<string, unknown> = { page, size: 20 };
  if (search) params.search = search;
  if (cityFilter) params.city = cityFilter;
  if (stateFilter) params.state = stateFilter;
  if (influencerFilter !== 'ALL') params.isInfluencer = influencerFilter === 'YES';

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
  });

  const users = data?.data ?? [];

  const columns: Column<UserListEntry>[] = [
    { key: 'name', header: 'Name', render: (r) => r.name },
    { key: 'username', header: 'Username', render: (r) => r.username ?? '---' },
    { key: 'phone', header: 'Mobile', render: (r) => r.phone ?? '---' },
    { key: 'city', header: 'City', render: (r) => r.city ?? '---' },
    { key: 'state', header: 'State', render: (r) => r.state ?? '---' },
    { key: 'points', header: 'Points', render: (r) => (
      <span className="font-semibold text-green">{r.points.toLocaleString()}</span>
    )},
    { key: 'accuracy', header: 'Accuracy %', render: (r) => r.accuracy != null ? r.accuracy.toFixed(1) + '%' : '---' },
    { key: 'activeDays', header: 'Active Days', render: (r) => r.activeDays ?? '---' },
    { key: 'isInfluencer', header: 'Influencer', render: (r) => r.isInfluencer ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
        <Star size={10} /> Yes
      </span>
    ) : <span className="text-muted">No</span> },
    { key: 'createdAt', header: 'Created At', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Users</h1>
        <p className="mt-1 text-sm text-muted">All registered app users</p>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label>Search</Label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Name, username, or mobile..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-64 pl-9" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input placeholder="Filter by city" value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>State</Label>
          <Input placeholder="Filter by state" value={stateFilter}
            onChange={(e) => { setStateFilter(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>Influencer</Label>
          <Select value={influencerFilter} onValueChange={(v) => { setInfluencerFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable columns={columns} data={users as unknown as Record<string, unknown>[]}
        isLoading={isLoading} error={error ? 'Failed to load users' : null}
        page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage}
        onRowClick={(row) => navigate('/users/' + (row as unknown as UserListEntry).id)}
        emptyMessage="No users found" />
    </div>
  );
}
