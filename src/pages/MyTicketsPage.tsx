import { useQuery } from "@tanstack/react-query";

import TicketsPage from "@/components/tickets-page";
import { fetchMyTickets } from "@/features/tickets/tickets.api";

function MyTicketsPage() {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", "mine"],
    queryFn: fetchMyTickets,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        Loading tickets...
      </div>
    );
  }

  return (
    <TicketsPage
      title="My Tickets"
      description="Tickets assigned to or created by you"
      tickets={tickets ?? []}
    />
  );
}

export default MyTicketsPage;