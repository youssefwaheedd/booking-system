/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import EventCard from "./EventCard";
import { LoaderCircleIcon } from "lucide-react";
import type {
  EventCardProps,
  EventsComponentProps,
  UserBooking,
} from "@/constants/interfaces";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBookings } from "@/services/bookings/bookingServices";
import { getEvents as fetchAllEvents } from "@/services/events/eventsServices";
import { Button } from "../ui/button";

const Events: React.FC<EventsComponentProps> = ({ showOnlyBooked = false }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [userBookedEventIds, setUserBookedEventIds] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let [allEvents, bookings]: [EventCardProps[], UserBooking[]] = [[], []];

      if (user) {
        const bookingsPromise = fetchUserBookings();
        const eventsPromise = !showOnlyBooked
          ? fetchAllEvents()
          : Promise.resolve([]);

        const [userBookings, allFetchedEvents] = await Promise.all([
          bookingsPromise,
          eventsPromise,
        ]);

        bookings = userBookings;
        allEvents = allFetchedEvents;

        const bookedIds = new Set(bookings.map((b) => b.eventId));
        setUserBookedEventIds(bookedIds);

        if (showOnlyBooked) {
          const bookedEvents = bookings
            .map((booking) => booking.event)
            .filter((event): event is EventCardProps => !!event);
          setEvents(bookedEvents);
        } else {
          setEvents(allEvents);
        }
      } else {
        const publicEvents = await fetchAllEvents();
        setEvents(publicEvents);
      }
    } catch (error: any) {
      setError("An unexpected error occurred: " + error.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [showOnlyBooked, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEventDeleted = () => {
    loadData();
  };

  const handleBookingChanged = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-2xl text-foreground">
          <LoaderCircleIcon className="h-8 w-8 animate-spin" />
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-2xl">
          <span>Error: {error}</span>
          <Button onClick={loadData} className="p-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center">
        <div className="flex items-center gap-2 text-2xl text-foreground">
          <span>
            {showOnlyBooked ? "You have no booked events." : "No events found."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 w-full ">
      <div className="p-2 sm:p-12 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div className="w-full" key={event.id}>
            <EventCard
              id={event.id}
              image={event.image || "/placeholder.jpeg"}
              name={event.name}
              description={event.description}
              category={event.category}
              date={event.date}
              venue={event.venue}
              price={event.price}
              isBookedByCurrentUser={userBookedEventIds.has(Number(event.id))}
              onBookingChanged={handleBookingChanged}
              onDelete={handleEventDeleted}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
