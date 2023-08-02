"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";

interface Inputs {
  username: string;
}

export default function Auth() {
  const { register, handleSubmit } = useForm<Inputs>();

  return (
    <div className="max-w-sm shadow-md px-4 py-2 rounded-md">
      <h1 className="text-center font-semibold text-3xl mb-4">Login</h1>
      <form
        onSubmit={handleSubmit(handleOnSubmit)}
        className="flex flex-col gap-4"
      >
        <Input type="text" {...register("username")} placeholder="Username" />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );

  function handleOnSubmit(data: Inputs) {
    console.log(data);
  }
}
