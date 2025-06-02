import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import axios from 'axios';
import { DownloadIcon, EditIcon, Trash2Icon } from 'lucide-react';

interface Artist {
  id: number;
  name: string;
  genre: string;
  bio: string;
  image_url?: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, name: '', genre: '', bio: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://pretask-production.up.railway.app/api/artists', {
        params: { search, genre: genreFilter, page, limit },
      });
      setArtists(res.data.artists);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch artists', error);
    } finally {
        setLoading(false)
    }
  };

  useEffect(() => {
    fetchArtists();
  }, [search, genreFilter, page]);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://pretask-production.up.railway.app/api/artists/${id}`);
      toast.success('Artist deleted successfully');
      fetchArtists();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleBatchDelete = async () => {
    try {
      await axios.post('https://pretask-production.up.railway.app/api/artists/batch-delete', { ids: selectedIds });
      setSelectedIds([]);
      toast.success('Selected artists deleted successfully');
      fetchArtists();
    } catch (error) {
      console.error('Batch delete failed', error);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const formData = new FormData();
formData.append('name', form.name);
formData.append('genre', form.genre);
formData.append('bio', form.bio);
if (imageFile) {
  formData.append('image', imageFile);
}

if (isEdit) {
  await axios.put(`https://pretask-production.up.railway.app/api/artists/${form.id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  toast.success('Artist updated successfully');
} else {
  await axios.post('https://pretask-production.up.railway.app/api/artists', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  toast.success('Artist created successfully');
}

setImageFile(null);

      setForm({ id: 0, name: '', genre: '', bio: '' });
      setOpen(false);
      setIsEdit(false);
      fetchArtists();
    } catch (error) {
      console.error('Create/Update failed', error);
    }
  };

  const openEditModal = (artist: Artist) => {
    setForm(artist);
    setIsEdit(true);
    setOpen(true);
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-md min-h-[90vh] shadow-xl border border-gray-600">
      <div className="flex gap-2 items-center">
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Input placeholder="Filter by Genre" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} />
        <Button onClick={() => fetchArtists()}>Search</Button>
        <Button variant="destructive" onClick={handleBatchDelete} disabled={selectedIds.length === 0}>
          Delete Selected
        </Button>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
  setForm({ id: 0, name: '', genre: '', bio: '' });
  setIsEdit(false);
  setImageFile(null);
}
        }}>
          <DialogTrigger asChild>
            <Button>Create Artist</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Artist' : 'Create New Artist'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Genre"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
              <Input
  placeholder="Bio"
  value={form.bio}
  onChange={(e) => setForm({ ...form, bio: e.target.value })}
/>
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  }}
/>
{imageFile && <p>Selected file: {imageFile.name}</p>}
              <Button onClick={handleCreateOrUpdate}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                className="border border-gray-400 text-gray-600 hover:border-gray-500"
                style={{ borderWidth: '1.5px' }}
                checked={selectedIds.length === artists.length && artists.length > 0}
                onCheckedChange={(checked) => setSelectedIds(checked ? artists.map(a => a.id) : [])}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-10">
        {/* You can use any spinner or loading text here */}
        Loading artists...
      </TableCell>
    </TableRow>
  ) : artists.length > 0 ? (
    artists.map((artist) => (
      <TableRow key={artist.id}>
        <TableCell>
          <Checkbox
            checked={selectedIds.includes(artist.id)}
            onCheckedChange={() => handleCheckboxChange(artist.id)}
            className="border border-gray-400 text-gray-600 hover:border-gray-500"
            style={{ borderWidth: '1.5px' }}
          />
        </TableCell>
        <TableCell>{artist.name}</TableCell>
        <TableCell>{artist.genre}</TableCell>
        <TableCell>{artist.bio}</TableCell>
        <TableCell>
  {artist.image_url ? (
    <img src={`https://pretask-production.up.railway.app${artist.image_url}`} alt={artist.name} className="h-12 w-12 object-cover rounded" />
  ) : (
    <span>No Image</span>
  )}
</TableCell>
        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">⋮</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEditModal(artist)}>
                                <EditIcon className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(artist.id)}>
                                <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`https://pretask-production.up.railway.app/${artist.image_url}`, '_blank')}>
                                <DownloadIcon className="mr-2 h-4 w-4" /> Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-10">
        No artists found.
      </TableCell>
    </TableRow>
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
