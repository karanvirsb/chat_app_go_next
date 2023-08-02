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
    <div className="max-w-sm shadow-md px-2 py-1 rounded-md">
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Input type="text" {...register("username")} placeholder="Username" />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );

  function handleOnSubmit(data: Inputs) {
    console.log(data);
  }
}
