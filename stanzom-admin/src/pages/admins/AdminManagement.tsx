import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { adminService } from '@/services/adminService';
import type { Admin } from '@/types';

const createSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['ADMIN']),
});

type CreateForm = z.infer<typeof createSchema>;

export default function AdminManagement() {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admins'],
    queryFn: () => adminService.getAdmins(),
  });

  const admins = data?.data ?? [];
  const adminCount = admins.filter((a) => a.role === 'ADMIN').length;
  const superAdminCount = admins.filter((a) => a.role === 'SUPER_ADMIN').length;

  const { register, handleSubmit, reset, formState: { errors: formErrors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'ADMIN' },
  });

  const createMut = useMutation({
    mutationFn: (data: CreateForm) => adminService.createAdmin({ ...data, permissions: [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admins'] }); setAddOpen(false); reset(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteAdmin(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admins'] }); setDeleteId(null); },
  });

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple/10 text-purple',
    ADMIN: 'bg-blue/10 text-blue',
  };

  const columns: Column<Admin>[] = [
    { key: 'name', header: 'Name', render: (r) => r.name },
    { key: 'email', header: 'Email', render: (r) => r.email },
    { key: 'role', header: 'Role', render: (r) => (
      <span className={'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (roleColor[r.role] ?? '')}>
        {r.role}
      </span>
    )},
    { key: 'lastLogin', header: 'Last Login', render: (r) => r.lastLogin ? new Date(r.lastLogin).toLocaleString() : 'Never' },
    { key: 'createdAt', header: 'Created At', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: 'actions', header: 'Actions', render: (r) => r.role !== 'SUPER_ADMIN' ? (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-gold">
          <Edit size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-red"
          onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}>
          <Trash2 size={14} />
        </Button>
      </div>
    ) : <span className="text-xs text-muted">Protected</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Management</h1>
          <p className="mt-1 text-sm text-muted">
            {adminCount}/5 admin slots used | {superAdminCount} super admin
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} disabled={adminCount >= 5}>
          <Plus size={16} /> Add Admin
        </Button>
      </div>

      <DataTable columns={columns} data={admins as unknown as Record<string, unknown>[]}
        isLoading={isLoading} error={error ? 'Failed to load admins' : null}
        emptyMessage="No admins found" />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new admin account. Cannot create super admins.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register('name')} placeholder="Full name" />
              {formErrors.name && <p className="text-xs text-red">{formErrors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...register('email')} type="email" placeholder="admin@stanzom.com" />
              {formErrors.email && <p className="text-xs text-red">{formErrors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input {...register('password')} type="password" placeholder="Min 8 characters" />
              {formErrors.password && <p className="text-xs text-red">{formErrors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select defaultValue="ADMIN" disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMut.mutate(deleteId)}
              disabled={deleteMut.isPending}>
              {deleteMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
