import type { Metadata } from "next"
import Component from "../daily-todo"

export const metadata: Metadata = {
  title: "TO-DO LIST",
}

export default function Page() {
  return <Component />
}
