import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Clock3, Download, Monitor, Paperclip, Server, Send, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { fetchTicket, addComment, updateTicket, uploadAttachment } from "@/features/tickets/tickets.api";
import { API_BASE_URL } from "@/lib/api-client";
import { useAuth } from "@/features/auth/useAuth";
import {
  formatDate,
  formatFileSize,
  priorityLabel,
  priorityVariant,
  statusLabel,
  typeLabel,
} from "@/features/tickets/ticket-labels";

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: () => fetchTicket(ticketId),
    enabled: Number.isFinite(ticketId),
  });

  const commentMutation = useMutation({
    mutationFn: () => addComment(ticketId, comment),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["tickets", ticketId] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: "open" | "in_progress" | "closed") =>
      updateTicket(ticketId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", ticketId] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(ticketId, file),
    onSuccess: () => {
      setUploadError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      queryClient.invalidateQueries({ queryKey: ["tickets", ticketId] });
    },
    onError: (error) => {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload file"
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        Loading ticket...
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Ticket not found.
      </p>
    );
  }

  const canManage =
    user &&
    (ticket.uploadedBy === user.id ||
      ticket.assigneeId === user.id ||
      user.role === "admin" ||
      user.role === "area_manager");
  const TypeIcon = ticket.type === "servers" ? Server : Monitor;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{ticket.name}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={priorityVariant[ticket.priority]}>
            {priorityLabel[ticket.priority]} priority
          </Badge>

          <Badge variant="outline">{statusLabel[ticket.status]}</Badge>

          <span className="inline-flex items-center gap-1">
            <TypeIcon className="size-3.5" />
            {typeLabel[ticket.type]}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Description</p>
            <p className="text-muted-foreground">
              {ticket.description || "No description provided."}
            </p>
          </div>

          <div className="grid gap-3 text-muted-foreground sm:grid-cols-2">
            <p>
              Reported by{" "}
              <span className="font-medium text-foreground">
                {ticket.reporter?.name ?? "Unknown"}
              </span>
            </p>

            <p>
              Assigned to{" "}
              <span className="font-medium text-foreground">
                {ticket.assignee?.name ?? "Unassigned"}
              </span>
            </p>

            <p>
              Created <span className="font-medium text-foreground">{formatDate(ticket.createdAt)}</span>
            </p>

            <p>
              Updated{" "}
              <span className="font-medium text-foreground">{formatDate(ticket.updatedAt)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {canManage && ticket.status !== "closed" && (
        <Card>
          <CardHeader>
            <CardTitle>Update status</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {ticket.status !== "in_progress" && (
              <Button
                onClick={() => statusMutation.mutate("in_progress")}
                disabled={statusMutation.isPending}
              >
                <Clock3 />
                Mark in progress
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={() => statusMutation.mutate("closed")}
              disabled={statusMutation.isPending}
            >
              <CheckCircle2 />
              Close ticket
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comments ({ticket.comments.length})</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {ticket.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            ticket.comments.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {c.author?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.content}</p>
              </div>
            ))
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim()) commentMutation.mutate();
            }}
            className="space-y-2"
          >
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-20 resize-y"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!comment.trim() || commentMutation.isPending}
              >
                <Send />
                Post comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments ({ticket.attachments.length})</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {ticket.attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attachments.</p>
          ) : (
            <ul className="space-y-2">
              {ticket.attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{a.originalFilename}</span>
                  </span>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(a.fileSizeBytes)}
                    </span>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      render={
                        <a
                          href={`${API_BASE_URL}${a.filePath}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Download ${a.originalFilename}`}
                        />
                      }
                    >
                      <Download />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {uploadError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {uploadError}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const file = fileInputRef.current?.files?.[0];
              if (file) uploadMutation.mutate(file);
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="block w-full max-w-sm text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={uploadMutation.isPending}
            >
              <Upload />
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {commentMutation.isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {commentMutation.error instanceof Error
            ? commentMutation.error.message
            : "Unable to post comment"}
        </p>
      )}
    </div>
  );
}

export default TicketDetailPage;