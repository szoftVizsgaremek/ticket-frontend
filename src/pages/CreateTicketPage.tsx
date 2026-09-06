import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

const createIssueSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  issueTypeId: z.string().min(1, "Issue type is required"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(255, "Summary must be less than 255 characters"),
  description: z.string().optional(),
  priorityId: z.string().min(1, "Priority is required"),
  assigneeId: z.string().optional(),
  labels: z.array(z.string()).default([]),
  componentIds: z.array(z.string()).default([]),
  sprintId: z.string().optional(),
  parentIssueId: z.string().optional(),
  dueDate: z.string().optional(),
});

type CreateIssueFormValues = z.input<typeof createIssueSchema>;

const projects = [
  { id: "ticket", name: "Ticket System" },
  { id: "frontend", name: "Frontend" },
  { id: "backend", name: "Backend" },
];

const issueTypes = [
  { id: "task", name: "Task" },
  { id: "bug", name: "Bug" },
  { id: "story", name: "Story" },
  { id: "epic", name: "Epic" },
];

const priorities = [
  { id: "lowest", name: "Lowest" },
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
  { id: "highest", name: "Highest" },
];

const assignees = [
  { id: "user-1", name: "John Doe" },
  { id: "user-2", name: "Jane Smith" },
];

type CreateIssueFormProps = {
  onSubmit?: (data: CreateIssueFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

export function CreateIssueForm({ onSubmit, onCancel }: CreateIssueFormProps) {
  const form = useForm<CreateIssueFormValues>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      projectId: "",
      issueTypeId: "",
      summary: "",
      description: "",
      priorityId: "medium",
      assigneeId: "",
      labels: [],
      componentIds: [],
      sprintId: "",
      parentIssueId: "",
      dueDate: "",
    },
  });

  const handleSubmit = async (data: CreateIssueFormValues) => {
    await onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Project */}
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Project <span className="text-destructive">*</span>
                </FormLabel>

                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select project</option>

                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Issue type */}
          <FormField
            control={form.control}
            name="issueTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Issue type <span className="text-destructive">*</span>
                </FormLabel>

                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select issue type</option>

                    {issueTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Summary */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Summary <span className="text-destructive">*</span>
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  placeholder="What needs to be done?"
                  maxLength={255}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
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
                  className="min-h-40 resize-y"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Priority */}
          <FormField
            control={form.control}
            name="priorityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Priority <span className="text-destructive">*</span>
                </FormLabel>

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

          {/* Assignee */}
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

                    {assignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Sprint */}
          <FormField
            control={form.control}
            name="sprintId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sprint</FormLabel>

                <FormControl>
                  <Input {...field} placeholder="Sprint ID" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Parent */}
          <FormField
            control={form.control}
            name="parentIssueId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent issue</FormLabel>

                <FormControl>
                  <Input {...field} placeholder="e.g. PROJ-123" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Due date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due date</FormLabel>

              <FormControl>
                <Input {...field} type="date" />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create issue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CreateTicketPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Ticket</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Issue</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateIssueForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateTicketPage;
