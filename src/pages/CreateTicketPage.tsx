import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTicket } from "@/features/tickets/tickets.api";
import { fetchUsers } from "@/features/users/users.api";

const createTicketSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(250, "Description must be less than 250 characters")
    .optional(),
  type: z.enum(["servers", "computers"], {
    message: "Type is required",
  }),
  priority: z.enum(["low", "moderate", "high", "critical"]),
  assigneeId: z.string().optional(),
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

const priorities = [
  { id: "low", name: "Low" },
  { id: "moderate", name: "Moderate" },
  { id: "high", name: "High" },
  { id: "critical", name: "Critical" },
] as const;

function CreateTicketPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      navigate(`/tickets/${ticket.id}`);
    },
  });

  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "servers",
      priority: "low",
      assigneeId: "",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Ticket</h1>

      <Card>
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                mutation.mutate({
                  ...values,
                  description: values.description || "",
                  assigneeId: values.assigneeId
                    ? Number(values.assigneeId)
                    : null,
                })
              )}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="What needs to be fixed?"
                        maxLength={100}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the issue..."
                        maxLength={250}
                        className="min-h-32 resize-y"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type <span className="text-destructive">*</span>
                      </FormLabel>

                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                          <option value="servers">Servers</option>
                          <option value="computers">Computers</option>
                        </select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>

                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                          {priorities.map((priority) => (
                            <option key={priority.id} value={priority.id}>
                              {priority.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>

                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Unassigned</option>

                          {users?.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.username})
                            </option>
                          ))}
                        </select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={mutation.isPending || form.formState.isSubmitting}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create ticket"
                  )}
                </Button>
              </div>

              {mutation.isError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Unable to create ticket"}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateTicketPage;