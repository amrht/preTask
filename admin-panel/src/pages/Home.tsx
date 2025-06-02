import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Log = {
  id: number;
  table_name: string;
  log: string;
  created_at: string;
};

export function formatToISTTimeAgo(utcDateString: string): string {
  const utcDate = new Date(utcDateString);

  // Convert to IST (UTC+5:30)
  const istDate = new Date(utcDate.getTime());

  // Format as "x minutes ago"
  return format(istDate);
}


export default function Home() {
  const [totalArtists, setTotalArtists] = useState<number | null>(null);
  const [totalContents, setTotalContents] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState<Log[]>([]);
  const [logLimit, setLogLimit] = useState(10);

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);

        const [artistsRes, contentsRes, usersRes] = await Promise.all([
          axios.get("https://pretask-production.up.railway.app/api/artists"),
          axios.get("https://pretask-production.up.railway.app/api/contents"),
          axios.get("https://pretask-production.up.railway.app/api/users"),
        ]);

        setTotalArtists(artistsRes.data.total);
        setTotalContents(contentsRes.data.total);
        setTotalUsers(usersRes.data.total);
      } catch (error) {
        console.error("Failed to fetch counts", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await axios.get(`https://pretask-production.up.railway.app/api/logs?limit=${logLimit}`);
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    }

    fetchLogs();
  }, [logLimit]);

  return (
    <div className="space-y-6 p-4 bg-white rounded-md shadow-xl min-h-[90vh] border border-black">
      <h1 className="text-3xl font-bold">Welcome to the Admin Panel</h1>

      {loading ? (
        <p>Loading overview...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-blue-500">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Total Artists</h2>
              <p className="text-4xl font-bold">{totalArtists ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="border-green-500">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Total Contents</h2>
              <p className="text-4xl font-bold">{totalContents ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Total Users</h2>
              <p className="text-4xl font-bold">{totalUsers ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Section */}
      <Card className="w-full mt-8 border-gray-600">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Recent Activity Logs</h2>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Show: {logLimit}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[5, 10, 15, 20].map((n) => (
                  <DropdownMenuItem key={n} onSelect={() => setLogLimit(n)}>
                    {n} logs
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-y-auto max-h-[30vh]">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border-b">Topic</th>
                  <th className="p-2 border-b">Table</th>
                  <th className="p-2 border-b">Activity</th>
                  <th className="p-2 border-b">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-2">{log.log.split(" ")[0]}</td>
                    <td className="p-2">{log.table_name}</td>
                    <td className="p-2">{log.log}</td>
                    <td className="p-2 text-gray-500">{formatToISTTimeAgo(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
