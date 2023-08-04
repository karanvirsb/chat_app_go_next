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
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface Inputs {
  username: string;
}

export default function Auth() {
  const form = useForm<Inputs>();
  const router = useRouter();
  const { updateSession } = useAuthContext();
  const [usernameErr, setUsernameErr] = useState("");

  return (
    <div className="min-w-sm max-w-md w-full shadow-md px-4 py-2 rounded-md bg-white">
      <h1 className="text-center font-semibold text-3xl mb-4">Login</h1>
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

  function handleOnSubmit(data: Inputs) {
    console.log(data);
    if (data.username.length < 3) {
      setUsernameErr("Username must be 3 characters long.");
      return;
    }
    setUsernameErr("");
    updateSession({ username: data.username });
    router.replace("/");
  }
}
