"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dynamic from "next/dynamic"

// Dynamically import the map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false }
)

// Approximate lat/lng centers for Kenya's 47 counties
const COUNTY_COORDS: Record<string, [number, number]> = {
  "Mombasa": [-4.05, 39.67],
  "Kwale": [-4.18, 39.45],
  "Kilifi": [-3.51, 39.85],
  "Tana River": [-1.80, 39.65],
  "Lamu": [-2.27, 40.90],
  "Taita Taveta": [-3.40, 38.35],
  "Garissa": [-0.45, 39.65],
  "Wajir": [1.75, 40.06],
  "Mandera": [3.94, 41.86],
  "Marsabit": [2.33, 37.98],
  "Isiolo": [0.35, 37.58],
  "Meru": [0.05, 37.65],
  "Tharaka Nithi": [-0.30, 37.85],
  "Embu": [-0.53, 37.45],
  "Kitui": [-1.37, 38.01],
  "Machakos": [-1.52, 37.26],
  "Makueni": [-1.80, 37.62],
  "Nyandarua": [-0.40, 36.52],
  "Nyeri": [-0.42, 36.95],
  "Kirinyaga": [-0.50, 37.27],
  "Murang'a": [-0.72, 37.15],
  "Kiambu": [-1.17, 36.83],
  "Turkana": [3.12, 35.60],
  "West Pokot": [1.62, 35.22],
  "Samburu": [1.17, 36.95],
  "Trans Nzoia": [1.00, 34.95],
  "Uasin Gishu": [0.52, 35.27],
  "Elgeyo Marakwet": [0.78, 35.52],
  "Nandi": [0.18, 35.15],
  "Baringo": [0.47, 35.97],
  "Laikipia": [0.18, 36.78],
  "Nakuru": [-0.30, 36.07],
  "Narok": [-1.08, 35.87],
  "Kajiado": [-2.10, 36.78],
  "Kericho": [-0.37, 35.28],
  "Bomet": [-0.78, 35.35],
  "Kakamega": [0.28, 34.75],
  "Vihiga": [0.07, 34.72],
  "Bungoma": [0.57, 34.56],
  "Busia": [0.46, 34.11],
  "Siaya": [-0.06, 34.29],
  "Kisumu": [-0.10, 34.76],
  "Homa Bay": [-0.52, 34.46],
  "Migori": [-1.06, 34.47],
  "Kisii": [-0.68, 34.77],
  "Nyamira": [-0.57, 34.93],
  "Nairobi": [-1.29, 36.82],
}

interface CountyData {
  id: number
  name: string
  institutions: number
  enrolment: number
}

interface Props {
  counties: CountyData[]
}

export function KenyaMap({ counties }: Props) {
  const [mounted, setMounted] = useState(false)
  const [selectedCounty, setSelectedCounty] = useState<string>("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  const maxInstitutions = Math.max(...counties.map((c) => c.institutions), 1)

  function getRadius(institutions: number): number {
    return 8 + (institutions / maxInstitutions) * 18
  }

  function getColor(institutions: number): string {
    const ratio = institutions / maxInstitutions
    if (ratio > 0.7) return "#e11d73"   // pink/magenta for high
    if (ratio > 0.4) return "#0891b2"   // teal for medium
    return "#10b981"                     // green for low
  }

  const filteredCounties = selectedCounty === "all"
    ? counties
    : counties.filter((c) => c.id.toString() === selectedCounty)

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>TVET Institutions Across Kenya</CardTitle>
          <CardDescription>Loading map...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[550px] w-full rounded-lg bg-muted animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>TVET Institutions Across Kenya</CardTitle>
            <CardDescription>
              {filteredCounties.reduce((s, c) => s + c.institutions, 0)} institutions
              {selectedCounty !== "all" ? ` in ${filteredCounties[0]?.name ?? ""}` : " nationwide"}
              {" · "}Click a bubble for details
            </CardDescription>
          </div>
          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {counties
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name} ({c.institutions})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4 px-4">
        <div className="rounded-lg overflow-hidden border">
          <MapContainer
            center={[0.02, 37.9]}
            zoom={6}
            style={{ height: 550, width: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredCounties.map((county) => {
              const coords = COUNTY_COORDS[county.name]
              if (!coords) return null
              return (
                <CircleMarker
                  key={county.id}
                  center={coords}
                  radius={getRadius(county.institutions)}
                  pathOptions={{
                    fillColor: getColor(county.institutions),
                    fillOpacity: 0.7,
                    color: getColor(county.institutions),
                    weight: 2,
                    opacity: 0.9,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div className="text-xs">
                      <p className="font-semibold">{county.name}</p>
                      <p>{county.institutions} institutions</p>
                      <p>{county.enrolment.toLocaleString()} learners</p>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="text-sm min-w-[150px]">
                      <p className="font-bold text-base">{county.name}</p>
                      <p className="text-muted-foreground mt-1">
                        <strong>{county.institutions}</strong> institutions
                      </p>
                      <p className="text-muted-foreground">
                        <strong>{county.enrolment.toLocaleString()}</strong> learners enrolled
                      </p>
                      <a
                        href={`/counties/${county.id}`}
                        className="mt-2 inline-block text-xs text-primary underline"
                      >
                        View county details →
                      </a>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            1–4 institutions
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-cyan-600" />
            5–7 institutions
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-pink-600" />
            8+ institutions
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
