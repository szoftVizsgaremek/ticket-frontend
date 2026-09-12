import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser } from "@/features/users/users.api";
import { usePermissions } from "@/features/auth/usePermissions";
import { PERMISSIONS } from "@/features/auth/permissions";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(70),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(70)
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username may only contain letters, numbers, dots, dashes"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(100),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "area_manager", "admin"]),
  birthDate: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const roles = [
  { id: "user", name: "User" },
  { id: "area_manager", name: "Area manager" },
  { id: "admin", name: "Admin" },
] as const;

function CreateUserPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate(`/dashboard`, {
        state: { message: `Created user ${created.username}` },
      });
    },
  });

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "user",
      birthDate: "",
    },
  });

  if (!can(PERMISSIONS.USER_CREATE)) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        You don&apos;t have permission to create users.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create User</h1>

      <Card>
        <CardHeader>
          <CardTitle>New account</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                mutation.mutate({
                  ...values,
                  birthDate: values.birthDate || null,
                })
              )}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jane Smith"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Username <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="jsmith"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="jane@company.com"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Initial password{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
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
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
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
                    "Create user"
                  )}
                </Button>
              </div>

              {mutation.isError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Unable to create user"}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateUserPage;