import axios, { AxiosHeaders } from "axios";
import { redirect } from "next/navigation";

import { headers } from "next/headers";

export default async function Home() {
  try {
    await axios.get(`${process.env.API_URL}/sign-in`, {
      headers: headers() as unknown as AxiosHeaders,
    });
  } catch (error) {
    redirect("/sign-in");
  }

}