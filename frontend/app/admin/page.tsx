"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Profile {
  id: string;
  name: string;
  garment: string;
  height: number;
  weight?: number;
  userWaist?: number;
  gender?: string;
  shoulder: number;
  bust: number;
  waist: number;
  hip: number;
  neck: number;
  sleeve: number;
  armLength: number;
  bicep: number;
  wrist: number;
  kameezLength: number;
  confidence: number;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/measurements?key=${encodeURIComponent(key)}`,
      );
      if (!res.ok) {
        throw new Error(
          res.status === 401 ? "Wrong admin key." : `Failed (${res.status}).`,
        );
      }
      const data = await res.json();
      setProfiles(data);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-1 text-2xl font-extrabold">Measurement Records</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Admin view — all saved measurement profiles.
        </p>

        <div className="mb-6 flex max-w-md gap-2">
          <Input
            type="password"
            placeholder="Enter admin key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <Button onClick={load} disabled={loading || !key}>
            {loading ? "Loading…" : "View"}
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm font-medium text-destructive">{error}</p>
        )}

        {loaded && profiles.length === 0 && (
          <p className="text-muted-foreground">No records yet.</p>
        )}

        {profiles.length > 0 && (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {profiles.length} record{profiles.length > 1 ? "s" : ""}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left">
                  <tr>
                    {[
                      "Date",
                      "Name",
                      "Garment",
                      "Gender",
                      "Height(cm)",
                      "Weight(kg)",
                      "Neck",
                      "Shoulder",
                      "Chest",
                      "Waist",
                      "Hip",
                      "Sleeve",
                      "Arm",
                      "Bicep",
                      "Wrist",
                      "Kameez",
                      "Conf.",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-2 font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-semibold">
                        {p.name}
                      </td>
                      <td className="px-3 py-2 capitalize">{p.garment}</td>
                      <td className="px-3 py-2 capitalize">{p.gender || "-"}</td>
                      <td className="px-3 py-2">{p.height}</td>
                      <td className="px-3 py-2">{p.weight ?? "-"}</td>
                      <td className="px-3 py-2">{Number(p.neck).toFixed(1)}</td>
                      <td className="px-3 py-2">
                        {Number(p.shoulder).toFixed(1)}
                      </td>
                      <td className="px-3 py-2">{Number(p.bust).toFixed(1)}</td>
                      <td className="px-3 py-2">{Number(p.waist).toFixed(1)}</td>
                      <td className="px-3 py-2">{Number(p.hip).toFixed(1)}</td>
                      <td className="px-3 py-2">
                        {Number(p.sleeve).toFixed(1)}
                      </td>
                      <td className="px-3 py-2">
                        {Number(p.armLength).toFixed(1)}
                      </td>
                      <td className="px-3 py-2">{Number(p.bicep).toFixed(1)}</td>
                      <td className="px-3 py-2">{Number(p.wrist).toFixed(1)}</td>
                      <td className="px-3 py-2">
                        {Number(p.kameezLength).toFixed(1)}
                      </td>
                      <td className="px-3 py-2">
                        {Math.round(Number(p.confidence) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}