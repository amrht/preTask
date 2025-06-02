import { useEffect, useState } from 'react';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from '@/components/ui/table';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DownloadIcon, EditIcon, Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Content {
  id: number;
  title: string;
  type: string;
  file_url: string;
  artist_id: number;
  artist_name: string;
}

interface Artist {
  id: number;
  name: string;
}

export default function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, title: '', type: '', artist_id: 0, file: null as File | null });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/contents', {
        params: { search, type: typeFilter, page, limit },
      });
      setContents(res.data.contents);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch contents', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/artists');
      setArtists(res.data.artists ?? res.data);
    } catch (error) {
      console.error('Failed to fetch artists', error);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [search, typeFilter, page]);

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/contents/${id}`);
      toast.success('Deleted successfully');
      fetchContents();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleBatchDelete = async () => {
    try {
      await axios.post('http://localhost:5000/api/contents/batch-delete', {
        ids: selectedIds,
      });
      toast.success('Selected contents deleted');
      setSelectedIds([]);
      fetchContents();
    } catch (error) {
      toast.error('Batch delete failed');
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('type', form.type);
      formData.append('artist_id', String(form.artist_id));
      if (form.file) formData.append('file', form.file);

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/contents/${form.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/contents', formData);
        toast.success('Created successfully');
      }

      setForm({ id: 0, title: '', type: '', artist_id: 0, file: null });
      setOpen(false);
      setIsEdit(false);
      fetchContents();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const openEditModal = (content: Content) => {
    setForm({
      id: content.id,
      title: content.title,
      type: content.type,
      artist_id: content.artist_id,
      file: null,
    });
    setIsEdit(true);
    setOpen(true);
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-md min-h-[90vh] shadow-xl border border-gray-600">
      <div className="flex gap-2 items-center">
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="w-40 justify-between">
      {typeFilter || 'Filter by Type'}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {['nasheed', 'podcast', 'poetry'].map((type) => (
      <DropdownMenuItem
        key={type}
        onSelect={() => setTypeFilter(type)}
      >
        {type}
      </DropdownMenuItem>
    ))}
    <DropdownMenuItem onSelect={() => setTypeFilter('')}>
      Clear Filter
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
        
        <Button onClick={fetchContents}>Search</Button>
        {selectedIds.length > 0 && (
          <Button variant="destructive" onClick={handleBatchDelete}>
            Delete Selected ({selectedIds.length})
          </Button>
        )}
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setForm({ id: 0, title: '', type: '', artist_id: 0, file: null });
            setIsEdit(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button>Create Content</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Content' : 'Create New Content'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {form.type || 'Select Type'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {['podcast', 'nasheed', 'poetry'].map((t) => (
                    <DropdownMenuItem key={t} onClick={() => setForm({ ...form, type: t })}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {artists.find(a => a.id === form.artist_id)?.name || 'Select Artist'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {artists.map((artist) => (
                    <DropdownMenuItem key={artist.id} onClick={() => setForm({ ...form, artist_id: artist.id })}>
                      {artist.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
              <Button onClick={handleCreateOrUpdate}>{isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selectedIds.length === contents.length}
                className="border border-gray-400 text-gray-600 hover:border-gray-500"
                style={{ borderWidth: '1.5px' }}
                onCheckedChange={(checked) => {
                  setSelectedIds(checked ? contents.map(c => c.id) : []);
                }}
              />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
          ) : contents.length > 0 ? (
            contents.map(content => (
              <TableRow key={content.id}>
                <TableCell>
                  <Checkbox
                    className="border border-gray-400 text-gray-600 hover:border-gray-500"
                    style={{ borderWidth: '1.5px' }}
                    checked={selectedIds.includes(content.id)}
                    onCheckedChange={(checked) => {
                      setSelectedIds((prev) =>
                        checked ? [...prev, content.id] : prev.filter((id) => id !== content.id)
                      );
                    }}
                  />
                </TableCell>
                <TableCell>{content.title}</TableCell>
                <TableCell>{content.type}</TableCell>
                <TableCell>{content.artist_name}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">⋮</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEditModal(content)}>
                        <EditIcon className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(content.id)}>
                        <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`http://localhost:5000/${content.file_url}`, '_blank')}>
                        <DownloadIcon className="mr-2 h-4 w-4" /> Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow><TableCell colSpan={5} className="text-center">No content found.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <div>Total: {total}</div>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page}</span>
          <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
