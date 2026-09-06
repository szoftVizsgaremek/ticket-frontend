import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">Profile coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;