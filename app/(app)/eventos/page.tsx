"use client";

import * as React from "react";
import { Plus, ChevronLeft, ChevronRight, MapPin, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { mockPastEvents, mockUpcomingEvents } from "@/lib/mock-data";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const CALENDAR_MONTH = { year: 2026, monthIndex: 9, label: "Outubro 2026" };
const EVENT_DAYS = new Set([4, 10, 18]);

function buildCalendarDays(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const days: (number | null)[] = Array.from({ length: firstDay }, () => null);
  for (let day = 1; day <= totalDays; day += 1) days.push(day);
  return days;
}

function EventCard({
  title,
  date,
  location,
  attendees,
  category,
  time,
}: {
  title: string;
  date: string;
  location: string;
  attendees: number;
  category: string;
  time?: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-accent-50 text-accent-700">
          <span className="text-[10px] font-semibold uppercase leading-none">
            {date.split(" ")[1]}
          </span>
          <span className="text-base font-bold leading-none">{date.split(" ")[0]}</span>
        </div>
        <Badge variant="outline">{category}</Badge>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {attendees} pessoas {time ? `· ${time}` : ""}
        </span>
      </div>
    </div>
  );
}

export default function EventosPage() {
  const [tab, setTab] = React.useState("proximos");
  const [modalOpen, setModalOpen] = React.useState(false);

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: integrar criação de evento com o backend.
    setModalOpen(false);
  }

  const days = buildCalendarDays(CALENDAR_MONTH.year, CALENDAR_MONTH.monthIndex);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe, publique e organize os eventos da igreja.
          </p>
        </div>
        <Button variant="accent" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Criar evento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Tabs
            value={tab}
            onValueChange={setTab}
            items={[
              { value: "proximos", label: `Próximos (${mockUpcomingEvents.length})` },
              { value: "anteriores", label: `Anteriores (${mockPastEvents.length})` },
            ]}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tab === "proximos"
              ? mockUpcomingEvents.map((event) => <EventCard key={event.id} {...event} />)
              : mockPastEvents.map((event) => (
                  <EventCard key={event.id} {...event} time={undefined} />
                ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{CALENDAR_MONTH.label}</p>
            <div className="flex items-center gap-1">
              <button
                aria-label="Mês anterior"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                disabled
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Próximo mês"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                disabled
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
            {WEEKDAYS.map((day, index) => (
              <span
                key={`${day}-${index}`}
                className="text-[11px] font-medium uppercase text-muted-foreground"
              >
                {day}
              </span>
            ))}
            {days.map((day, index) => (
              <div key={index} className="flex items-center justify-center py-1">
                {day && (
                  <span
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                      EVENT_DAYS.has(day)
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Dias com eventos programados
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Criar novo evento"
        description="Preencha as informações principais do evento."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input label="Nome do evento" name="title" placeholder="Ex: Culto de Celebração" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data" name="date" type="date" required />
            <Input label="Horário" name="time" type="time" required />
          </div>
          <Input label="Local" name="location" placeholder="Ex: Templo Principal" required />

          <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Este formulário ainda não está conectado ao backend — interface
            pronta para integração futura.
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              Salvar evento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
