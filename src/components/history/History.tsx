"use client";
import { AppState, User } from "@/lib/types";

interface Props {
  state: AppState;
  currentUser: User;
}

export default function History(_props: Props) {
  return <div><h2 className="text-xl font-bold">History</h2><p className="text-gray-400 mt-2">Coming soon</p></div>;
}
