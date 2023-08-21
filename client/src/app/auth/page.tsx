"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/AuthContext";
import { handleCheckUsername } from "@/handlers/checkUsernameHandler";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface Inputs {
  username: string;
}

export default function Auth() {
  const form = useForm<Inputs>({ defaultValues: { username: "" } });
  const router = useRouter();
  const { updateSession } = useAuthContext();
  const [usernameErr, setUsernameErr] = useState("");

  return (
    <div className="min-w-sm w-full max-w-md rounded-md bg-white px-4 py-2 shadow-md">
      <h1 className="mb-4 text-center text-3xl font-semibold">Login</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleOnSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="example" {...field} />
                  </FormControl>
                </FormItem>
              );
            }}
          ></FormField>
          <p>{usernameErr}</p>
          <Button type="submit">Login</Button>
        </form>
      </Form>
    </div>
  );

  async function handleOnSubmit(data: Inputs) {
    if (data.username.length < 3) {
      setUsernameErr("Username must be 3 characters long.");
      return;
    }

    const res = await handleCheckUsername(data.username);

    if (!res.success) {
      setUsernameErr(res.error);
      return;
    }
    setUsernameErr("");
    updateSession({ username: data.username });
    router.replace("/");
  }
}
