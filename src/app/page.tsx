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
<<<<<<< HEAD

=======
<<<<<<< HEAD
=======

  return <h1>Hello World</h1>;
>>>>>>> origin/main
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
}