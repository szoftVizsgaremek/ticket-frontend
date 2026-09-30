import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Popover } from "@base-ui/react/popover";
import {
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  Paperclip,
  Search,
  Send,
  Upload,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchTicket,
  addComment,
  addTicketWatcher,
  removeTicketWatcher,
  updateTicket,
  uploadAttachment,
} from "@/features/tickets/tickets.api";
import { fetchUsers } from "@/features/users/users.api";
import { API_BASE_URL } from "@/lib/api-client";
import { useAuth } from "@/features/auth/useAuth";
import { usePermissions } from "@/features/auth/usePermissions";
import { PERMISSIONS } from "@/features/auth/permissions";
import { ROLE_LABELS } from "@/features/auth/auth.types";
import {
  formatDate,
  formatFileSize,
  priorityLabel,
  priorityVariant,
  statusLabel,
  typeIcon,
  typeLabel,
} from "@/features/tickets/ticket-labels";
import type { TicketDetail, TicketUser } from "@/features/tickets/ticket.types";

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { user } = useAuth();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: () => fetchTicket(ticketId),
    enabled: Number.isFinite(ticketId),
  });

  // A switch has to answer the click, and a round trip plus a refetch is long
  // enough to read as a dropped click. So the list is updated locally first and
  // rolled back if the request fails.
  const watcherMutation = useMutation({
    mutationFn: ({
      userId,
      watch,
    }: {
      userId: number;
      watch: boolean;
      user: TicketUser;
    }) =>
      watch
        ? addTicketWatcher(ticketId, userId)
        : removeTicketWatcher(ticketId, userId),

    onMutate: async ({ userId, watch, user }) => {
      await queryClient.cancelQueries({ queryKey: ["tickets", ticketId] });

      const previous = queryClient.getQueryData<TicketDetail>([
        "tickets",
        ticketId,
      ]);

      if (previous) {
        queryClient.setQueryData<TicketDetail>(["tickets", ticketId], (old) => {
          if (!old) return old;

          return {
            ...old,
            watchers: watch
              ? [...old.watchers, user].sort((a, b) =>
                  a.name.localeCompare(b.name)
                )
              : old.watchers.filter((w) => w.id !== userId),
          };
        });
      }

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tickets", ticketId], context.previous);
      }
    },

    // Settles either way, so a failed optimistic update is replaced by the
    // truth rather than left as a guess.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", ticketId] });
    },
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

  // Reporter and assignee can always drive their own ticket; roles with
  // ticket:edit (area managers, superadmins) can drive any of them.
  const canManage =
    !!user &&
    (ticket.uploadedBy === user.id ||
      ticket.assigneeId === user.id ||
      can(PERMISSIONS.TICKET_EDIT));
  const TypeIcon = typeIcon[ticket.type];

  return (
    <div className="space-y-6">
      {/* <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </Button> */}
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

      {/* <WatchersCard
        ticket={ticket}
        isPending={watcherMutation.isPending}
        onToggle={(watcher, watch) =>
          watcherMutation.mutate({ userId: watcher.id, watch, user: watcher })
        }
      /> */}

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

// interface WatchersCardProps {
//   ticket: TicketDetail;
//   isPending: boolean;
//   onToggle: (watcher: TicketUser, watch: boolean) => void;
// }

// /**
//  * Who is watching this ticket, and the switch that changes it.
//  *
//  * The list is seeded by the backend — every technician and operator watches a
//  * new ticket without anybody adding them — so the switches are for taking a
//  * watcher off, and for putting one on who is not a watcher by role.
//  */
// function WatchersCard({ ticket, isPending, onToggle }: WatchersCardProps) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");

//   // Only fetched once the popover is opened: most visits to a ticket never
//   // touch the watcher list, and /api/users is a full user list.
//   const { data: users } = useQuery({
//     queryKey: ["users"],
//     queryFn: fetchUsers,
//     enabled: open,
//   });

//   const watching = useMemo(
//     () => new Set(ticket?.watchers?.map((w) => w.id)),
//     [ticket.watchers]
//   );

//   const candidates = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     return (users ?? [])
//       .filter(
//         (u) =>
//           !term ||
//           u.name.toLowerCase().includes(term) ||
//           u.username.toLowerCase().includes(term)
//       )
//       .sort((a, b) => a.name.localeCompare(b.name));
//   }, [users, search]);

  // return (
  //   <Card>
  //     <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
  //       <CardTitle>Watchers ({ticket.watchers.length})</CardTitle>

  //       <Popover.Root
  //         open={open}
  //         onOpenChange={(next) => {
  //           setOpen(next);
  //           // Leaving the search text behind would hide people the next time
  //           // the popover is opened.
  //           if (!next) setSearch("");
  //         }}
  //       >
          {/* <Popover.Trigger
            render={
              <Button variant="outline" size="xs">
                <UserPlus />
                Add watcher
              </Button>
            }
          /> */}

          // <Popover.Portal>
          //   <Popover.Positioner
          //     align="end"
          //     sideOffset={8}
          //     className="z-50"
          //   >
          //     <Popover.Popup className="w-80 rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none">
          //       <div className="relative border-b p-2">
          //         <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />

                  {/* <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users..."
                    aria-label="Search users"
                    className="pl-8"
                  />
                </div>

                {candidates.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No users found.
                  </p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto p-1">
                    {candidates.map((candidate) => {
                      const isWatching = watching.has(candidate.id);

                      return (
                        <li
                          key={candidate.id}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {candidate.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {ROLE_LABELS[candidate.role]}
                            </p>
                          </div>

                          <Switch
                            checked={isWatching}
                            disabled={isPending}
                            aria-label={
                              isWatching
                                ? `Stop ${candidate.name} watching this ticket`
                                : `Watch this ticket as ${candidate.name}`
                            }
                            onCheckedChange={(watch) =>
                              onToggle(candidate, watch)
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </CardHeader> */}

      {/* <CardContent> */}
        {/* {ticket.watchers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nobody is watching this ticket. Watchers are notified when its status
            changes.
          </p>
        ) : (
          <ul className="space-y-2">
            {ticket.watchers.map((watcher) => (
              <li
                key={watcher.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{watcher.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[watcher.role]}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isPending && <Loader2 className="size-3.5 animate-spin" />}

                  <Switch
                    checked
                    disabled={isPending}
                    aria-label={`Stop ${watcher.name} watching this ticket`}
                    onCheckedChange={() => onToggle(watcher, false)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
        } */ }

export default TicketDetailPage;