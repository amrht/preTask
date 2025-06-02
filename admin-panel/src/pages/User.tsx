import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../store/userStore';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ id: 0, name: '', email: '', role: 'editor' });
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      console.log(res.data)
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/users/${form.id}`, form);
        toast.success('User updated');
      } else {
        await axios.post('http://localhost:5000/api/users', form);
        toast.success('User created');
      }
      setForm({ id: 0, name: '', email: '', role: 'editor' });
      setOpen(false);
      setIsEdit(false);
      fetchUsers();
    } catch {
      toast.error('Failed to save user');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const toggleBan = async (user: User) => {
  try {
    // Spread all user fields, overwrite is_active with negation
    await axios.put(`http://localhost:5000/api/users/${user.id}`, {
      ...user,
      is_active: !user.is_active,
    });
    toast.success(user.is_active ? 'User banned' : 'User unbanned');
    fetchUsers();
  } catch {
    toast.error('Failed to update status');
  }
};


  if (user?.role !== 'admin') {
    return (
      <Card className="p-6 text-center text-red-600 font-semibold">
        You don’t have access. Only Admins can access this page.
      </Card>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-white rounded-md min-h-[90vh] shadow-xl border border-gray-600">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setForm({ id: 0, name: '', email: '', role: 'editor' });
            setIsEdit(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="w-full justify-between">
        {form.role || 'Select role'}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-full">
      {['admin', 'editor'].map(role => (
        <DropdownMenuItem key={role} onClick={() => setForm({ ...form, role })}>
          {role}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
              <Button onClick={handleSave}>{isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id} className={!u.is_active ? 'text-red-600' : ''}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.is_active ? 'Active' : 'Banned'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">⋮</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      setForm(u);
                      setIsEdit(true);
                      setOpen(true);
                    }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(u.id)}>Delete</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleBan(u)}>
                      {u.is_active ? 'Ban' : 'Unban'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
