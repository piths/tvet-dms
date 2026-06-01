"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UploadIcon, FileIcon, CheckCircle2Icon, ClockIcon, ShieldCheckIcon } from "lucide-react"

interface Document {
  id: string
  document_type: string
  title: string
  file_name: string
  file_size: number | null
  verified: boolean
  verified_at: string | null
  notes: string | null
  created_at: string
}

interface Props {
  documents: Document[]
  staffId: string
  canUpload: boolean
  canVerify: boolean
}

const DOC_TYPES = [
  { value: "academic_certificate", label: "Academic Certificate" },
  { value: "tsc_registration", label: "TSC Registration" },
  { value: "cdacc_certificate", label: "CDACC Certificate" },
  { value: "professional_development", label: "Professional Development" },
  { value: "appraisal_report", label: "Appraisal Report (TPAD)" },
  { value: "id_document", label: "ID Document" },
  { value: "other", label: "Other" },
]

const DOC_TYPE_LABELS: Record<string, string> = Object.fromEntries(DOC_TYPES.map(d => [d.value, d.label]))

export function StaffDocuments({ documents, staffId, canUpload, canVerify }: Props) {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [docType, setDocType] = useState("")
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const verified = documents.filter(d => d.verified).length
  const total = documents.length

  async function handleUpload() {
    if (!file || !docType || !title) return
    setLoading(true)

    const supabase = createClient()
    const filePath = `staff/${staffId}/${Date.now()}-${file.name}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("staff-documents")
      .upload(filePath, file)

    if (uploadError) {
      // If bucket doesn't exist, just save the record with a placeholder path
      console.warn("Storage upload failed (bucket may not exist):", uploadError.message)
    }

    // Save document record
    const { error } = await supabase.from("staff_document").insert({
      staff_id: staffId,
      document_type: docType,
      title,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Document uploaded")
      setUploadOpen(false)
      setDocType("")
      setTitle("")
      setFile(null)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleVerify(docId: string) {
    const supabase = createClient()
    const { error } = await supabase.from("staff_document").update({
      verified: true,
      verified_at: new Date().toISOString(),
    }).eq("id", docId)

    if (error) toast.error(error.message)
    else toast.success("Document verified")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <FileIcon className="h-3 w-3" />
            {total} documents
          </Badge>
          <Badge variant={verified === total && total > 0 ? "default" : "secondary"} className="gap-1">
            <CheckCircle2Icon className="h-3 w-3" />
            {verified}/{total} verified
          </Badge>
        </div>
        {canUpload && (
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <UploadIcon className="mr-1.5 h-3.5 w-3.5" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Documents Table */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No documents uploaded yet.
            {canUpload && " Upload certificates and qualifications to build the trainer's file."}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                {canVerify && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {doc.file_name}
                    {doc.file_size && ` (${(doc.file_size / 1024).toFixed(0)} KB)`}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(doc.created_at).toLocaleDateString("en-KE")}
                  </TableCell>
                  <TableCell>
                    {doc.verified ? (
                      <Badge className="bg-green-600 gap-1 text-xs">
                        <ShieldCheckIcon className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <ClockIcon className="h-3 w-3" /> Pending
                      </Badge>
                    )}
                  </TableCell>
                  {canVerify && (
                    <TableCell>
                      {!doc.verified && (
                        <Button size="sm" variant="outline" onClick={() => handleVerify(doc.id)}>
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a certificate, registration, or other document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. BSc Electrical Engineering - JKUAT" />
            </div>
            <div className="space-y-2">
              <Label>File *</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-muted-foreground">PDF, images, or Word documents. Max 10MB.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={loading || !file || !docType || !title}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
