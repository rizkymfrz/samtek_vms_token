"use client"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { groups, page, type GroupId } from "../_data/content"
import { registry, titleOf, type ShowcaseEntry } from "../_registry"

const groupIds = Object.keys(groups) as GroupId[]

const matches = (entry: ShowcaseEntry, query: string) => {
  const needle = query.trim().toLowerCase()
  return !needle || titleOf(entry.id).toLowerCase().includes(needle)
}

export const Showcase = () => {
  const [query, setQuery] = React.useState("")
  const visible = registry.filter((entry) => matches(entry, query))

  const toggleDark = (checked: boolean) => {
    document.documentElement.classList.toggle("dark", checked)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 p-8">
      <aside className="sticky top-8 hidden h-[calc(100svh-4rem)] w-64 shrink-0 flex-col gap-4 overflow-y-auto md:flex">
        <Label className="flex items-center justify-between">
          {page.themeToggle}
          <Switch onCheckedChange={toggleDark} />
        </Label>
        <Input
          aria-label={page.searchLabel}
          placeholder={page.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <nav aria-label={page.navLabel} className="flex flex-col gap-4">
          {groupIds.map((group) => {
            const entries = visible.filter((entry) => entry.group === group)
            if (entries.length === 0) return null
            return (
              <div key={group} className="flex flex-col gap-1">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {groups[group]}
                </p>
                {entries.map((entry) => (
                  <a
                    key={entry.id}
                    href={`#${entry.id}`}
                    className="px-2 py-1 text-sm hover:bg-muted"
                  >
                    {titleOf(entry.id)}
                  </a>
                ))}
              </div>
            )
          })}
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{page.title}</h1>
          <p className="text-muted-foreground">{page.description}</p>
        </header>
        {visible.length === 0 && <p className="text-muted-foreground">{page.noResults}</p>}
        {groupIds.map((group) => {
          const entries = visible.filter((entry) => entry.group === group)
          if (entries.length === 0) return null
          return (
            <div key={group} className="flex flex-col gap-16">
              <h2 className="border-b pb-2 text-xl font-semibold">{groups[group]}</h2>
              {entries.map(({ id, Demo }) => (
                <section key={id} id={id} className="flex scroll-mt-8 flex-col gap-4">
                  <h3 className="text-lg font-medium">{titleOf(id)}</h3>
                  <div className="overflow-x-auto border p-8">
                    <Demo />
                  </div>
                </section>
              ))}
            </div>
          )
        })}
      </main>
    </div>
  )
}
