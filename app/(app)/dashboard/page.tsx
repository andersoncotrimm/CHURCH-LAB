import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  UserPlus,
  FileUp,
  ClipboardPlus,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  mockActivities,
  mockIndicators,
  mockShortcuts,
  mockUpcomingEvents,
  mockUser,
} from "@/lib/mock-data";

const SHORTCUT_ICONS = [CalendarPlus, UserPlus, FileUp, ClipboardPlus];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Olá, {mockUser.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui está um resumo da {mockUser.church} hoje.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockIndicators.map((indicator) => (
          <Card key={indicator.label}>
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground">{indicator.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {indicator.value}
                </p>
                <Badge variant={indicator.positive ? "success" : "neutral"}>
                  {indicator.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Próximos eventos</CardTitle>
            </div>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockUpcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                  <span className="text-[10px] font-semibold uppercase leading-none">
                    {event.date.split(" ")[1]}
                  </span>
                  <span className="text-base font-bold leading-none">
                    {event.date.split(" ")[0]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.attendees} pessoas
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                  {event.time}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-5">
              {mockActivities.map((activity) => (
                <li key={activity.id} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-accent" />
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.actor}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{activity.time}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Atalhos rápidos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {mockShortcuts.map((shortcut, index) => {
            const Icon = SHORTCUT_ICONS[index];
            return (
              <button
                key={shortcut.label}
                type="button"
                className="group flex items-start gap-3.5 rounded-2xl border border-border bg-surface p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    {shortcut.label}
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {shortcut.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
