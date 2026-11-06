import type { Metadata } from "next"

import { Showcase } from "./_components/showcase"
import { page } from "./_data/content"

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function ShowcasePage() {
  return <Showcase />
}
